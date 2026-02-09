import type { Express } from "express";
import { z } from "zod";
import { db, storage, isAuthenticated, logAudit, getClientIp, logActivity } from "./shared";
import { contactOtps, users as usersTable, newsletterSubscribers, userNotifications } from "@shared/schema";
import { and, eq, gt } from "drizzle-orm";
import { checkRateLimit, sanitizeHtml } from "../lib/security";
import { sendEmail, getOtpEmailTemplate, getNewsletterWelcomeTemplate, getAutoReplyTemplate } from "../lib/email";
import { EmailLanguage, getOtpSubject } from "../lib/email-translations";

export function registerContactRoutes(app: Express) {
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
        return res.status(400).json({ message: "Email is required" });
      }

      const isSubscribed = await storage.isSubscribedToNewsletter(targetEmail);
      if (isSubscribed) {
        // Silent success for already subscribed via dashboard toggle
        return res.json({ success: true, message: "Already subscribed" });
      }

      await storage.subscribeToNewsletter(targetEmail);

      await storage.createGuestVisitor({
        email: targetEmail,
        source: 'newsletter',
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        language: req.headers['accept-language']?.split(',')[0] || null,
        page: req.headers['referer'] || null,
        referrer: null,
        metadata: null,
      }).catch(() => {});

      // NOTIFICATION: Newsletter subscription (translated on frontend via i18n keys)
      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, targetEmail)).limit(1);
      if (user) {
        await db.insert(userNotifications).values({
          userId: user.id,
          title: 'i18n:ntf.newsletterSubscribed.title',
          message: 'i18n:ntf.newsletterSubscribed.message',
          type: 'info',
          isRead: false
        });
      }
      
      const nlLang = ((user as any)?.preferredLanguage || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'es') as EmailLanguage;
      const nlSubjects: Record<string, string> = {
        en: "Subscription confirmed - Easy US LLC",
        ca: "Subscripció confirmada - Easy US LLC",
        fr: "Abonnement confirmé - Easy US LLC",
        de: "Abonnement bestätigt - Easy US LLC",
        it: "Iscrizione confermata - Easy US LLC",
        pt: "Subscrição confirmada - Easy US LLC",
      };
      await sendEmail({
        to: targetEmail,
        subject: nlSubjects[nlLang] || "Confirmación de suscripción a Easy US LLC",
        html: getNewsletterWelcomeTemplate(nlLang),
      }).catch(() => {});
      
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email" });
      }
      res.status(500).json({ message: "Error subscribing" });
    }
  });


  // Contact form
  app.post("/api/contact/send-otp", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit('contact', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` 
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

      const cLang = (req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'es') as EmailLanguage;
      const supportedContactLangs: string[] = ['es', 'en', 'ca', 'fr', 'de', 'it', 'pt'];
      const contactLang = supportedContactLangs.includes(cLang) ? cLang : 'es' as EmailLanguage;
      await sendEmail({
        to: email,
        subject: getOtpSubject(contactLang),
        html: getOtpEmailTemplate(otp, undefined, contactLang),
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Error sending contact OTP:", err);
      res.status(400).json({ message: "Error sending verification code. Please try again in a few minutes." });
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
        return res.status(400).json({ message: "The code has expired or is incorrect. Please request a new one." });
      }

      await db.update(contactOtps)
        .set({ verified: true })
        .where(eq(contactOtps.id, record.id));

      res.json({ success: true });
    } catch (err) {
      console.error("Error verifying contact OTP:", err);
      res.status(400).json({ message: "Could not verify the code. Please try again." });
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
      const { generateUniqueMessageId } = await import("../lib/id-generator");
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

      const contactLang = (req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'es') as EmailLanguage;
      const validLang = ['es','en','ca','fr','de','it','pt'].includes(contactLang) ? contactLang : 'es';
      const contactTicketSubjects: Record<string, string> = {
        es: `Hemos recibido tu mensaje - Ticket #${ticketId}`,
        en: `We received your message - Ticket #${ticketId}`,
        ca: `Hem rebut el teu missatge - Ticket #${ticketId}`,
        fr: `Nous avons reçu votre message - Ticket #${ticketId}`,
        de: `Wir haben Ihre Nachricht erhalten - Ticket #${ticketId}`,
        it: `Abbiamo ricevuto il tuo messaggio - Ticket #${ticketId}`,
        pt: `Recebemos a sua mensagem - Ticket #${ticketId}`
      };
      await sendEmail({
        to: contactData.email,
        subject: contactTicketSubjects[validLang] || contactTicketSubjects.es,
        html: getAutoReplyTemplate(sanitizedData.nombre, ticketId, validLang as EmailLanguage),
      });

      await storage.createGuestVisitor({
        email: contactData.email,
        source: 'contact',
        ip: clientIp,
        userAgent: req.headers['user-agent'] || null,
        language: req.headers['accept-language']?.split(',')[0] || null,
        page: '/contacto',
        referrer: req.headers['referer'] || null,
        metadata: JSON.stringify({ name: `${sanitizedData.nombre} ${sanitizedData.apellido}`, subject: sanitizedData.subject }),
      }).catch(() => {});

      logAudit({ action: 'order_created', ip: clientIp, details: { ticketId, type: 'contact' } });
      res.json({ success: true, ticketId });
    } catch (err) {
      console.error("Error processing contact form:", err);
      res.status(400).json({ message: "Error processing message" });
    }
  });
}
