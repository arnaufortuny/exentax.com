import type { Express } from "express";
import { z } from "zod";
import { db, isAuthenticated, isAdmin, isAdminOrSupport, logAudit, getClientIp } from "./shared";
import { consultationTypes, consultationAvailability, consultationBlockedDates, consultationBookings, users as usersTable } from "@shared/schema";
import { and, eq, desc, sql, inArray } from "drizzle-orm";

export function registerConsultationRoutes(app: Express) {
  // ============ CONSULTATION BOOKING SYSTEM ============

  // Get all active consultation types (public)
  app.get("/api/consultations/types", async (req, res) => {
    try {
      const types = await db.select().from(consultationTypes).where(eq(consultationTypes.isActive, true));
      res.json(types);
    } catch (err) {
      console.error("Error fetching consultation types:", err);
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
      console.error("Error fetching availability:", err);
      res.status(500).json({ message: "Error fetching availability" });
    }
  });

  // Create a consultation booking (requires authentication)
  app.post("/api/consultations/book", isAuthenticated, async (req, res) => {
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
      console.error("Error creating booking:", err);
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
      console.error("Error fetching user consultations:", err);
      res.status(500).json({ message: "Error fetching consultations" });
    }
  });

  // Cancel a consultation (user)
  app.patch("/api/consultations/:id/cancel", isAuthenticated, async (req, res) => {
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
      console.error("Error cancelling booking:", err);
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
      console.error("Error fetching consultation types:", err);
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
      console.error("Error creating consultation type:", err);
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
      console.error("Error updating consultation type:", err);
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
      console.error("Error deleting consultation type:", err);
      res.status(500).json({ message: "Error deleting type" });
    }
  });

  // Get availability schedule (admin)
  app.get("/api/admin/consultations/availability", isAdmin, async (req, res) => {
    try {
      const slots = await db.select().from(consultationAvailability).orderBy(consultationAvailability.dayOfWeek, consultationAvailability.startTime);
      res.json(slots);
    } catch (err) {
      console.error("Error fetching availability:", err);
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
      console.error("Error creating availability slot:", err);
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
      console.error("Error updating availability:", err);
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
      console.error("Error deleting availability:", err);
      res.status(500).json({ message: "Error deleting schedule" });
    }
  });

  // Get blocked dates (admin)
  app.get("/api/admin/consultations/blocked-dates", isAdmin, async (req, res) => {
    try {
      const dates = await db.select().from(consultationBlockedDates).orderBy(desc(consultationBlockedDates.date));
      res.json(dates);
    } catch (err) {
      console.error("Error fetching blocked dates:", err);
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
      console.error("Error creating blocked date:", err);
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
      console.error("Error deleting blocked date:", err);
      res.status(500).json({ message: "Error deleting blocked date" });
    }
  });

  // Get all bookings (admin)
  app.get("/api/admin/consultations/bookings", isAdminOrSupport, async (req, res) => {
    try {
      const { status, from, to } = req.query;
      
      let query = db.select({
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
        .innerJoin(usersTable, eq(consultationBookings.userId, usersTable.id))
        .orderBy(desc(consultationBookings.scheduledDate));
      
      const bookings = await query;
      res.json(bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
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
      console.error("Error updating booking:", err);
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
      console.error("Error rescheduling booking:", err);
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
      console.error("Error fetching consultation stats:", err);
      res.status(500).json({ message: "Error fetching statistics" });
    }
  });
}
