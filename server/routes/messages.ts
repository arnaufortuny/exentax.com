import type { Express } from "express";
import { db, storage, isAuthenticated, logActivity } from "./shared";
import { users as usersTable, messages as messagesTable, messageReplies, userNotifications } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sendEmail, getAutoReplyTemplate, getMessageReplyTemplate } from "../lib/email";

export function registerMessageRoutes(app: Express) {
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

  // Message replies - secured: only message owner or admin can view
  app.get("/api/messages/:id/replies", isAuthenticated, async (req: any, res) => {
    try {
      const messageId = Number(req.params.id);
      
      // Verify message belongs to user or user is admin
      const [message] = await db.select().from(messagesTable).where(eq(messagesTable.id, messageId)).limit(1);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      if (message.userId !== req.session.userId && !req.session.isAdmin && !req.session.isSupport) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const replies = await db.select().from(messageReplies)
        .where(eq(messageReplies.messageId, messageId))
        .orderBy(messageReplies.createdAt);
      
      res.json(replies);
    } catch (error) {
      console.error("Error fetching message replies:", error);
      res.status(500).json({ message: "Error fetching replies" });
    }
  });

  // Add reply to message - secured: only message owner or admin can reply
  app.post("/api/messages/:id/reply", isAuthenticated, async (req: any, res) => {
    try {
      const messageId = Number(req.params.id);
      const { content } = req.body;
      
      // Verify message belongs to user or user is admin
      const [existingMessage] = await db.select().from(messagesTable).where(eq(messagesTable.id, messageId)).limit(1);
      if (!existingMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      if (existingMessage.userId !== req.session.userId && !req.session.isAdmin && !req.session.isSupport) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: "El contenido de la respuesta es requerido" });
      }
      
      const [reply] = await db.insert(messageReplies).values({
        messageId,
        content,
        isAdmin: req.session.isAdmin || req.session.isSupport || false,
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
      res.status(500).json({ message: "Error creating reply" });
    }
  });
}
