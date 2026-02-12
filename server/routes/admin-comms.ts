import type { Express } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { db, storage, isAdmin, isAdminOrSupport, getClientIp, asyncHandler } from "./shared";
import { checkRateLimit } from "../lib/security";
import { createLogger } from "../lib/logger";

const log = createLogger('admin-comms');
import { newsletterSubscribers, calculatorConsultations, messages as messagesTable, messageReplies } from "@shared/schema";
import { sendEmail, getNewsletterBroadcastTemplate } from "../lib/email";

export function registerAdminCommsRoutes(app: Express) {
  // Admin Newsletter
  app.get("/api/admin/newsletter", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const subscribers = await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt));
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  }));

  // Delete newsletter subscriber
  app.delete("/api/admin/newsletter/:id", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting subscriber" });
    }
  }));

  // Calculator consultations - Save consultation + guest record
  app.post("/api/calculator/consultation", asyncHandler(async (req: Request, res: Response) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = await checkRateLimit('consultation', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: "Too many requests. Please try again later." });
      }

      const { email, income, country, activity, savings } = z.object({
        email: z.string().email(),
        income: z.number().min(1),
        country: z.string(),
        activity: z.string().optional(),
        savings: z.number().optional()
      }).parse(req.body);

      await db.insert(calculatorConsultations).values({
        email,
        income,
        country,
        activity: activity || null,
        savings: savings || 0,
        isRead: false
      });

      await storage.createGuestVisitor({
        email,
        source: 'calculator',
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        language: req.headers['accept-language']?.split(',')[0] || null,
        page: '/tools/price-calculator',
        referrer: req.headers['referer'] || null,
        metadata: JSON.stringify({ income, country, activity: activity || null, savings: savings || 0 }),
      });

      res.json({ success: true });
    } catch (error) {
      log.error("Calculator consultation error", error);
      res.status(500).json({ message: "Error saving consultation" });
    }
  }));

  // Admin: Get calculator consultations
  app.get("/api/admin/calculator-consultations", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const consultations = await db.select().from(calculatorConsultations).orderBy(desc(calculatorConsultations.createdAt));
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching consultations" });
    }
  }));

  // Admin: Mark consultation as read
  app.patch("/api/admin/calculator-consultations/:id/read", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.update(calculatorConsultations).set({ isRead: true }).where(eq(calculatorConsultations.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error marking as read" });
    }
  }));

  // ============== GUEST VISITOR TRACKING ==============

  app.post("/api/guest/track", asyncHandler(async (req: Request, res: Response) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = await checkRateLimit('general', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: "Too many requests" });
      }

      const data = z.object({
        email: z.string().email().optional(),
        source: z.string().min(1),
        page: z.string().optional(),
        metadata: z.string().optional(),
      }).parse(req.body);

      await storage.createGuestVisitor({
        email: data.email || null,
        source: data.source,
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        language: req.headers['accept-language']?.split(',')[0] || null,
        page: data.page || null,
        referrer: req.headers['referer'] || null,
        metadata: data.metadata || null,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Invalid tracking data" });
    }
  }));

  app.get("/api/admin/guests", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const guests = await storage.getAllGuestVisitors();
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching guests" });
    }
  }));

  app.get("/api/admin/guests/stats", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const stats = await storage.getGuestVisitorStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching guest stats" });
    }
  }));

  app.delete("/api/admin/guests/:id", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      await storage.deleteGuestVisitor(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting guest" });
    }
  }));

  app.delete("/api/admin/guests/email/:email", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const count = await storage.deleteGuestVisitorsByEmail(decodeURIComponent(req.params.email));
      res.json({ success: true, deleted: count });
    } catch (error) {
      res.status(500).json({ message: "Error deleting guest records" });
    }
  }));

  // Admin: Delete calculator consultation
  app.delete("/api/admin/calculator-consultations/:id", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(calculatorConsultations).where(eq(calculatorConsultations.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting consultation" });
    }
  }));

  // Admin: Get unread calculator consultations count
  app.get("/api/admin/calculator-consultations/unread-count", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const [result] = await db.select({ count: sql<number>`count(*)` }).from(calculatorConsultations).where(eq(calculatorConsultations.isRead, false));
      res.json({ count: result?.count || 0 });
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  }));

  // Broadcast to all newsletter subscribers
  app.post("/api/admin/newsletter/broadcast", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { subject, message } = z.object({
      subject: z.string().min(1),
      message: z.string().min(1)
    }).parse(req.body);

    const subscribers = await db.select().from(newsletterSubscribers);
    const html = getNewsletterBroadcastTemplate(subject, message);

    let sent = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail({ to: sub.email, subject, html });
        sent++;
      } catch (e) {
        log.warn("Failed to send newsletter email", { to: sub.email, error: (e as any)?.message });
      }
    }

    res.json({ success: true, sent, total: subscribers.length });
  }));

  // Admin Messages
  app.get("/api/admin/messages", isAdminOrSupport, asyncHandler(async (req: Request, res: Response) => {
    try {
      const allMessages = await storage.getAllMessages();
      const search = (req.query.search as string || '').toLowerCase().trim();
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.min(Math.max(1, Number(req.query.pageSize) || 50), 200);
      
      let filtered = allMessages;
      if (search) {
        filtered = allMessages.filter((m: any) => {
          const name = (m.senderName || m.name || '').toLowerCase();
          const email = (m.senderEmail || m.email || '').toLowerCase();
          const subject = (m.subject || '').toLowerCase();
          return name.includes(search) || email.includes(search) || subject.includes(search);
        });
      }
      
      const total = filtered.length;
      const totalPages = Math.ceil(total / pageSize);
      const offset = (page - 1) * pageSize;
      const paginatedMessages = filtered.slice(offset, offset + pageSize);
      
      res.json({
        data: paginatedMessages,
        pagination: { page, pageSize, total, totalPages },
      });
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  }));

  app.patch("/api/admin/messages/:id/archive", isAdminOrSupport, asyncHandler(async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateMessageStatus(Number(req.params.id), 'archived');
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error archiving message" });
    }
  }));

  app.delete("/api/admin/messages/:id", isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const msgId = Number(req.params.id);
      await db.delete(messageReplies).where(eq(messageReplies.messageId, msgId));
      await db.delete(messagesTable).where(eq(messagesTable.id, msgId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting message" });
    }
  }));
}
