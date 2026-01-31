import { Request, Response } from "express";
import { db } from "../db";
import { z } from "zod";
import { eq, desc, sql, and } from "drizzle-orm";
import { 
  users as usersTable, 
  orders as ordersTable, 
  llcApplications as llcApplicationsTable,
  maintenanceApplications,
  newsletterSubscribers,
  applicationDocuments as applicationDocumentsTable,
  messages as messagesTable,
  orderEvents,
  userNotifications,
  discountCodes
} from "@shared/schema";
import { storage } from "../storage";
import { logAudit } from "../lib/security";
import { 
  sendEmail, 
  sendTrustpilotEmail,
  getAccountDeactivatedTemplate,
  getAccountVipTemplate,
  getAccountReactivatedTemplate,
  getOrderUpdateTemplate,
  getAdminNoteTemplate,
  getPaymentRequestTemplate,
  getDocumentRequestTemplate
} from "../lib/email";
import { updateApplicationDeadlines } from "../calendar-service";

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const statsCache = new Map<string, CacheEntry<any>>();
const STATS_CACHE_TTL = 30000;

function getCachedData<T>(key: string): T | null {
  const entry = statsCache.get(key);
  if (entry && Date.now() - entry.timestamp < STATS_CACHE_TTL) {
    return entry.data as T;
  }
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  statsCache.set(key, { data, timestamp: Date.now() });
}

export const getAdminOrders = async (_req: Request, res: Response) => {
  try {
    const allOrders = await storage.getAllOrders();
    res.json(allOrders);
  } catch (error) {
    console.error("Admin orders error:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  const { status } = z.object({ status: z.string() }).parse(req.body);
  
  const [updatedOrder] = await db.update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, orderId))
    .returning();
  
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

    if (status === 'completed' && order.userId) {
      await db.update(usersTable)
        .set({ accountStatus: 'vip' })
        .where(eq(usersTable.id, order.userId));
      
      const orderCode = order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber || `#${order.id}`;
      sendTrustpilotEmail({
        to: order.user.email,
        name: order.user.firstName || "Cliente",
        orderNumber: orderCode
      }).catch(() => {});
    }

    if (status === 'filed' && order.application) {
      const formationDate = new Date();
      const state = order.application.state || "new_mexico";
      await updateApplicationDeadlines(order.application.id, formationDate, state);
    }

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
});

export const updatePaymentLink = asyncHandler(async (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  const { paymentLink, paymentStatus, paymentDueDate } = z.object({
    paymentLink: z.string().url().optional().nullable(),
    paymentStatus: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
    paymentDueDate: z.string().optional().nullable()
  }).parse(req.body);

  const updateData: Record<string, unknown> = {};
  if (paymentLink !== undefined) updateData.paymentLink = paymentLink;
  if (paymentStatus) updateData.paymentStatus = paymentStatus;
  if (paymentDueDate !== undefined) updateData.paymentDueDate = paymentDueDate ? new Date(paymentDueDate) : null;
  if (paymentStatus === 'paid') updateData.paidAt = new Date();

  const [updatedOrder] = await db.update(ordersTable)
    .set(updateData)
    .where(eq(ordersTable.id, orderId))
    .returning();

  if (!updatedOrder) {
    return res.status(404).json({ message: "Pedido no encontrado" });
  }

  logAudit({
    action: 'payment_link_update',
    userId: req.session?.userId,
    targetId: String(orderId),
    details: { paymentLink, paymentStatus }
  });

  res.json(updatedOrder);
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  
  const order = await storage.getOrder(orderId);
  if (!order) {
    return res.status(404).json({ message: "Pedido no encontrado" });
  }
  
  await db.transaction(async (tx) => {
    await tx.delete(orderEvents).where(eq(orderEvents.orderId, orderId));
    await tx.delete(applicationDocumentsTable).where(eq(applicationDocumentsTable.orderId, orderId));
    
    if (order.userId) {
      await tx.delete(userNotifications).where(
        and(
          eq(userNotifications.userId, order.userId),
          sql`${userNotifications.message} LIKE ${'%' + (order.invoiceNumber || `#${orderId}`) + '%'}`
        )
      );
    }
    
    if (order.application?.id) {
      await tx.delete(llcApplicationsTable).where(eq(llcApplicationsTable.id, order.application.id));
    }
    
    await tx.delete(ordersTable).where(eq(ordersTable.id, orderId));
  });
  
  res.json({ success: true, message: "Pedido eliminado correctamente" });
});

export const getAdminUsers = async (_req: Request, res: Response) => {
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
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

  logAudit({ 
    action: 'admin_user_update', 
    userId: req.session?.userId, 
    targetId: userId,
    details: { changes: Object.keys(data) } 
  });

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

  res.json(updated);
});

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

export const createUser = asyncHandler(async (req: Request, res: Response) => {
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
});

export const getSystemStats = async (_req: Request, res: Response) => {
  try {
    const cached = getCachedData<any>('system-stats');
    if (cached) {
      return res.json(cached);
    }
    
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

    const conversionRate = userCount > 0 ? (orderCount / userCount) * 100 : 0;

    const statsData = { 
      totalSales,
      pendingSales,
      orderCount,
      pendingOrders,
      completedOrders,
      processingOrders,
      userCount,
      pendingAccounts,
      activeAccounts,
      vipAccounts,
      deactivatedAccounts,
      subscriberCount,
      totalMessages,
      pendingMessages,
      totalDocs,
      pendingDocs,
      conversionRate: Number(conversionRate.toFixed(2))
    };
    
    setCachedData('system-stats', statsData);
    
    res.json(statsData);
  } catch (error) {
    console.error("System stats error:", error);
    res.status(500).json({ message: "Error fetching system stats" });
  }
};

export const sendNote = async (req: Request, res: Response) => {
  try {
    const { userId, title, message, type } = z.object({
      userId: z.string(),
      title: z.string().min(1, "Título requerido"),
      message: z.string().min(1, "Mensaje requerido"),
      type: z.enum(['update', 'info', 'action_required'])
    }).parse(req.body);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const { generateUniqueTicketId } = await import("../lib/id-generator");
    const ticketId = await generateUniqueTicketId();

    await db.insert(userNotifications).values({
      userId,
      title,
      message,
      type,
      ticketId,
      isRead: false
    });

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
};

export const sendPaymentLink = async (req: Request, res: Response) => {
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
};

export const requestDocument = async (req: Request, res: Response) => {
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

      const { encrypt } = await import("../utils/encryption");
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
};
