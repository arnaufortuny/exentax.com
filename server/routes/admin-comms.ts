import type { Express } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { db, storage, isAdmin, isAdminOrSupport, getClientIp, asyncHandler } from "./shared";
import { checkRateLimit } from "../lib/security";
import { createLogger } from "../lib/logger";

const log = createLogger('admin-comms');
import { newsletterSubscribers, calculatorConsultations, messages as messagesTable, messageReplies } from "@shared/schema";
import { sendEmail } from "../lib/email";

export function registerAdminCommsRoutes(app: Express) {
  // Admin Newsletter
  app.get("/api/admin/newsletter", isAdmin, async (req, res) => {
    try {
      const subscribers = await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt));
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });

  // Delete newsletter subscriber
  app.delete("/api/admin/newsletter/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting subscriber" });
    }
  });

  // Calculator consultations - Save consultation + guest record
  app.post("/api/calculator/consultation", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit('consultation', ip);
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
  });

  // Admin: Get calculator consultations
  app.get("/api/admin/calculator-consultations", isAdmin, async (req, res) => {
    try {
      const consultations = await db.select().from(calculatorConsultations).orderBy(desc(calculatorConsultations.createdAt));
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching consultations" });
    }
  });

  // Admin: Mark consultation as read
  app.patch("/api/admin/calculator-consultations/:id/read", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await db.update(calculatorConsultations).set({ isRead: true }).where(eq(calculatorConsultations.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error marking as read" });
    }
  });

  // ============== GUEST VISITOR TRACKING ==============

  app.post("/api/guest/track", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit('general', ip);
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
  });

  app.get("/api/admin/guests", isAdmin, async (req, res) => {
    try {
      const guests = await storage.getAllGuestVisitors();
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching guests" });
    }
  });

  app.get("/api/admin/guests/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getGuestVisitorStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching guest stats" });
    }
  });

  app.delete("/api/admin/guests/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteGuestVisitor(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting guest" });
    }
  });

  app.delete("/api/admin/guests/email/:email", isAdmin, async (req, res) => {
    try {
      const count = await storage.deleteGuestVisitorsByEmail(decodeURIComponent(req.params.email));
      res.json({ success: true, deleted: count });
    } catch (error) {
      res.status(500).json({ message: "Error deleting guest records" });
    }
  });

  // Admin: Delete calculator consultation
  app.delete("/api/admin/calculator-consultations/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(calculatorConsultations).where(eq(calculatorConsultations.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting consultation" });
    }
  });

  // Admin: Get unread calculator consultations count
  app.get("/api/admin/calculator-consultations/unread-count", isAdmin, async (req, res) => {
    try {
      const [result] = await db.select({ count: sql<number>`count(*)` }).from(calculatorConsultations).where(eq(calculatorConsultations.isRead, false));
      res.json({ count: result?.count || 0 });
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
          <h1 style="font-size: 24px; font-weight: 900; color: #0A0A0A; margin: 0 0 24px 0;">${subject}</h1>
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
  app.get("/api/admin/messages", isAdminOrSupport, async (req, res) => {
    try {
      const allMessages = await storage.getAllMessages();
      const limit = Math.min(Number(req.query.limit) || 300, 500);
      res.json(allMessages.slice(0, limit));
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });

  app.patch("/api/admin/messages/:id/archive", isAdminOrSupport, async (req, res) => {
    try {
      const updated = await storage.updateMessageStatus(Number(req.params.id), 'archived');
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error archiving message" });
    }
  });

  app.delete("/api/admin/messages/:id", isAdmin, async (req, res) => {
    try {
      const msgId = Number(req.params.id);
      await db.delete(messageReplies).where(eq(messageReplies.messageId, msgId));
      await db.delete(messagesTable).where(eq(messagesTable.id, msgId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting message" });
    }
  });
}
