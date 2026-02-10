import type { Express } from "express";
import { z } from "zod";
import { and, eq, gt } from "drizzle-orm";
import { db, isAuthenticated, isNotUnderReview, getClientIp, logAudit } from "./shared";
import { contactOtps, users as usersTable } from "@shared/schema";
import { sendEmail, getOtpEmailTemplate, getWelcomeEmailTemplate, getPasswordChangeOtpTemplate } from "../lib/email";
import { EmailLanguage, getOtpSubject } from "../lib/email-translations";
import { checkRateLimit } from "../lib/security";
import { createLogger } from "../lib/logger";

const log = createLogger('user-security');

export function registerUserSecurityRoutes(app: Express) {
  // Verify email for pending accounts (activate account)
  app.post("/api/user/verify-email", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { otpCode } = req.body;
      
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.emailVerified) {
        return res.json({ success: true, message: "Email already verified" });
      }
      
      const userEmail = user.email;
      
      // Verify OTP
      const [otpRecord] = await db.select()
        .from(contactOtps)
        .where(
          and(
            eq(contactOtps.email, userEmail),
            eq(contactOtps.otpType, "account_verification"),
            eq(contactOtps.otp, otpCode),
            eq(contactOtps.verified, false),
            gt(contactOtps.expiresAt, new Date())
          )
        )
        .limit(1);
      
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP code" });
      }
      
      // Mark OTP as used and activate account
      await db.update(contactOtps).set({ verified: true }).where(eq(contactOtps.id, otpRecord.id));
      await db.update(usersTable).set({ 
        emailVerified: true, 
        accountStatus: 'active' 
      }).where(eq(usersTable.id, userId));
      
      // Update session
      req.session.isAdmin = user.isAdmin;
      req.session.isSupport = user.isSupport;
      
      // Send welcome email
      const activeLang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
      sendEmail({
        to: userEmail,
        subject: activeLang === 'en' ? "Account activated - Easy US LLC" : activeLang === 'ca' ? "Compte activat - Easy US LLC" : activeLang === 'fr' ? "Compte activé - Easy US LLC" : activeLang === 'de' ? "Konto aktiviert - Easy US LLC" : activeLang === 'it' ? "Account attivato - Easy US LLC" : activeLang === 'pt' ? "Conta ativada - Easy US LLC" : "Cuenta activada - Easy US LLC",
        html: getWelcomeEmailTemplate(user.firstName || undefined, activeLang)
      }).catch((err: any) => log.error('Failed to send welcome email', err));
      
      logAudit({ action: 'email_verified', userId, ip: getClientIp(req), details: { email: user.email } });
      
      res.json({ success: true, message: "Email verified successfully. Your account is active." });
    } catch (error) {
      log.error("Verify email error", error);
      res.status(500).json({ message: "Error verifying email" });
    }
  });
  
  // Send verification OTP for pending accounts
  app.post("/api/user/send-verification-otp", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      
      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.emailVerified) {
        return res.json({ success: true, message: "Email already verified" });
      }
      
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit('otp', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` });
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const userEmail = user.email;
      
      await db.insert(contactOtps).values({
        email: userEmail,
        otp,
        otpType: "account_verification",
        expiresAt,
        verified: false
      });
      
      const vpLang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
      sendEmail({
        to: userEmail,
        subject: getOtpSubject(vpLang),
        html: getOtpEmailTemplate(otp, user.firstName || undefined, vpLang)
      }).catch((err: any) => log.error('Failed to send verification OTP email', err));
      
      logAudit({ action: 'send_verification_otp', userId, ip, details: { email: userEmail, type: 'account_verification' } });
      
      res.json({ success: true, message: "OTP code sent to your email" });
    } catch (error) {
      log.error("Send verification OTP error", error);
      res.status(500).json({ message: "Error sending OTP" });
    }
  });

  // Request OTP for password change
  app.post("/api/user/request-password-otp", isAuthenticated, async (req: any, res) => {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
      if (!user?.email) {
        return res.status(400).json({ message: "User not found" });
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
      
      const pwLang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
      await sendEmail({
        to: user.email,
        subject: getOtpSubject(pwLang),
        html: getPasswordChangeOtpTemplate(user.firstName || '', otp, pwLang)
      });
      
      logAudit({ action: 'otp_sent', userId: req.session.userId, ip: getClientIp(req), details: { email: user.email, type: 'password_change' } });
      
      res.json({ success: true });
    } catch (error) {
      log.error("Request password OTP error", error);
      res.status(500).json({ message: "Error sending code" });
    }
  });

  // Change password with OTP verification
  app.post("/api/user/change-password", isAuthenticated, isNotUnderReview, async (req: any, res) => {
    try {
      const { currentPassword, newPassword, otp } = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
        otp: z.string().length(6)
      }).parse(req.body);
      
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
      if (!user?.email || !user?.passwordHash) {
        return res.status(400).json({ message: "Cannot change password" });
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
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }
      
      // Delete used OTP
      await db.delete(contactOtps).where(eq(contactOtps.id, otpRecord.id));
      
      const { verifyPassword, hashPassword } = await import("../lib/auth-service");
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: "Incorrect current password" });
      }
      
      const newHash = await hashPassword(newPassword);
      await db.update(usersTable).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(usersTable.id, req.session.userId));
      
      logAudit({ action: 'password_change', userId: req.session.userId, ip: getClientIp(req), details: { email: user.email } });
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data" });
      }
      log.error("Change password error", error);
      res.status(500).json({ message: "Error changing password" });
    }
  });
}
