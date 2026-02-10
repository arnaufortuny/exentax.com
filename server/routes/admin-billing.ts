import type { Express } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { and, or, eq, desc, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { asyncHandler, db, storage, isAdmin, logAudit, getCachedData, setCachedData } from "./shared";
import { createLogger } from "../lib/logger";

const log = createLogger('admin-billing');
import { users as usersTable, maintenanceApplications, newsletterSubscribers, messages as messagesTable, orderEvents, userNotifications, orders as ordersTable, llcApplications as llcApplicationsTable, applicationDocuments as applicationDocumentsTable, discountCodes, accountingTransactions, auditLogs, standaloneInvoices, paymentAccounts } from "@shared/schema";

export function registerAdminBillingRoutes(app: Express) {
  app.post("/api/admin/orders/create", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const validStates = ["New Mexico", "Wyoming", "Delaware"] as const;
    const schema = z.object({
      userId: z.string().uuid(),
      state: z.enum(validStates),
      amount: z.string().or(z.number()).refine(val => Number(val) > 0, { message: "Amount must be greater than 0" })
    });
    const { userId, state, amount } = schema.parse(req.body);
    
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const productMap: Record<string, { id: number; name: string }> = {
      "New Mexico": { id: 1, name: "LLC New Mexico" },
      "Wyoming": { id: 2, name: "LLC Wyoming" },
      "Delaware": { id: 3, name: "LLC Delaware" }
    };
    const product = productMap[state];
    const amountCents = Math.round(Number(amount) * 100);
    
    const { generateUniqueAdminOrderCode } = await import("../lib/id-generator");
    const invoiceNumber = await generateUniqueAdminOrderCode(state);
    
    const [order] = await db.insert(ordersTable).values({
      userId,
      productId: product.id,
      amount: amountCents,
      status: 'pending',
      invoiceNumber
    }).returning();
    
    // Create LLC application so order shows in client dashboard (as 'submitted' not 'draft' since admin created it)
    await db.insert(llcApplicationsTable).values({
      orderId: order.id,
      requestCode: invoiceNumber,
      ownerFullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null,
      ownerEmail: user.email,
      ownerPhone: user.phone,
      state,
      status: 'submitted'
    });
    
    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: 'order_created',
      description: `Pedido ${invoiceNumber} creado por administrador`
    });
    
    await db.insert(userNotifications).values({
      userId,
      orderId: order.id,
      orderCode: invoiceNumber,
      title: 'i18n:ntf.orderCreatedAdmin.title',
      message: `i18n:ntf.orderCreatedAdmin.message::{"invoiceNumber":"${invoiceNumber}","productName":"${product.name}"}`,
      type: 'info',
      isRead: false
    });
    
    res.json({ success: true, orderId: order.id, invoiceNumber });
  }));

  // Admin create maintenance order
  app.post("/api/admin/orders/create-maintenance", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const validStates = ["New Mexico", "Wyoming", "Delaware"] as const;
    const schema = z.object({
      userId: z.string().uuid(),
      state: z.enum(validStates),
      amount: z.string().or(z.number()).refine(val => Number(val) > 0, { message: "Amount must be greater than 0" })
    });
    const { userId, state, amount } = schema.parse(req.body);
    
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Maintenance product IDs: NM=4, WY=5, DE=6
    const productMap: Record<string, { id: number; name: string }> = {
      "New Mexico": { id: 4, name: "Mantenimiento Anual New Mexico" },
      "Wyoming": { id: 5, name: "Mantenimiento Anual Wyoming" },
      "Delaware": { id: 6, name: "Mantenimiento Anual Delaware" }
    };
    const product = productMap[state];
    const amountCents = Math.round(Number(amount) * 100);
    
    const { generateUniqueAdminOrderCode } = await import("../lib/id-generator");
    const invoiceNumber = `M-${await generateUniqueAdminOrderCode(state)}`;
    
    const [order] = await db.insert(ordersTable).values({
      userId,
      productId: product.id,
      amount: amountCents,
      status: 'pending',
      invoiceNumber
    }).returning();
    
    // Create maintenance application so order shows in client dashboard
    await db.insert(maintenanceApplications).values({
      orderId: order.id,
      requestCode: invoiceNumber,
      ownerFullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null,
      ownerEmail: user.email,
      ownerPhone: user.phone,
      state,
      status: 'submitted'
    });
    
    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: 'order_created',
      description: `Pedido de mantenimiento ${invoiceNumber} creado por administrador`
    });
    
    await db.insert(userNotifications).values({
      userId,
      orderId: order.id,
      orderCode: invoiceNumber,
      title: 'i18n:ntf.maintenanceCreatedAdmin.title',
      message: `i18n:ntf.maintenanceCreatedAdmin.message::{"invoiceNumber":"${invoiceNumber}","productName":"${product.name}"}`,
      type: 'info',
      isRead: false
    });
    
    // Audit log
    logAudit({
      action: 'admin_create_maintenance_order',
      userId: req.session?.userId,
      targetId: String(order.id),
      details: { userId, state, amount: amountCents, invoiceNumber }
    });
    
    res.json({ success: true, orderId: order.id, invoiceNumber });
  }));

  app.post("/api/admin/orders/create-custom", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      userId: z.string().uuid(),
      concept: z.string().min(1, "Concept is required"),
      amount: z.string().or(z.number()).refine(val => Number(val) > 0, { message: "Amount must be greater than 0" }),
    });
    const { userId, concept, amount } = schema.parse(req.body);
    
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const amountCents = Math.round(Number(amount) * 100);
    
    const { generate8DigitId } = await import("../lib/id-generator");
    const invoiceNumber = `CUST-${generate8DigitId()}`;
    
    const [order] = await db.insert(ordersTable).values({
      userId,
      productId: 1,
      amount: amountCents,
      status: 'pending',
      invoiceNumber
    }).returning();
    
    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: 'order_created',
      description: `Custom order: ${concept}`
    });
    
    await db.insert(userNotifications).values({
      userId,
      orderId: order.id,
      orderCode: invoiceNumber,
      title: 'i18n:ntf.orderCreatedAdmin.title',
      message: `i18n:ntf.orderCreatedAdmin.message::{"invoiceNumber":"${invoiceNumber}","productName":"${concept}"}`,
      type: 'info',
      isRead: false
    });
    
    logAudit({
      action: 'admin_create_custom_order',
      userId: req.session?.userId,
      targetId: String(order.id),
      details: { userId, concept, amount: amountCents, invoiceNumber }
    });
    
    res.json({ success: true, orderId: order.id, invoiceNumber });
  }));

  app.get("/api/admin/system-stats", isAdmin, async (req, res) => {
    try {
      // Check cache first
      const cached = getCachedData<any>('system-stats');
      if (cached) {
        return res.json(cached);
      }
      
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

      const statsData = { 
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
      };
      
      // Cache the result for 30 seconds
      setCachedData('system-stats', statsData);
      
      res.json(statsData);
    } catch (error) {
      log.error("System stats error", error);
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

  // Audit logs endpoint (persistent from database)
  app.get("/api/admin/audit-logs", isAdmin, async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
      const offset = parseInt(req.query.offset as string) || 0;
      const action = req.query.action as string | undefined;
      const search = req.query.search as string | undefined;
      
      const conditions: any[] = [];
      
      if (action) {
        conditions.push(eq(auditLogs.action, action));
      }
      
      if (search) {
        conditions.push(
          or(
            sql`${auditLogs.ip}::text ILIKE ${'%' + search + '%'}`,
            sql`${auditLogs.userId}::text ILIKE ${'%' + search + '%'}`,
            sql`${auditLogs.details}::text ILIKE ${'%' + search + '%'}`
          )
        );
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const actorUser = alias(usersTable, 'actor_user');
      const targetUser = alias(usersTable, 'target_user');
      
      const logsQuery = db.select({
        id: auditLogs.id,
        action: auditLogs.action,
        userId: auditLogs.userId,
        targetId: auditLogs.targetId,
        ip: auditLogs.ip,
        userAgent: auditLogs.userAgent,
        details: auditLogs.details,
        createdAt: auditLogs.createdAt,
        userName: sql<string>`COALESCE(${actorUser.firstName} || ' ' || ${actorUser.lastName}, ${actorUser.firstName}, '')`,
        userEmail: sql<string>`COALESCE(${actorUser.email}, '')`,
        targetName: sql<string>`COALESCE(${targetUser.firstName} || ' ' || ${targetUser.lastName}, ${targetUser.firstName}, '')`,
        targetEmail: sql<string>`COALESCE(${targetUser.email}, '')`,
      })
        .from(auditLogs)
        .leftJoin(actorUser, eq(actorUser.id, auditLogs.userId))
        .leftJoin(targetUser, eq(targetUser.id, auditLogs.targetId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);
      
      const countQuery = db.select({ count: sql<number>`count(*)` }).from(auditLogs);
      
      if (whereClause) {
        logsQuery.where(whereClause);
        countQuery.where(whereClause);
      }
      
      const [logs, countResult] = await Promise.all([logsQuery, countQuery]);
      const total = Number(countResult[0]?.count || 0);
      
      const distinctActions = await db.selectDistinct({ action: auditLogs.action }).from(auditLogs).orderBy(auditLogs.action);
      
      res.json({ logs, total, limit, offset, actions: distinctActions.map(a => a.action) });
    } catch (error) {
      log.error("Audit logs error", error);
      res.status(500).json({ message: "Error fetching audit logs" });
    }
  });

  // ============== RENEWAL MANAGEMENT ==============
  
  // Get clients needing renewal (within 90 days or expired)
  app.get("/api/admin/renewals", isAdmin, async (req, res) => {
    try {
      const { getClientsNeedingRenewal } = await import("../calendar-service");
      const clients = await getClientsNeedingRenewal();
      res.json(clients);
    } catch (error) {
      log.error("Error fetching renewal clients", error);
      res.status(500).json({ message: "Error fetching clients pending renewal" });
    }
  });

  // Get only expired clients (past renewal date, no maintenance order)
  app.get("/api/admin/renewals/expired", isAdmin, async (req, res) => {
    try {
      const { checkExpiredRenewals } = await import("../calendar-service");
      const expiredClients = await checkExpiredRenewals();
      res.json(expiredClients);
    } catch (error) {
      log.error("Error fetching expired renewals", error);
      res.status(500).json({ message: "Error fetching expired renewals" });
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
        return res.status(400).json({ message: "Discount code and value are required" });
      }

      const [existing] = await db.select().from(discountCodes).where(eq(discountCodes.code, code.toUpperCase())).limit(1);
      if (existing) {
        return res.status(400).json({ message: "This code already exists" });
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

  // ===== Payment Accounts Management =====
  app.get("/api/admin/payment-accounts", isAdmin, async (req, res) => {
    try {
      const accounts = await storage.getPaymentAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payment accounts" });
    }
  });

  app.post("/api/admin/payment-accounts", isAdmin, async (req, res) => {
    try {
      const schema = z.object({
        label: z.string().min(1),
        holder: z.string().min(1),
        bankName: z.string().min(1),
        accountType: z.string().default("checking"),
        accountNumber: z.string().optional().nullable(),
        routingNumber: z.string().optional().nullable(),
        iban: z.string().optional().nullable(),
        swift: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().default(0),
      });
      const data = schema.parse(req.body);
      const account = await storage.createPaymentAccount(data);
      res.json(account);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error creating payment account" });
    }
  });

  app.patch("/api/admin/payment-accounts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.updatePaymentAccount(id, req.body);
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Error updating payment account" });
    }
  });

  app.delete("/api/admin/payment-accounts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePaymentAccount(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting payment account" });
    }
  });

  app.get("/api/payment-accounts/active", async (_req, res) => {
    try {
      const accounts = await storage.getActivePaymentAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payment accounts" });
    }
  });

  // Validate discount code (public - for checkout)
  app.post("/api/discount-codes/validate", async (req, res) => {
    try {
      const { code, orderAmount } = req.body;
      
      if (!code) {
        return res.status(400).json({ valid: false, message: "Code required" });
      }

      const [discountCode] = await db.select().from(discountCodes).where(eq(discountCodes.code, code.toUpperCase())).limit(1);
      
      if (!discountCode) {
        return res.status(404).json({ valid: false, message: "Code not found" });
      }

      if (!discountCode.isActive) {
        return res.status(400).json({ valid: false, message: "Code inactive" });
      }

      const now = new Date();
      if (discountCode.validFrom && new Date(discountCode.validFrom) > now) {
        return res.status(400).json({ valid: false, message: "Code not yet valid" });
      }
      if (discountCode.validUntil && new Date(discountCode.validUntil) < now) {
        return res.status(400).json({ valid: false, message: "Code expired" });
      }

      if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
        return res.status(400).json({ valid: false, message: "Code exhausted" });
      }

      if (discountCode.minOrderAmount && orderAmount && orderAmount < discountCode.minOrderAmount) {
        return res.status(400).json({ valid: false, message: `Minimum order: ${(discountCode.minOrderAmount / 100).toFixed(2)}€` });
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

  app.get("/api/admin/invoices", isAdmin, async (req, res) => {
    try {
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
        notes: standaloneInvoices.notes,
        user: {
          id: usersTable.id,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          email: usersTable.email,
        }
      })
        .from(standaloneInvoices)
        .leftJoin(usersTable, eq(standaloneInvoices.userId, usersTable.id))
        .orderBy(desc(standaloneInvoices.createdAt));
      res.json(invoices);
    } catch (error) {
      log.error("Error fetching invoices", error);
      res.status(500).json({ message: "Error fetching invoices" });
    }
  });

  app.delete("/api/admin/invoices/:id", isAdmin, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      await db.delete(standaloneInvoices).where(eq(standaloneInvoices.id, invoiceId));
      res.json({ success: true, message: "Invoice deleted" });
    } catch (error) {
      log.error("Error deleting invoice", error);
      res.status(500).json({ message: "Error deleting invoice" });
    }
  });

  app.patch("/api/admin/invoices/:id/status", isAdmin, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const { status } = z.object({
        status: z.enum(['pending', 'paid', 'completed', 'cancelled', 'refunded'])
      }).parse(req.body);

      const updateData: any = { status, updatedAt: new Date() };
      if (status === 'paid') updateData.paidAt = new Date();

      await db.update(standaloneInvoices).set(updateData)
        .where(eq(standaloneInvoices.id, invoiceId));

      res.json({ success: true, message: "Status updated" });
    } catch (error) {
      log.error("Error updating invoice status", error);
      res.status(500).json({ message: "Error updating status" });
    }
  });

  app.get("/api/admin/invoices/:id/download", isAdmin, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const [invoice] = await db.select().from(standaloneInvoices).where(eq(standaloneInvoices.id, invoiceId)).limit(1);
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
      log.error("Error downloading invoice", error);
      res.status(500).json({ message: "Error downloading invoice" });
    }
  });

  // Create standalone invoice for user (not tied to order)
  app.post("/api/admin/invoices/create", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { userId, concept, amount, currency, invoiceDate, paymentAccountIds } = z.object({
      userId: z.string(),
      concept: z.string().min(1),
      amount: z.number().min(1),
      currency: z.enum(["EUR", "USD"]).default("EUR"),
      invoiceDate: z.string().optional(),
      paymentAccountIds: z.array(z.number()).optional(),
    }).parse(req.body);
    
    const currencySymbol = currency === "USD" ? "$" : "€";

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { generateUniqueInvoiceNumber } = await import("../lib/id-generator");
    const invoiceNumber = await generateUniqueInvoiceNumber();

    let selectedBankAccounts: import("../lib/pdf-generator").BankAccountInfo[] | undefined;
    if (paymentAccountIds && paymentAccountIds.length > 0) {
      const accounts = await db.select().from(paymentAccounts)
        .where(sql`${paymentAccounts.id} IN (${sql.join(paymentAccountIds.map(id => sql`${id}`), sql`, `)})`);
      if (accounts.length > 0) {
        selectedBankAccounts = accounts.map(a => ({
          label: a.label,
          holder: a.holder,
          bankName: a.bankName,
          accountType: a.accountType,
          accountNumber: a.accountNumber,
          routingNumber: a.routingNumber,
          iban: a.iban,
          swift: a.swift,
          address: a.address,
        }));
      }
    }

    const dateStr = invoiceDate || new Date().toISOString().split('T')[0];

    const { generateCustomInvoicePdf } = await import("../lib/pdf-generator");
    const pdfBuffer = await generateCustomInvoicePdf({
      invoiceNumber,
      date: dateStr,
      customer: {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || undefined,
        idType: user.idType || undefined,
        idNumber: user.idNumber || undefined,
        address: user.address || undefined,
        streetType: user.streetType || undefined,
        city: user.city || undefined,
        province: user.province || undefined,
        postalCode: user.postalCode || undefined,
        country: user.country || undefined,
        clientId: user.clientId || undefined,
      },
      concept,
      amount,
      currency,
      status: 'pending',
      bankAccounts: selectedBankAccounts,
    });

    const fileUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

    const [invoice] = await db.insert(standaloneInvoices).values({
      invoiceNumber,
      userId,
      concept,
      amount,
      currency,
      status: 'pending',
      fileUrl,
      createdBy: (req as any).session?.userId || null,
    }).returning();

    await db.insert(accountingTransactions).values({
      type: 'income',
      category: 'other_income',
      amount: amount,
      currency,
      description: `Factura ${invoiceNumber}: ${concept}`,
      reference: invoiceNumber,
      userId,
      transactionDate: new Date(dateStr),
      notes: `Cliente: ${user.firstName} ${user.lastName} (${user.email})`,
      createdBy: (req as any).session?.userId || null,
    });

    await db.insert(userNotifications).values({
      userId,
      title: `i18n:dashboard.notifications.invoice.created.title`,
      message: `i18n:dashboard.notifications.invoice.created.message::${JSON.stringify({ number: invoiceNumber, amount: (amount / 100).toFixed(2), currency: currencySymbol })}`,
      type: 'info',
    });

    res.json({ success: true, invoiceNumber, invoiceId: invoice.id });
  }));
}
