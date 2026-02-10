import type { Express } from "express";
import { z } from "zod";
import { db, isAuthenticated, isNotUnderReview, isAdmin, isAdminOrSupport, logAudit, getClientIp } from "./shared";
import { createLogger } from "../lib/logger";
import { checkRateLimit } from "../lib/security";

const log = createLogger('consultations');
import { consultationTypes, consultationAvailability, consultationBlockedDates, consultationBookings, users as usersTable } from "@shared/schema";
import { and, eq, desc, sql, inArray, isNull, isNotNull, lte, gte } from "drizzle-orm";

function getMadridOffset(date: Date): number {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);
  const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  const isDST = date.getTimezoneOffset() < stdOffset;
  const utcOffsetMinutes = isDST ? 120 : 60;
  return utcOffsetMinutes + date.getTimezoneOffset();
}

export function registerConsultationRoutes(app: Express) {
  // ============ CONSULTATION BOOKING SYSTEM ============

  // Get all active consultation types (public)
  app.get("/api/consultations/types", async (req, res) => {
    try {
      const types = await db.select().from(consultationTypes).where(eq(consultationTypes.isActive, true));
      res.json(types);
    } catch (err) {
      log.error("Error fetching consultation types", err);
      res.status(500).json({ message: "Error fetching consultation types" });
    }
  });

  // Get availability for a specific date
  app.get("/api/consultations/availability", async (req, res) => {
    try {
      const date = req.query.date as string;
      if (!date) return res.status(400).json({ message: "Date parameter required" });
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.getDay();
      
      // Check if date is blocked
      const blocked = await db.select().from(consultationBlockedDates)
        .where(sql`DATE(${consultationBlockedDates.date}) = DATE(${targetDate})`);
      
      if (blocked.length > 0) {
        return res.json({ available: false, slots: [], reason: "blocked" });
      }
      
      // Get available slots for this day
      const slots = await db.select().from(consultationAvailability)
        .where(and(
          eq(consultationAvailability.dayOfWeek, dayOfWeek),
          eq(consultationAvailability.isActive, true)
        ));
      
      // Get existing bookings for this date
      const existingBookings = await db.select({
        scheduledTime: consultationBookings.scheduledTime,
        status: consultationBookings.status
      }).from(consultationBookings)
        .where(and(
          sql`DATE(${consultationBookings.scheduledDate}) = DATE(${targetDate})`,
          inArray(consultationBookings.status, ['pending', 'confirmed'])
        ));
      
      const bookedTimes = new Set(existingBookings.map(b => b.scheduledTime));
      
      // Filter out booked slots
      const availableSlots = slots.filter(slot => !bookedTimes.has(slot.startTime));
      
      res.json({ 
        available: availableSlots.length > 0, 
        slots: availableSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime }))
      });
    } catch (err) {
      log.error("Error fetching availability", err);
      res.status(500).json({ message: "Error fetching availability" });
    }
  });

  // Generate time slots for free consultations (10:00-18:00 Madrid, 20 min intervals)
  app.get("/api/consultations/free-slots", async (req, res) => {
    try {
      const date = req.query.date as string;
      if (!date) return res.status(400).json({ message: "Date parameter required" });
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.getDay();
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return res.json({ available: false, slots: [], reason: "weekend" });
      }
      
      const blocked = await db.select().from(consultationBlockedDates)
        .where(sql`DATE(${consultationBlockedDates.date}) = DATE(${targetDate})`);
      
      if (blocked.length > 0) {
        return res.json({ available: false, slots: [], reason: "blocked" });
      }
      
      const existingBookings = await db.select({
        scheduledTime: consultationBookings.scheduledTime,
        duration: consultationBookings.duration,
        status: consultationBookings.status
      }).from(consultationBookings)
        .where(and(
          sql`DATE(${consultationBookings.scheduledDate}) = DATE(${targetDate})`,
          inArray(consultationBookings.status, ['pending', 'confirmed'])
        ));
      
      const bookedTimes = new Set(existingBookings.map(b => b.scheduledTime));
      
      const allSlots: { startTime: string; endTime: string }[] = [];
      for (let hour = 10; hour < 18; hour++) {
        for (let min = 0; min < 60; min += 20) {
          const endMin = min + 20;
          const endHour = hour + Math.floor(endMin / 60);
          const endMinFinal = endMin % 60;
          if (endHour > 18 || (endHour === 18 && endMinFinal > 0)) break;
          const startTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
          const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinFinal).padStart(2, '0')}`;
          if (!bookedTimes.has(startTime)) {
            allSlots.push({ startTime, endTime });
          }
        }
      }
      
      const now = new Date();
      const madridOffset = getMadridOffset(now);
      const madridNow = new Date(now.getTime() + madridOffset * 60000);
      const todayMadrid = madridNow.toISOString().split('T')[0];
      const targetDateStr = targetDate.toISOString().split('T')[0];
      
      let availableSlots = allSlots;
      if (targetDateStr === todayMadrid) {
        const currentHour = madridNow.getHours();
        const currentMin = madridNow.getMinutes();
        availableSlots = allSlots.filter(slot => {
          const [slotH, slotM] = slot.startTime.split(':').map(Number);
          return slotH > currentHour + 1 || (slotH === currentHour + 1 && slotM > currentMin);
        });
      }
      
      res.json({ available: availableSlots.length > 0, slots: availableSlots });
    } catch (err) {
      log.error("Error fetching free consultation slots", err);
      res.status(500).json({ message: "Error fetching available slots" });
    }
  });

  // Public booking for free consultations (no auth required)
  app.post("/api/consultations/book-free", async (req: any, res) => {
    try {
      const clientIpCheck = getClientIp(req);
      const rateCheck = checkRateLimit('consultation', clientIpCheck);
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: "Too many booking requests. Please try again later.", retryAfter: rateCheck.retryAfter });
      }
      
      const schema = z.object({
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        email: z.string().email().max(255),
        phone: z.string().max(30).optional(),
        scheduledDate: z.string(),
        scheduledTime: z.string().regex(/^\d{2}:\d{2}$/),
        countryOfResidence: z.string().max(100).optional(),
        mainTopic: z.string().max(200).optional(),
        hasExistingBusiness: z.string().optional(),
        businessActivity: z.string().max(200).optional(),
        estimatedRevenue: z.string().optional(),
        preferredState: z.string().optional(),
        activity: z.string().max(200).optional(),
        aboutYou: z.string().max(1000).optional(),
        hasSL: z.string().optional(),
        isAutonomo: z.string().optional(),
        approximateRevenue: z.string().optional(),
        additionalNotes: z.string().max(2000).optional(),
        preferredLanguage: z.string().optional(),
      });
      
      const data = schema.parse(req.body);
      const email = data.email.trim().toLowerCase();
      const lang = (data.preferredLanguage || 'es') as any;
      
      const clientIp = getClientIp(req);
      
      const scheduledDate = new Date(data.scheduledDate);
      const dayOfWeek = scheduledDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return res.status(400).json({ message: "Weekends are not available" });
      }
      
      const [slotH, slotM] = data.scheduledTime.split(':').map(Number);
      if (slotH < 10 || slotH >= 18) {
        return res.status(400).json({ message: "Time must be between 10:00 and 18:00" });
      }
      
      const blocked = await db.select().from(consultationBlockedDates)
        .where(sql`DATE(${consultationBlockedDates.date}) = DATE(${scheduledDate})`);
      if (blocked.length > 0) {
        return res.status(400).json({ message: "This date is not available" });
      }
      
      const [existingBooking] = await db.select().from(consultationBookings)
        .where(and(
          sql`DATE(${consultationBookings.scheduledDate}) = DATE(${scheduledDate})`,
          eq(consultationBookings.scheduledTime, data.scheduledTime),
          inArray(consultationBookings.status, ['pending', 'confirmed'])
        ));
      
      if (existingBooking) {
        return res.status(400).json({ message: "This slot is already booked" });
      }
      
      let freeType = await db.select().from(consultationTypes)
        .where(and(eq(consultationTypes.name, 'free_consultation'), eq(consultationTypes.isActive, true)))
        .then(r => r[0]);
      
      if (!freeType) {
        [freeType] = await db.insert(consultationTypes).values({
          name: 'free_consultation',
          nameEs: 'Asesoría Gratuita',
          nameEn: 'Free Consultation',
          nameCa: 'Assessoria Gratuïta',
          description: 'Free 20-minute consultation for potential clients',
          descriptionEs: 'Asesoría gratuita de 20 minutos para potenciales clientes',
          descriptionEn: 'Free 20-minute consultation for potential clients',
          descriptionCa: 'Assessoria gratuïta de 20 minuts per a potencials clients',
          duration: 20,
          price: 0,
          isActive: true,
        }).returning();
      }
      
      let userId: string | null = null;
      if (req.session?.userId) {
        userId = req.session.userId;
      } else {
        const [existingUser] = await db.select({ id: usersTable.id }).from(usersTable)
          .where(eq(usersTable.email, email)).limit(1);
        if (existingUser) {
          userId = existingUser.id;
        }
      }
      
      const { generateUniqueBookingCode } = await import("../lib/id-generator");
      const bookingCode = await generateUniqueBookingCode();
      
      const [booking] = await db.insert(consultationBookings).values({
        bookingCode,
        userId,
        consultationTypeId: freeType.id,
        scheduledDate,
        scheduledTime: data.scheduledTime,
        duration: 20,
        status: 'confirmed',
        guestFirstName: data.firstName,
        guestLastName: data.lastName,
        guestEmail: email,
        guestPhone: data.phone || null,
        countryOfResidence: data.countryOfResidence || null,
        mainTopic: data.mainTopic || null,
        activity: data.businessActivity || data.activity || null,
        aboutYou: data.aboutYou || null,
        hasSL: data.hasExistingBusiness || data.hasSL || null,
        isAutonomo: data.isAutonomo || null,
        approximateRevenue: data.estimatedRevenue || data.approximateRevenue || null,
        additionalNotes: data.additionalNotes || null,
        preferredLanguage: data.preferredLanguage || 'es',
      }).returning();
      
      logAudit({
        action: 'consultation_booked',
        userId: userId || undefined,
        targetId: booking.id.toString(),
        ip: clientIp,
        userAgent: req.headers['user-agent'],
        details: {
          bookingCode,
          email,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        }
      });
      
      try {
        const { getConsultationConfirmationTemplate, sendEmail } = await import("../lib/email");
        const dateObj = new Date(data.scheduledDate);
        const dateFormatted = dateObj.toLocaleDateString(lang === 'en' ? 'en-GB' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : lang === 'pt' ? 'pt-PT' : lang === 'ca' ? 'ca-ES' : 'es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const { getEmailTranslations } = await import("../lib/email-translations");
        const t = getEmailTranslations(lang);
        const html = getConsultationConfirmationTemplate(
          data.firstName,
          bookingCode,
          dateFormatted,
          data.scheduledTime,
          20,
          lang
        );
        await sendEmail({
          to: email,
          subject: t.consultationConfirmation.subject,
          html
        });
        
        await db.update(consultationBookings)
          .set({ confirmationSentAt: new Date() })
          .where(eq(consultationBookings.id, booking.id));
      } catch (emailErr) {
        log.error("Error sending consultation confirmation email", emailErr);
      }
      
      res.json({ success: true, booking: { id: booking.id, bookingCode, scheduledDate: data.scheduledDate, scheduledTime: data.scheduledTime } });
    } catch (err: any) {
      log.error("Error creating free consultation booking", err);
      if (err.errors) {
        return res.status(400).json({ message: err.errors[0]?.message || "Validation error" });
      }
      res.status(500).json({ message: "Error creating the booking" });
    }
  });

  // Create a consultation booking (requires authentication)
  app.post("/api/consultations/book", isAuthenticated, isNotUnderReview, async (req, res) => {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);
      if (!user) return res.status(401).json({ message: "User not found" });
      
      // Check account status
      if (user.accountStatus === 'deactivated') {
        return res.status(403).json({ message: "Your account is deactivated" });
      }
      
      const schema = z.object({
        consultationTypeId: z.number(),
        scheduledDate: z.string(),
        scheduledTime: z.string(),
        hasLlc: z.string().optional(),
        llcState: z.string().optional(),
        estimatedRevenue: z.string().optional(),
        countryOfResidence: z.string().optional(),
        mainTopic: z.string().optional(),
        additionalNotes: z.string().optional(),
      });
      
      const data = schema.parse(req.body);
      
      // Verify consultation type exists
      const [consultationType] = await db.select().from(consultationTypes)
        .where(eq(consultationTypes.id, data.consultationTypeId));
      
      if (!consultationType || !consultationType.isActive) {
        return res.status(400).json({ message: "Invalid consultation type" });
      }
      
      // Check slot availability
      const scheduledDate = new Date(data.scheduledDate);
      const dayOfWeek = scheduledDate.getDay();
      
      const [slot] = await db.select().from(consultationAvailability)
        .where(and(
          eq(consultationAvailability.dayOfWeek, dayOfWeek),
          eq(consultationAvailability.startTime, data.scheduledTime),
          eq(consultationAvailability.isActive, true)
        ));
      
      if (!slot) {
        return res.status(400).json({ message: "Schedule not available" });
      }
      
      // Check for existing booking at this time
      const [existingBooking] = await db.select().from(consultationBookings)
        .where(and(
          sql`DATE(${consultationBookings.scheduledDate}) = DATE(${scheduledDate})`,
          eq(consultationBookings.scheduledTime, data.scheduledTime),
          inArray(consultationBookings.status, ['pending', 'confirmed'])
        ));
      
      if (existingBooking) {
        return res.status(400).json({ message: "This schedule is already booked" });
      }
      
      // Generate booking code
      const { generateUniqueBookingCode } = await import("../lib/id-generator");
      const bookingCode = await generateUniqueBookingCode();
      
      // Create booking
      const [booking] = await db.insert(consultationBookings).values({
        bookingCode,
        userId: user.id,
        consultationTypeId: data.consultationTypeId,
        scheduledDate,
        scheduledTime: data.scheduledTime,
        duration: consultationType.duration,
        status: 'pending',
        hasLlc: data.hasLlc,
        llcState: data.llcState,
        estimatedRevenue: data.estimatedRevenue,
        countryOfResidence: data.countryOfResidence,
        mainTopic: data.mainTopic,
        additionalNotes: data.additionalNotes,
      }).returning();
      
      // Log audit
      logAudit({
        action: 'consultation_booked',
        userId: user.id,
        targetId: booking.id.toString(),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: {
          bookingCode,
          consultationType: consultationType.name,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime
        }
      });
      
      res.json({ success: true, booking });
    } catch (err: any) {
      log.error("Error creating booking", err);
      if (err.errors) {
        return res.status(400).json({ message: err.errors[0]?.message || "Error creating booking" });
      }
      res.status(500).json({ message: "Error creating the booking" });
    }
  });

  // Get user's consultations
  app.get("/api/consultations/my", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      const bookings = await db.select({
        booking: consultationBookings,
        consultationType: consultationTypes
      }).from(consultationBookings)
        .innerJoin(consultationTypes, eq(consultationBookings.consultationTypeId, consultationTypes.id))
        .where(eq(consultationBookings.userId, userId))
        .orderBy(desc(consultationBookings.scheduledDate));
      
      res.json(bookings);
    } catch (err) {
      log.error("Error fetching user consultations", err);
      res.status(500).json({ message: "Error fetching consultations" });
    }
  });

  // Cancel a consultation (user)
  app.patch("/api/consultations/:id/cancel", isAuthenticated, isNotUnderReview, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const bookingId = parseInt(req.params.id);
      
      const [booking] = await db.select().from(consultationBookings)
        .where(and(
          eq(consultationBookings.id, bookingId),
          eq(consultationBookings.userId, userId)
        ));
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (!['pending', 'confirmed'].includes(booking.status)) {
        return res.status(400).json({ message: "Cannot cancel this booking" });
      }
      
      await db.update(consultationBookings)
        .set({ 
          status: 'cancelled', 
          cancelledAt: new Date(),
          cancelReason: req.body.reason || 'Cancelled by user',
          updatedAt: new Date()
        })
        .where(eq(consultationBookings.id, bookingId));
      
      logAudit({
        action: 'consultation_cancelled',
        userId: userId,
        targetId: bookingId.toString(),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: { bookingCode: booking.bookingCode }
      });
      
      res.json({ success: true });
    } catch (err) {
      log.error("Error cancelling booking", err);
      res.status(500).json({ message: "Error canceling booking" });
    }
  });

  // ===== ADMIN CONSULTATION ROUTES =====

  // Get all consultation types (admin)
  app.get("/api/admin/consultations/types", isAdmin, async (req, res) => {
    try {
      const types = await db.select().from(consultationTypes).orderBy(desc(consultationTypes.createdAt));
      res.json(types);
    } catch (err) {
      log.error("Error fetching consultation types", err);
      res.status(500).json({ message: "Error fetching consultation types" });
    }
  });

  // Create consultation type (admin)
  app.post("/api/admin/consultations/types", isAdmin, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        nameEs: z.string().min(1),
        nameEn: z.string().min(1),
        nameCa: z.string().min(1),
        description: z.string().optional(),
        descriptionEs: z.string().optional(),
        descriptionEn: z.string().optional(),
        descriptionCa: z.string().optional(),
        duration: z.number().min(15).max(180),
        price: z.number().min(0),
        isActive: z.boolean().optional(),
      });
      
      const data = schema.parse(req.body);
      
      const [type] = await db.insert(consultationTypes).values(data).returning();
      
      logAudit({
        action: 'consultation_type_created',
        userId: req.session.userId!,
        targetId: type.id.toString(),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: { name: data.name }
      });
      
      res.json(type);
    } catch (err: any) {
      log.error("Error creating consultation type", err);
      res.status(400).json({ message: err.errors?.[0]?.message || "Error creating consultation type" });
    }
  });

  // Update consultation type (admin)
  app.patch("/api/admin/consultations/types/:id", isAdmin, async (req, res) => {
    try {
      const typeId = parseInt(req.params.id);
      
      const [updated] = await db.update(consultationTypes)
        .set(req.body)
        .where(eq(consultationTypes.id, typeId))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ message: "Type not found" });
      }
      
      res.json(updated);
    } catch (err) {
      log.error("Error updating consultation type", err);
      res.status(500).json({ message: "Error updating type" });
    }
  });

  // Delete consultation type (admin)
  app.delete("/api/admin/consultations/types/:id", isAdmin, async (req, res) => {
    try {
      const typeId = parseInt(req.params.id);
      await db.delete(consultationTypes).where(eq(consultationTypes.id, typeId));
      res.json({ success: true });
    } catch (err) {
      log.error("Error deleting consultation type", err);
      res.status(500).json({ message: "Error deleting type" });
    }
  });

  // Get availability schedule (admin)
  app.get("/api/admin/consultations/availability", isAdmin, async (req, res) => {
    try {
      const slots = await db.select().from(consultationAvailability).orderBy(consultationAvailability.dayOfWeek, consultationAvailability.startTime);
      res.json(slots);
    } catch (err) {
      log.error("Error fetching availability", err);
      res.status(500).json({ message: "Error fetching availability" });
    }
  });

  // Add availability slot (admin)
  app.post("/api/admin/consultations/availability", isAdmin, async (req, res) => {
    try {
      const schema = z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        isActive: z.boolean().optional(),
      });
      
      const data = schema.parse(req.body);
      
      const [slot] = await db.insert(consultationAvailability).values(data).returning();
      res.json(slot);
    } catch (err: any) {
      log.error("Error creating availability slot", err);
      res.status(400).json({ message: err.errors?.[0]?.message || "Error creating schedule" });
    }
  });

  // Update availability slot (admin)
  app.patch("/api/admin/consultations/availability/:id", isAdmin, async (req, res) => {
    try {
      const slotId = parseInt(req.params.id);
      
      const [updated] = await db.update(consultationAvailability)
        .set(req.body)
        .where(eq(consultationAvailability.id, slotId))
        .returning();
      
      res.json(updated);
    } catch (err) {
      log.error("Error updating availability", err);
      res.status(500).json({ message: "Error updating schedule" });
    }
  });

  // Delete availability slot (admin)
  app.delete("/api/admin/consultations/availability/:id", isAdmin, async (req, res) => {
    try {
      const slotId = parseInt(req.params.id);
      await db.delete(consultationAvailability).where(eq(consultationAvailability.id, slotId));
      res.json({ success: true });
    } catch (err) {
      log.error("Error deleting availability", err);
      res.status(500).json({ message: "Error deleting schedule" });
    }
  });

  // Get blocked dates (admin)
  app.get("/api/admin/consultations/blocked-dates", isAdmin, async (req, res) => {
    try {
      const dates = await db.select().from(consultationBlockedDates).orderBy(desc(consultationBlockedDates.date));
      res.json(dates);
    } catch (err) {
      log.error("Error fetching blocked dates", err);
      res.status(500).json({ message: "Error fetching blocked dates" });
    }
  });

  // Add blocked date (admin)
  app.post("/api/admin/consultations/blocked-dates", isAdmin, async (req, res) => {
    try {
      const schema = z.object({
        date: z.string(),
        reason: z.string().optional(),
      });
      
      const data = schema.parse(req.body);
      
      const [blocked] = await db.insert(consultationBlockedDates).values({
        date: new Date(data.date),
        reason: data.reason
      }).returning();
      
      res.json(blocked);
    } catch (err: any) {
      log.error("Error creating blocked date", err);
      res.status(400).json({ message: err.errors?.[0]?.message || "Error blocking date" });
    }
  });

  // Delete blocked date (admin)
  app.delete("/api/admin/consultations/blocked-dates/:id", isAdmin, async (req, res) => {
    try {
      const dateId = parseInt(req.params.id);
      await db.delete(consultationBlockedDates).where(eq(consultationBlockedDates.id, dateId));
      res.json({ success: true });
    } catch (err) {
      log.error("Error deleting blocked date", err);
      res.status(500).json({ message: "Error deleting blocked date" });
    }
  });

  // Get all bookings (admin)
  app.get("/api/admin/consultations/bookings", isAdminOrSupport, async (req, res) => {
    try {
      const { status, from, to } = req.query;
      
      const bookings = await db.select({
        booking: consultationBookings,
        consultationType: consultationTypes,
        user: {
          id: usersTable.id,
          email: usersTable.email,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          clientId: usersTable.clientId
        }
      }).from(consultationBookings)
        .innerJoin(consultationTypes, eq(consultationBookings.consultationTypeId, consultationTypes.id))
        .leftJoin(usersTable, eq(consultationBookings.userId, usersTable.id))
        .orderBy(desc(consultationBookings.scheduledDate));
      
      res.json(bookings);
    } catch (err) {
      log.error("Error fetching bookings", err);
      res.status(500).json({ message: "Error fetching bookings" });
    }
  });

  // Update booking status (admin)
  app.patch("/api/admin/consultations/bookings/:id", isAdminOrSupport, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status, adminNotes, meetingLink } = req.body;
      
      const updateData: any = { updatedAt: new Date() };
      
      if (status) {
        updateData.status = status;
        if (status === 'confirmed') updateData.confirmedAt = new Date();
        if (status === 'completed') updateData.completedAt = new Date();
        if (status === 'cancelled') updateData.cancelledAt = new Date();
      }
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
      if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
      
      const [updated] = await db.update(consultationBookings)
        .set(updateData)
        .where(eq(consultationBookings.id, bookingId))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      logAudit({
        action: 'consultation_updated',
        userId: req.session.userId!,
        targetId: bookingId.toString(),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: { status, adminNotes, meetingLink }
      });
      
      res.json(updated);
    } catch (err) {
      log.error("Error updating booking", err);
      res.status(500).json({ message: "Error updating booking" });
    }
  });

  // Reschedule booking (admin)
  app.patch("/api/admin/consultations/bookings/:id/reschedule", isAdminOrSupport, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { scheduledDate, scheduledTime } = req.body;
      
      // Check new slot availability
      const newDate = new Date(scheduledDate);
      const [existingBooking] = await db.select().from(consultationBookings)
        .where(and(
          sql`DATE(${consultationBookings.scheduledDate}) = DATE(${newDate})`,
          eq(consultationBookings.scheduledTime, scheduledTime),
          inArray(consultationBookings.status, ['pending', 'confirmed'])
        ));
      
      if (existingBooking && existingBooking.id !== bookingId) {
        return res.status(400).json({ message: "This schedule is already booked" });
      }
      
      const [updated] = await db.update(consultationBookings)
        .set({ 
          scheduledDate: newDate,
          scheduledTime,
          status: 'rescheduled',
          updatedAt: new Date()
        })
        .where(eq(consultationBookings.id, bookingId))
        .returning();
      
      logAudit({
        action: 'consultation_rescheduled',
        userId: req.session.userId!,
        targetId: bookingId.toString(),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: { scheduledDate, scheduledTime }
      });
      
      res.json(updated);
    } catch (err) {
      log.error("Error rescheduling booking", err);
      res.status(500).json({ message: "Error rescheduling booking" });
    }
  });

  // Get consultation stats (admin)
  app.get("/api/admin/consultations/stats", isAdminOrSupport, async (req, res) => {
    try {
      const [pending] = await db.select({ count: sql<number>`count(*)` }).from(consultationBookings).where(eq(consultationBookings.status, 'pending'));
      const [confirmed] = await db.select({ count: sql<number>`count(*)` }).from(consultationBookings).where(eq(consultationBookings.status, 'confirmed'));
      const [completed] = await db.select({ count: sql<number>`count(*)` }).from(consultationBookings).where(eq(consultationBookings.status, 'completed'));
      const [cancelled] = await db.select({ count: sql<number>`count(*)` }).from(consultationBookings).where(eq(consultationBookings.status, 'cancelled'));
      
      res.json({
        pending: Number(pending?.count || 0),
        confirmed: Number(confirmed?.count || 0),
        completed: Number(completed?.count || 0),
        cancelled: Number(cancelled?.count || 0),
        total: Number(pending?.count || 0) + Number(confirmed?.count || 0) + Number(completed?.count || 0) + Number(cancelled?.count || 0)
      });
    } catch (err) {
      log.error("Error fetching consultation stats", err);
      res.status(500).json({ message: "Error fetching statistics" });
    }
  });
}

export async function processConsultationReminders() {
  try {
    const now = new Date();
    const madridOffset = getMadridOffset(now);
    
    const upcomingBookings = await db.select().from(consultationBookings)
      .where(and(
        inArray(consultationBookings.status, ['pending', 'confirmed']),
        gte(consultationBookings.scheduledDate, new Date(now.getTime() - 86400000)),
        lte(consultationBookings.scheduledDate, new Date(now.getTime() + 86400000 * 2))
      ));
    
    for (const booking of upcomingBookings) {
      const [slotH, slotM] = booking.scheduledTime.split(':').map(Number);
      const bookingDate = new Date(booking.scheduledDate);
      bookingDate.setHours(slotH, slotM, 0, 0);
      
      const bookingUtc = new Date(bookingDate.getTime() - madridOffset * 60000);
      const msUntilBooking = bookingUtc.getTime() - now.getTime();
      const hoursUntil = msUntilBooking / (1000 * 60 * 60);
      
      const email = booking.guestEmail || null;
      const name = booking.guestFirstName || 'Cliente';
      const lang = (booking.preferredLanguage || 'es') as any;

      if (!email) {
        if (booking.userId) {
          const [user] = await db.select({ email: usersTable.email, firstName: usersTable.firstName }).from(usersTable).where(eq(usersTable.id, booking.userId)).limit(1);
          if (!user || !user.email) continue;
          await sendReminder(booking, user.email!, user.firstName || name, lang, hoursUntil);
        }
        continue;
      }
      
      await sendReminder(booking, email, name, lang, hoursUntil);
    }
  } catch (err) {
    log.error("Error processing consultation reminders", err);
  }
}

async function sendReminder(booking: any, email: string, name: string, lang: any, hoursUntil: number) {
  const { getConsultationReminderTemplate, sendEmail } = await import("../lib/email");
  const { getEmailTranslations } = await import("../lib/email-translations");
  const t = getEmailTranslations(lang);
  
  const dateObj = new Date(booking.scheduledDate);
  const dateFormatted = dateObj.toLocaleDateString(lang === 'en' ? 'en-GB' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : lang === 'pt' ? 'pt-PT' : lang === 'ca' ? 'ca-ES' : 'es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  if (hoursUntil <= 3.5 && hoursUntil > 2.5 && !booking.reminder3hSentAt) {
    const html = getConsultationReminderTemplate(name, booking.bookingCode, dateFormatted, booking.scheduledTime, booking.duration, '3h', lang);
    await sendEmail({ to: email, subject: t.consultationReminder.subject3h, html });
    await db.update(consultationBookings).set({ reminder3hSentAt: new Date() }).where(eq(consultationBookings.id, booking.id));
    log.info(`Sent 3h reminder for booking ${booking.bookingCode} to ${email}`);
  }
  
  if (hoursUntil <= 0.75 && hoursUntil > 0.1 && !booking.reminder30mSentAt) {
    const html = getConsultationReminderTemplate(name, booking.bookingCode, dateFormatted, booking.scheduledTime, booking.duration, '30m', lang);
    await sendEmail({ to: email, subject: t.consultationReminder.subject30m, html });
    await db.update(consultationBookings).set({ reminder30mSentAt: new Date() }).where(eq(consultationBookings.id, booking.id));
    log.info(`Sent 30m reminder for booking ${booking.bookingCode} to ${email}`);
  }
}
