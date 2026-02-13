import type { Express, Response } from "express";
import { z } from "zod";
import { db, storage, isAuthenticated, isNotUnderReview, logActivity, getClientIp, asyncHandler, parseIdParam } from "./shared";
import { users as usersTable, messages as messagesTable, messageReplies, userNotifications } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sendEmail, getAutoReplyTemplate, getMessageReplyTemplate } from "../lib/email";
import type { EmailLanguage } from "../lib/email-translations";
import { checkRateLimit } from "../lib/security";
import { createLogger } from "../lib/logger";

const log = createLogger('messages');

const createMessageSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(320),
  phone: z.string().max(30).optional().nullable(),
  contactByWhatsapp: z.boolean().optional().default(false),
  subject: z.string().max(500).optional(),
  content: z.string().min(1).max(5000),
  requestCode: z.string().max(50).optional(),
});

export function registerMessageRoutes(app: Express) {
  app.get("/api/messages", isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    try {
      const userMessages = await storage.getMessagesByUserId(req.session.userId);
      res.json(userMessages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  }));

  app.post("/api/messages", asyncHandler(async (req: any, res: Response) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = await checkRateLimit('contact', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: "Too many messages. Please try again later.", retryAfter: rateCheck.retryAfter });
      }

      const parsed = createMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten().fieldErrors });
      }
      const { name, email, phone, contactByWhatsapp, subject, content, requestCode } = parsed.data;
      const userId = req.session?.userId || null;
      
      // Restrict suspended or under-review accounts from sending new messages
      if (userId) {
        const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        if (currentUser?.accountStatus === 'deactivated') {
          return res.status(403).json({ message: "Your account is deactivated. You cannot send messages." });
        }
        if (currentUser?.accountStatus === 'pending') {
          return res.status(403).json({ 
            message: "Your account is under review. Our team is performing security checks.",
            code: "ACCOUNT_UNDER_REVIEW"
          });
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

      // Send auto-reply with ticket ID (translated)
      const ticketId = message.messageId || String(message.id);
      let userLang: EmailLanguage = 'es';
      if (userId) {
        const [msgUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        if (msgUser?.preferredLanguage) userLang = msgUser.preferredLanguage as EmailLanguage;
      } else {
        const browserLang = (req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'es') as string;
        if (['es','en','ca','fr','de','it','pt'].includes(browserLang)) userLang = browserLang as EmailLanguage;
      }
      const ticketSubjects: Record<string, string> = {
        es: `Recibimos tu mensaje - Ticket #${ticketId}`,
        en: `We received your message - Ticket #${ticketId}`,
        ca: `Hem rebut el teu missatge - Ticket #${ticketId}`,
        fr: `Nous avons reçu votre message - Ticket #${ticketId}`,
        de: `Wir haben Ihre Nachricht erhalten - Ticket #${ticketId}`,
        it: `Abbiamo ricevuto il tuo messaggio - Ticket #${ticketId}`,
        pt: `Recebemos a sua mensagem - Ticket #${ticketId}`
      };
      sendEmail({
        to: email,
        subject: ticketSubjects[userLang] || ticketSubjects.es,
        html: getAutoReplyTemplate(name || "Cliente", ticketId, userLang),
      }).catch((err) => log.warn("Failed to send auto-reply email", { to: email, error: err?.message }));

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
  }));

  // Message replies - secured: only message owner or admin can view
  app.get("/api/messages/:id/replies", isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    try {
      const messageId = parseIdParam(req);
      
      // Verify message belongs to user or user is admin
      const [message] = await db.select().from(messagesTable).where(eq(messagesTable.id, messageId)).limit(1);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      if (message.userId !== req.session.userId && !req.session.isAdmin && !req.session.isSupport) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const rawReplies = await db.select({
        id: messageReplies.id,
        messageId: messageReplies.messageId,
        content: messageReplies.content,
        isAdmin: messageReplies.isAdmin,
        fromName: messageReplies.fromName,
        createdAt: messageReplies.createdAt,
        createdBy: messageReplies.createdBy,
        authorFirstName: usersTable.firstName,
        authorLastName: usersTable.lastName,
      })
        .from(messageReplies)
        .leftJoin(usersTable, eq(messageReplies.createdBy, usersTable.id))
        .where(eq(messageReplies.messageId, messageId))
        .orderBy(messageReplies.createdAt);
      
      const replies = rawReplies.map(r => ({
        id: r.id,
        messageId: r.messageId,
        content: r.content,
        isAdmin: r.isAdmin,
        isFromAdmin: r.isAdmin,
        createdAt: r.createdAt,
        createdBy: r.createdBy,
        authorName: r.fromName || (r.authorFirstName || r.authorLastName 
          ? `${r.authorFirstName || ''} ${r.authorLastName || ''}`.trim() 
          : null),
      }));
      
      res.json(replies);
    } catch (error) {
      log.error("Error fetching message replies", error);
      res.status(500).json({ message: "Error fetching replies" });
    }
  }));

  // Add reply to message - secured: only message owner or admin can reply
  app.post("/api/messages/:id/reply", isAuthenticated, isNotUnderReview, asyncHandler(async (req: any, res: Response) => {
    try {
      const messageId = parseIdParam(req);
      const { content, fromName } = req.body;
      
      // Verify message belongs to user or user is admin
      const [existingMessage] = await db.select().from(messagesTable).where(eq(messagesTable.id, messageId)).limit(1);
      if (!existingMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      if (existingMessage.userId !== req.session.userId && !req.session.isAdmin && !req.session.isSupport) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: "Reply content is required" });
      }
      
      const isAdminReply = req.session.isAdmin || req.session.isSupport || false;
      const [reply] = await db.insert(messageReplies).values({
        messageId,
        content,
        isAdmin: isAdminReply,
        fromName: isAdminReply && fromName ? fromName.trim().substring(0, 100) : null,
        createdBy: req.session.userId,
      }).returning();
      
      // Get message for email notification
      const [message] = await db.select().from(messagesTable).where(eq(messagesTable.id, messageId)).limit(1);
      if (message?.email && (req.session.isAdmin || req.session.isSupport)) {
        // Admin reply - notify client by email
        const ticketId = message.messageId || String(messageId);
        sendEmail({
          to: message.email,
          subject: `Nueva respuesta a tu consulta - Ticket #${ticketId}`,
          html: getMessageReplyTemplate(message.name?.split(' ')[0] || 'Cliente', content, ticketId)
        }).catch((err) => log.warn("Failed to send reply notification email", { to: message.email, error: err?.message }));
        
        // Create notification for client if they have a user account
        if (message.userId) {
          await db.insert(userNotifications).values({
            userId: message.userId,
            title: 'i18n:ntf.messageReply.title',
            message: `i18n:ntf.messageReply.message::{"ticketId":"${ticketId}"}`,
            type: 'info',
            isRead: false
          });
        }
      }
      
      res.json(reply);
    } catch (error) {
      log.error("Error creating reply", error);
      res.status(500).json({ message: "Error creating reply" });
    }
  }));
}
