import type { Express } from "express";
import { z } from "zod";
import { and, eq, gt, desc, sql } from "drizzle-orm";
import { db, storage, isAuthenticated, isNotUnderReview, isAdmin, logAudit, getClientIp, logActivity } from "./shared";
import { contactOtps, users as usersTable, userNotifications, orders as ordersTable, llcApplications as llcApplicationsTable, standaloneInvoices } from "@shared/schema";
import { sendEmail, getProfileChangeOtpTemplate, getAdminProfileChangesTemplate, getAccountDeactivatedByUserTemplate } from "../lib/email";
import { getEmailTranslations, EmailLanguage } from "../lib/email-translations";
import { checkRateLimit } from "../lib/security";
import { getUpcomingDeadlinesForUser } from "../calendar-service";
import { createLogger } from "../lib/logger";

const log = createLogger('user-profile');

export function registerUserProfileRoutes(app: Express) {
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  // Protected admin seeding - requires existing admin authentication
  app.post("/api/seed-admin", isAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      const adminEmail = email || process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
      
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, adminEmail)).limit(1);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found." });
      }
      
      await db.update(usersTable).set({ isAdmin: true, accountStatus: 'active' }).where(eq(usersTable.email, adminEmail));
      res.json({ success: true, message: "Admin role assigned successfully" });
    } catch (error) {
      log.error("Seed admin error", error);
      res.status(500).json({ message: "Error assigning admin role" });
    }
  });

  // Client Deactivate Account (user requests "delete" but we only deactivate, preserving all data)
  app.delete("/api/user/account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.accountStatus === 'deactivated') {
        return res.status(400).json({ message: "Account is already deactivated" });
      }

      await db.update(usersTable).set({ 
        accountStatus: 'deactivated',
        isActive: false,
        internalNotes: user.internalNotes 
          ? `${user.internalNotes}\n[${new Date().toISOString()}] Desactivado por petición del cliente`
          : `[${new Date().toISOString()}] Desactivado por petición del cliente`,
        updatedAt: new Date()
      }).where(eq(usersTable.id, userId));

      const uLang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
      
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: uLang === 'en' ? "Your account deletion request" 
            : uLang === 'ca' ? "Sol·licitud d'eliminació del teu compte" 
            : uLang === 'fr' ? "Demande de suppression de votre compte" 
            : uLang === 'de' ? "Ihre Kontolöschungsanfrage" 
            : uLang === 'it' ? "Richiesta di eliminazione del tuo account" 
            : uLang === 'pt' ? "Pedido de eliminação da sua conta" 
            : "Solicitud de eliminación de tu cuenta",
          html: getAccountDeactivatedByUserTemplate(user.firstName || undefined, uLang)
        }).catch(() => {});
      }

      logActivity("Cuenta desactivada por cliente", { userId, email: user.email });

      req.session.destroy(() => {});
      res.json({ success: true, message: "Account deactivated successfully" });
    } catch (error) {
      log.error("Deactivate account error", error);
      res.status(500).json({ message: "Error deactivating account" });
    }
  });

  // Save language preference (separate from profile - no OTP needed)
  app.patch("/api/user/language", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { preferredLanguage } = req.body;
      if (!preferredLanguage || typeof preferredLanguage !== 'string') {
        return res.status(400).json({ message: "Invalid language" });
      }
      await db.update(usersTable).set({ preferredLanguage }).where(eq(usersTable.id, userId));
      const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      res.json(updatedUser);
    } catch (error) {
      log.error("Update language error", error);
      res.status(500).json({ message: "Error updating language" });
    }
  });

  // Client Update Profile
  const updateProfileSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    businessActivity: z.string().optional(),
    address: z.string().optional(),
    streetType: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    idNumber: z.string().optional(),
    idType: z.string().optional(),
    birthDate: z.string().optional(),
  });
  
  // Sensitive fields that require OTP: name, ID/passport, phone only
  const sensitiveFields = ['firstName', 'lastName', 'idNumber', 'idType', 'phone'];
  
  app.patch("/api/user/profile", isAuthenticated, isNotUnderReview, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { otpCode, ...profileData } = req.body;
      const validatedData = updateProfileSchema.parse(profileData);
      
      const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!currentUser || !currentUser.email) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const currentUserEmail = currentUser.email;
      
      // Check which sensitive fields are being changed
      // OTP is only required when MODIFYING an existing value, not when setting it for the first time
      const changedSensitiveFields: { field: string; oldValue: any; newValue: any }[] = [];
      for (const field of sensitiveFields) {
        const currentValue = currentUser[field as keyof typeof currentUser];
        const newValue = validatedData[field as keyof typeof validatedData];
        const currentIsEmpty = !currentValue || (typeof currentValue === 'string' && currentValue.trim() === '');
        const newIsEmpty = !newValue || (typeof newValue === 'string' && newValue.trim() === '');
        
        if (field in validatedData && newValue !== currentValue) {
          // Skip OTP if the current value is empty (first time setting) or new value is empty (clearing)
          if (currentIsEmpty || newIsEmpty) {
            continue;
          }
          changedSensitiveFields.push({
            field,
            oldValue: currentValue || '(empty)',
            newValue: newValue || '(empty)'
          });
        }
      }
      
      if (changedSensitiveFields.length > 0) {
        if (!otpCode) {
          // Separate non-sensitive changes (apply immediately) from sensitive (hold pending)
          const nonSensitiveData: Record<string, any> = {};
          const pendingData: Record<string, any> = {};
          
          for (const [key, value] of Object.entries(validatedData)) {
            if (sensitiveFields.includes(key) && changedSensitiveFields.some(f => f.field === key)) {
              pendingData[key] = value;
            } else {
              nonSensitiveData[key] = value;
            }
          }
          
          // Apply non-sensitive changes immediately
          if (Object.keys(nonSensitiveData).length > 0) {
            await db.update(usersTable).set(nonSensitiveData).where(eq(usersTable.id, userId));
          }
          
          // Store pending sensitive changes with 24h expiry
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await db.update(usersTable).set({
            pendingProfileChanges: { fields: pendingData, changedFields: changedSensitiveFields, requestedAt: new Date().toISOString() },
            pendingChangesExpiresAt: expiresAt,
          }).where(eq(usersTable.id, userId));
          
          // Generate OTP (24h validity)
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          
          await db.insert(contactOtps).values({
            email: currentUserEmail,
            otp,
            otpType: "profile_change",
            expiresAt: otpExpiresAt,
            verified: false
          });
          
          const userLang = (currentUser.preferredLanguage as any) || 'es';
          const userName = currentUser.firstName || 'Cliente';
          sendEmail({
            to: currentUserEmail,
            subject: `${getEmailTranslations(userLang).profileChangeOtp.title} - Easy US LLC`,
            html: getProfileChangeOtpTemplate(userName, otp, userLang)
          }).catch((err: any) => log.error('Failed to send profile change OTP', err));
          
          return res.status(400).json({ 
            message: "OTP verification required for sensitive changes",
            code: "OTP_REQUIRED",
            changedFields: changedSensitiveFields.map(f => f.field),
            pendingChanges: pendingData
          });
        }
        
        // OTP provided - verify it
        const [otpRecord] = await db.select()
          .from(contactOtps)
          .where(
            and(
              eq(contactOtps.email, currentUserEmail),
              eq(contactOtps.otpType, "profile_change"),
              eq(contactOtps.otp, otpCode),
              eq(contactOtps.verified, false),
              gt(contactOtps.expiresAt, new Date())
            )
          )
          .orderBy(sql`${contactOtps.expiresAt} DESC`)
          .limit(1);
        
        if (!otpRecord) {
          return res.status(400).json({ message: "Invalid or expired OTP code", code: "OTP_INVALID" });
        }
        
        // Mark OTP as used
        await db.update(contactOtps).set({ verified: true }).where(eq(contactOtps.id, otpRecord.id));
        
        // Apply ALL changes (including previously pending sensitive ones)
        await db.update(usersTable).set({
          ...validatedData,
          pendingProfileChanges: null,
          pendingChangesExpiresAt: null,
        }).where(eq(usersTable.id, userId));
        
        // Log audit for admin visibility
        logAudit({
          action: 'password_change',
          userId,
          details: {
            type: 'profile_update_verified',
            changedFields: changedSensitiveFields,
            email: currentUser.email,
            clientId: currentUser.clientId
          }
        });
        
        const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
        sendEmail({
          to: adminEmail,
          subject: `[ALERTA] Cambios de perfil verificados - Cliente ${currentUser.clientId}`,
          html: getAdminProfileChangesTemplate(
            `${currentUser.firstName} ${currentUser.lastName}`,
            currentUser.email || '',
            currentUser.clientId || '',
            changedSensitiveFields
          )
        }).catch((err: any) => log.error('Failed to send admin profile change email', err));
        
        const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        return res.json(updatedUser);
      }
      
      // No sensitive fields changed - apply immediately
      await db.update(usersTable).set(validatedData).where(eq(usersTable.id, userId));
      
      const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      log.error("Update profile error", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });
  
  // Confirm pending profile changes with OTP
  app.post("/api/user/profile/confirm-otp", isAuthenticated, isNotUnderReview, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { otpCode } = req.body;
      
      if (!otpCode || typeof otpCode !== 'string' || otpCode.length !== 6) {
        return res.status(400).json({ message: "Invalid OTP code" });
      }
      
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const pendingChanges = user.pendingProfileChanges as any;
      if (!pendingChanges || !pendingChanges.fields) {
        return res.status(400).json({ message: "No pending changes to confirm" });
      }
      
      // Check if pending changes have expired
      if (user.pendingChangesExpiresAt && new Date(user.pendingChangesExpiresAt) < new Date()) {
        await db.update(usersTable).set({ pendingProfileChanges: null, pendingChangesExpiresAt: null }).where(eq(usersTable.id, userId));
        return res.status(400).json({ message: "Pending changes have expired. Please make the changes again." });
      }
      
      const userEmail = user.email;
      
      // Verify OTP
      const [otpRecord] = await db.select()
        .from(contactOtps)
        .where(
          and(
            eq(contactOtps.email, userEmail),
            eq(contactOtps.otpType, "profile_change"),
            eq(contactOtps.otp, otpCode),
            eq(contactOtps.verified, false),
            gt(contactOtps.expiresAt, new Date())
          )
        )
        .orderBy(sql`${contactOtps.expiresAt} DESC`)
        .limit(1);
      
      if (!otpRecord) {
        const attempts = (pendingChanges.otpAttempts || 0) + 1;
        const maxAttempts = 5;
        
        if (attempts >= maxAttempts) {
          await db.update(usersTable).set({ 
            pendingProfileChanges: null, 
            pendingChangesExpiresAt: null,
            accountStatus: 'pending'
          }).where(eq(usersTable.id, userId));
          
          logAudit({
            action: 'account_review',
            userId,
            details: { reason: 'Too many failed OTP attempts for profile change', attempts, email: user.email }
          });
          
          return res.status(403).json({ 
            message: "Too many failed attempts. Your account has been placed under review for security.", 
            code: "ACCOUNT_UNDER_REVIEW",
            attemptsRemaining: 0
          });
        }
        
        await db.update(usersTable).set({ 
          pendingProfileChanges: { ...pendingChanges, otpAttempts: attempts }
        }).where(eq(usersTable.id, userId));
        
        return res.status(400).json({ 
          message: "Invalid or expired OTP code", 
          code: "OTP_INVALID",
          attemptsRemaining: maxAttempts - attempts
        });
      }
      
      // Mark OTP as used
      await db.update(contactOtps).set({ verified: true }).where(eq(contactOtps.id, otpRecord.id));
      
      // Apply pending changes
      await db.update(usersTable).set({
        ...pendingChanges.fields,
        pendingProfileChanges: null,
        pendingChangesExpiresAt: null,
      }).where(eq(usersTable.id, userId));
      
      // Log audit
      logAudit({
        action: 'password_change',
        userId,
        details: {
          type: 'profile_update_verified',
          changedFields: pendingChanges.changedFields,
          email: user.email,
          clientId: user.clientId
        }
      });
      
      const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
      sendEmail({
        to: adminEmail,
        subject: `[ALERTA] Cambios de perfil verificados - Cliente ${user.clientId}`,
        html: getAdminProfileChangesTemplate(
          `${user.firstName} ${user.lastName}`,
          user.email || '',
          user.clientId || '',
          pendingChanges.changedFields || []
        )
      }).catch((err: any) => log.error('Failed to send admin profile change email', err));
      
      const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      log.error("Confirm profile OTP error", error);
      res.status(500).json({ message: "Error confirming changes" });
    }
  });
  
  // Cancel pending profile changes
  app.post("/api/user/profile/cancel-pending", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      await db.update(usersTable).set({ pendingProfileChanges: null, pendingChangesExpiresAt: null }).where(eq(usersTable.id, userId));
      const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      log.error("Cancel pending changes error", error);
      res.status(500).json({ message: "Error cancelling changes" });
    }
  });
  
  // Resend OTP for pending profile changes
  app.post("/api/user/profile/resend-otp", isAuthenticated, isNotUnderReview, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      
      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const pendingChanges = user.pendingProfileChanges as any;
      if (!pendingChanges) {
        return res.status(400).json({ message: "No pending changes" });
      }
      
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit('otp', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` });
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const userEmail = user.email;
      
      await db.insert(contactOtps).values({
        email: userEmail,
        otp,
        otpType: "profile_change",
        expiresAt: otpExpiresAt,
        verified: false
      });
      
      const resendLang = (user.preferredLanguage as any) || 'es';
      const resendName = user.firstName || 'Cliente';
      sendEmail({
        to: userEmail,
        subject: `${getEmailTranslations(resendLang).profileChangeOtp.title} - Easy US LLC`,
        html: getProfileChangeOtpTemplate(resendName, otp, resendLang)
      }).catch((err: any) => log.error('Failed to send resend OTP email', err));
      
      res.json({ success: true, message: "New OTP code sent" });
    } catch (error) {
      log.error("Resend OTP error", error);
      res.status(500).json({ message: "Error sending OTP" });
    }
  });

  // User Compliance Deadlines - Calendar API
  app.get("/api/user/deadlines", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      // Get all user orders with applications
      const userOrders = await db.select({
        order: ordersTable,
        application: llcApplicationsTable,
      })
      .from(ordersTable)
      .leftJoin(llcApplicationsTable, eq(ordersTable.id, llcApplicationsTable.orderId))
      .where(eq(ordersTable.userId, userId));

      const applications = userOrders
        .filter(o => o.application)
        .map(o => o.application);

      const deadlines = getUpcomingDeadlinesForUser(applications);
      res.json(deadlines);
    } catch (error) {
      log.error("Error fetching deadlines", error);
      res.status(500).json({ message: "Error fetching compliance dates" });
    }
  });

  // Client update order (allowed fields before processing)
  app.patch("/api/orders/:id", isAuthenticated, isNotUnderReview, async (req: any, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order || order.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ message: "The order is already in progress and cannot be modified." });
      }

      const updateSchema = z.object({
        companyNameOption2: z.string().optional(),
        designator: z.string().optional(),
        companyDescription: z.string().optional(),
        ownerNamesAlternates: z.string().optional(),
        notes: z.string().optional()
      });

      const validatedData = updateSchema.parse(req.body);
      
      await db.update(llcApplicationsTable)
        .set({ ...validatedData, lastUpdated: new Date() })
        .where(eq(llcApplicationsTable.orderId, orderId));

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error updating order" });
    }
  });

  app.get("/api/user/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const invoices = await db.select({
        id: standaloneInvoices.id,
        invoiceNumber: standaloneInvoices.invoiceNumber,
        concept: standaloneInvoices.concept,
        amount: standaloneInvoices.amount,
        currency: standaloneInvoices.currency,
        status: standaloneInvoices.status,
        fileUrl: standaloneInvoices.fileUrl,
        createdAt: standaloneInvoices.createdAt,
        paidAt: standaloneInvoices.paidAt,
      })
        .from(standaloneInvoices)
        .where(eq(standaloneInvoices.userId, userId))
        .orderBy(desc(standaloneInvoices.createdAt));
      res.json(invoices);
    } catch (error) {
      log.error("Error fetching user invoices", error);
      res.status(500).json({ message: "Error fetching invoices" });
    }
  });

  app.get("/api/user/invoices/:id/download", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const invoiceId = parseInt(req.params.id);
      const [invoice] = await db.select().from(standaloneInvoices)
        .where(and(eq(standaloneInvoices.id, invoiceId), eq(standaloneInvoices.userId, userId)))
        .limit(1);
      if (!invoice || !invoice.fileUrl) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      if (invoice.fileUrl.startsWith('data:application/pdf;base64,')) {
        const base64 = invoice.fileUrl.replace('data:application/pdf;base64,', '');
        const pdfBuffer = Buffer.from(base64, 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.pdf"`);
        res.send(pdfBuffer);
      } else if (invoice.fileUrl.startsWith('data:text/html;base64,')) {
        const base64 = invoice.fileUrl.replace('data:text/html;base64,', '');
        const html = Buffer.from(base64, 'base64').toString('utf-8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.html"`);
        res.send(html);
      } else {
        return res.status(400).json({ message: "Invalid invoice format" });
      }
    } catch (error) {
      log.error("Error downloading user invoice", error);
      res.status(500).json({ message: "Error downloading invoice" });
    }
  });

  app.get("/api/user/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const notifs = await db.select()
        .from(userNotifications)
        .where(eq(userNotifications.userId, userId))
        .orderBy(desc(userNotifications.createdAt))
        .limit(50);
      res.json(notifs);
    } catch (error) {
      log.error("Get notifications error", error);
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });

  app.patch("/api/user/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      await db.update(userNotifications)
        .set({ isRead: true })
        .where(and(eq(userNotifications.id, req.params.id), eq(userNotifications.userId, req.session.userId)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });

  // Delete user notification
  app.delete("/api/user/notifications/:id", isAuthenticated, async (req: any, res) => {
    try {
      await db.delete(userNotifications)
        .where(and(eq(userNotifications.id, req.params.id), eq(userNotifications.userId, req.session.userId)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting notification" });
    }
  });
}
