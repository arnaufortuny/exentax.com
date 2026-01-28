import type { Express } from "express";
import type { Server } from "http";
import { setupCustomAuth, isAuthenticated, isAdmin } from "./lib/custom-auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertLlcApplicationSchema, insertApplicationDocumentSchema } from "@shared/schema";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { sendEmail, getOtpEmailTemplate, getConfirmationEmailTemplate, getReminderEmailTemplate, getWelcomeEmailTemplate, getNewsletterWelcomeTemplate, getAutoReplyTemplate, getEmailFooter, getEmailHeader, getOrderUpdateTemplate, getNoteReceivedTemplate, getAccountSuspendedTemplate, getAccountDeactivatedTemplate, getClaudiaMessageTemplate } from "./lib/email";
import { contactOtps, products as productsTable, users as usersTable, maintenanceApplications, newsletterSubscribers, messages as messagesTable, orderEvents, messageReplies, userNotifications, orders as ordersTable, llcApplications as llcApplicationsTable, applicationDocuments as applicationDocumentsTable } from "@shared/schema";
import { and, eq, gt, desc, sql } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Rate limiting simulation / protection
  const rateLimit = new Map<string, number[]>();
  app.use("/api/", (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || "unknown";
    const windowMs = 60000;
    const maxRequests = 100;
    
    const timestamps = rateLimit.get(ip) || [];
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    
    if (validTimestamps.length >= maxRequests) {
      return res.status(429).json({ message: "Demasiadas peticiones. Por favor, espera un minuto." });
    }
    
    validTimestamps.push(now);
    rateLimit.set(ip, validTimestamps);
    next();
  });

  // Set up Custom Auth
  setupCustomAuth(app);

  // Health check endpoint for deployment (already handled in index.ts for root priority)
  app.get("/api/healthz", (_req, res) => {
    res.status(200).send("OK");
  });

    // Unified activity log helper (lightweight - email only, no DB table)
    const logActivity = async (title: string, data: any, req?: any) => {
      const ip = req?.ip || "unknown";
      
      // Email notification to admin for all logs
      sendEmail({
        to: "afortuny07@gmail.com",
        subject: `[LOG] ${title}`,
        html: `
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
              ${getEmailHeader()}
              <div style="padding: 40px;">
                <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">${title}</h2>
                <div style="background: #f4f4f4; border-left: 4px solid #6EDC8A; padding: 20px; margin: 20px 0;">
                  ${Object.entries(data).map(([k, v]) => `<p style="margin: 0 0 10px 0; font-size: 14px;"><strong>${k}:</strong> ${v}</p>`).join('')}
                </div>
                <p style="font-size: 12px; color: #999;">IP: ${ip}</p>
                <p style="font-size: 12px; color: #999;">Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
              </div>
              ${getEmailFooter()}
            </div>
          </div>
        `,
      }).catch(e => console.error("Admin notification error:", e));

      if (process.env.NODE_ENV === 'development') {
        console.log(`[LOG] ${title}:`, data);
      }
    };

    // Error handler wrapper for routes
    const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    // === Activity Tracking ===
    app.post("/api/activity/track", async (req, res) => {
      const { action, details } = req.body;
      if (action === "CLICK_ELEGIR_ESTADO") {
        logActivity("Selección de Estado", { "Detalles": details }, req);
      }
      res.json({ success: true });
    });

  // === API Routes ===

  // Admin Orders
  app.get("/api/admin/orders", isAdmin, async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json(allOrders);
    } catch (error) {
      console.error("Admin orders error:", error);
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.patch("/api/admin/orders/:id/status", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const orderId = Number(req.params.id);
    const { status } = z.object({ status: z.string() }).parse(req.body);
    
    const [updatedOrder] = await db.update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, orderId))
      .returning();
    
    const order = await storage.getOrder(orderId);
    if (order?.user?.email) {
      const statusLabels: Record<string, string> = {
        pending: "Pendiente",
        processing: "En proceso",
        paid: "Pagado",
        filed: "Presentado",
        documents_ready: "Documentos listos",
        completed: "Completado",
        cancelled: "Cancelado"
      };
      const statusLabel = statusLabels[status] || status.replace(/_/g, " ");

      // Create Notification in Dashboard
      await db.insert(userNotifications).values({
        userId: order.userId,
        title: `Actualización de pedido: ${statusLabel}`,
        message: `Tu pedido ${order.invoiceNumber || `#${order.id}`} ha cambiado a: ${statusLabel}.`,
        type: 'update',
        isRead: false
      });

      // Add Order Event for Timeline
      await db.insert(orderEvents).values({
        orderId: order.id,
        eventType: statusLabel,
        description: `El estado del pedido ha sido actualizado a ${statusLabel}.`,
        createdBy: req.session.userId
      });

      sendEmail({
        to: order.user.email,
        subject: `Actualización de tu pedido ${order.invoiceNumber || `#${order.id}`}`,
        html: getOrderUpdateTemplate(
          order.user.firstName || "Cliente",
          order.invoiceNumber || `#${order.id}`,
          status,
          `Tu pedido ha pasado a estado: <strong>${statusLabels[status] || status}</strong>. Puedes ver los detalles y descargar tu factura y recibo actualizado en tu panel de control.`,
          order.amount
        )
      }).catch(console.error);
    }
    res.json(updatedOrder);
  }));

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
      accountStatus: z.enum(['active', 'pending', 'suspended', 'deactivated', 'vip']).optional(),
      internalNotes: z.string().optional()
    });
    const data = updateSchema.parse(req.body);
    
    // If status is being updated to suspended, we consider it "Desactivado"
    const [updated] = await db.update(usersTable).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(usersTable.id, userId)).returning();

    // Trigger emails if account status changes
    if (data.accountStatus === 'suspended' || data.accountStatus === 'deactivated') {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (user && user.email) {
        const isSuspended = data.accountStatus === 'suspended';
        
        // 1. Send appropriate email based on status
        await sendEmail({
          to: user.email,
          subject: isSuspended 
            ? "Tu cuenta ha sido suspendida temporalmente - Easy US LLC" 
            : "Tu cuenta ha sido desactivada - Easy US LLC",
          html: isSuspended 
            ? getAccountSuspendedTemplate(user.firstName || "Cliente")
            : getAccountDeactivatedTemplate(user.firstName || "Cliente")
        }).catch(console.error);

        // 2. Send Claudia's personal email
        const claudiaMsg = data.internalNotes || (isSuspended 
          ? "Tu cuenta ha sido suspendida temporalmente mientras verificamos información adicional. Por favor, responde a este correo para proceder con la reactivación."
          : "Tu cuenta ha sido desactivada permanentemente. Si consideras que esto es un error, por favor contacta con nosotros.");
        await sendEmail({
          to: user.email,
          subject: "Información importante sobre tu cuenta - Claudia (Easy US LLC)",
          html: getClaudiaMessageTemplate(user.firstName || "Cliente", claudiaMsg)
        }).catch(console.error);

        // 3. Create notification for client
        await db.insert(userNotifications).values({
          userId,
          title: isSuspended ? "Cuenta suspendida temporalmente" : "Cuenta desactivada",
          message: isSuspended 
            ? "Tu cuenta ha sido suspendida temporalmente. Revisa tu email para más detalles."
            : "Tu cuenta ha sido desactivada permanentemente. Contacta con soporte si tienes dudas.",
          type: 'action_required',
          isRead: false
        });
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
      await db.delete(usersTable).where(eq(usersTable.id, userId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error al eliminar usuario" });
    }
  });

  app.get("/api/admin/system-stats", isAdmin, async (req, res) => {
    try {
      // Get core metrics
      const [salesResult] = await db.select({ totalSales: sql<number>`COALESCE(sum(amount), 0)` }).from(ordersTable).where(eq(ordersTable.status, 'completed'));
      const [userResult] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
      const [orderResult] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable);
      
      // Get unique visitors from activity logs
      const [visitorResult] = await db.select({ count: sql<number>`count(DISTINCT ip_address)` }).from(sql`activity_logs`);

      const totalSales = Number(salesResult?.totalSales || 0);
      const userCount = Number(userResult?.count || 0);
      const orderCount = Number(orderResult?.count || 0);
      const visitorCount = Number(visitorResult?.count || 0);

      // Calculate conversion rate (orders / visitors)
      const conversionRate = visitorCount > 0 ? (orderCount / visitorCount) * 100 : 0;

      res.json({ 
        totalSales,
        userCount,
        orderCount,
        visitorCount,
        conversionRate: Number(conversionRate.toFixed(2))
      });
    } catch (error) {
      console.error("System stats error:", error);
      res.status(500).json({ message: "Error fetching system stats" });
    }
  });

  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const result = await db.select({ total: sql<number>`sum(amount)` }).from(ordersTable).where(eq(ordersTable.status, 'completed'));
      res.json({ totalSales: Number(result[0]?.total || 0) });
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats" });
    }
  });

  // Admin Newsletter
  app.get("/api/admin/newsletter", isAdmin, async (req, res) => {
    try {
      const subscribers = await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt));
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });

  // Admin Messages
  app.get("/api/admin/messages", isAdmin, async (req, res) => {
    try {
      const allMessages = await storage.getAllMessages();
      res.json(allMessages);
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });

  app.patch("/api/admin/messages/:id/archive", isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateMessageStatus(Number(req.params.id), 'archived');
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error al archivar mensaje" });
    }
  });

  // Document Management - Upload official docs by Admin
  app.post("/api/admin/documents", isAdmin, async (req, res) => {
    try {
      const { orderId, fileName, fileUrl, documentType, applicationId } = req.body;
      const [doc] = await db.insert(applicationDocumentsTable).values({
        orderId,
        applicationId,
        fileName,
        fileType: "application/pdf",
        fileUrl,
        documentType: documentType || "official_filing",
        reviewStatus: "approved",
        uploadedBy: (req as any).session.userId
      }).returning();
      
      res.json(doc);
    } catch (error) {
      console.error("Upload doc error:", error);
      res.status(500).json({ message: "Error uploading document" });
    }
  });

  app.get("/api/user/documents", isAuthenticated, async (req: any, res) => {
    try {
      const docs = await db.select().from(applicationDocumentsTable)
        .leftJoin(ordersTable, eq(applicationDocumentsTable.orderId, ordersTable.id))
        .where(eq(ordersTable.userId, req.session.userId))
        .orderBy(desc(applicationDocumentsTable.uploadedAt));
      res.json(docs.map(d => d.application_documents));
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });
  app.post("/api/admin/send-email", isAdmin, async (req, res) => {
    try {
      const { to, subject, message, userId } = req.body;
      
      // Send the actual email
      await sendEmail({ 
        to, 
        subject: subject || "Comunicación de Easy US LLC", 
        html: getNoteReceivedTemplate("Cliente", message, subject) 
      });
      
      // Create a ticket/message in the system
      if (userId) {
        const { encrypt } = await import("./utils/encryption");
        const year = new Date().getFullYear();
        // Generate 8-digit ticket ID (purely numeric)
        const msgId = Math.floor(10000000 + Math.random() * 90000000).toString();
        
        const encryptedContent = encrypt(message);
        await db.insert(messagesTable).values({
          userId,
          name: "Soporte Easy US",
          email: "info@easyusllc.com",
          subject: subject || "Comunicación Administrativa",
          content: message,
          encryptedContent,
          type: "support",
          status: "read",
          messageId: msgId
        });
        
        // Also add a notification
        await db.insert(userNotifications).values({
          userId,
          title: subject || "Nueva comunicación",
          message: "Has recibido una nueva comunicación oficial vía email.",
          type: 'info',
          isRead: false
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Send email error:", error);
      res.status(500).json({ message: "Error al enviar email" });
    }
  });

  // Client document upload
  app.post("/api/documents/upload", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId, fileName, fileUrl, documentType, applicationId } = z.object({
        orderId: z.number(),
        applicationId: z.number(),
        fileName: z.string(),
        fileUrl: z.string(),
        documentType: z.string()
      }).parse(req.body);

      const [doc] = await db.insert(applicationDocumentsTable).values({
        orderId,
        applicationId,
        fileName,
        fileType: "application/pdf",
        fileUrl,
        documentType,
        reviewStatus: "pending",
        uploadedBy: req.session.userId
      }).returning();

      logActivity("Documento Subido por Cliente", { 
        "Cliente ID": req.session.userId,
        "Pedido ID": orderId,
        "Tipo": documentType
      });

      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: "Error al subir documento" });
    }
  });

  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  // Secure Admin Seeding - Promotes ADMIN_EMAIL user to admin role (protected by secret token)
  app.post("/api/seed-admin", async (req, res) => {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
      
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, adminEmail)).limit(1);
      if (!existingUser) {
        return res.status(404).json({ message: "Admin user not found. Please register first." });
      }
      
      await db.update(usersTable).set({ isAdmin: true, accountStatus: 'active' }).where(eq(usersTable.email, adminEmail));
      res.json({ success: true, message: "Admin role assigned successfully" });
    } catch (error) {
      console.error("Seed admin error:", error);
      res.status(500).json({ message: "Error seeding admin" });
    }
  });

  // Client Delete Account
  app.delete("/api/user/account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { mode } = req.body; // 'hard' for 100% delete, 'soft' to keep data but disable email

      if (mode === 'hard') {
        await db.delete(usersTable).where(eq(usersTable.id, userId));
      } else {
        // Soft delete: Keep record but mark as suspended and change email to prevent reuse
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        await db.update(usersTable).set({ 
          accountStatus: 'suspended',
          isActive: false,
          email: `deleted_${userId}_${user.email}`,
          updatedAt: new Date()
        }).where(eq(usersTable.id, userId));
      }

      req.session.destroy(() => {});
      res.json({ success: true, message: "Cuenta procesada correctamente" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ message: "Error al procesar la eliminación de cuenta" });
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
  
  app.patch("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = updateProfileSchema.parse(req.body);
      
      await db.update(usersTable).set(validatedData).where(eq(usersTable.id, userId));
      
      const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });

  // User notifications
  // Admin Note/Notification system
  app.post("/api/admin/send-note", isAdmin, async (req, res) => {
    try {
      const { userId, email, title, message, type, sendEmail: shouldSendEmail } = z.object({
        userId: z.string(),
        email: z.string().email().optional(),
        title: z.string(),
        message: z.string(),
        type: z.enum(['update', 'info', 'action_required']),
        sendEmail: z.boolean().default(true)
      }).parse(req.body);

      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

      // Create Notification
      await db.insert(userNotifications).values({
        userId,
        title,
        message,
        type,
        isRead: false
      });

      if (shouldSendEmail && user.email) {
        await sendEmail({
          to: user.email,
          subject: `Notificación de Easy US LLC: ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              ${getEmailHeader()}
              <div style="padding: 20px;">
                <h2 style="color: #0E1215;">${title}</h2>
                <p>Hola ${user.firstName || 'Cliente'},</p>
                <div style="background: #f4f4f4; border-left: 4px solid #6EDC8A; padding: 15px; margin: 20px 0;">
                  <p>${message}</p>
                </div>
                <p>Puedes ver más detalles accediendo a tu panel de cliente.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.BASE_URL || 'https://easyusllc.com'}/dashboard" style="background: #6EDC8A; color: #0E1215; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold;">
                    Ver en mi Panel
                  </a>
                </div>
              </div>
              ${getEmailFooter()}
            </div>
          `
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error al enviar nota" });
    }
  });

  // Admin Payment Link system
  app.post("/api/admin/send-payment-link", isAdmin, async (req, res) => {
    try {
      const { userId, paymentLink, message, amount } = z.object({
        userId: z.string(),
        paymentLink: z.string().url(),
        message: z.string(),
        amount: z.string().optional()
      }).parse(req.body);

      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user || !user.email) return res.status(404).json({ message: "Usuario o email no encontrado" });

      await sendEmail({
        to: user.email,
        subject: "Easy US LLC - Acción Requerida: Pago Pendiente",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${getEmailHeader()}
            <div style="padding: 20px;">
              <h2 style="color: #0E1215;">Pago Pendiente de Trámite</h2>
              <p>Hola ${user.firstName || 'Cliente'},</p>
              <p>Se ha generado una solicitud de pago para continuar con su trámite${amount ? ` por un valor de <strong>${amount}</strong>` : ''}.</p>
              <div style="background: #f4f4f4; border-left: 4px solid #6EDC8A; padding: 15px; margin: 20px 0;">
                <p><strong>Mensaje del administrador:</strong> ${message}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${paymentLink}" style="background: #6EDC8A; color: #0E1215; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 1.1rem;">
                  REALIZAR PAGO AHORA
                </a>
              </div>
              <p style="font-size: 0.8rem; color: #6B7280; text-align: center;">Si el botón no funciona, copie y pegue este enlace: <br>${paymentLink}</p>
            </div>
            ${getEmailFooter()}
          </div>
        `
      });

      // Create internal notification
      await db.insert(userNotifications).values({
        userId,
        title: "Pago Pendiente Solicitado",
        message: `Se ha enviado un enlace de pago por ${amount || 'el trámite'}. Revisa tu email.`,
        type: 'action_required',
        isRead: false
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Send payment link error:", error);
      res.status(500).json({ message: "Error al enviar enlace de pago" });
    }
  });

  // Client update order (allowed fields before processing)
  app.patch("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order || order.userId !== req.session.userId) {
        return res.status(403).json({ message: "No autorizado" });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ message: "El pedido ya está en trámite y no puede modificarse." });
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
      res.status(500).json({ message: "Error al actualizar pedido" });
    }
  });

  // Get user notifications
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
      console.error("Get notifications error:", error);
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

  // Request OTP for password change
  const passwordChangeOtps = new Map<string, { otp: string; expires: Date }>();
  
  app.post("/api/user/request-password-otp", isAuthenticated, async (req: any, res) => {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
      if (!user?.email) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      passwordChangeOtps.set(req.session.userId, { otp, expires: new Date(Date.now() + 10 * 60 * 1000) }); // 10 min
      
      await sendEmail({
        to: user.email,
        subject: "Código de verificación - Cambio de contraseña",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${getEmailHeader()}
            <div style="padding: 30px;">
              <h2 style="margin-bottom: 20px;">Código de Verificación</h2>
              <p>Has solicitado cambiar tu contraseña. Usa este código para verificar tu identidad:</p>
              <div style="background: #F0FDF4; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0E1215;">${otp}</span>
              </div>
              <p style="color: #6B7280; font-size: 14px;">Este código expira en 10 minutos.</p>
              <p style="color: #6B7280; font-size: 14px;">Si no solicitaste este cambio, ignora este mensaje.</p>
            </div>
            ${getEmailFooter()}
          </div>
        `
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Request password OTP error:", error);
      res.status(500).json({ message: "Error al enviar código" });
    }
  });

  // Change password with OTP verification
  app.post("/api/user/change-password", isAuthenticated, async (req: any, res) => {
    try {
      const { currentPassword, newPassword, otp } = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
        otp: z.string().length(6)
      }).parse(req.body);
      
      // Verify OTP
      const storedOtp = passwordChangeOtps.get(req.session.userId);
      if (!storedOtp || storedOtp.otp !== otp || storedOtp.expires < new Date()) {
        return res.status(400).json({ message: "Código de verificación inválido o expirado" });
      }
      passwordChangeOtps.delete(req.session.userId);
      
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
      if (!user?.passwordHash) {
        return res.status(400).json({ message: "No se puede cambiar la contraseña" });
      }
      
      const { verifyPassword, hashPassword } = await import("./lib/auth-service");
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: "Contraseña actual incorrecta" });
      }
      
      const newHash = await hashPassword(newPassword);
      await db.update(usersTable).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(usersTable.id, req.session.userId));
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos inválidos" });
      }
      console.error("Change password error:", error);
      res.status(500).json({ message: "Error al cambiar contraseña" });
    }
  });

  // Request document from client
  app.post("/api/admin/request-document", isAdmin, async (req, res) => {
    try {
      const { email, documentType, message, userId } = z.object({
        email: z.string().email(),
        documentType: z.string(),
        message: z.string(),
        userId: z.string().optional()
      }).parse(req.body);

      const msgId = Math.floor(10000000 + Math.random() * 90000000).toString();
      
      const docTypeLabels: Record<string, string> = {
        'passport': 'Pasaporte / Documento de Identidad',
        'address_proof': 'Comprobante de Domicilio',
        'tax_id': 'Identificación Fiscal',
        'other': 'Otro Documento'
      };
      const docTypeLabel = docTypeLabels[documentType] || documentType;
      
      await sendEmail({
        to: email,
        subject: `Acción Requerida: Solicitud de Documentación (${docTypeLabel})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${getEmailHeader()}
            <div style="padding: 20px;">
              <h2>Solicitud de Documentación</h2>
              <p>Hola,</p>
              <p>Nuestro equipo requiere que subas el siguiente documento: <strong>${docTypeLabel}</strong></p>
              <div style="background: #f4f4f4; border-left: 4px solid #6EDC8A; padding: 15px; margin: 20px 0;">
                <p><strong>Mensaje del agente:</strong> ${message}</p>
              </div>
              <p>Puedes subirlo directamente accediendo a tu panel de cliente en la sección de "Documentos".</p>
              <p>Ticket ID: <strong>${msgId}</strong></p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.BASE_URL || 'https://easyusllc.com'}/dashboard" style="background: #6EDC8A; color: #0E1215; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold;">
                  Acceder a mi Panel
                </a>
              </div>
            </div>
            ${getEmailFooter()}
          </div>
        `
      });

      if (userId) {
        await db.insert(userNotifications).values({
          userId,
          title: "Acción Requerida: Subir Documento",
          message: `Se ha solicitado el documento: ${docTypeLabel}. Revisa tu email para más detalles.`,
          type: 'action_required',
          isRead: false
        });

        const { encrypt } = await import("./utils/encryption");
        await db.insert(messagesTable).values({
          userId,
          name: "Easy US LLC (Soporte)",
          email: "soporte@easyusllc.com",
          subject: `Solicitud de Documento: ${docTypeLabel}`,
          content: message,
          encryptedContent: encrypt(message),
          type: "support",
          status: "unread",
          messageId: msgId
        });
      }

      res.json({ success: true, messageId: msgId });
    } catch (error) {
      console.error("Request doc error:", error);
      res.status(500).json({ message: "Error al solicitar documento" });
    }
  });

  // Orders (Requires authentication)
  app.get(api.orders.list.path, async (req: any, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const orders = await storage.getOrders(req.session.userId);
    res.json(orders);
  });

  // Invoices
  app.get("/api/orders/:id/invoice", isAuthenticated, async (req: any, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order || (order.userId !== req.session.userId && !req.session.isAdmin)) {
        return res.status(403).json({ message: "No autorizado" });
      }

      // Invoice Template
      res.send(`
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Factura INV-${new Date(order.createdAt || Date.now()).getFullYear()}-${String(order.id).padStart(5, '0')}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #0E1215; background: #fff; line-height: 1.5; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #6EDC8A; padding-bottom: 30px; margin-bottom: 40px; }
              .logo-container h1 { margin: 0; font-size: 2.5rem; font-weight: 900; letter-spacing: -0.05em; color: #0E1215; }
              .logo-container p { margin: 5px 0 0; font-weight: 700; color: #6B7280; font-size: 0.9rem; }
              .invoice-info { text-align: right; }
              .invoice-info p { margin: 2px 0; font-weight: 700; }
              .invoice-info .label { color: #6B7280; font-size: 0.8rem; text-transform: uppercase; }
              .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px; }
              .details-box h3 { font-size: 0.8rem; text-transform: uppercase; color: #6B7280; margin-bottom: 10px; border-bottom: 1px solid #E6E9EC; padding-bottom: 5px; }
              .details-box p { margin: 0; font-weight: 700; font-size: 1.1rem; }
              .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
              .table th { text-align: left; padding: 15px; background: #F7F7F5; font-size: 0.8rem; text-transform: uppercase; color: #6B7280; }
              .table td { padding: 20px 15px; border-bottom: 1px solid #E6E9EC; font-weight: 700; }
              .total-section { display: flex; justify-content: flex-end; }
              .total-box { background: #0E1215; color: #fff; padding: 30px; border-radius: 20px; min-width: 250px; text-align: right; }
              .total-box p { margin: 0; font-size: 0.9rem; opacity: 0.8; }
              .total-box h2 { margin: 5px 0 0; font-size: 2rem; font-weight: 900; color: #6EDC8A; }
              .footer { margin-top: 100px; text-align: center; border-top: 1px solid #E6E9EC; padding-top: 30px; color: #6B7280; font-size: 0.8rem; }
              .btn-print { background: #6EDC8A; color: #0E1215; border: none; padding: 12px 25px; border-radius: 30px; font-weight: 900; cursor: pointer; font-size: 0.9rem; margin-bottom: 30px; transition: transform 0.2s; }
              .btn-print:hover { transform: scale(1.05); }
              @media print { .no-print { display: none; } body { padding: 0; } .total-box { background: #eee !important; color: #000 !important; border: 2px solid #000; } .total-box h2 { color: #000 !important; } }
            </style>
          </head>
          <body>
            <div class="no-print">
              <button class="btn-print" onclick="window.print()">DESCARGAR / IMPRIMIR FACTURA</button>
            </div>
            <div class="header">
              <div class="logo-container">
                <h1>EASY US LLC</h1>
                <p>FORTUNY CONSULTING LLC</p>
              </div>
              <div class="invoice-info">
                <p class="label">Nº Factura</p>
                <p style="font-size: 1.2rem;">INV-${new Date(order.createdAt || Date.now()).getFullYear()}-${String(order.id).padStart(5, '0')}</p>
                <p class="label" style="margin-top: 10px;">Fecha de Emisión</p>
                <p>${new Date(order.createdAt || Date.now()).toLocaleDateString('es-ES')}</p>
              </div>
            </div>
            <div class="details-grid">
              <div class="details-box">
                <h3>Emisor</h3>
                <p>FORTUNY CONSULTING LLC</p>
                <p style="font-size: 0.9rem; font-weight: 400; color: #6B7280; margin-top: 5px;">Servicios de Consultoría y Formación de Empresas en EE.UU.</p>
              </div>
              <div class="details-box">
                <h3>Cliente</h3>
                <p>${order.user?.firstName} ${order.user?.lastName}</p>
                <p style="font-size: 0.85rem; font-weight: 600; color: #6B7280;">ID: ${order.user?.clientId || order.user?.id?.slice(0, 8).toUpperCase() || ''}</p>
                ${order.user?.idNumber ? `<p style="font-size: 0.85rem; font-weight: 400; color: #6B7280;">${order.user?.idType?.toUpperCase() || 'ID'}: ${order.user?.idNumber}</p>` : ''}
                <p style="font-size: 0.9rem; font-weight: 400; color: #6B7280; margin-top: 5px;">${order.user?.email}</p>
                ${order.user?.phone ? `<p style="font-size: 0.9rem; font-weight: 400; color: #6B7280;">${order.user?.phone}</p>` : ''}
              </div>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Concepto / Descripción del Servicio</th>
                  <th>Estado</th>
                  <th style="text-align: right;">Precio Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${order.product?.name}</td>
                  <td>
                    <span style="background: #6EDC8A; color: #0E1215; padding: 4px 12px; border-radius: 10px; font-size: 0.7rem; text-transform: uppercase;">
                      ${order.status === 'paid' ? 'Pagado' : order.status}
                    </span>
                  </td>
                  <td style="text-align: right; font-size: 1.2rem;">${(order.amount / 100).toFixed(2)} ${order.currency || 'EUR'}</td>
                </tr>
              </tbody>
            </table>
            <div class="total-section">
              <div class="total-box">
                <p>TOTAL FACTURADO</p>
                <h2>${(order.amount / 100).toFixed(2)} ${order.currency || 'EUR'}</h2>
              </div>
            </div>
            <div class="footer">
              <p>Este documento es un comprobante oficial de pago emitido por Easy US LLC (Fortuny Consulting LLC).</p>
              <p>Para cualquier duda técnica, por favor contacte con soporte@easyusllc.com</p>
              <p style="margin-top: 10px; font-weight: 700;">© ${new Date().getFullYear()} Easy US LLC. Todos los derechos reservados.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Invoice Error:", error);
      res.status(500).send("Error al generar factura");
    }
  });
  app.post("/api/admin/orders/:id/generate-invoice", isAdmin, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      
      // Get existing order data
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
      if (!order) {
        return res.status(404).json({ message: "Pedido no encontrado" });
      }
      
      // Optional: update amount/currency if provided
      const updateData: any = { isInvoiceGenerated: true };
      if (req.body.amount) updateData.amount = req.body.amount;
      if (req.body.currency) updateData.currency = req.body.currency;
      
      const [updatedOrder] = await db.update(ordersTable)
        .set(updateData)
        .where(eq(ordersTable.id, orderId))
        .returning();

      // Automatically make invoice available in documentation center
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(orderId).padStart(5, '0')}`;
      
      // Check if invoice already exists to avoid duplicates
      const existingDoc = await db.select().from(applicationDocumentsTable)
        .where(and(eq(applicationDocumentsTable.orderId, orderId), eq(applicationDocumentsTable.documentType, "invoice")))
        .limit(1);
      
      if (existingDoc.length === 0) {
        await db.insert(applicationDocumentsTable).values({
          orderId,
          fileName: `Factura ${invoiceNumber}`,
          fileType: "application/pdf",
          fileUrl: `/api/orders/${orderId}/invoice`,
          documentType: "invoice",
          reviewStatus: "approved",
          uploadedBy: (req as any).session.userId
        });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: "Error generating invoice" });
    }
  });

  app.post(api.orders.create.path, async (req: any, res) => {
    try {
      if (req.session?.userId) {
        const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
        if (currentUser && (currentUser.accountStatus === 'pending' || currentUser.accountStatus === 'suspended')) {
          return res.status(403).json({ message: "Tu cuenta está en revisión o suspendida. No puedes realizar nuevos pedidos en este momento." });
        }
      }
      const { productId } = api.orders.create.input.parse(req.body);
      
      let userId: string;
      
      if (req.session?.userId) {
        userId = req.session.userId;
      } else {
        // Create a guest user record
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(usersTable).values({
          id: guestId,
          email: null,
          firstName: "Guest",
          lastName: "User",
        });
        userId = guestId;
      }

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(400).json({ message: "Invalid product" });
      }

      // CRITICAL: Ensure pricing follows NM 639, WY 799, DE 999
      let finalPrice = product.price;
      if (product.name.includes("New Mexico")) finalPrice = 63900;
      else if (product.name.includes("Wyoming")) finalPrice = 79900;
      else if (product.name.includes("Delaware")) finalPrice = 99900;

      // Create the order
      const order = await storage.createOrder({
        userId,
        productId,
        amount: finalPrice,
        status: "pending",
        stripeSessionId: "mock_session_" + Date.now(),
      });

      // Add Order Event for Timeline
      await db.insert(orderEvents).values({
        orderId: order.id,
        eventType: "Pedido Recibido",
        description: `Se ha registrado un nuevo pedido para ${product.name}.`,
        createdBy: userId
      });

      // NOTIFICATION: New order created
      if (userId && !userId.startsWith('guest_')) {
        await db.insert(userNotifications).values({
          userId,
          title: "Nuevo pedido registrado",
          message: `Tu pedido de ${product.name} ha sido registrado correctamente. Te mantendremos informado del progreso.`,
          type: 'info',
          isRead: false
        });
      }

      // Create an empty application linked to the order
      const application = await storage.createLlcApplication({
        orderId: order.id,
        status: "draft",
        state: product.name.split(" ")[0], // Extract state name correctly
      });

      // Generate unified request code: 8 random digits
      const generateRandomCode = () => {
        return Math.floor(10000000 + Math.random() * 90000000).toString();
      };
      
      const requestCode = generateRandomCode();

      const updatedApplication = await storage.updateLlcApplication(application.id, { requestCode });

      // Notification to admin about NEW ORDER
      logActivity("Nuevo Pedido Recibido", {
        "Referencia": requestCode,
        "Producto": product.name,
        "Importe": `${(finalPrice / 100).toFixed(2)}€`,
        "Usuario": userId,
        "IP": req.ip
      });

      // Return order with application
      res.status(201).json({ ...order, application: updatedApplication });

      // Send welcome email if user is authenticated and has email
      if (req.session?.userId) {
        const [userData] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
        if (userData?.email) {
          sendEmail({
            to: userData.email,
            subject: "¡Bienvenido a Easy US LLC! - Próximos pasos",
            html: getWelcomeEmailTemplate(userData.firstName || "Cliente"),
          }).catch(err => console.error("Error sending welcome email:", err));
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Error creating order:", err);
      return res.status(500).json({ message: "Error creating order" });
    }
  });

  // Messages API
  app.get("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userMessages = await storage.getMessagesByUserId(req.session.userId);
      res.json(userMessages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.post("/api/messages", async (req: any, res) => {
    try {
      const { name, email, subject, content, requestCode } = req.body;
      const userId = req.session?.userId || null;
      
      const message = await storage.createMessage({
        userId,
        name,
        email,
        subject,
        content,
        requestCode,
        type: "contact"
      });

      // Send auto-reply
      sendEmail({
        to: email,
        subject: `Recibimos tu mensaje: ${subject || "Contacto"}`,
        html: getAutoReplyTemplate(name || "Cliente"),
      }).catch(console.error);

      // Notify admin
      logActivity("Nuevo Mensaje de Contacto", {
        "Nombre": name,
        "Email": email,
        "Asunto": subject,
        "Mensaje": content,
        "Referencia": requestCode || "N/A"
      });

      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Error sending message" });
    }
  });

  // Client Update Request Data
  app.patch("/api/llc/:id/data", isAuthenticated, async (req: any, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = req.body;
      const [updated] = await db.update(messagesTable) // Fix: This was causing LSP errors if referencing non-existent table
        .set({ ...updates, createdAt: new Date() })
        .where(eq(messagesTable.id, appId))
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating request" });
    }
  });
  app.get(api.llc.get.path, async (req: any, res) => {
    const appId = Number(req.params.id);
    
    const application = await storage.getLlcApplication(appId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  });

  app.put(api.llc.update.path, async (req: any, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = api.llc.update.input.parse(req.body);

      const application = await storage.getLlcApplication(appId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const updatedApp = await storage.updateLlcApplication(appId, updates);
      
      // If status is being updated to "submitted", send confirmation email
      if (updates.status === "submitted" && updatedApp.ownerEmail) {
        const orderIdentifier = updatedApp.requestCode || `#${updatedApp.id}`;
        
        // Unified Notification to admin
        logActivity("Nueva Solicitud LLC", {
          "Referencia": orderIdentifier,
          "Estado Pago": "CONFIRMADO / COMPLETADO",
          "Propietario": updatedApp.ownerFullName,
          "DNI/Pasaporte": updatedApp.ownerIdNumber || 'No proporcionado',
          "Email": updatedApp.ownerEmail,
          "Teléfono": updatedApp.ownerPhone,
          "Empresa": updatedApp.companyName,
          "Estado Registro": updatedApp.state,
          "Categoría": updatedApp.businessCategory === "Otra (especificar)" ? updatedApp.businessCategoryOther : updatedApp.businessCategory,
          "Notas": updatedApp.notes || "Ninguna"
        });

        // Confirmation to client with full info
      sendEmail({
        to: updatedApp.ownerEmail,
        subject: `Confirmación de Solicitud ${orderIdentifier} - Easy US LLC`,
        html: getConfirmationEmailTemplate(updatedApp.ownerFullName || "Cliente", orderIdentifier, { companyName: updatedApp.companyName }),
      }).catch(err => console.error("Error sending confirmation email:", err));
    }

    res.json(updatedApp);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    console.error("Error updating LLC application:", err);
    res.status(500).json({ message: "Error updating request" });
  }
});

  // Lookup by request code
  app.get(api.llc.getByCode.path, async (req: any, res) => {
    const code = req.params.code;
    
    const application = await storage.getLlcApplicationByRequestCode(code);
    if (!application) {
      return res.status(404).json({ message: "Solicitud no encontrada. Verifica el código ingresado." });
    }

    res.json(application);
  });

  // Documents
  app.post(api.documents.create.path, async (req: any, res) => {
    try {
      const docData = api.documents.create.input.parse(req.body);
      
      if (docData.applicationId) {
        const application = await storage.getLlcApplication(docData.applicationId);
        if (!application) {
          return res.status(404).json({ message: "Application not found" });
        }
      }

      const document = await storage.createDocument(docData);
      res.status(201).json(document);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch("/api/admin/documents/:id/review", isAdmin, async (req, res) => {
    try {
      const docId = Number(req.params.id);
      const { reviewStatus } = z.object({ reviewStatus: z.enum(["pending", "approved", "rejected", "action_required"]) }).parse(req.body);
      
      const [updated] = await db.update(applicationDocumentsTable)
        .set({ reviewStatus })
        .where(eq(applicationDocumentsTable.id, docId))
        .returning();
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating document review status" });
    }
  });

  // Client document upload endpoint
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  
  app.post("/api/user/documents/upload", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "No autorizado" });
      }

      // Get user's orders to attach document
      const userOrders = await storage.getOrders(userId);
      if (!userOrders.length) {
        return res.status(400).json({ message: "No tienes pedidos activos" });
      }

      // Use busboy for file handling with size limit
      const busboy = (await import('busboy')).default;
      const bb = busboy({ 
        headers: req.headers,
        limits: { fileSize: MAX_FILE_SIZE_BYTES }
      });
      
      let fileName = '';
      let fileBuffer: Buffer | null = null;
      let fileTruncated = false;
      let documentType = 'passport';
      let notes = '';
      
      bb.on('field', (name: string, val: string) => {
        if (name === 'documentType') documentType = val;
        if (name === 'notes') notes = val;
      });
      
      bb.on('file', (name: string, file: any, info: any) => {
        fileName = info.filename || `documento_${Date.now()}`;
        const chunks: Buffer[] = [];
        file.on('data', (data: Buffer) => chunks.push(data));
        file.on('limit', () => { fileTruncated = true; });
        file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
      });

      bb.on('finish', async () => {
        if (fileTruncated) {
          return res.status(413).json({ message: `El archivo excede el límite de ${MAX_FILE_SIZE_MB}MB` });
        }
        
        if (!fileBuffer) {
          return res.status(400).json({ message: "No se recibió ningún archivo" });
        }

        // Save file (in production, use cloud storage)
        const fs = await import('fs/promises');
        const path = await import('path');
        const uploadDir = path.join(process.cwd(), 'uploads', 'client-docs');
        await fs.mkdir(uploadDir, { recursive: true });
        
        const safeFileName = `${userId}_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadDir, safeFileName);
        await fs.writeFile(filePath, fileBuffer);
        
        // Generate ticket ID for this document upload
        const ticketId = `DOC-${Math.floor(10000000 + Math.random() * 90000000)}`;
        
        // Translate document type for display
        const docTypeLabelsUpload: Record<string, string> = {
          'passport': 'Pasaporte / Documento de Identidad',
          'address_proof': 'Comprobante de Domicilio',
          'tax_id': 'Identificación Fiscal',
          'other': 'Otro Documento'
        };
        const docTypeLabel = docTypeLabelsUpload[documentType] || documentType;
        
        // Create document record
        const doc = await db.insert(applicationDocumentsTable).values({
          orderId: userOrders[0].id,
          fileName: fileName,
          fileType: fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          fileUrl: `/uploads/client-docs/${safeFileName}`,
          documentType: documentType,
          reviewStatus: 'pending',
          uploadedBy: userId
        }).returning();

        // Get user data for admin notification
        const userData = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        const user = userData[0];
        
        if (user) {
          // Create message in admin panel as support ticket
          const { encrypt } = await import("./utils/encryption");
          const notesText = documentType === 'other' && notes ? `\n\nNotas del cliente: ${notes}` : '';
          const messageContent = `El cliente ha subido un nuevo documento.\n\nTipo: ${docTypeLabel}\nArchivo: ${fileName}${notesText}\n\nArchivo disponible en: ${doc[0].fileUrl}`;
          
          await db.insert(messagesTable).values({
            userId,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Cliente',
            email: user.email || 'sin-email@cliente.com',
            subject: `Documento Recibido: ${docTypeLabel}`,
            content: messageContent,
            encryptedContent: encrypt(messageContent),
            type: 'support',
            status: 'unread',
            messageId: ticketId
          });
          
          // Log for admin with ticket ID
          console.log(`[Document Upload] Ticket ${ticketId} - User ${user.firstName} ${user.lastName} (${user.email}) uploaded: ${fileName}`);
          
          // Email notification to admin
          await sendEmail({
            to: "afortuny07@gmail.com",
            subject: `[${ticketId}] Nuevo Documento Recibido`,
            html: `
              <div style="background-color: #f9f9f9; padding: 20px 0;">
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
                  ${getEmailHeader("Nuevo Documento")}
                  <div style="padding: 40px;">
                    <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Documento recibido de cliente</h2>
                    <div style="background: #F0FDF4; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #6EDC8A;">
                      <p style="margin: 0; font-size: 12px; color: #6B7280; text-transform: uppercase;">Ticket ID</p>
                      <p style="margin: 5px 0 0; font-size: 20px; font-weight: 900; color: #0E1215;">${ticketId}</p>
                    </div>
                    <table style="width: 100%; font-size: 14px; line-height: 1.6;">
                      <tr><td style="padding: 8px 0; color: #6B7280;">Cliente:</td><td style="padding: 8px 0; font-weight: 600;">${user.firstName} ${user.lastName}</td></tr>
                      <tr><td style="padding: 8px 0; color: #6B7280;">Email:</td><td style="padding: 8px 0;">${user.email}</td></tr>
                      <tr><td style="padding: 8px 0; color: #6B7280;">Archivo:</td><td style="padding: 8px 0; font-weight: 600;">${fileName}</td></tr>
                      <tr><td style="padding: 8px 0; color: #6B7280;">Tamaño:</td><td style="padding: 8px 0;">${(fileBuffer.length / 1024).toFixed(1)} KB</td></tr>
                    </table>
                    <div style="margin-top: 30px; text-align: center;">
                      <a href="${process.env.BASE_URL || 'https://easyusllc.com'}/dashboard" style="background-color: #6EDC8A; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 100px; font-weight: 900; font-size: 13px; text-transform: uppercase;">Ver en Panel Admin →</a>
                    </div>
                  </div>
                  ${getEmailFooter()}
                </div>
              </div>
            `
          }).catch(console.error);
        }

        res.json({ success: true, document: doc[0], ticketId });
      });

      req.pipe(bb);
    } catch (error: any) {
      console.error("Client upload error:", error);
      res.status(500).json({ message: "Error al subir documento" });
    }
  });

  app.delete("/api/admin/documents/:id", isAdmin, async (req, res) => {
    try {
      const docId = Number(req.params.id);
      await db.delete(applicationDocumentsTable).where(eq(applicationDocumentsTable.id, docId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting document" });
    }
  });

  // Payment simulation endpoint for LLC
  app.post("/api/llc/:id/pay", async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      const application = await storage.getLlcApplication(appId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Update order status to paid
      if (application.orderId) {
        await storage.updateOrderStatus(application.orderId, "paid");
      }
      
      // Update application status to submitted
      await storage.updateLlcApplication(appId, { status: "submitted", paymentStatus: "paid" });
      
      res.json({ success: true, message: "Payment successful" });
    } catch (error) {
      console.error("Payment error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  // OTP Endpoints
  app.post("/api/:type(llc|maintenance)/:id/send-otp", async (req, res) => {
    try {
      const type = req.params.type as 'llc' | 'maintenance';
      const appId = Number(req.params.id);
      const { email } = req.body;
      
      if (!email) return res.status(400).json({ message: "Email is required" });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await storage.setOtp(type, appId, otp, expires);
      
      await sendEmail({
        to: email,
        subject: "Código de verificación - Easy US LLC",
        html: getOtpEmailTemplate(otp),
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error sending ${req.params.type} OTP:`, error);
      res.status(500).json({ message: "Error al enviar el código de verificación" });
    }
  });

  app.post("/api/:type(llc|maintenance)/:id/verify-otp", async (req, res) => {
    const type = req.params.type as 'llc' | 'maintenance';
    const appId = Number(req.params.id);
    const { otp } = req.body;
    
    if (!otp) return res.status(400).json({ message: "OTP is required" });
    
    const success = await storage.verifyOtp(type, appId, otp);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ message: "Código inválido o caducado" });
    }
  });

  app.post("/api/maintenance/orders", async (req: any, res) => {
    try {
      const { productId, state } = req.body;
      
      let userId: string;
      if (req.session?.userId) {
        userId = req.session.userId;
      } else {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(usersTable).values({
          id: guestId,
          email: null,
          firstName: "Guest",
          lastName: "User",
        });
        userId = guestId;
      }

      const product = await storage.getProduct(productId);
      if (!product) return res.status(400).json({ message: "Invalid product" });

      const order = await storage.createOrder({
        userId,
        productId,
        amount: product.price,
        status: "pending",
        stripeSessionId: "mock_session_maint_" + Date.now(),
      });

      const [application] = await db.insert(maintenanceApplications).values({
        orderId: order.id,
        status: "draft",
        state: state || product.name.split(" ")[0],
      }).returning();

      const timestamp = Date.now().toString();
      const randomPart = Math.random().toString(36).substring(7).toUpperCase();
      const requestCode = `MN-${timestamp.substring(timestamp.length - 4)}-${randomPart.substring(0, 3)}-${Math.floor(Math.random() * 9)}`;

      await db.update(maintenanceApplications)
        .set({ requestCode })
        .where(eq(maintenanceApplications.id, application.id));

      // NOTIFICATION: New maintenance order
      if (userId && !userId.startsWith('guest_')) {
        await db.insert(userNotifications).values({
          userId,
          title: "Nuevo pedido de mantenimiento",
          message: `Tu pedido de mantenimiento anual ha sido registrado. Te mantendremos informado del progreso.`,
          type: 'info',
          isRead: false
        });
      }

      res.status(201).json({ ...order, application: { ...application, requestCode } });
    } catch (err) {
      console.error("Error creating maintenance order:", err);
      res.status(500).json({ message: "Error creating maintenance order" });
    }
  });

  // Maintenance App Updates

  // Newsletter
  app.get("/api/newsletter/status", isAuthenticated, async (req: any, res) => {
    const isSubscribed = await storage.isSubscribedToNewsletter(req.session.email);
    res.json({ isSubscribed });
  });

  app.post("/api/newsletter/unsubscribe", isAuthenticated, async (req: any, res) => {
    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.email, req.session.email));
    res.json({ success: true });
  });

  // Newsletter Subscription
  app.post("/api/newsletter/subscribe", async (req: any, res) => {
    try {
      const { email } = z.object({ email: z.string().email().optional() }).parse(req.body);
      
      // If no email provided, try to use authenticated user's email
      const targetEmail = email || req.session?.email || null;
      
      if (!targetEmail) {
        return res.status(400).json({ message: "Se requiere un email" });
      }

      const isSubscribed = await storage.isSubscribedToNewsletter(targetEmail);
      if (isSubscribed) {
        // Silent success for already subscribed via dashboard toggle
        return res.json({ success: true, message: "Ya estás suscrito" });
      }

      await storage.subscribeToNewsletter(targetEmail);

      // NOTIFICATION: Newsletter subscription
      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, targetEmail)).limit(1);
      if (user) {
        await db.insert(userNotifications).values({
          userId: user.id,
          title: "Suscripción confirmada",
          message: "Te has suscrito correctamente a nuestra newsletter. Recibirás las últimas noticias y ofertas.",
          type: 'info',
          isRead: false
        });
      }
      
      await sendEmail({
        to: targetEmail,
        subject: "¡Bienvenido a la Newsletter de Easy US LLC!",
        html: getNewsletterWelcomeTemplate(),
      }).catch(err => console.error("Error sending newsletter welcome email:", err));
      
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Email inválido" });
      }
      res.status(500).json({ message: "Error al suscribirse" });
    }
  });

  // Admin Invoice (unique route - not duplicated)
  app.get("/api/admin/invoice/:id", isAdmin, async (req, res) => {
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    res.setHeader('Content-Type', 'text/html');
    res.send(generateInvoiceHtml(order));
  });

  // Client Receipt/Resumen Route
  app.get("/api/orders/:id/receipt", isAuthenticated, async (req: any, res) => {
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    if (order.userId !== req.session.userId && !req.session.isAdmin) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    res.setHeader('Content-Type', 'text/html');
    res.send(generateReceiptHtml(order));
  });

  // Order Events Timeline
  app.get("/api/orders/:id/events", isAuthenticated, async (req: any, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
      if (order.userId !== req.session.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "Acceso denegado" });
      }
      
      const events = await db.select().from(orderEvents)
        .where(eq(orderEvents.orderId, orderId))
        .orderBy(desc(orderEvents.createdAt));
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching order events:", error);
      res.status(500).json({ message: "Error al obtener eventos" });
    }
  });

  // Add order event (admin only)
  app.post("/api/admin/orders/:id/events", isAdmin, async (req: any, res) => {
    try {
      const orderId = Number(req.params.id);
      const { eventType, description } = req.body;
      
      const [event] = await db.insert(orderEvents).values({
        orderId,
        eventType,
        description,
        createdBy: req.session.userId,
      }).returning();
      
      // Get order and user info for email notification
      const order = await storage.getOrder(orderId);
      if (order) {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, order.userId)).limit(1);
        if (user?.email) {
          sendEmail({
            to: user.email,
            subject: "Actualización de tu pedido - Easy US LLC",
            html: `
              <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #fff;">
                ${getEmailHeader()}
                <div style="padding: 30px;">
                  <h2 style="color: #000; font-weight: 900;">Actualización de Pedido #${orderId}</h2>
                  <div style="background: #f4f4f4; border-left: 4px solid #6EDC8A; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: 700;">${eventType}</p>
                    <p style="margin: 10px 0 0; color: #666;">${description}</p>
                  </div>
                  <p style="color: #666; font-size: 14px;">Fecha: ${new Date().toLocaleString('es-ES')}</p>
                </div>
                ${getEmailFooter()}
              </div>
            `,
          }).catch(e => console.error("Error sending event email:", e));
        }
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error creating order event:", error);
      res.status(500).json({ message: "Error al crear evento" });
    }
  });

  // Message replies
  app.get("/api/messages/:id/replies", isAuthenticated, async (req: any, res) => {
    try {
      const messageId = Number(req.params.id);
      const replies = await db.select().from(messageReplies)
        .where(eq(messageReplies.messageId, messageId))
        .orderBy(messageReplies.createdAt);
      
      res.json(replies);
    } catch (error) {
      console.error("Error fetching message replies:", error);
      res.status(500).json({ message: "Error al obtener respuestas" });
    }
  });

  // Add reply to message
  app.post("/api/messages/:id/reply", isAuthenticated, async (req: any, res) => {
    try {
      const messageId = Number(req.params.id);
      const { content } = req.body;
      
      const [reply] = await db.insert(messageReplies).values({
        messageId,
        content,
        isAdmin: req.session.isAdmin || false,
        createdBy: req.session.userId,
      }).returning();
      
      // Get message for email notification
      const [message] = await db.select().from(messagesTable).where(eq(messagesTable.id, messageId)).limit(1);
      if (message?.email && !req.session.isAdmin) {
        // Admin reply - notify user
        sendEmail({
          to: message.email,
          subject: "Nueva respuesta a tu consulta - Easy US LLC",
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #fff;">
              ${getEmailHeader()}
              <div style="padding: 30px;">
                <h2 style="color: #000; font-weight: 900;">Respuesta a tu consulta</h2>
                <p style="color: #666;">Ticket ID: MSG-${messageId}</p>
                <div style="background: #f4f4f4; border-left: 4px solid #6EDC8A; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0;">${content}</p>
                </div>
                <p style="color: #666; font-size: 14px;">Puedes responder accediendo a tu área de clientes.</p>
              </div>
              ${getEmailFooter()}
            </div>
          `,
        }).catch(e => console.error("Error sending reply email:", e));
      }
      
      res.json(reply);
    } catch (error) {
      console.error("Error creating reply:", error);
      res.status(500).json({ message: "Error al crear respuesta" });
    }
  });

  function generateInvoiceHtml(order: any) {
    const requestCode = order.application?.requestCode || `ORD-${order.id}`;
    const userName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Cliente';
    const userEmail = order.user?.email || '';
    const userPhone = order.user?.phone || '';
    const userClientId = order.user?.clientId || order.user?.id?.slice(0, 8).toUpperCase() || '';
    const userAddress = order.user ? [
      order.user.streetType,
      order.user.address,
      order.user.city,
      order.user.province,
      order.user.postalCode,
      order.user.country
    ].filter(Boolean).join(', ') : '';
    const userIdNumber = order.user?.idNumber ? `${order.user.idType?.toUpperCase() || 'ID'}: ${order.user.idNumber}` : '';
    const productName = order.product?.name || 'Servicio de Constitución LLC';
    const invoiceNumber = `INV-${new Date(order.createdAt || Date.now()).getFullYear()}-${String(order.id).padStart(5, '0')}`;
    
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Factura ${invoiceNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
          <style>
            @media print { 
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
              .no-print { display: none !important; }
              @page { margin: 1cm; }
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #0E1215; line-height: 1.6; background: #fff; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 3px solid #6EDC8A; }
            .logo-section h1 { font-size: 28px; font-weight: 900; letter-spacing: -0.02em; }
            .logo-section .subtitle { color: #6B7280; font-size: 13px; margin-top: 4px; }
            .invoice-info { text-align: right; }
            .invoice-badge { background: linear-gradient(135deg, #6EDC8A 0%, #4eca70 100%); color: #0E1215; padding: 10px 20px; border-radius: 100px; font-weight: 900; font-size: 13px; display: inline-block; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
            .invoice-number { font-size: 20px; font-weight: 800; color: #0E1215; }
            .invoice-date { font-size: 13px; color: #6B7280; margin-top: 4px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-bottom: 50px; }
            .detail-box { background: #F7F7F5; padding: 25px; border-radius: 16px; }
            .detail-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6EDC8A; margin-bottom: 12px; letter-spacing: 0.08em; }
            .detail-content p { font-size: 14px; margin-bottom: 4px; }
            .detail-content strong { font-weight: 700; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .items-table thead th { text-align: left; padding: 16px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #6B7280; border-bottom: 2px solid #E6E9EC; }
            .items-table thead th:last-child { text-align: right; }
            .items-table tbody td { padding: 20px 12px; font-size: 15px; border-bottom: 1px solid #F7F7F5; }
            .items-table tbody td:last-child { text-align: right; font-weight: 600; }
            .totals-section { display: flex; justify-content: flex-end; margin-bottom: 50px; }
            .totals-box { background: linear-gradient(135deg, #F7F7F5 0%, #E6E9EC 100%); padding: 30px; border-radius: 20px; min-width: 280px; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .totals-row.final { border-top: 2px solid #0E1215; padding-top: 15px; margin-top: 15px; margin-bottom: 0; }
            .totals-row.final .label { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280; }
            .totals-row.final .amount { font-size: 28px; font-weight: 900; color: #0E1215; }
            .footer { text-align: center; padding-top: 30px; border-top: 1px solid #E6E9EC; font-size: 12px; color: #6B7280; }
            .footer p { margin-bottom: 4px; }
            .print-controls { text-align: center; margin-bottom: 30px; }
            .print-btn { background: #6EDC8A; color: #0E1215; padding: 14px 35px; border: none; border-radius: 100px; font-weight: 800; cursor: pointer; font-size: 14px; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 15px rgba(110, 220, 138, 0.3); }
            .print-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(110, 220, 138, 0.4); }
          </style>
        </head>
        <body>
          <div class="print-controls no-print">
            <button class="print-btn" onclick="window.print()">Imprimir / Descargar PDF</button>
          </div>
          
          <div class="header">
            <div class="logo-section">
              <h1>Easy US LLC</h1>
              <p class="subtitle">Servicios de Constitución Empresarial</p>
            </div>
            <div class="invoice-info">
              <div class="invoice-badge">Factura</div>
              <div class="invoice-number">${invoiceNumber}</div>
              <div class="invoice-date">Fecha: ${new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="detail-box">
              <div class="detail-label">Datos del Emisor</div>
              <div class="detail-content">
                <p><strong>EASY US LLC</strong></p>
                <p>FORTUNY CONSULTING LLC</p>
                <p>1209 Mountain Road Place NE, STE R</p>
                <p>Albuquerque, NM 87110, USA</p>
                <p style="margin-top: 10px;">info@easyusllc.com</p>
                <p>+34 614 91 69 10</p>
              </div>
            </div>
            <div class="detail-box">
              <div class="detail-label">Datos del Cliente</div>
              <div class="detail-content">
                <p><strong>${userName}</strong></p>
                ${userClientId ? `<p style="font-size: 12px; color: #6B7280;"><strong>ID Cliente:</strong> ${userClientId}</p>` : ''}
                ${userIdNumber ? `<p>${userIdNumber}</p>` : ''}
                <p>${userEmail}</p>
                ${userPhone ? `<p>${userPhone}</p>` : ''}
                ${userAddress ? `<p style="margin-top: 6px;">${userAddress}</p>` : ''}
                <p style="margin-top: 10px;"><strong>Ref. Pedido:</strong> ${requestCode}</p>
              </div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Descripción del Servicio</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${productName}</strong><br><span style="color: #6B7280; font-size: 13px;">Servicio completo de constitución empresarial en USA</span></td>
                <td>${(order.amount / 100).toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals-section">
            <div class="totals-box">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>${(order.amount / 100).toFixed(2)} €</span>
              </div>
              <div class="totals-row">
                <span>IVA (0%)</span>
                <span>0.00 €</span>
              </div>
              <div class="totals-row final">
                <span class="label">Total</span>
                <span class="amount">${(order.amount / 100).toFixed(2)} €</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>EASY US LLC</strong> • FORTUNY CONSULTING LLC</p>
            <p>1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110, USA</p>
            <p>info@easyusllc.com • +34 614 91 69 10 • www.easyusllc.com</p>
          </div>
        </body>
      </html>
    `;
  }

  function generateReceiptHtml(order: any) {
    const requestCode = order.application?.requestCode || `ORD-${order.id}`;
    const userName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Cliente';
    const userEmail = order.user?.email || '';
    const productName = order.product?.name || 'Servicio de Constitución LLC';
    const receiptNumber = `REC-${new Date(order.createdAt).getFullYear()}-${String(order.id).padStart(5, '0')}`;
    const statusLabels: Record<string, string> = {
      'paid': 'Pagado',
      'pending': 'Pendiente',
      'processing': 'En Proceso',
      'completed': 'Completado'
    };
    
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recibo ${receiptNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
          <style>
            @media print { 
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff !important; } 
              .no-print { display: none !important; }
              .receipt-card { box-shadow: none !important; }
              @page { margin: 1cm; }
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #0E1215; line-height: 1.6; background: #F7F7F5; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .print-controls { text-align: center; margin-bottom: 25px; }
            .print-btn { background: #6EDC8A; color: #0E1215; padding: 14px 35px; border: none; border-radius: 100px; font-weight: 800; cursor: pointer; font-size: 14px; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 15px rgba(110, 220, 138, 0.3); }
            .print-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(110, 220, 138, 0.4); }
            .receipt-card { background: white; max-width: 500px; width: 100%; padding: 50px; border-radius: 32px; box-shadow: 0 25px 50px rgba(0,0,0,0.08); }
            .receipt-header { text-align: center; margin-bottom: 35px; }
            .success-icon { width: 70px; height: 70px; background: linear-gradient(135deg, #6EDC8A 0%, #4eca70 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
            .success-icon svg { width: 35px; height: 35px; color: #0E1215; }
            .receipt-badge { background: #6EDC8A; color: #0E1215; padding: 8px 18px; border-radius: 100px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; display: inline-block; margin-bottom: 15px; }
            .receipt-title { font-size: 26px; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 8px; }
            .receipt-number { color: #6EDC8A; font-size: 18px; font-weight: 800; }
            .receipt-message { color: #6B7280; font-size: 14px; margin-top: 15px; padding: 0 20px; }
            .receipt-details { background: #F7F7F5; border-radius: 20px; padding: 25px; margin-bottom: 30px; }
            .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #E6E9EC; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
            .detail-value { font-size: 15px; font-weight: 600; color: #0E1215; text-align: right; }
            .detail-value.highlight { font-size: 22px; font-weight: 900; color: #6EDC8A; }
            .status-badge { background: #6EDC8A; color: #0E1215; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 800; }
            .status-badge.pending { background: #FEF3C7; color: #92400E; }
            .receipt-footer { text-align: center; padding-top: 25px; border-top: 1px solid #E6E9EC; font-size: 12px; color: #6B7280; }
            .receipt-footer p { margin-bottom: 4px; }
            .receipt-footer .company { font-weight: 700; color: #0E1215; }
          </style>
        </head>
        <body>
          <div class="print-controls no-print">
            <button class="print-btn" onclick="window.print()">Imprimir / Descargar PDF</button>
          </div>
          
          <div class="receipt-card">
            <div class="receipt-header">
              <div class="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="receipt-badge">Recibo de Solicitud</div>
              <h1 class="receipt-title">Pedido Confirmado</h1>
              <div class="receipt-number">${receiptNumber}</div>
              <p class="receipt-message">Hemos recibido correctamente tu solicitud. Tu proceso de constitución está en marcha.</p>
            </div>
            
            <div class="receipt-details">
              <div class="detail-row">
                <span class="detail-label">Cliente</span>
                <span class="detail-value">${userName}</span>
              </div>
              ${userEmail ? `<div class="detail-row">
                <span class="detail-label">Email</span>
                <span class="detail-value">${userEmail}</span>
              </div>` : ''}
              <div class="detail-row">
                <span class="detail-label">Servicio</span>
                <span class="detail-value">${productName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fecha</span>
                <span class="detail-value">${new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Referencia</span>
                <span class="detail-value">${requestCode}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Estado</span>
                <span class="status-badge ${order.status === 'pending' ? 'pending' : ''}">${statusLabels[order.status] || order.status}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total</span>
                <span class="detail-value highlight">${(order.amount / 100).toFixed(2)} €</span>
              </div>
            </div>
            
            <div class="receipt-footer">
              <p>Conserva este recibo para tus registros.</p>
              <p class="company">EASY US LLC • FORTUNY CONSULTING LLC</p>
              <p>1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110</p>
              <p>info@easyusllc.com • +34 614 91 69 10</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Contact form
  app.post("/api/contact/send-otp", async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await db.insert(contactOtps).values({
        email,
        otp,
        expiresAt,
      });

      await sendEmail({
        to: email,
        subject: "Código de verificación - Easy US LLC",
        html: getOtpEmailTemplate(otp),
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Error sending contact OTP:", err);
      res.status(400).json({ message: "Error al enviar el código de verificación. Por favor, inténtalo de nuevo en unos minutos." });
    }
  });

  app.post("/api/contact/verify-otp", async (req, res) => {
    try {
      const { email, otp } = z.object({ email: z.string().email(), otp: z.string() }).parse(req.body);
      
      const [record] = await db.select()
        .from(contactOtps)
        .where(
          and(
            eq(contactOtps.email, email),
            eq(contactOtps.otp, otp),
            gt(contactOtps.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!record) {
        return res.status(400).json({ message: "Código inválido o caducado" });
      }

      await db.update(contactOtps)
        .set({ verified: true })
        .where(eq(contactOtps.id, record.id));

      res.json({ success: true });
    } catch (err) {
      console.error("Error verifying contact OTP:", err);
      res.status(400).json({ message: "Error al verificar el código" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = z.object({
        nombre: z.string(),
        apellido: z.string(),
        email: z.string().email(),
        telefono: z.string().optional(),
        subject: z.string(),
        mensaje: z.string(),
        otp: z.string(),
      }).parse(req.body);

      const [otpRecord] = await db.select()
        .from(contactOtps)
        .where(
          and(
            eq(contactOtps.email, contactData.email),
            eq(contactOtps.otp, contactData.otp),
            eq(contactOtps.verified, true)
          )
        )
        .limit(1);

      if (!otpRecord) {
        return res.status(400).json({ message: "Email no verificado" });
      }

      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString();
      
      // Notification to admin
      logActivity("Acción Contacto", {
        "ID Ticket": `#${ticketId}`,
        "Nombre": `${contactData.nombre} ${contactData.apellido}`,
        "Email": contactData.email,
        "Teléfono": contactData.telefono || "No proporcionado",
        "Asunto": contactData.subject,
        "Mensaje": contactData.mensaje,
        "IP": clientIp
      });

      await sendEmail({
        to: contactData.email,
        subject: `Confirmación de mensaje - Easy US LLC #${ticketId}`,
        html: getAutoReplyTemplate(ticketId, contactData.nombre),
      });

      res.json({ success: true, ticketId });
    } catch (err) {
      console.error("Error processing contact form:", err);
      res.status(400).json({ message: "Error al procesar el mensaje" });
    }
  });

  // Maintenance Orders (second route - keeping for legacy support)
  app.post("/api/maintenance/orders-legacy", async (req: any, res) => {
    try {
      const { productId, state } = req.body;
      let userId: string;
      
      if (req.session?.userId) {
        userId = req.session.userId;
      } else {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(usersTable).values({
          id: guestId,
          email: null,
          firstName: "Guest",
          lastName: "User",
        });
        userId = guestId;
      }

      const product = await storage.getProduct(productId);
      if (!product) return res.status(400).json({ message: "Invalid product" });

      // CRITICAL: Ensure pricing follows NM 349, WY 499, DE 599 for maintenance
      let finalPrice = product.price;
      if (state?.includes("New Mexico")) finalPrice = 34900;
      else if (state?.includes("Wyoming")) finalPrice = 49900;
      else if (state?.includes("Delaware")) finalPrice = 59900;

      const order = await storage.createOrder({
        userId,
        productId,
        amount: finalPrice,
        status: "pending",
        stripeSessionId: "mock_maintenance_" + Date.now(),
      });

      const maintenanceResults = await db.insert(maintenanceApplications).values({
        orderId: order.id,
        status: "draft",
        state: state || "New Mexico",
      }).returning();
      const application = maintenanceResults[0];

      // NOTIFICATION: New maintenance order
      if (userId && !userId.startsWith('guest_')) {
        await db.insert(userNotifications).values({
          userId,
          title: "Nuevo pedido de mantenimiento",
          message: `Tu pedido de mantenimiento anual ha sido registrado. Te mantendremos informado del progreso.`,
          type: 'info',
          isRead: false
        });
      }

      res.status(201).json({ ...order, application });
    } catch (err) {
      console.error("Error creating maintenance order:", err);
      res.status(500).json({ message: "Error" });
    }
  });

  app.post("/api/maintenance/:id/send-otp", async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    
    await db.update(maintenanceApplications)
      .set({ emailOtp: otp, emailOtpExpires: expires })
      .where(eq(maintenanceApplications.id, Number(req.params.id)));
    
    await sendEmail({
      to: email,
      subject: "Código de verificación - Easy US LLC",
      html: getOtpEmailTemplate(otp),
    });
    res.json({ success: true });
  });

  app.post("/api/maintenance/:id/verify-otp", async (req, res) => {
    const appId = Number(req.params.id);
    const { otp } = req.body;
    
    const [app] = await db.select().from(maintenanceApplications)
      .where(and(
        eq(maintenanceApplications.id, appId),
        eq(maintenanceApplications.emailOtp, otp),
        gt(maintenanceApplications.emailOtpExpires, new Date())
      ));
    
    if (app) {
      await db.update(require("@shared/schema").maintenanceApplications)
        .set({ emailVerified: true })
        .where(eq(require("@shared/schema").maintenanceApplications.id, appId));
      res.json({ success: true });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  });

  app.put("/api/maintenance/:id", async (req, res) => {
    const appId = Number(req.params.id);
    const updates = req.body;
    
    const [updatedApp] = await db.update(maintenanceApplications)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(maintenanceApplications.id, appId))
      .returning();
    
    if (updates.status === "submitted") {
      logActivity("Nueva Solicitud Mantenimiento", {
        "Propietario": updatedApp.ownerFullName,
        "LLC": updatedApp.companyName,
        "EIN": updatedApp.ein,
        "Estado": updatedApp.state,
        "Email": updatedApp.ownerEmail,
        "Disolver": updatedApp.wantsDissolve || "No",
        "Servicios": updatedApp.expectedServices
      });
    }
    res.json(updatedApp);
  });

  // Seed Data
  await seedDatabase();

  // === Test Email Route ===
  app.post("/api/admin/test-emails", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
      const ticketId = "12345678";
      const otp = "888999";
      const name = "Cliente de Prueba";
      const requestCode = "NM-9999-ABC-0";

      // Improved Admin Activity Notification (Elegir Estado)
      const activityHtml = `
        <div style="background-color: #f9f9f9; padding: 20px 0;">
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
            ${getEmailHeader()}
            <div style="padding: 40px;">
              <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Log de Actividad: Selección de Estado</h2>
              <div style="background: #f4f4f4; border-left: 4px solid #000; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Acción:</strong> Clic en botón elegir</p>
                <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Estado:</strong> New Mexico Pack</p>
          <p style="margin: 0; font-size: 14px;"><strong>Precio:</strong> 639€</p>
        </div>
        <p style="font-size: 12px; color: #999;">IP Origen: 127.0.0.1 | Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
      </div>
      ${getEmailFooter()}
    </div>
  </div>
`;

const orderHtml = `
  <div style="background-color: #f9f9f9; padding: 20px 0;">
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
      ${getEmailHeader()}
      <div style="padding: 40px;">
        <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Detalles de la Notificación</h2>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Estado de la Transacción</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Estado Pago:</strong> <span style="color: #0d9488; font-weight: 700;">CONFIRMADO (MOCK)</span></p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Fecha/Hora:</strong> ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Aceptación Términos:</strong> SÍ (Marcado en formulario)</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Información del Propietario</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Nombre:</strong> ${name}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>DNI / Pasaporte:</strong> 12345678X (Test)</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Dirección:</strong> Calle Falsa 123, 28001 Madrid, España</p>
        </div>

        <div>
          <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Detalles de la Empresa</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Nombre LLC:</strong> Mi Nueva Empresa LLC</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Estado:</strong> New Mexico</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Actividad:</strong> Consultoría de Software y Marketing Digital</p>
          <p style="margin: 0; font-size: 14px;"><strong>Notas:</strong> Necesito el EIN urgente para abrir cuenta en Mercury.</p>
        </div>
      </div>
      ${getEmailFooter()}
    </div>
  </div>
`;

      // Send improved admin templates
      await Promise.all([
        sendEmail({ to: email, subject: "TEST: OTP Verificación de Identidad", html: getOtpEmailTemplate(otp) }),
        sendEmail({ to: email, subject: "TEST: Log de Actividad (Admin)", html: activityHtml }),
        sendEmail({ to: email, subject: "TEST: Nueva Solicitud LLC (Admin)", html: orderHtml }),
        sendEmail({ to: email, subject: "TEST: Confirmación de Pedido (Cliente)", html: getConfirmationEmailTemplate(name, requestCode, { companyName: "Mi Nueva Empresa LLC" }) }),
        sendEmail({ to: email, subject: "TEST: Bienvenido a Easy US LLC", html: getWelcomeEmailTemplate(name) }),
        sendEmail({ to: email, subject: "TEST: Newsletter Bienvenida", html: getNewsletterWelcomeTemplate() }),
        sendEmail({ to: email, subject: "TEST: Confirmación de Mensaje (Auto-reply)", html: getAutoReplyTemplate(ticketId, name) }),
        sendEmail({ to: email, subject: "TEST: OTP Mensaje de Contacto", html: getOtpEmailTemplate(otp) }),
      ]);

      res.json({ success: true, message: "Emails de prueba administrativos mejorados enviados" });
    } catch (error) {
      console.error("Error sending test emails:", error);
      res.status(500).json({ message: "Error al enviar emails de prueba" });
    }
  });

  return httpServer;
}

async function seedDatabase() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    await storage.createProduct({
      name: "New Mexico LLC",
      description: "Constitución rápida en el estado más eficiente. Ideal para bajo coste de mantenimiento.",
      price: 63900,
      features: [
        "Tasas del estado pagadas",
        "Registered Agent (12 meses)",
        "Articles of Organization oficiales",
        "Operating Agreement profesional",
        "EIN del IRS",
        "BOI Report presentado",
        "Declaraciones fiscales año 1",
        "Soporte completo 12 meses"
      ],
    });
    await storage.createProduct({
      name: "Wyoming LLC",
      description: "Constitución premium en el estado más prestigioso de USA. Máxima privacidad y protección.",
      price: 79900,
      features: [
        "Tasas del estado pagadas",
        "Registered Agent (12 meses)",
        "EIN del IRS garantizado",
        "Articles of Organization oficiales",
        "Operating Agreement profesional",
        "BOI Report presentado",
        "Annual Report año 1",
        "Declaraciones fiscales año 1",
        "Soporte completo 12 meses"
      ],
    });
    await storage.createProduct({
      name: "Delaware LLC",
      description: "El estándar para startups y empresas tecnológicas. Reconocimiento legal global.",
      price: 99900,
      features: [
        "Tasas del estado pagadas",
        "Registered Agent (12 meses)",
        "Articles of Organization oficiales",
        "Operating Agreement profesional",
        "EIN del IRS",
        "BOI Report presentado",
        "Declaraciones fiscales año 1",
        "Soporte completo 12 meses"
      ],
    });
  }
}
