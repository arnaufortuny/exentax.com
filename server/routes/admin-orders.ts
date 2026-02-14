import type { Express } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { and, eq, desc, sql, inArray } from "drizzle-orm";
import { asyncHandler, db, storage, isAdmin, isAdminOrSupport, logAudit } from "./shared";
import { createLogger } from "../lib/logger";

const log = createLogger('admin-orders');
import { orders as ordersTable, users as usersTable, maintenanceApplications, orderEvents, userNotifications, llcApplications as llcApplicationsTable, applicationDocuments as applicationDocumentsTable, documentRequests as documentRequestsTable } from "@shared/schema";
import { sendEmail, sendTrustpilotEmail, getOrderUpdateTemplate } from "../lib/email";
import { updateApplicationDeadlines } from "../calendar-service";

const VALID_ORDER_STATUSES = ['pending', 'paid', 'processing', 'filed', 'documents_ready', 'completed', 'cancelled'] as const;
type OrderStatus = typeof VALID_ORDER_STATUSES[number];

const VALID_ORDER_TRANSITIONS: Record<string, OrderStatus[]> = {
  pending: ['paid', 'processing', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['filed', 'documents_ready', 'completed', 'cancelled'],
  filed: ['documents_ready', 'completed', 'cancelled'],
  documents_ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: ['pending'],
};

export function registerAdminOrderRoutes(app: Express) {
  // Admin Orders
  app.get("/api/admin/orders", isAdminOrSupport, asyncHandler(async (req: Request, res: Response) => {
    try {
      const allOrders = await storage.getAllOrders();
      const search = (req.query.search as string || '').toLowerCase().trim();
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.min(Math.max(1, Number(req.query.pageSize) || 50), 200);
      const status = (req.query.status as string || '').toLowerCase().trim();
      
      let filtered = allOrders;
      if (search) {
        filtered = allOrders.filter((o: any) => {
          const userName = `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.toLowerCase();
          const email = (o.user?.email || '').toLowerCase();
          const company = (o.application?.companyName || o.maintenanceApplication?.companyName || '').toLowerCase();
          const code = (o.application?.requestCode || o.maintenanceApplication?.requestCode || '').toLowerCase();
          const invoice = (o.invoiceNumber || '').toLowerCase();
          const clientId = (o.user?.clientId || '').toLowerCase();
          return userName.includes(search) || email.includes(search) || company.includes(search) || code.includes(search) || invoice.includes(search) || clientId.includes(search);
        });
      }
      if (status) {
        filtered = filtered.filter((o: any) => o.status === status);
      }
      
      const total = filtered.length;
      const totalPages = Math.ceil(total / pageSize);
      const offset = (page - 1) * pageSize;
      const paginatedOrders = filtered.slice(offset, offset + pageSize);
      
      res.json({
        data: paginatedOrders,
        pagination: { page, pageSize, total, totalPages },
      });
    } catch (error) {
      log.error("Admin orders error", error);
      res.status(500).json({ message: "Error fetching orders" });
    }
  }));

  app.patch("/api/admin/orders/:id/status", isAdminOrSupport, asyncHandler(async (req: Request, res: Response) => {
    try {
    const orderId = Number(req.params.id);
    const { status } = z.object({ status: z.enum(VALID_ORDER_STATUSES) }).parse(req.body);
    
    const existingOrder = await storage.getOrder(orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const currentStatus = existingOrder.status as OrderStatus;
    const allowedTransitions = VALID_ORDER_TRANSITIONS[currentStatus] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from '${currentStatus}' to '${status}'. Allowed: ${allowedTransitions.join(', ') || 'none'}` 
      });
    }
    
    const [updatedOrder] = await db.update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, orderId))
      .returning();
    
    logAudit({ 
      action: 'order_status_change', 
      userId: req.session?.userId, 
      targetId: String(orderId),
      details: { previousStatus: currentStatus, newStatus: status } 
    });
    
    const order = await storage.getOrder(orderId);
    if (order?.user?.email) {
      const userLang = (order.user.preferredLanguage as string) || 'es';
      
      const statusLabelsI18n: Record<string, Record<string, string>> = {
        pending: { es: "Pendiente", en: "Pending", ca: "Pendent", fr: "En attente", de: "Ausstehend", it: "In sospeso", pt: "Pendente" },
        paid: { es: "Pagado", en: "Paid", ca: "Pagat", fr: "Payé", de: "Bezahlt", it: "Pagato", pt: "Pago" },
        processing: { es: "En proceso", en: "Processing", ca: "En procés", fr: "En cours", de: "In Bearbeitung", it: "In elaborazione", pt: "Em processamento" },
        filed: { es: "Presentado", en: "Filed", ca: "Presentat", fr: "Déposé", de: "Eingereicht", it: "Presentato", pt: "Apresentado" },
        documents_ready: { es: "Documentos listos", en: "Documents ready", ca: "Documents preparats", fr: "Documents prêts", de: "Dokumente bereit", it: "Documenti pronti", pt: "Documentos prontos" },
        completed: { es: "Completado", en: "Completed", ca: "Completat", fr: "Terminé", de: "Abgeschlossen", it: "Completato", pt: "Concluído" },
        cancelled: { es: "Cancelado", en: "Cancelled", ca: "Cancel·lat", fr: "Annulé", de: "Storniert", it: "Annullato", pt: "Cancelado" }
      };
      
      const statusLabel = statusLabelsI18n[status]?.[userLang] || statusLabelsI18n[status]?.es || status.replace(/_/g, " ");

      if (status === 'completed' && order.userId) {
        await db.update(usersTable)
          .set({ accountStatus: 'vip' })
          .where(eq(usersTable.id, order.userId));
        
        const orderCode = order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber || `#${order.id}`;
        sendTrustpilotEmail({
          to: order.user.email,
          name: order.user.firstName || "Cliente",
          orderNumber: orderCode,
          lang: (userLang as any) || 'es'
        }).catch((err) => log.warn("Failed to send email", { error: err?.message }));
      }

      if (status === 'filed' && order.application) {
        const formationDate = new Date();
        const state = order.application.state || "new_mexico";
        const hasTaxExtension = order.application.hasTaxExtension || false;
        await updateApplicationDeadlines(order.application.id, formationDate, state, hasTaxExtension);
      }

      if (status === 'cancelled' && order.application) {
        await db.update(llcApplicationsTable).set({
          irs1120DueDate: null,
          irs5472DueDate: null,
          annualReportDueDate: null,
          agentRenewalDate: null,
        }).where(eq(llcApplicationsTable.id, order.application.id));
      }

      const orderCode = order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber || `#${order.id}`;
      
      const messageKey = status === 'completed' ? 'ntf.orderUpdateCompleted.message' : 'ntf.orderUpdate.message';
      
      await db.insert(userNotifications).values({
        userId: order.userId,
        orderId: order.id,
        orderCode,
        title: `i18n:ntf.orderUpdate.title::{"statusLabel":"@ntf.orderStatus.${status}"}`,
        message: `i18n:${messageKey}::{"orderCode":"${orderCode}","statusLabel":"@ntf.orderStatus.${status}"}`,
        type: 'update',
        isRead: false
      });

      await db.insert(orderEvents).values({
        orderId: order.id,
        eventType: statusLabel,
        description: `${statusLabel} — ${orderCode}`,
        createdBy: req.session.userId
      });

      const emailSubjects: Record<string, string> = {
        es: `Actualización de estado - Pedido ${order.invoiceNumber || `#${order.id}`}`,
        en: `Status update - Order ${order.invoiceNumber || `#${order.id}`}`,
        ca: `Actualització d'estat - Comanda ${order.invoiceNumber || `#${order.id}`}`,
        fr: `Mise à jour - Commande ${order.invoiceNumber || `#${order.id}`}`,
        de: `Statusaktualisierung - Bestellung ${order.invoiceNumber || `#${order.id}`}`,
        it: `Aggiornamento stato - Ordine ${order.invoiceNumber || `#${order.id}`}`,
        pt: `Atualização de estado - Pedido ${order.invoiceNumber || `#${order.id}`}`
      };

      const emailBodies: Record<string, string> = {
        es: `Tu pedido ha pasado a estado: ${statusLabel}. Puedes ver los detalles en tu área de clientes.`,
        en: `Your order status has been updated to: ${statusLabel}. You can view the details in your dashboard.`,
        ca: `La teva comanda ha passat a estat: ${statusLabel}. Pots veure els detalls a la teva àrea de clients.`,
        fr: `Votre commande est passée à l'état : ${statusLabel}. Vous pouvez consulter les détails dans votre espace client.`,
        de: `Ihr Bestellstatus wurde auf ${statusLabel} aktualisiert. Sie können die Details in Ihrem Dashboard einsehen.`,
        it: `Il tuo ordine è passato allo stato: ${statusLabel}. Puoi visualizzare i dettagli nella tua area clienti.`,
        pt: `O seu pedido foi atualizado para: ${statusLabel}. Pode ver os detalhes na sua área de clientes.`
      };

      sendEmail({
        to: order.user.email,
        subject: emailSubjects[userLang] || emailSubjects.es,
        html: getOrderUpdateTemplate(
          order.user.firstName || "Cliente",
          order.invoiceNumber || `#${order.id}`,
          status,
          emailBodies[userLang] || emailBodies.es,
          userLang as any
        )
      }).catch((err) => log.warn("Failed to send email", { error: err?.message }));
    }
    res.json(updatedOrder);
    } catch (error) {
      log.error("Order status change error", error);
      res.status(500).json({ message: "Error updating order status" });
    }
  }));

  app.patch("/api/admin/orders/:id/inline", isAdminOrSupport, asyncHandler(async (req: Request, res: Response) => {
    try {
    const orderId = Number(req.params.id);
    const body = z.object({
      amount: z.number().optional(),
      companyName: z.string().optional(),
      state: z.string().optional(),
      ownerFullName: z.string().optional(),
      ownerEmail: z.string().optional(),
      ownerPhone: z.string().optional(),
      businessCategory: z.string().optional(),
      ein: z.string().optional(),
      notes: z.string().optional(),
    }).parse(req.body);

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (body.amount !== undefined) {
      await db.update(ordersTable).set({ amount: body.amount }).where(eq(ordersTable.id, orderId));
    }

    const appFields: Record<string, string | undefined> = {};
    if (body.companyName !== undefined) appFields.companyName = body.companyName;
    if (body.state !== undefined) appFields.state = body.state;
    if (body.ownerFullName !== undefined) appFields.ownerFullName = body.ownerFullName;
    if (body.ownerEmail !== undefined) appFields.ownerEmail = body.ownerEmail;
    if (body.ownerPhone !== undefined) appFields.ownerPhone = body.ownerPhone;
    if (body.businessCategory !== undefined) appFields.businessCategory = body.businessCategory;

    if (Object.keys(appFields).length > 0) {
      const [llcApp] = await db.select().from(llcApplicationsTable).where(eq(llcApplicationsTable.orderId, orderId));
      if (llcApp) {
        await db.update(llcApplicationsTable).set(appFields).where(eq(llcApplicationsTable.id, llcApp.id));
      }
      const [maintApp] = await db.select().from(maintenanceApplications).where(eq(maintenanceApplications.orderId, orderId));
      if (maintApp) {
        const maintFields: Record<string, string | undefined> = { ...appFields };
        if (body.ein !== undefined) maintFields.ein = body.ein;
        await db.update(maintenanceApplications).set(maintFields).where(eq(maintenanceApplications.id, maintApp.id));
      }
    }

    logAudit({
      action: 'order_updated',
      userId: req.session?.userId,
      targetId: orderId.toString(),
      details: { orderId, changedFields: Object.keys(body) }
    });
    res.json({ success: true });
    } catch (error) {
      log.error("Order inline edit error", error);
      res.status(500).json({ message: "Error updating order" });
    }
  }));

  const VALID_PAYMENT_TRANSITIONS: Record<string, string[]> = {
    pending: ['paid', 'overdue', 'cancelled'],
    overdue: ['paid', 'cancelled'],
    paid: [],
    cancelled: ['pending'],
  };

  app.patch("/api/admin/orders/:id/payment-link", isAdminOrSupport, asyncHandler(async (req: Request, res: Response) => {
    try {
    const orderId = Number(req.params.id);
    const { paymentLink, paymentStatus, paymentDueDate } = z.object({
      paymentLink: z.string().url().optional().nullable(),
      paymentStatus: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
      paymentDueDate: z.string().optional().nullable()
    }).parse(req.body);

    const existingOrder = await storage.getOrder(orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (paymentStatus) {
      const currentPaymentStatus = existingOrder.paymentStatus || 'pending';
      const allowedPaymentTransitions = VALID_PAYMENT_TRANSITIONS[currentPaymentStatus] || [];
      if (!allowedPaymentTransitions.includes(paymentStatus)) {
        return res.status(400).json({
          message: `Invalid payment status transition from '${currentPaymentStatus}' to '${paymentStatus}'. Allowed: ${allowedPaymentTransitions.join(', ') || 'none'}`
        });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (paymentLink !== undefined) updateData.paymentLink = paymentLink;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentDueDate !== undefined) updateData.paymentDueDate = paymentDueDate ? new Date(paymentDueDate) : null;
    if (paymentStatus === 'paid') {
      updateData.paidAt = new Date();
      if (existingOrder.status === 'pending') {
        updateData.status = 'paid';
      }
    }

    const [updatedOrder] = await db.update(ordersTable)
      .set(updateData)
      .where(eq(ordersTable.id, orderId))
      .returning();

    logAudit({
      action: 'payment_link_update',
      userId: req.session?.userId,
      targetId: String(orderId),
      details: { paymentLink, paymentStatus, previousPaymentStatus: existingOrder.paymentStatus }
    });

    res.json(updatedOrder);
    } catch (error) {
      log.error("Payment link update error", error);
      res.status(500).json({ message: "Error updating payment information" });
    }
  }));

  app.delete("/api/admin/orders/:id", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
    const orderId = Number(req.params.id);
    
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Use transaction for safe cascade deletion
    await db.transaction(async (tx) => {
      // Delete order events
      await tx.delete(orderEvents).where(eq(orderEvents.orderId, orderId));
      
      // Delete document requests linked to documents from this order (before deleting docs)
      const orderDocs = await tx.select({ id: applicationDocumentsTable.id })
        .from(applicationDocumentsTable)
        .where(eq(applicationDocumentsTable.orderId, orderId));
      const docIds = orderDocs.map(d => d.id);
      if (docIds.length > 0) {
        await tx.delete(documentRequestsTable).where(
          inArray(documentRequestsTable.linkedDocumentId, docIds)
        );
      }
      
      // Delete application documents
      await tx.delete(applicationDocumentsTable).where(eq(applicationDocumentsTable.orderId, orderId));
      
      // Delete user notifications related to this order
      if (order.userId) {
        await tx.delete(userNotifications).where(
          and(
            eq(userNotifications.userId, order.userId),
            eq(userNotifications.orderId, orderId)
          )
        );
      }
      
      // Delete the LLC application if exists
      if (order.application?.id) {
        await tx.delete(llcApplicationsTable).where(eq(llcApplicationsTable.id, order.application.id));
      }
      
      // Delete maintenance application if exists
      await tx.delete(maintenanceApplications).where(eq(maintenanceApplications.orderId, orderId));
      
      // Finally delete the order
      await tx.delete(ordersTable).where(eq(ordersTable.id, orderId));
    });
    
    logAudit({
      action: 'admin_order_update',
      userId: req.session?.userId,
      targetId: String(orderId),
      details: { action: 'delete', invoiceNumber: order.invoiceNumber, status: order.status },
      ip: req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || undefined,
    });

    res.json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
      log.error("Error deleting order", error);
      res.status(500).json({ message: "Error deleting order" });
    }
  }));

  // Get incomplete/draft applications for admin
  app.get("/api/admin/incomplete-applications", isAdminOrSupport, asyncHandler(async (req: Request, res: Response) => {
    try {
      const llcDrafts = await db.select({
        id: llcApplicationsTable.id,
        orderId: llcApplicationsTable.orderId,
        requestCode: llcApplicationsTable.requestCode,
        ownerFullName: llcApplicationsTable.ownerFullName,
        ownerEmail: llcApplicationsTable.ownerEmail,
        ownerPhone: llcApplicationsTable.ownerPhone,
        companyName: llcApplicationsTable.companyName,
        state: llcApplicationsTable.state,
        status: llcApplicationsTable.status,
        abandonedAt: llcApplicationsTable.abandonedAt,
        remindersSent: llcApplicationsTable.remindersSent,
        lastUpdated: llcApplicationsTable.lastUpdated,
      })
      .from(llcApplicationsTable)
      .where(eq(llcApplicationsTable.status, "draft"))
      .orderBy(desc(llcApplicationsTable.lastUpdated));
      
      const maintDrafts = await db.select({
        id: maintenanceApplications.id,
        orderId: maintenanceApplications.orderId,
        requestCode: maintenanceApplications.requestCode,
        ownerFullName: maintenanceApplications.ownerFullName,
        ownerEmail: maintenanceApplications.ownerEmail,
        ownerPhone: maintenanceApplications.ownerPhone,
        companyName: maintenanceApplications.companyName,
        state: maintenanceApplications.state,
        status: maintenanceApplications.status,
        abandonedAt: maintenanceApplications.abandonedAt,
        remindersSent: maintenanceApplications.remindersSent,
        lastUpdated: maintenanceApplications.lastUpdated,
      })
      .from(maintenanceApplications)
      .where(eq(maintenanceApplications.status, "draft"))
      .orderBy(desc(maintenanceApplications.lastUpdated));
      
      res.json({
        llc: llcDrafts.map(d => ({ ...d, type: 'llc' })),
        maintenance: maintDrafts.map(d => ({ ...d, type: 'maintenance' })),
      });
    } catch (error) {
      log.error("Error fetching incomplete applications", error);
      res.status(500).json({ message: "Error fetching incomplete applications" });
    }
  }));

  app.delete("/api/admin/incomplete-applications/:type/:id", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
    const { type, id } = req.params;
    const appId = Number(id);
    
    if (type === 'llc') {
      const [app] = await db.select({ orderId: llcApplicationsTable.orderId })
        .from(llcApplicationsTable)
        .where(and(eq(llcApplicationsTable.id, appId), eq(llcApplicationsTable.status, "draft")));
      
      if (!app) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      await db.transaction(async (tx) => {
        await tx.delete(applicationDocumentsTable).where(eq(applicationDocumentsTable.orderId, app.orderId));
        await tx.delete(orderEvents).where(eq(orderEvents.orderId, app.orderId));
        await tx.delete(llcApplicationsTable).where(eq(llcApplicationsTable.id, appId));
        await tx.delete(ordersTable).where(eq(ordersTable.id, app.orderId));
      });
    } else if (type === 'maintenance') {
      const [app] = await db.select({ orderId: maintenanceApplications.orderId })
        .from(maintenanceApplications)
        .where(and(eq(maintenanceApplications.id, appId), eq(maintenanceApplications.status, "draft")));
      
      if (!app) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      await db.transaction(async (tx) => {
        await tx.delete(applicationDocumentsTable).where(eq(applicationDocumentsTable.orderId, app.orderId));
        await tx.delete(orderEvents).where(eq(orderEvents.orderId, app.orderId));
        await tx.delete(maintenanceApplications).where(eq(maintenanceApplications.id, appId));
        await tx.delete(ordersTable).where(eq(ordersTable.id, app.orderId));
      });
    } else {
      return res.status(400).json({ message: "Invalid request type" });
    }
    
    logAudit({
      action: 'admin_order_update',
      userId: req.session?.userId,
      targetId: String(appId),
      details: { action: 'delete_incomplete', type },
      ip: req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || undefined,
    });

    res.json({ success: true, message: "Incomplete request deleted" });
    } catch (error) {
      log.error("Error deleting incomplete application", error);
      res.status(500).json({ message: "Error deleting incomplete application" });
    }
  }));

  // Update LLC important dates with automatic calculation
  app.patch("/api/admin/llc/:appId/dates", isAdminOrSupport, asyncHandler(async (req: Request, res: Response) => {
    const appId = Number(req.params.appId);
    const { field, value } = z.object({ 
      field: z.enum(['llcCreatedDate', 'agentRenewalDate', 'irs1120DueDate', 'irs5472DueDate', 'annualReportDueDate', 'ein', 'registrationNumber', 'llcAddress', 'ownerSharePercentage', 'agentStatus', 'boiStatus', 'boiFiledDate']),
      value: z.string()
    }).parse(req.body);
    
    // Handle text fields (EIN, registration number, address, share percentage, agent status, BOI status)
    const textFields = ['ein', 'registrationNumber', 'llcAddress', 'ownerSharePercentage', 'agentStatus', 'boiStatus'];
    if (textFields.includes(field)) {
      const updateData: Record<string, string | null> = {};
      updateData[field] = value || null;
      
      // If marking agent as renewed, update the renewal date to next year
      if (field === 'agentStatus' && value === 'renewed') {
        const [app] = await db.select({ agentRenewalDate: llcApplicationsTable.agentRenewalDate })
          .from(llcApplicationsTable)
          .where(eq(llcApplicationsTable.id, appId))
          .limit(1);
        
        if (app?.agentRenewalDate) {
          const newRenewalDate = new Date(app.agentRenewalDate);
          newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
          await db.update(llcApplicationsTable)
            .set({ 
              agentStatus: 'active',
              agentRenewalDate: newRenewalDate 
            })
            .where(eq(llcApplicationsTable.id, appId));
          return res.json({ success: true, newRenewalDate });
        }
      }
      
      await db.update(llcApplicationsTable)
        .set(updateData)
        .where(eq(llcApplicationsTable.id, appId));
      return res.json({ success: true });
    }
    
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
      
      // IRS 1120: April 15 of next year
      updateData.irs1120DueDate = new Date(nextYear, 3, 15);
      
      // IRS 5472: April 15 of next year (same deadline as 1120)
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
          updateData.annualReportDueDate = new Date(nextYear, 5, 1); // June 1
        }
        // New Mexico: no annual report, leave as null
      }
    }
    
    await db.update(llcApplicationsTable)
      .set(updateData)
      .where(eq(llcApplicationsTable.id, appId));
    
    res.json({ success: true });
  }));

  // Toggle tax extension for LLC application (6 months: Apr 15 -> Oct 15)
  app.patch("/api/admin/llc/:appId/tax-extension", isAdminOrSupport, asyncHandler(async (req: Request, res: Response) => {
    const appId = Number(req.params.appId);
    const { hasTaxExtension } = z.object({ 
      hasTaxExtension: z.boolean()
    }).parse(req.body);
    
    // Get current application data
    const [app] = await db.select()
      .from(llcApplicationsTable)
      .where(eq(llcApplicationsTable.id, appId))
      .limit(1);
    
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // Update extension flag
    await db.update(llcApplicationsTable)
      .set({ hasTaxExtension })
      .where(eq(llcApplicationsTable.id, appId));
    
    // Recalculate tax deadlines if LLC has been created
    if (app.llcCreatedDate) {
      const creationDate = new Date(app.llcCreatedDate);
      const creationYear = creationDate.getFullYear();
      const nextYear = creationYear + 1;
      
      // Tax extension: April 15 normally, October 15 with 6-month extension
      const taxMonth = hasTaxExtension ? 9 : 3; // October (9) with extension, April (3) without
      
      await db.update(llcApplicationsTable)
        .set({
          irs1120DueDate: new Date(nextYear, taxMonth, 15),
          irs5472DueDate: new Date(nextYear, taxMonth, 15),
        })
        .where(eq(llcApplicationsTable.id, appId));
    }
    
    res.json({ 
      success: true, 
      hasTaxExtension
    });
  }));
}
