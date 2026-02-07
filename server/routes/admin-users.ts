import type { Express } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { eq, desc, inArray, and, sql } from "drizzle-orm";
import { asyncHandler, db, isAdmin, isAdminOrSupport, logAudit, logActivity } from "./shared";
import { users as usersTable, orders as ordersTable, llcApplications as llcApplicationsTable, maintenanceApplications, applicationDocuments as applicationDocumentsTable, orderEvents, userNotifications, messages as messagesTable, messageReplies } from "@shared/schema";
import { sendEmail, getAccountDeactivatedTemplate, getAccountVipTemplate, getAccountReactivatedTemplate, getAdminPasswordResetTemplate } from "../lib/email";
import { validatePassword } from "../lib/security";

export function registerAdminUserRoutes(app: Express) {
  // Admin Users
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.patch("/api/admin/users/:id", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const updateSchema = z.object({
      firstName: z.string().min(1).max(100).optional(),
      lastName: z.string().min(1).max(100).optional(),
      email: z.string().email().optional(),
      phone: z.string().max(30).optional().nullable(),
      address: z.string().optional().nullable(),
      streetType: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      province: z.string().optional().nullable(),
      postalCode: z.string().optional().nullable(),
      country: z.string().optional().nullable(),
      idNumber: z.string().optional().nullable(),
      idType: z.enum(['dni', 'nie', 'passport']).optional().nullable(),
      birthDate: z.string().optional().nullable(),
      businessActivity: z.string().optional().nullable(),
      isActive: z.boolean().optional(),
      isAdmin: z.boolean().optional(),
      isSupport: z.boolean().optional(),
      accountStatus: z.enum(['active', 'pending', 'deactivated', 'vip']).optional(),
      internalNotes: z.string().optional().nullable()
    });
    const data = updateSchema.parse(req.body);
    
    // Only afortuny07@gmail.com can assign admin/support privileges
    const SUPER_ADMIN_EMAIL = "afortuny07@gmail.com";
    if (data.isAdmin !== undefined || data.isSupport !== undefined) {
      const [currentAdmin] = await db.select().from(usersTable).where(eq(usersTable.id, req.session?.userId || '')).limit(1);
      if (!currentAdmin || currentAdmin.email !== SUPER_ADMIN_EMAIL) {
        return res.status(403).json({ message: "Only the main administrator can assign admin or support privileges" });
      }
    }
    
    // If setting isAdmin to true, ensure emailVerified is also true
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.isAdmin === true) {
      updateData.emailVerified = true;
      updateData.accountStatus = 'active';
    }
    
    const [updated] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId)).returning();

    // Audit log for user update
    logAudit({ 
      action: 'admin_user_update', 
      userId: req.session?.userId, 
      targetId: userId,
      details: { changes: Object.keys(data) } 
    });

    // Trigger emails based on account status change
    if (data.accountStatus) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (user && user.email) {
        if (data.accountStatus === 'deactivated') {
          await sendEmail({
            to: user.email,
            subject: "Notificación de estado de cuenta",
            html: getAccountDeactivatedTemplate(user.firstName || "Cliente")
          }).catch(() => {});
          await db.insert(userNotifications).values({
            userId,
            title: "Cuenta desactivada",
            message: "Tu cuenta ha sido desactivada. Contacta con soporte si tienes dudas.",
            type: 'action_required',
            isRead: false
          });
        } else if (data.accountStatus === 'vip') {
          await sendEmail({
            to: user.email,
            subject: "Tu cuenta ha sido actualizada a estado VIP",
            html: getAccountVipTemplate(user.firstName || "Cliente")
          }).catch(() => {});
          await db.insert(userNotifications).values({
            userId,
            title: "Estado VIP activado",
            message: "Tu cuenta ha sido actualizada al estado VIP con beneficios prioritarios.",
            type: 'update',
            isRead: false
          });
        } else if (data.accountStatus === 'active') {
          await sendEmail({
            to: user.email,
            subject: "Tu cuenta ha sido reactivada",
            html: getAccountReactivatedTemplate(user.firstName || "Cliente")
          }).catch(() => {});
          await db.insert(userNotifications).values({
            userId,
            title: "Cuenta reactivada",
            message: "Tu cuenta ha sido reactivada y ya puedes acceder a todos los servicios.",
            type: 'update',
            isRead: false
          });
        }
      }
    }

    // Log account changes to admin
    if (data.accountStatus || data.isActive !== undefined) {
      logActivity("Cambio Crítico de Cuenta", { 
        userId, 
        "Nuevo Estado": data.accountStatus, 
        "Activo": data.isActive,
        adminId: (req as any).session.userId 
      }, req);
    }

    res.json(updated);
  }));

  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Cascade delete all user-related data for security and data integrity
      // 1. Get all orders for this user
      const userOrders = await db.select({ id: ordersTable.id }).from(ordersTable).where(eq(ordersTable.userId, userId));
      const orderIds = userOrders.map(o => o.id);
      
      // 2. Get all LLC applications from user's orders
      const userApps = orderIds.length > 0 
        ? await db.select({ id: llcApplicationsTable.id }).from(llcApplicationsTable).where(inArray(llcApplicationsTable.orderId, orderIds))
        : [];
      const appIds = userApps.map(a => a.id);
      
      // 3. Delete documents associated with orders/applications
      if (orderIds.length > 0) {
        await db.delete(applicationDocumentsTable).where(inArray(applicationDocumentsTable.orderId, orderIds));
      }
      if (appIds.length > 0) {
        await db.delete(applicationDocumentsTable).where(inArray(applicationDocumentsTable.applicationId, appIds));
      }
      
      // 4. Delete order events
      if (orderIds.length > 0) {
        await db.delete(orderEvents).where(inArray(orderEvents.orderId, orderIds));
      }
      
      // 5. Delete user notifications
      await db.delete(userNotifications).where(eq(userNotifications.userId, userId));
      
      // 6. Delete message replies and messages
      const userMessages = await db.select({ id: messagesTable.id }).from(messagesTable).where(eq(messagesTable.userId, userId));
      const messageIds = userMessages.map(m => m.id);
      if (messageIds.length > 0) {
        await db.delete(messageReplies).where(inArray(messageReplies.messageId, messageIds));
      }
      await db.delete(messagesTable).where(eq(messagesTable.userId, userId));
      
      // 7. Delete maintenance applications from user's orders
      if (orderIds.length > 0) {
        await db.delete(maintenanceApplications).where(inArray(maintenanceApplications.orderId, orderIds));
      }
      
      // 8. Delete LLC applications from user's orders
      if (orderIds.length > 0) {
        await db.delete(llcApplicationsTable).where(inArray(llcApplicationsTable.orderId, orderIds));
      }
      
      // 9. Delete orders
      await db.delete(ordersTable).where(eq(ordersTable.userId, userId));
      
      // 10. Finally delete the user
      await db.delete(usersTable).where(eq(usersTable.id, userId));
      
      logAudit({ 
        action: 'admin_user_update', 
        userId: req.session?.userId, 
        targetId: userId,
        details: { action: 'cascade_delete', deletedOrders: orderIds.length, deletedApps: appIds.length } 
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  app.post("/api/admin/users/create", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email(),
      phone: z.string().optional(),
      password: z.string().min(6)
    });
    const { firstName, lastName, email, phone, password } = schema.parse(req.body);
    
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    
    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [newUser] = await db.insert(usersTable).values({
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      passwordHash: hashedPassword,
      emailVerified: true,
      accountStatus: 'active'
    }).returning();
    
    res.json({ success: true, userId: newUser.id });
  }));

  // Admin reset client password
  app.post("/api/admin/users/:id/reset-password", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ message: "Password is required" });
    }
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }
    
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db.update(usersTable).set({ 
      passwordHash: hashedPassword, 
      updatedAt: new Date() 
    }).where(eq(usersTable.id, userId));
    
    logAudit({ 
      action: 'admin_password_reset', 
      userId: req.session?.userId, 
      targetId: userId,
      details: { email: user.email }
    });
    
    // Send email notification to user
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "Tu contraseña ha sido restablecida",
        html: getAdminPasswordResetTemplate(user.firstName || 'Cliente')
      }).catch(() => {});
    }
    
    res.json({ success: true });
  }));

  // Download all user documents as ZIP
  app.get("/api/admin/users/:id/documents/download", isAdminOrSupport, asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const archiver = await import("archiver");
    const path = await import("path");
    const fs = await import("fs");
    
    // Get user info
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get all documents for this user
    const documents = await db.select()
      .from(applicationDocumentsTable)
      .where(eq(applicationDocumentsTable.userId, userId));
    
    if (documents.length === 0) {
      return res.status(404).json({ message: "No documents found for this user" });
    }
    
    // Create ZIP archive
    const archive = archiver.default('zip', { zlib: { level: 9 } });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="documentos_${user.firstName || 'cliente'}_${user.clientId || userId}.zip"`);
    
    archive.pipe(res);
    
    for (const doc of documents) {
      const filePath = path.join(process.cwd(), doc.fileUrl);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: doc.fileName });
      }
    }
    
    await archive.finalize();
    
    logAudit({
      action: 'admin_documents_download',
      userId: req.session?.userId,
      targetId: userId,
      details: { documentCount: documents.length }
    });
  }));

  // Deactivate user account (for clients who don't renew)
  app.patch("/api/admin/users/:id/deactivate", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { reason, confirmDeactivation } = req.body;
    
    // Require explicit confirmation
    if (!confirmDeactivation) {
      return res.status(400).json({ message: "Explicit confirmation required (confirmDeactivation: true)" });
    }
    
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Cannot deactivate admin users
    if (user.isAdmin) {
      return res.status(403).json({ message: "Cannot deactivate an administrator" });
    }
    
    // Check if user is already deactivated
    if (user.accountStatus === 'deactivated') {
      return res.status(400).json({ message: "User is already deactivated" });
    }
    
    // Check for any recent paid orders (within last 30 days)
    const recentOrders = await db.select().from(ordersTable)
      .where(and(
        eq(ordersTable.userId, userId),
        eq(ordersTable.status, 'paid'),
        sql`${ordersTable.paidAt} > NOW() - INTERVAL '30 days'`
      )).limit(1);
    
    if (recentOrders.length > 0) {
      return res.status(400).json({ 
        message: "Cannot deactivate: user has a recent payment in the last 30 days" 
      });
    }
    
    const sanitizedReason = reason ? String(reason).slice(0, 500) : 'No renovó mantenimiento';
    
    await db.update(usersTable).set({
      accountStatus: 'deactivated',
      internalNotes: user.internalNotes 
        ? `${user.internalNotes}\n[${new Date().toISOString()}] Desactivado por admin: ${sanitizedReason}`
        : `[${new Date().toISOString()}] Desactivado por admin: ${sanitizedReason}`,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));
    
    logActivity("Usuario Desactivado", { 
      "Usuario ID": userId,
      "ClientID": user.clientId,
      "Email": user.email,
      "Estado Anterior": user.accountStatus,
      "Razón": sanitizedReason,
      "Admin": (req as any).session?.userId
    });
    
    res.json({ success: true, message: "User deactivated successfully" });
  }));
  
  // Reactivate user account
  app.patch("/api/admin/users/:id/reactivate", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { reason } = req.body;
    
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.accountStatus !== 'deactivated') {
      return res.status(400).json({ message: "User is not deactivated" });
    }
    
    const sanitizedReason = reason ? String(reason).slice(0, 500) : 'Reactivado por admin';
    
    await db.update(usersTable).set({
      accountStatus: 'active',
      internalNotes: user.internalNotes 
        ? `${user.internalNotes}\n[${new Date().toISOString()}] Reactivado: ${sanitizedReason}`
        : `[${new Date().toISOString()}] Reactivado: ${sanitizedReason}`,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));
    
    logActivity("Usuario Reactivado", { 
      "Usuario ID": userId,
      "Email": user.email,
      "Razón": sanitizedReason
    });
    
    res.json({ success: true, message: "User reactivated successfully" });
  }));
}
