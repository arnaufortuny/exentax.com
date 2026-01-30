import type { Express } from "express";
import type { Server } from "http";
import { setupCustomAuth, isAuthenticated, isAdmin } from "./lib/custom-auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertLlcApplicationSchema, insertApplicationDocumentSchema } from "@shared/schema";
import type { Request, Response } from "express";
import { db } from "./db";
import { sendEmail, sendTrustpilotEmail, getOtpEmailTemplate, getConfirmationEmailTemplate, getWelcomeEmailTemplate, getNewsletterWelcomeTemplate, getAutoReplyTemplate, getEmailFooter, getEmailHeader, getOrderUpdateTemplate, getNoteReceivedTemplate, getAccountDeactivatedTemplate, getAccountUnderReviewTemplate, getOrderCompletedTemplate, getAccountVipTemplate, getAccountReactivatedTemplate, getAdminNoteTemplate, getPaymentRequestTemplate, getDocumentRequestTemplate, getMessageReplyTemplate, getPasswordChangeOtpTemplate, getOrderEventTemplate, getAdminLLCOrderTemplate, getAdminMaintenanceOrderTemplate } from "./lib/email";
import { contactOtps, products as productsTable, users as usersTable, maintenanceApplications, newsletterSubscribers, messages as messagesTable, orderEvents, messageReplies, userNotifications, orders as ordersTable, llcApplications as llcApplicationsTable, applicationDocuments as applicationDocumentsTable, discountCodes } from "@shared/schema";
import { and, eq, gt, desc, sql, isNotNull } from "drizzle-orm";
import { checkRateLimit, sanitizeHtml, logAudit, getSystemHealth, getClientIp, getRecentAuditLogs } from "./lib/security";
import { generateInvoicePdf, generateReceiptPdf } from "./lib/pdf-generator";
import { setupOAuth } from "./oauth";
import { checkAndSendReminders, updateApplicationDeadlines, getUpcomingDeadlinesForUser } from "./calendar-service";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Enhanced Rate limiting with automatic cleanup
  const rateLimit = new Map<string, number[]>();
  const WINDOW_MS = 60000;
  const MAX_REQUESTS = 100;
  const CLEANUP_INTERVAL = 300000; // Clean up every 5 minutes
  
  // Periodic cleanup of stale IPs to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(rateLimit.entries());
    for (let i = 0; i < entries.length; i++) {
      const [ip, timestamps] = entries[i];
      const valid = timestamps.filter((t: number) => now - t < WINDOW_MS);
      if (valid.length === 0) {
        rateLimit.delete(ip);
      } else {
        rateLimit.set(ip, valid);
      }
    }
  }, CLEANUP_INTERVAL);
  
  // Cleanup expired OTPs every 10 minutes
  setInterval(async () => {
    try {
      await db.delete(contactOtps).where(
        sql`${contactOtps.expiresAt} < NOW()`
      );
    } catch (e) {
      console.error("OTP cleanup error:", e);
    }
  }, 600000);
  
  app.use("/api/", (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.headers['x-forwarded-for']?.toString().split(',')[0] || "unknown";
    
    const timestamps = rateLimit.get(ip) || [];
    const validTimestamps = timestamps.filter(t => now - t < WINDOW_MS);
    
    if (validTimestamps.length >= MAX_REQUESTS) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ message: "Demasiadas peticiones. Por favor, espera un minuto." });
    }
    
    validTimestamps.push(now);
    rateLimit.set(ip, validTimestamps);
    next();
  });

  // Set up Custom Auth
  setupCustomAuth(app);

  // Set up Google OAuth
  setupOAuth(app);

  // Schedule compliance reminder checks every hour
  setInterval(async () => {
    try {
      await checkAndSendReminders();
    } catch (e) {
      console.error("Compliance reminder check error:", e);
    }
  }, 3600000);

  // Run initial reminder check on startup (after 30 seconds to allow DB to be ready)
  setTimeout(async () => {
    try {
      await checkAndSendReminders();
      console.log("Initial compliance reminder check completed");
    } catch (e) {
      console.error("Initial compliance reminder check error:", e);
    }
  }, 30000);

  // Health check endpoint for deployment with database verification
  app.get("/api/healthz", async (_req, res) => {
    try {
      const health = await getSystemHealth();
      if (health.status === 'unhealthy') {
        return res.status(503).json(health);
      }
      res.status(200).json(health);
    } catch (error) {
      res.status(503).json({ status: 'unhealthy', error: 'Health check failed' });
    }
  });

  // Admin endpoint for audit logs
  app.get("/api/admin/audit-logs", isAdmin, async (_req, res) => {
    const logs = getRecentAuditLogs(500);
    res.json(logs);
  });

    // Unified activity log helper (console only - no email spam)
    const logActivity = async (title: string, data: any, _req?: any) => {
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
    
    // Audit log for order status change
    logAudit({ 
      action: 'order_status_change', 
      userId: req.session?.userId, 
      targetId: String(orderId),
      details: { newStatus: status } 
    });
    
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

      // If order completed, upgrade user to VIP status and send Trustpilot email
      if (status === 'completed' && order.userId) {
        await db.update(usersTable)
          .set({ accountStatus: 'vip' })
          .where(eq(usersTable.id, order.userId));
        
        // Send Trustpilot review request email
        const orderCode = order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber || `#${order.id}`;
        sendTrustpilotEmail({
          to: order.user.email,
          name: order.user.firstName || "Cliente",
          orderNumber: orderCode
        }).catch(() => {});
      }

      // Auto-calculate compliance deadlines when order is filed
      if (status === 'filed' && order.application) {
        const formationDate = new Date();
        const state = order.application.state || "new_mexico";
        await updateApplicationDeadlines(order.application.id, formationDate, state);
      }

      // Create Notification in Dashboard
      const orderCode = order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber || `#${order.id}`;
      await db.insert(userNotifications).values({
        userId: order.userId,
        orderId: order.id,
        orderCode,
        title: `Actualización de pedido: ${statusLabel}`,
        message: `Tu pedido ${orderCode} ha cambiado a: ${statusLabel}.${status === 'completed' ? ' ¡Enhorabuena, ahora eres cliente VIP!' : ''}`,
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
        subject: `Actualización de estado - Pedido ${order.invoiceNumber || `#${order.id}`}`,
        html: getOrderUpdateTemplate(
          order.user.firstName || "Cliente",
          order.invoiceNumber || `#${order.id}`,
          status,
          `Tu pedido ha pasado a estado: ${statusLabels[status] || status}. Puedes ver los detalles en tu panel de control.`
        )
      }).catch(() => {});
    }
    res.json(updatedOrder);
  }));

  // Delete order (admin only) - Full cascade deletion
  app.delete("/api/admin/orders/:id", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const orderId = Number(req.params.id);
    
    // Get order details before deletion for logging
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    
    // Use transaction for safe cascade deletion
    await db.transaction(async (tx) => {
      // Delete order events
      await tx.delete(orderEvents).where(eq(orderEvents.orderId, orderId));
      
      // Delete application documents
      await tx.delete(applicationDocumentsTable).where(eq(applicationDocumentsTable.orderId, orderId));
      
      // Delete user notifications related to this order
      if (order.userId) {
        await tx.delete(userNotifications).where(
          and(
            eq(userNotifications.userId, order.userId),
            sql`${userNotifications.message} LIKE ${'%' + (order.invoiceNumber || `#${orderId}`) + '%'}`
          )
        );
      }
      
      // Delete the LLC application if exists
      if (order.application?.id) {
        await tx.delete(llcApplicationsTable).where(eq(llcApplicationsTable.id, order.application.id));
      }
      
      // Finally delete the order
      await tx.delete(ordersTable).where(eq(ordersTable.id, orderId));
    });
    
    res.json({ success: true, message: "Pedido eliminado correctamente" });
  }));

  // Update LLC important dates with automatic calculation
  app.patch("/api/admin/llc/:appId/dates", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const appId = Number(req.params.appId);
    const { field, value } = z.object({ 
      field: z.enum(['llcCreatedDate', 'agentRenewalDate', 'irs1120DueDate', 'irs5472DueDate', 'annualReportDueDate']),
      value: z.string()
    }).parse(req.body);
    
    const dateValue = value ? new Date(value) : null;
    const updateData: Record<string, Date | null> = {};
    updateData[field] = dateValue;
    
    // Auto-calculate other fiscal dates when llcCreatedDate is set
    if (field === 'llcCreatedDate' && dateValue) {
      const creationDate = new Date(dateValue);
      const creationYear = creationDate.getFullYear();
      const nextYear = creationYear + 1;
      
      // Agent renewal: 1 year after creation
      const agentRenewal = new Date(creationDate);
      agentRenewal.setFullYear(agentRenewal.getFullYear() + 1);
      updateData.agentRenewalDate = agentRenewal;
      
      // IRS 1120: March 15 of next year
      updateData.irs1120DueDate = new Date(nextYear, 2, 15);
      
      // IRS 5472: April 15 of next year
      updateData.irs5472DueDate = new Date(nextYear, 3, 15);
      
      // Annual Report: Get the LLC state to determine date
      const [app] = await db.select({ state: llcApplicationsTable.state })
        .from(llcApplicationsTable)
        .where(eq(llcApplicationsTable.id, appId))
        .limit(1);
      
      if (app?.state) {
        // Annual report dates by state
        // New Mexico: No annual report required
        // Wyoming: First day of anniversary month
        // Delaware: March 1
        if (app.state === 'Wyoming') {
          const wyomingDate = new Date(creationDate);
          wyomingDate.setFullYear(wyomingDate.getFullYear() + 1);
          wyomingDate.setDate(1);
          updateData.annualReportDueDate = wyomingDate;
        } else if (app.state === 'Delaware') {
          updateData.annualReportDueDate = new Date(nextYear, 2, 1); // March 1
        }
        // New Mexico: no annual report, leave as null
      }
    }
    
    await db.update(llcApplicationsTable)
      .set(updateData)
      .where(eq(llcApplicationsTable.id, appId));
    
    res.json({ success: true });
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
      accountStatus: z.enum(['active', 'pending', 'deactivated', 'vip']).optional(),
      internalNotes: z.string().optional()
    });
    const data = updateSchema.parse(req.body);
    
    const [updated] = await db.update(usersTable).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(usersTable.id, userId)).returning();

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
      await db.delete(usersTable).where(eq(usersTable.id, userId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error al eliminar usuario" });
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
      return res.status(400).json({ message: "El email ya está registrado" });
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

  app.post("/api/admin/orders/create", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const validStates = ["New Mexico", "Wyoming", "Delaware"] as const;
    const schema = z.object({
      userId: z.string().uuid(),
      state: z.enum(validStates),
      amount: z.string().or(z.number()).refine(val => Number(val) > 0, { message: "El importe debe ser mayor que 0" })
    });
    const { userId, state, amount } = schema.parse(req.body);
    
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    const productMap: Record<string, { id: number; name: string }> = {
      "New Mexico": { id: 1, name: "LLC New Mexico" },
      "Wyoming": { id: 2, name: "LLC Wyoming" },
      "Delaware": { id: 3, name: "LLC Delaware" }
    };
    const product = productMap[state];
    const amountCents = Math.round(Number(amount) * 100);
    
    const statePrefix = state === "Wyoming" ? "WY" : state === "Delaware" ? "DE" : "NM";
    const year = new Date().getFullYear().toString().slice(-2);
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `${statePrefix}-${year}${timestamp}-${randomSuffix}`;
    
    const [order] = await db.insert(ordersTable).values({
      userId,
      productId: product.id,
      amount: amountCents,
      status: 'pending',
      invoiceNumber
    }).returning();
    
    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: 'order_created',
      description: `Pedido ${invoiceNumber} creado por administrador`
    });
    
    await db.insert(userNotifications).values({
      userId,
      orderId: order.id,
      orderCode: invoiceNumber,
      title: 'Nuevo pedido registrado',
      message: `Se ha registrado el pedido ${invoiceNumber} para ${product.name}`,
      type: 'info',
      isRead: false
    });
    
    res.json({ success: true, orderId: order.id, invoiceNumber });
  }));

  app.get("/api/admin/system-stats", isAdmin, async (req, res) => {
    try {
      // Core metrics - parallel queries for performance
      const [
        salesResult,
        pendingSalesResult,
        userResult,
        orderResult,
        pendingOrdersResult,
        completedOrdersResult,
        processingOrdersResult,
        subscriberResult,
        pendingAccountsResult,
        activeAccountsResult,
        vipAccountsResult,
        deactivatedAccountsResult,
        messagesResult,
        pendingMessagesResult,
        docsResult,
        pendingDocsResult
      ] = await Promise.all([
        db.select({ total: sql<number>`COALESCE(sum(amount), 0)` }).from(ordersTable).where(eq(ordersTable.status, 'completed')),
        db.select({ total: sql<number>`COALESCE(sum(amount), 0)` }).from(ordersTable).where(eq(ordersTable.status, 'pending')),
        db.select({ count: sql<number>`count(*)` }).from(usersTable),
        db.select({ count: sql<number>`count(*)` }).from(ordersTable),
        db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, 'pending')),
        db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, 'completed')),
        db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, 'processing')),
        db.select({ count: sql<number>`count(*)` }).from(newsletterSubscribers),
        db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.accountStatus, 'pending')),
        db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.accountStatus, 'active')),
        db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.accountStatus, 'vip')),
        db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.accountStatus, 'deactivated')),
        db.select({ count: sql<number>`count(*)` }).from(messagesTable),
        db.select({ count: sql<number>`count(*)` }).from(messagesTable).where(eq(messagesTable.status, 'pending')),
        db.select({ count: sql<number>`count(*)` }).from(applicationDocumentsTable),
        db.select({ count: sql<number>`count(*)` }).from(applicationDocumentsTable).where(eq(applicationDocumentsTable.reviewStatus, 'pending'))
      ]);

      const totalSales = Number(salesResult[0]?.total || 0);
      const pendingSales = Number(pendingSalesResult[0]?.total || 0);
      const userCount = Number(userResult[0]?.count || 0);
      const orderCount = Number(orderResult[0]?.count || 0);
      const pendingOrders = Number(pendingOrdersResult[0]?.count || 0);
      const completedOrders = Number(completedOrdersResult[0]?.count || 0);
      const processingOrders = Number(processingOrdersResult[0]?.count || 0);
      const subscriberCount = Number(subscriberResult[0]?.count || 0);
      const pendingAccounts = Number(pendingAccountsResult[0]?.count || 0);
      const activeAccounts = Number(activeAccountsResult[0]?.count || 0);
      const vipAccounts = Number(vipAccountsResult[0]?.count || 0);
      const deactivatedAccounts = Number(deactivatedAccountsResult[0]?.count || 0);
      const totalMessages = Number(messagesResult[0]?.count || 0);
      const pendingMessages = Number(pendingMessagesResult[0]?.count || 0);
      const totalDocs = Number(docsResult[0]?.count || 0);
      const pendingDocs = Number(pendingDocsResult[0]?.count || 0);

      // Conversion rate
      const conversionRate = userCount > 0 ? (orderCount / userCount) * 100 : 0;

      res.json({ 
        // Sales
        totalSales,
        pendingSales,
        // Orders
        orderCount,
        pendingOrders,
        completedOrders,
        processingOrders,
        // Users
        userCount,
        pendingAccounts,
        activeAccounts,
        vipAccounts,
        deactivatedAccounts,
        // Newsletter
        subscriberCount,
        // Messages
        totalMessages,
        pendingMessages,
        // Documents
        totalDocs,
        pendingDocs,
        // Metrics
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

  // ============== DISCOUNT CODES ==============
  
  // Get all discount codes (admin)
  app.get("/api/admin/discount-codes", isAdmin, async (req, res) => {
    try {
      const codes = await db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
      res.json(codes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching discount codes" });
    }
  });

  // Create discount code (admin)
  app.post("/api/admin/discount-codes", isAdmin, async (req, res) => {
    try {
      const { code, description, discountType, discountValue, minOrderAmount, maxUses, validFrom, validUntil, isActive } = req.body;
      
      if (!code || !discountValue) {
        return res.status(400).json({ message: "Código y valor de descuento son requeridos" });
      }

      const [existing] = await db.select().from(discountCodes).where(eq(discountCodes.code, code.toUpperCase())).limit(1);
      if (existing) {
        return res.status(400).json({ message: "Este código ya existe" });
      }

      const [newCode] = await db.insert(discountCodes).values({
        code: code.toUpperCase(),
        description,
        discountType: discountType || 'percentage',
        discountValue: parseInt(discountValue),
        minOrderAmount: minOrderAmount ? parseInt(minOrderAmount) : 0,
        maxUses: maxUses ? parseInt(maxUses) : null,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: isActive !== false,
      }).returning();

      res.status(201).json(newCode);
    } catch (error) {
      res.status(500).json({ message: "Error creating discount code" });
    }
  });

  // Update discount code (admin)
  app.patch("/api/admin/discount-codes/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { code, description, discountType, discountValue, minOrderAmount, maxUses, validFrom, validUntil, isActive } = req.body;

      const updateData: any = {};
      if (code) updateData.code = code.toUpperCase();
      if (description !== undefined) updateData.description = description;
      if (discountType) updateData.discountType = discountType;
      if (discountValue !== undefined) updateData.discountValue = parseInt(discountValue);
      if (minOrderAmount !== undefined) updateData.minOrderAmount = parseInt(minOrderAmount);
      if (maxUses !== undefined) updateData.maxUses = maxUses ? parseInt(maxUses) : null;
      if (validFrom) updateData.validFrom = new Date(validFrom);
      if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null;
      if (isActive !== undefined) updateData.isActive = isActive;

      const [updated] = await db.update(discountCodes).set(updateData).where(eq(discountCodes.id, id)).returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating discount code" });
    }
  });

  // Delete discount code (admin)
  app.delete("/api/admin/discount-codes/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(discountCodes).where(eq(discountCodes.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting discount code" });
    }
  });

  // Validate discount code (public - for checkout)
  app.post("/api/discount-codes/validate", async (req, res) => {
    try {
      const { code, orderAmount } = req.body;
      
      if (!code) {
        return res.status(400).json({ valid: false, message: "Código requerido" });
      }

      const [discountCode] = await db.select().from(discountCodes).where(eq(discountCodes.code, code.toUpperCase())).limit(1);
      
      if (!discountCode) {
        return res.status(404).json({ valid: false, message: "Código no encontrado" });
      }

      if (!discountCode.isActive) {
        return res.status(400).json({ valid: false, message: "Código inactivo" });
      }

      const now = new Date();
      if (discountCode.validFrom && new Date(discountCode.validFrom) > now) {
        return res.status(400).json({ valid: false, message: "Código aún no válido" });
      }
      if (discountCode.validUntil && new Date(discountCode.validUntil) < now) {
        return res.status(400).json({ valid: false, message: "Código expirado" });
      }

      if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
        return res.status(400).json({ valid: false, message: "Código agotado" });
      }

      if (discountCode.minOrderAmount && orderAmount && orderAmount < discountCode.minOrderAmount) {
        return res.status(400).json({ valid: false, message: `Pedido mínimo: ${(discountCode.minOrderAmount / 100).toFixed(2)}€` });
      }

      // Calculate discount
      let discountAmount = 0;
      if (orderAmount) {
        if (discountCode.discountType === 'percentage') {
          discountAmount = Math.round((orderAmount * discountCode.discountValue) / 100);
        } else {
          discountAmount = discountCode.discountValue;
        }
      }

      res.json({
        valid: true,
        code: discountCode.code,
        discountType: discountCode.discountType,
        discountValue: discountCode.discountValue,
        discountAmount,
        description: discountCode.description,
      });
    } catch (error) {
      res.status(500).json({ valid: false, message: "Error validating code" });
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

  // Broadcast to all newsletter subscribers
  app.post("/api/admin/newsletter/broadcast", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { subject, message } = z.object({
      subject: z.string().min(1),
      message: z.string().min(1)
    }).parse(req.body);

    const subscribers = await db.select().from(newsletterSubscribers);
    
    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f7f7f5;">
        <div style="background: white; padding: 32px; border-radius: 16px;">
          <h1 style="font-size: 24px; font-weight: 900; color: #0E1215; margin: 0 0 24px 0;">${subject}</h1>
          <div style="font-size: 15px; line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</div>
          <hr style="border: none; border-top: 1px solid #E6E9EC; margin: 32px 0;" />
          <p style="font-size: 12px; color: #6B7280; margin: 0;">Easy US LLC - Formación de empresas en USA</p>
        </div>
      </div>
    `;

    let sent = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail({ to: sub.email, subject, html });
        sent++;
      } catch (e) {
        // Email error silenced
      }
    }

    res.json({ success: true, sent, total: subscribers.length });
  }));

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

  app.delete("/api/user/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const docId = parseInt(req.params.id);
      
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user || user.accountStatus === 'pending') {
        return res.status(403).json({ message: "No puedes eliminar documentos mientras tu cuenta está en revisión" });
      }
      
      const docs = await db.select().from(applicationDocumentsTable)
        .leftJoin(ordersTable, eq(applicationDocumentsTable.orderId, ordersTable.id))
        .where(and(
          eq(applicationDocumentsTable.id, docId),
          eq(ordersTable.userId, userId)
        ));
      
      if (!docs.length) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      
      await db.delete(applicationDocumentsTable).where(eq(applicationDocumentsTable.id, docId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Error al eliminar documento" });
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

  // Protected admin seeding - requires existing admin authentication
  app.post("/api/seed-admin", isAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      const adminEmail = email || process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
      
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, adminEmail)).limit(1);
      if (!existingUser) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }
      
      await db.update(usersTable).set({ isAdmin: true, accountStatus: 'active' }).where(eq(usersTable.email, adminEmail));
      res.json({ success: true, message: "Rol de administrador asignado correctamente" });
    } catch (error) {
      console.error("Seed admin error:", error);
      res.status(500).json({ message: "Error al asignar rol de administrador" });
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
        // Soft delete: Keep record but mark as deactivated and change email to prevent reuse
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        await db.update(usersTable).set({ 
          accountStatus: 'deactivated',
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
      console.error("Error fetching deadlines:", error);
      res.status(500).json({ message: "Error al obtener fechas de cumplimiento" });
    }
  });

  // Admin: Set formation date for an application (triggers auto-calculation)
  app.post("/api/admin/applications/:id/set-formation-date", isAdmin, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { formationDate, state } = z.object({
        formationDate: z.string(),
        state: z.string().optional()
      }).parse(req.body);

      const [app] = await db.select().from(llcApplicationsTable).where(eq(llcApplicationsTable.id, applicationId)).limit(1);
      if (!app) {
        return res.status(404).json({ message: "Aplicación no encontrada" });
      }

      const deadlines = await updateApplicationDeadlines(
        applicationId, 
        new Date(formationDate), 
        state || app.state || "new_mexico"
      );

      res.json({ 
        success: true, 
        message: "Fechas de cumplimiento calculadas exitosamente",
        deadlines 
      });
    } catch (error) {
      console.error("Error setting formation date:", error);
      res.status(500).json({ message: "Error al establecer fecha de constitución" });
    }
  });

  // User notifications - Unified Note + Email System
  app.post("/api/admin/send-note", isAdmin, async (req, res) => {
    try {
      const { userId, title, message, type } = z.object({
        userId: z.string(),
        title: z.string().min(1, "Título requerido"),
        message: z.string().min(1, "Mensaje requerido"),
        type: z.enum(['update', 'info', 'action_required'])
      }).parse(req.body);

      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

      // Generate unique ticket ID (8-digit numeric format)
      const { generateUniqueTicketId } = await import("./lib/id-generator");
      const ticketId = await generateUniqueTicketId();

      // Create Notification in system with ticketId
      await db.insert(userNotifications).values({
        userId,
        title,
        message,
        type,
        ticketId,
        isRead: false
      });

      // Always send email notification with ticket reference
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: `${title} - Ticket #${ticketId}`,
          html: getAdminNoteTemplate(user.firstName || 'Cliente', title, message, ticketId)
        });
      }

      res.json({ success: true, emailSent: !!user.email, ticketId });
    } catch (error) {
      console.error("Error sending note:", error);
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
        subject: "Pago pendiente - Easy US LLC",
        html: getPaymentRequestTemplate(user.firstName || 'Cliente', message, paymentLink, amount)
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
  app.post("/api/user/request-password-otp", isAuthenticated, async (req: any, res) => {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
      if (!user?.email) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      
      // Store OTP in database
      await db.insert(contactOtps).values({
        email: user.email,
        otp,
        otpType: "password_change",
        expiresAt: expires,
        verified: false
      });
      
      await sendEmail({
        to: user.email,
        subject: "Código de verificación - Cambio de contraseña",
        html: getPasswordChangeOtpTemplate(user.firstName || 'Cliente', otp)
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
      
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
      if (!user?.email || !user?.passwordHash) {
        return res.status(400).json({ message: "No se puede cambiar la contraseña" });
      }
      
      // Verify OTP from database
      const [otpRecord] = await db.select()
        .from(contactOtps)
        .where(and(
          eq(contactOtps.email, user.email),
          eq(contactOtps.otp, otp),
          eq(contactOtps.otpType, "password_change"),
          gt(contactOtps.expiresAt, new Date())
        ));
      
      if (!otpRecord) {
        return res.status(400).json({ message: "Código de verificación inválido o expirado" });
      }
      
      // Delete used OTP
      await db.delete(contactOtps).where(eq(contactOtps.id, otpRecord.id));
      
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
        subject: `Acción Requerida: Solicitud de Documentación`,
        html: getDocumentRequestTemplate('Cliente', docTypeLabel, message, msgId)
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

      // Get application requestCode (LLC or Maintenance)
      const [llcApp] = await db.select().from(llcApplicationsTable).where(eq(llcApplicationsTable.orderId, orderId)).limit(1);
      const [maintApp] = await db.select().from(maintenanceApplications).where(eq(maintenanceApplications.orderId, orderId)).limit(1);
      const invoiceNumber = llcApp?.requestCode || maintApp?.requestCode || order.invoiceNumber;

      // Generate PDF using lightweight PDFKit
      const pdfBuffer = await generateInvoicePdf({
        invoiceNumber: invoiceNumber || `INV-${orderId}`,
        date: new Date(order.createdAt || Date.now()).toLocaleDateString('es-ES'),
        customerName: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Cliente',
        customerEmail: order.user?.email || '',
        productName: order.product?.name || 'Servicio LLC',
        amount: order.amount,
        currency: order.currency || 'EUR',
        status: order.status,
        originalAmount: order.originalAmount || undefined,
        discountAmount: order.discountAmount || undefined,
        discountCode: order.discountCode || undefined
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Factura-${invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
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
      const [llcAppInv] = await db.select().from(llcApplicationsTable).where(eq(llcApplicationsTable.orderId, orderId)).limit(1);
      const [maintAppInv] = await db.select().from(maintenanceApplications).where(eq(maintenanceApplications.orderId, orderId)).limit(1);
      const displayInvoiceNumber = llcAppInv?.requestCode || maintAppInv?.requestCode || order.invoiceNumber;
      
      // Check if invoice already exists to avoid duplicates
      const existingDoc = await db.select().from(applicationDocumentsTable)
        .where(and(eq(applicationDocumentsTable.orderId, orderId), eq(applicationDocumentsTable.documentType, "invoice")))
        .limit(1);
      
      if (existingDoc.length === 0) {
        await db.insert(applicationDocumentsTable).values({
          orderId,
          fileName: `Factura ${displayInvoiceNumber}`,
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

  // Create standalone invoice for user (not tied to order)
  app.post("/api/admin/invoices/create", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { userId, concept, amount, currency } = z.object({
      userId: z.string(),
      concept: z.string().min(1),
      amount: z.number().min(1),
      currency: z.enum(["EUR", "USD"]).default("EUR")
    }).parse(req.body);
    
    const currencySymbol = currency === "USD" ? "$" : "€";

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    
    // Generate invoice HTML
    const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Factura ${invoiceNumber}</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 40px; color: #0E1215; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: 900; color: #0E1215; }
    .logo span { color: #6EDC8A; }
    .invoice-title { font-size: 32px; font-weight: 900; text-align: right; }
    .invoice-number { font-size: 14px; color: #6B7280; text-align: right; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .section-title { font-size: 12px; color: #6B7280; text-transform: uppercase; margin-bottom: 8px; }
    .section-content { font-size: 14px; line-height: 1.6; }
    .items { margin: 40px 0; }
    .items-header { display: grid; grid-template-columns: 3fr 1fr 1fr; padding: 12px 0; border-bottom: 2px solid #0E1215; font-weight: 700; font-size: 12px; text-transform: uppercase; }
    .items-row { display: grid; grid-template-columns: 3fr 1fr 1fr; padding: 16px 0; border-bottom: 1px solid #E6E9EC; font-size: 14px; }
    .total-section { text-align: right; margin-top: 24px; }
    .total-row { font-size: 14px; margin-bottom: 8px; }
    .total-final { font-size: 24px; font-weight: 900; color: #0E1215; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #E6E9EC; font-size: 11px; color: #6B7280; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">EASY<span>US</span></div>
      <p style="font-size: 11px; color: #6B7280;">Fortuny Consulting LLC</p>
    </div>
    <div>
      <div class="invoice-title">FACTURA</div>
      <div class="invoice-number">${invoiceNumber}</div>
      <div class="invoice-number">${new Date().toLocaleDateString('es-ES')}</div>
    </div>
  </div>
  <div class="details">
    <div>
      <div class="section-title">Facturado a</div>
      <div class="section-content">
        <strong>${user.firstName} ${user.lastName}</strong><br>
        ${user.email}<br>
        ${user.phone || ''}
      </div>
    </div>
    <div>
      <div class="section-title">Emitido por</div>
      <div class="section-content">
        <strong>Fortuny Consulting LLC</strong><br>
        1209 Mountain Road Pl NE Ste R<br>
        Albuquerque, NM 87110
      </div>
    </div>
  </div>
  <div class="items">
    <div class="items-header">
      <span>Concepto</span>
      <span style="text-align:right;">Cantidad</span>
      <span style="text-align:right;">Importe</span>
    </div>
    <div class="items-row">
      <span>${concept}</span>
      <span style="text-align:right;">1</span>
      <span style="text-align:right;">${(amount / 100).toFixed(2)} ${currencySymbol}</span>
    </div>
  </div>
  <div class="total-section">
    <div class="total-row">Subtotal: ${(amount / 100).toFixed(2)} ${currencySymbol}</div>
    <div class="total-row">IVA (0%): 0.00 ${currencySymbol}</div>
    <div class="total-final">Total: ${(amount / 100).toFixed(2)} ${currencySymbol}</div>
  </div>
  <div class="footer">
    <p>Fortuny Consulting LLC - EIN: 99-1877254</p>
    <p>1209 Mountain Road Pl NE Ste R, Albuquerque, NM 87110, USA</p>
    <p>info@easyusllc.com | www.easyusllc.com</p>
  </div>
</body>
</html>`;

    // Store as document for user
    const [userOrder] = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId)).limit(1);
    if (userOrder) {
      await db.insert(applicationDocumentsTable).values({
        orderId: userOrder.id,
        fileName: `Factura ${invoiceNumber} - ${concept}`,
        fileType: "text/html",
        fileUrl: `data:text/html;base64,${Buffer.from(invoiceHtml).toString('base64')}`,
        documentType: "invoice",
        reviewStatus: "approved",
        uploadedBy: req.session.userId
      });
    }

    res.json({ success: true, invoiceNumber });
  }));

  app.post(api.orders.create.path, async (req: any, res) => {
    try {
      const { productId, email, password, ownerFullName, paymentMethod, discountCode, discountAmount } = req.body;
      
      // Parse productId
      const parsedInput = api.orders.create.input.parse({ productId });
      
      let userId: string;
      let isNewUser = false;
      
      if (req.session?.userId) {
        // User already authenticated
        const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
        if (currentUser && (currentUser.accountStatus === 'pending' || currentUser.accountStatus === 'deactivated')) {
          return res.status(403).json({ message: "Tu cuenta está en revisión o desactivada. No puedes realizar nuevos pedidos en este momento." });
        }
        userId = req.session.userId;
      } else {
        // Require email, password and OTP verification for new users
        if (!email || !password) {
          return res.status(400).json({ message: "Se requiere email y contraseña para realizar un pedido." });
        }
        
        if (password.length < 8) {
          return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
        }
        
        // Check if email already exists
        const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
        if (existingUser) {
          return res.status(400).json({ message: "Este email ya está registrado. Por favor inicia sesión." });
        }
        
        // Verify that email has been verified via OTP
        const [otpRecord] = await db.select()
          .from(contactOtps)
          .where(
            and(
              eq(contactOtps.email, email),
              eq(contactOtps.otpType, "account_verification"),
              eq(contactOtps.verified, true),
              gt(contactOtps.expiresAt, new Date(Date.now() - 30 * 60 * 1000)) // Allow 30 min window after verification
            )
          )
          .orderBy(sql`${contactOtps.expiresAt} DESC`)
          .limit(1);
        
        if (!otpRecord) {
          return res.status(400).json({ message: "Por favor verifica tu email antes de continuar." });
        }
        
        // Create new user with verified email and password
        const { hashPassword, generateUniqueClientId } = await import("./lib/auth-service");
        const passwordHash = await hashPassword(password);
        const clientId = await generateUniqueClientId();
        const nameParts = ownerFullName?.split(' ') || ['Cliente'];
        
        const [newUser] = await db.insert(usersTable).values({
          email,
          passwordHash,
          clientId,
          firstName: nameParts[0] || 'Cliente',
          lastName: nameParts.slice(1).join(' ') || '',
          emailVerified: true,
          accountStatus: 'active',
        }).returning();
        
        userId = newUser.id;
        isNewUser = true;
        
        // Set session for the new user
        req.session.userId = userId;
        
        // Send welcome email
        sendEmail({
          to: email,
          subject: "Bienvenido a Easy US LLC - Acceso a tu panel",
          html: getWelcomeEmailTemplate(nameParts[0] || 'Cliente')
        }).catch(console.error);
      }

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(400).json({ message: "Invalid product" });
      }

      // CRITICAL: Ensure pricing follows NM 739€, WY 899€, DE 1199€
      let finalPrice = product.price;
      if (product.name.includes("New Mexico")) finalPrice = 73900;
      else if (product.name.includes("Wyoming")) finalPrice = 89900;
      else if (product.name.includes("Delaware")) finalPrice = 119900;

      // Calculate final amount with discount
      let originalAmount = finalPrice;
      let appliedDiscountAmount = 0;
      let appliedDiscountCode: string | null = null;
      
      if (discountCode && discountAmount) {
        appliedDiscountCode = discountCode;
        appliedDiscountAmount = discountAmount;
        finalPrice = Math.max(0, finalPrice - discountAmount);
        
        // Increment used count for the discount code
        await db.update(discountCodes)
          .set({ usedCount: sql`${discountCodes.usedCount} + 1` })
          .where(eq(discountCodes.code, discountCode.toUpperCase()));
      }

      // Create the order
      const order = await storage.createOrder({
        userId,
        productId,
        amount: finalPrice,
        originalAmount: appliedDiscountCode ? originalAmount : null,
        discountCode: appliedDiscountCode,
        discountAmount: appliedDiscountAmount || null,
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

      // Create an empty application linked to the order
      const application = await storage.createLlcApplication({
        orderId: order.id,
        status: "draft",
        state: product.name.split(" ")[0], // Extract state name correctly
      });

      // NOTIFICATION: New order created (after application so we have requestCode)
      if (userId && !userId.startsWith('guest_')) {
        await db.insert(userNotifications).values({
          userId,
          orderId: order.id,
          orderCode: application.requestCode || order.invoiceNumber,
          title: "Nuevo pedido registrado",
          message: `Tu pedido de ${product.name} ha sido registrado correctamente. Te mantendremos informado del progreso.`,
          type: 'info',
          isRead: false
        });
      }

      // Generate unified request code: STATE-8digits (e.g., NM-12345678)
      const { generateUniqueOrderCode } = await import("./lib/id-generator");
      const appState = product.name.split(" ")[0] || 'New Mexico';
      const requestCode = await generateUniqueOrderCode(appState);

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
      const { name, email, phone, contactByWhatsapp, subject, content, requestCode } = req.body;
      const userId = req.session?.userId || null;
      
      // Restrict suspended accounts from sending messages
      if (userId) {
        const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        if (currentUser?.accountStatus === 'deactivated') {
          return res.status(403).json({ message: "Tu cuenta está suspendida. No puedes enviar mensajes." });
        }
      }
      
      const message = await storage.createMessage({
        userId,
        name,
        email,
        phone: phone || null,
        contactByWhatsapp: contactByWhatsapp || false,
        subject,
        content,
        requestCode,
        type: "contact"
      });

      // Send auto-reply with ticket ID
      const ticketId = message.messageId || String(message.id);
      sendEmail({
        to: email,
        subject: `Recibimos tu mensaje - Ticket #${ticketId}`,
        html: getAutoReplyTemplate(ticketId, name || "Cliente"),
      }).catch(() => {});

      // Notify admin with WhatsApp preference
      logActivity("Nuevo Mensaje de Contacto", {
        "Nombre": name,
        "Email": email,
        "Teléfono": phone || "No proporcionado",
        "WhatsApp": contactByWhatsapp ? "Sí" : "No",
        "Asunto": subject,
        "Mensaje": content,
        "Referencia": requestCode || "N/A"
      });

      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Error sending message" });
    }
  });

  // Claim order endpoint - creates account and associates with existing order
  app.post("/api/llc/claim-order", async (req: any, res) => {
    try {
      const { applicationId, email, password, ownerFullName, paymentMethod } = req.body;
      
      if (!applicationId || !email || !password) {
        return res.status(400).json({ message: "Se requiere email y contraseña." });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
      }
      
      // Check if email already exists
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (existingUser) {
        return res.status(400).json({ message: "Este email ya está registrado. Por favor inicia sesión." });
      }
      
      // Verify that email has been verified via OTP
      const [otpRecord] = await db.select()
        .from(contactOtps)
        .where(
          and(
            eq(contactOtps.email, email),
            eq(contactOtps.otpType, "account_verification"),
            eq(contactOtps.verified, true),
            gt(contactOtps.expiresAt, new Date(Date.now() - 30 * 60 * 1000))
          )
        )
        .orderBy(sql`${contactOtps.expiresAt} DESC`)
        .limit(1);
      
      if (!otpRecord) {
        return res.status(400).json({ message: "Por favor verifica tu email antes de continuar." });
      }
      
      // Get the application to find the order
      const application = await storage.getLlcApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Solicitud no encontrada." });
      }
      
      // Create new user with verified email and copy address fields from application
      const { hashPassword, generateUniqueClientId } = await import("./lib/auth-service");
      const passwordHash = await hashPassword(password);
      const clientId = await generateUniqueClientId();
      const nameParts = ownerFullName?.split(' ') || ['Cliente'];
      
      const [newUser] = await db.insert(usersTable).values({
        email,
        passwordHash,
        clientId,
        firstName: nameParts[0] || 'Cliente',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: application.ownerPhone || null,
        streetType: application.ownerStreetType || null,
        address: application.ownerAddress || null,
        city: application.ownerCity || null,
        province: application.ownerProvince || null,
        postalCode: application.ownerPostalCode || null,
        country: application.ownerCountry || null,
        birthDate: application.ownerBirthDate || null,
        businessActivity: application.businessActivity || null,
        emailVerified: true,
        accountStatus: 'active',
      }).returning();
      
      // Update the order to associate with the new user
      await db.update(ordersTable)
        .set({ userId: newUser.id })
        .where(eq(ordersTable.id, application.orderId));
      
      // Update LLC application with paymentMethod if provided
      if (paymentMethod) {
        await storage.updateLlcApplication(applicationId, { paymentMethod });
      }
      
      // Set session for the new user
      req.session.userId = newUser.id;
      
      // Send welcome email
      sendEmail({
        to: email,
        subject: "Bienvenido a Easy US LLC - Acceso a tu panel",
        html: getWelcomeEmailTemplate(nameParts[0] || 'Cliente')
      }).catch(console.error);
      
      res.json({ success: true, userId: newUser.id });
    } catch (error) {
      console.error("Error claiming order:", error);
      res.status(500).json({ message: "Error al crear la cuenta." });
    }
  });

  // Claim maintenance order endpoint
  app.post("/api/maintenance/claim-order", async (req: any, res) => {
    try {
      const { applicationId, email, password, ownerFullName, paymentMethod } = req.body;
      
      if (!applicationId || !email || !password) {
        return res.status(400).json({ message: "Se requiere email y contraseña." });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
      }
      
      // Check if email already exists
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (existingUser) {
        return res.status(400).json({ message: "Este email ya está registrado. Por favor inicia sesión." });
      }
      
      // Verify that email has been verified via OTP
      const [otpRecord] = await db.select()
        .from(contactOtps)
        .where(
          and(
            eq(contactOtps.email, email),
            eq(contactOtps.otpType, "account_verification"),
            eq(contactOtps.verified, true),
            gt(contactOtps.expiresAt, new Date(Date.now() - 30 * 60 * 1000))
          )
        )
        .orderBy(sql`${contactOtps.expiresAt} DESC`)
        .limit(1);
      
      if (!otpRecord) {
        return res.status(400).json({ message: "Por favor verifica tu email antes de continuar." });
      }
      
      // Get the maintenance application to find the order
      const [application] = await db.select().from(maintenanceApplications).where(eq(maintenanceApplications.id, applicationId)).limit(1);
      if (!application) {
        return res.status(404).json({ message: "Solicitud no encontrada." });
      }
      
      // Create new user with verified email
      const { hashPassword, generateUniqueClientId } = await import("./lib/auth-service");
      const passwordHash = await hashPassword(password);
      const clientId = await generateUniqueClientId();
      const nameParts = ownerFullName?.split(' ') || ['Cliente'];
      
      const [newUser] = await db.insert(usersTable).values({
        email,
        passwordHash,
        clientId,
        firstName: nameParts[0] || 'Cliente',
        lastName: nameParts.slice(1).join(' ') || '',
        emailVerified: true,
        accountStatus: 'active',
      }).returning();
      
      // Update the order to associate with the new user
      await db.update(ordersTable)
        .set({ userId: newUser.id })
        .where(eq(ordersTable.id, application.orderId));
      
      // Update maintenance application with paymentMethod if provided
      if (paymentMethod) {
        await db.update(maintenanceApplications)
          .set({ paymentMethod })
          .where(eq(maintenanceApplications.id, applicationId));
      }
      
      // Set session for the new user
      req.session.userId = newUser.id;
      
      // Send welcome email
      sendEmail({
        to: email,
        subject: "Bienvenido a Easy US LLC - Acceso a tu panel",
        html: getWelcomeEmailTemplate(nameParts[0] || 'Cliente')
      }).catch(console.error);
      
      res.json({ success: true, userId: newUser.id });
    } catch (error) {
      console.error("Error claiming maintenance order:", error);
      res.status(500).json({ message: "Error al crear la cuenta." });
    }
  });

  // Client Update LLC Application Data
  app.patch("/api/llc/:id/data", isAuthenticated, async (req: any, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = req.body;
      const [updated] = await db.update(llcApplicationsTable)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(llcApplicationsTable.id, appId))
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating application" });
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
        
        // Get order info for price
        const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, updatedApp.orderId)).limit(1);
        const orderAmount = order ? (order.amount / 100).toFixed(2) : 'N/A';
        
        // Email notification to admin about completed order
        const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
        const paymentMethodLabel = updatedApp.paymentMethod === 'transfer' ? 'Transferencia Bancaria' : updatedApp.paymentMethod === 'link' ? 'Link de Pago' : 'No especificado';
        
        sendEmail({
          to: adminEmail,
          subject: `[PEDIDO REALIZADO] ${orderIdentifier} - ${updatedApp.companyName}`,
          html: getAdminLLCOrderTemplate({
            orderIdentifier,
            amount: orderAmount,
            paymentMethod: paymentMethodLabel,
            ownerFullName: updatedApp.ownerFullName || undefined,
            ownerEmail: updatedApp.ownerEmail || undefined,
            ownerPhone: updatedApp.ownerPhone || undefined,
            ownerBirthDate: updatedApp.ownerBirthDate || undefined,
            ownerIdType: updatedApp.ownerIdType || undefined,
            ownerIdNumber: updatedApp.ownerIdNumber || undefined,
            ownerAddress: `${updatedApp.ownerStreetType || ''} ${updatedApp.ownerAddress || ''}`.trim() || undefined,
            ownerCity: updatedApp.ownerCity || undefined,
            ownerProvince: updatedApp.ownerProvince || undefined,
            ownerPostalCode: updatedApp.ownerPostalCode || undefined,
            ownerCountry: updatedApp.ownerCountry || undefined,
            companyName: updatedApp.companyName || undefined,
            companyNameOption2: updatedApp.companyNameOption2 || undefined,
            designator: updatedApp.designator || undefined,
            state: updatedApp.state || undefined,
            businessCategory: updatedApp.businessCategory === "Otra (especificar)" ? (updatedApp.businessCategoryOther || undefined) : (updatedApp.businessCategory || undefined),
            businessActivity: updatedApp.businessActivity || undefined,
            companyDescription: updatedApp.companyDescription || undefined,
            isSellingOnline: updatedApp.isSellingOnline || undefined,
            needsBankAccount: updatedApp.needsBankAccount || undefined,
            willUseStripe: updatedApp.willUseStripe || undefined,
            wantsBoiReport: updatedApp.wantsBoiReport || undefined,
            wantsMaintenancePack: updatedApp.wantsMaintenancePack || undefined,
            notes: updatedApp.notes || undefined
          })
        }).catch(() => {});

        // Confirmation to client with full info
        sendEmail({
          to: updatedApp.ownerEmail,
          subject: `Solicitud recibida - Referencia ${orderIdentifier}`,
          html: getConfirmationEmailTemplate(updatedApp.ownerFullName || "Cliente", orderIdentifier, { companyName: updatedApp.companyName || undefined }),
        }).catch(() => {});
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
        
        // Generate ticket ID for this document upload (8-digit format)
        const { generateUniqueMessageId } = await import("./lib/id-generator");
        const ticketId = await generateUniqueMessageId();
        
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

  app.post("/api/maintenance/orders", async (req: any, res) => {
    try {
      const { productId, state, email, password, ownerFullName, paymentMethod, discountCode, discountAmount } = req.body;
      
      let userId: string;
      let isNewUser = false;
      
      if (req.session?.userId) {
        const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
        if (currentUser && (currentUser.accountStatus === 'pending' || currentUser.accountStatus === 'deactivated')) {
          return res.status(403).json({ message: "Tu cuenta está en revisión o desactivada. No puedes realizar nuevos pedidos en este momento." });
        }
        userId = req.session.userId;
      } else {
        if (!email || !password) {
          return res.status(400).json({ message: "Se requiere email y contraseña para realizar un pedido." });
        }
        
        if (password.length < 8) {
          return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
        }
        
        const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
        if (existingUser) {
          return res.status(400).json({ message: "Este email ya está registrado. Por favor inicia sesión." });
        }
        
        const { hashPassword, generateUniqueClientId } = await import("./lib/auth-service");
        const passwordHash = await hashPassword(password);
        const clientId = await generateUniqueClientId();
        const nameParts = ownerFullName?.split(' ') || ['Cliente'];
        
        const [newUser] = await db.insert(usersTable).values({
          email,
          passwordHash,
          clientId,
          firstName: nameParts[0] || 'Cliente',
          lastName: nameParts.slice(1).join(' ') || '',
          emailVerified: true,
          accountStatus: 'active',
        }).returning();
        
        userId = newUser.id;
        isNewUser = true;
        req.session.userId = userId;
        
        sendEmail({
          to: email,
          subject: "Bienvenido a Easy US LLC - Acceso a tu panel",
          html: getWelcomeEmailTemplate(nameParts[0] || 'Cliente')
        }).catch(console.error);
      }

      const product = await storage.getProduct(productId);
      if (!product) return res.status(400).json({ message: "Invalid product" });

      // State-specific pricing for maintenance: NM 539€, WY 699€, DE 899€
      let finalPrice = product.price;
      if (state?.includes("New Mexico")) finalPrice = 53900;
      else if (state?.includes("Wyoming")) finalPrice = 69900;
      else if (state?.includes("Delaware")) finalPrice = 89900;

      // Calculate final amount with discount
      let originalAmount = finalPrice;
      let appliedDiscountAmount = 0;
      let appliedDiscountCode: string | null = null;
      
      if (discountCode && discountAmount) {
        appliedDiscountCode = discountCode;
        appliedDiscountAmount = discountAmount;
        finalPrice = Math.max(0, finalPrice - discountAmount);
        
        // Increment used count for the discount code
        await db.update(discountCodes)
          .set({ usedCount: sql`${discountCodes.usedCount} + 1` })
          .where(eq(discountCodes.code, discountCode.toUpperCase()));
      }

      const order = await storage.createOrder({
        userId,
        productId,
        amount: finalPrice,
        originalAmount: appliedDiscountCode ? originalAmount : null,
        discountCode: appliedDiscountCode,
        discountAmount: appliedDiscountAmount || null,
        status: "pending",
        stripeSessionId: "mock_session_maint_" + Date.now(),
      });

      const [application] = await db.insert(maintenanceApplications).values({
        orderId: order.id,
        status: "draft",
        state: state || product.name.split(" ")[0],
      }).returning();

      // Generate unified request code: STATE-8digits (e.g., NM-12345678)
      const { generateUniqueOrderCode } = await import("./lib/id-generator");
      const appState = state || product.name.split(" ")[0] || 'New Mexico';
      const requestCode = await generateUniqueOrderCode(appState);

      await db.update(maintenanceApplications)
        .set({ requestCode })
        .where(eq(maintenanceApplications.id, application.id));

      // NOTIFICATION: New maintenance order
      if (userId && !userId.startsWith('guest_')) {
        await db.insert(userNotifications).values({
          userId,
          orderId: order.id,
          orderCode: requestCode,
          title: "Nuevo pedido de mantenimiento",
          message: `Tu pedido de mantenimiento anual (${requestCode}) ha sido registrado. Te mantendremos informado del progreso.`,
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
  app.put("/api/maintenance/:id", async (req, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = req.body;
      
      const [updatedApp] = await db.update(maintenanceApplications)
        .set({ ...updates, lastUpdated: new Date() })
        .where(eq(maintenanceApplications.id, appId))
        .returning();
      
      if (!updatedApp) {
        return res.status(404).json({ message: "Solicitud no encontrada" });
      }
      
      if (updates.status === "submitted") {
        const orderIdentifier = updatedApp.requestCode || `MN-${updatedApp.id}`;
        
        // Get order info for price
        const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, updatedApp.orderId)).limit(1);
        const orderAmount = order ? (order.amount / 100).toFixed(2) : 'N/A';
        
        // Email notification to admin about completed maintenance order
        const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
        const maintPaymentMethodLabel = updatedApp.paymentMethod === 'transfer' ? 'Transferencia Bancaria' : updatedApp.paymentMethod === 'link' ? 'Link de Pago' : 'No especificado';
        
        sendEmail({
          to: adminEmail,
          subject: `[PEDIDO REALIZADO] ${orderIdentifier} - Mantenimiento ${updatedApp.companyName}`,
          html: getAdminMaintenanceOrderTemplate({
            orderIdentifier,
            amount: orderAmount,
            paymentMethod: maintPaymentMethodLabel,
            ownerFullName: updatedApp.ownerFullName || undefined,
            ownerEmail: updatedApp.ownerEmail || undefined,
            ownerPhone: updatedApp.ownerPhone || undefined,
            companyName: updatedApp.companyName || undefined,
            ein: updatedApp.ein || undefined,
            state: updatedApp.state || undefined,
            creationSource: updatedApp.creationSource || undefined,
            creationYear: updatedApp.creationYear || undefined,
            bankAccount: updatedApp.bankAccount || undefined,
            paymentGateway: updatedApp.paymentGateway || undefined,
            businessActivity: updatedApp.businessActivity || undefined,
            expectedServices: updatedApp.expectedServices || undefined,
            wantsDissolve: updatedApp.wantsDissolve || undefined,
            notes: updatedApp.notes || undefined
          })
        }).catch(() => {});
        
        // Confirmation to client
        if (updatedApp.ownerEmail) {
          sendEmail({
            to: updatedApp.ownerEmail,
            subject: `Solicitud recibida - Referencia ${orderIdentifier}`,
            html: getConfirmationEmailTemplate(updatedApp.ownerFullName || "Cliente", orderIdentifier, { companyName: updatedApp.companyName || undefined, serviceType: "Mantenimiento Anual" }),
          }).catch(() => {});
        }
      }
      
      res.json(updatedApp);
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar la solicitud" });
    }
  });

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
        subject: "Confirmación de suscripción a Easy US LLC",
        html: getNewsletterWelcomeTemplate(),
      }).catch(() => {});
      
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

  // Client Receipt/Resumen Route (PDF)
  app.get("/api/orders/:id/receipt", isAuthenticated, async (req: any, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
      if (order.userId !== req.session.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "Acceso denegado" });
      }
      
      // Get application requestCode (LLC or Maintenance)
      const [llcApp] = await db.select().from(llcApplicationsTable).where(eq(llcApplicationsTable.orderId, orderId)).limit(1);
      const [maintApp] = await db.select().from(maintenanceApplications).where(eq(maintenanceApplications.orderId, orderId)).limit(1);
      const requestCode = llcApp?.requestCode || maintApp?.requestCode || order.invoiceNumber || '';
      
      // Generate PDF using lightweight PDFKit
      const pdfBuffer = await generateReceiptPdf({
        requestCode: requestCode || `REC-${orderId}`,
        date: new Date(order.createdAt || Date.now()).toLocaleDateString('es-ES'),
        customerName: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Cliente',
        productName: order.product?.name || 'Servicio LLC',
        amount: order.amount,
        currency: order.currency || 'EUR',
        status: order.status
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Recibo-${requestCode}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Receipt Error:", error);
      res.status(500).send("Error al generar recibo");
    }
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
            subject: "Actualización de tu pedido",
            html: getOrderEventTemplate(user.firstName || 'Cliente', String(orderId), eventType, description)
          }).catch(() => {});
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
      
      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: "El contenido de la respuesta es requerido" });
      }
      
      const [reply] = await db.insert(messageReplies).values({
        messageId,
        content,
        isAdmin: req.session.isAdmin || false,
        createdBy: req.session.userId,
      }).returning();
      
      // Get message for email notification
      const [message] = await db.select().from(messagesTable).where(eq(messagesTable.id, messageId)).limit(1);
      if (message?.email && req.session.isAdmin) {
        // Admin reply - notify client by email
        const ticketId = message.messageId || String(messageId);
        sendEmail({
          to: message.email,
          subject: `Nueva respuesta a tu consulta - Ticket #${ticketId}`,
          html: getMessageReplyTemplate(message.name?.split(' ')[0] || 'Cliente', content, ticketId)
        }).catch(() => {});
        
        // Create notification for client if they have a user account
        if (message.userId) {
          await db.insert(userNotifications).values({
            userId: message.userId,
            title: "Nueva respuesta a tu consulta",
            message: `Hemos respondido a tu mensaje (Ticket: #${ticketId}). Revisa tu email o tu área de mensajes.`,
            type: 'info',
            isRead: false
          });
        }
      }
      
      res.json(reply);
    } catch (error) {
      console.error("Error creating reply:", error);
      res.status(500).json({ message: "Error al crear respuesta" });
    }
  });

  function generateInvoiceHtml(order: any) {
    const requestCode = order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber;
    const userName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Cliente';
    const userEmail = order.user?.email || '';
    const userPhone = order.user?.phone || '';
    const userClientId = order.user?.clientId || '';
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
    const invoiceNumber = requestCode || order.invoiceNumber;
    
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
              <img src="https://easyusllc.com/logo-icon.png" alt="Easy US LLC" style="width: 60px; height: 60px; margin-bottom: 10px; border-radius: 12px;">
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
                <td>${((order.originalAmount || order.amount) / 100).toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals-section">
            <div class="totals-box">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>${((order.originalAmount || order.amount) / 100).toFixed(2)} €</span>
              </div>
              ${order.discountCode ? `
              <div class="totals-row" style="color: #16a34a;">
                <span>Descuento (${order.discountCode})</span>
                <span>-${(order.discountAmount / 100).toFixed(2)} €</span>
              </div>
              ` : ''}
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

  function generateReceiptHtml(order: any, requestCode?: string) {
    const receiptNumber = requestCode || order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber;
    const userName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Cliente';
    const userEmail = order.user?.email || '';
    const productName = order.product?.name || 'Servicio de Constitución LLC';
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
              <img src="https://easyusllc.com/logo-icon.png" alt="Easy US LLC" style="width: 70px; height: 70px; margin: 0 auto 20px; display: block; border-radius: 12px;">
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
              ${order.discountCode ? `
              <div class="detail-row">
                <span class="detail-label">Subtotal</span>
                <span class="detail-value">${((order.originalAmount || order.amount) / 100).toFixed(2)} €</span>
              </div>
              <div class="detail-row" style="color: #16a34a;">
                <span class="detail-label">Descuento (${order.discountCode})</span>
                <span class="detail-value" style="color: #16a34a;">-${(order.discountAmount / 100).toFixed(2)} €</span>
              </div>
              ` : ''}
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
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit('contact', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          message: `Demasiados intentos. Espera ${rateCheck.retryAfter} segundos.` 
        });
      }

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
        subject: "Tu código de verificación | Easy US LLC",
        html: getOtpEmailTemplate(otp, "Cliente"),
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

      // Sanitize user input
      const sanitizedData = {
        nombre: sanitizeHtml(contactData.nombre),
        apellido: sanitizeHtml(contactData.apellido),
        subject: sanitizeHtml(contactData.subject),
        mensaje: sanitizeHtml(contactData.mensaje),
        telefono: contactData.telefono ? sanitizeHtml(contactData.telefono) : undefined,
      };

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

      const clientIp = getClientIp(req);
      const { generateUniqueMessageId } = await import("./lib/id-generator");
      const ticketId = await generateUniqueMessageId();
      
      // Notification to admin with sanitized data
      logActivity("Acción Contacto", {
        "ID Ticket": ticketId,
        "Nombre": `${sanitizedData.nombre} ${sanitizedData.apellido}`,
        "Email": contactData.email,
        "Teléfono": sanitizedData.telefono || "No proporcionado",
        "Asunto": sanitizedData.subject,
        "Mensaje": sanitizedData.mensaje,
        "IP": clientIp
      });

      await sendEmail({
        to: contactData.email,
        subject: `Hemos recibido tu mensaje - Ticket #${ticketId}`,
        html: getAutoReplyTemplate(ticketId, sanitizedData.nombre),
      });

      logAudit({ action: 'order_created', ip: clientIp, details: { ticketId, type: 'contact' } });
      res.json({ success: true, ticketId });
    } catch (err) {
      console.error("Error processing contact form:", err);
      res.status(400).json({ message: "Error al procesar el mensaje" });
    }
  });

  // =============================================
  // OTP endpoints for registration and password reset
  // =============================================
  
  // Check if email already exists (for form flow to detect existing users)
  app.post("/api/auth/check-email", async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      
      res.json({ 
        exists: !!existingUser,
        firstName: existingUser?.firstName || null
      });
    } catch (err) {
      res.status(400).json({ message: "Email inválido" });
    }
  });
  
  // Send OTP for account registration (email verification before creating account)
  app.post("/api/register/send-otp", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit('register', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          message: `Demasiados intentos. Espera ${rateCheck.retryAfter} segundos.` 
        });
      }

      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      // Check if email is already registered
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (existingUser) {
        return res.status(400).json({ message: "Este email ya está registrado. Por favor inicia sesión." });
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await db.insert(contactOtps).values({
        email,
        otp,
        otpType: "account_verification",
        expiresAt,
      });

      await sendEmail({
        to: email,
        subject: "Tu código de verificación | Easy US LLC",
        html: getOtpEmailTemplate(otp, "Cliente"),
      });

      logAudit({ action: 'user_register', ip, details: { email, step: 'otp_sent' } });
      res.json({ success: true });
    } catch (err) {
      console.error("Error sending registration OTP:", err);
      res.status(400).json({ message: "Error al enviar el código de verificación." });
    }
  });

  // Verify OTP for account registration
  app.post("/api/register/verify-otp", async (req, res) => {
    try {
      const { email, otp } = z.object({ email: z.string().email(), otp: z.string() }).parse(req.body);
      
      const [record] = await db.select()
        .from(contactOtps)
        .where(
          and(
            eq(contactOtps.email, email),
            eq(contactOtps.otp, otp),
            eq(contactOtps.otpType, "account_verification"),
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
      console.error("Error verifying registration OTP:", err);
      res.status(400).json({ message: "Error al verificar el código" });
    }
  });

  // Send OTP for password reset (forgot password)
  app.post("/api/password-reset/send-otp", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit('passwordReset', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          message: `Demasiados intentos. Espera ${rateCheck.retryAfter} segundos.` 
        });
      }

      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      // Check if user exists (but don't reveal this to prevent enumeration)
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      
      // Always return success to prevent email enumeration attacks
      if (!existingUser) {
        return res.json({ success: true });
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await db.insert(contactOtps).values({
        email,
        otp,
        otpType: "password_reset",
        expiresAt,
      });

      await sendEmail({
        to: email,
        subject: "Tu código de verificación | Easy US LLC",
        html: getOtpEmailTemplate(otp, existingUser?.firstName || "Cliente"),
      });

      logAudit({ action: 'password_reset', ip, details: { email } });
      res.json({ success: true });
    } catch (err) {
      console.error("Error sending password reset OTP:", err);
      res.status(400).json({ message: "Error al enviar el código de verificación." });
    }
  });

  // Verify OTP and reset password
  app.post("/api/password-reset/confirm", async (req, res) => {
    try {
      const { email, otp, newPassword } = z.object({ 
        email: z.string().email(), 
        otp: z.string(),
        newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
      }).parse(req.body);
      
      const [record] = await db.select()
        .from(contactOtps)
        .where(
          and(
            eq(contactOtps.email, email),
            eq(contactOtps.otp, otp),
            eq(contactOtps.otpType, "password_reset"),
            gt(contactOtps.expiresAt, new Date()),
            eq(contactOtps.verified, false)
          )
        )
        .limit(1);

      if (!record) {
        return res.status(400).json({ message: "Código inválido o caducado" });
      }

      // Find the user
      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }

      // Hash new password and update
      const { hashPassword } = await import("./lib/auth-service");
      const passwordHash = await hashPassword(newPassword);
      
      await db.update(usersTable)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(usersTable.id, user.id));

      // Mark OTP as used
      await db.update(contactOtps)
        .set({ verified: true })
        .where(eq(contactOtps.id, record.id));

      res.json({ success: true, message: "Contraseña actualizada correctamente" });
    } catch (err: any) {
      console.error("Error resetting password:", err);
      if (err.errors) {
        return res.status(400).json({ message: err.errors[0]?.message || "Error al restablecer la contraseña" });
      }
      res.status(400).json({ message: "Error al restablecer la contraseña" });
    }
  });

  // Seed Data
  await seedDatabase();

  // === Test Email Route ===
  app.post("/api/admin/test-emails", isAdmin, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requerido" });

    try {
      const ticketId = "12345678";
      const otp = "888999";
      const name = "Cliente de Prueba";
      const requestCode = "NM-12345678";

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
          <p style="margin: 0; font-size: 14px;"><strong>Precio:</strong> 739€</p>
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
        sendEmail({ to: email, subject: "TEST: Tu código de verificación", html: getOtpEmailTemplate(otp, name) }),
        sendEmail({ to: email, subject: "TEST: Log de Actividad (Admin)", html: activityHtml }),
        sendEmail({ to: email, subject: "TEST: Nueva Solicitud LLC (Admin)", html: orderHtml }),
        sendEmail({ to: email, subject: "TEST: Confirmación de Pedido (Cliente)", html: getConfirmationEmailTemplate(name, requestCode, { companyName: "Mi Nueva Empresa LLC" }) }),
        sendEmail({ to: email, subject: "TEST: Bienvenido a Easy US LLC", html: getWelcomeEmailTemplate(name) }),
        sendEmail({ to: email, subject: "TEST: Newsletter Bienvenida", html: getNewsletterWelcomeTemplate() }),
        sendEmail({ to: email, subject: "TEST: Confirmación de Mensaje (Auto-reply)", html: getAutoReplyTemplate(ticketId, name) }),
      ]);

      res.json({ success: true, message: "Emails de prueba administrativos mejorados enviados" });
    } catch (error) {
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
      price: 73900,
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
      price: 89900,
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
      price: 119900,
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
