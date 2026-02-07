import type { Express } from "express";
import { z } from "zod";
import { db, logAudit, getClientIp } from "./shared";
import { contactOtps, users as usersTable } from "@shared/schema";
import { and, eq, gt } from "drizzle-orm";
import { checkRateLimit } from "../lib/security";
import { sendEmail, getOtpEmailTemplate } from "../lib/email";

export function registerAuthExtRoutes(app: Express) {
  // Check if email already exists (for form flow to detect existing users)
  app.post("/api/auth/check-email", async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      
      const isDeactivated = existingUser ? (existingUser.isActive === false || existingUser.accountStatus === 'deactivated') : false;
      
      res.json({ 
        exists: !!existingUser,
        deactivated: isDeactivated,
        firstName: existingUser?.firstName || null
      });
    } catch (err) {
      res.status(400).json({ message: "Invalid email" });
    }
  });
  
  // Send OTP for account registration (email verification before creating account)
  app.post("/api/register/send-otp", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit('register', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` 
        });
      }

      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      // Check if email is already registered
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (existingUser) {
        // Check if account is deactivated
        if (existingUser.isActive === false || existingUser.accountStatus === 'deactivated') {
          return res.status(403).json({ 
            message: "Your account has been deactivated. Contact our support team for more information.",
            code: "ACCOUNT_DEACTIVATED"
          });
        }
        return res.status(400).json({ message: "This email is already registered. Please log in." });
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
      res.status(400).json({ message: "Error sending verification code." });
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
        return res.status(400).json({ message: "The code has expired or is incorrect. Please request a new one." });
      }

      await db.update(contactOtps)
        .set({ verified: true })
        .where(eq(contactOtps.id, record.id));

      res.json({ success: true });
    } catch (err) {
      console.error("Error verifying registration OTP:", err);
      res.status(400).json({ message: "Could not verify the code. Please try again." });
    }
  });

  // Send OTP for password reset (forgot password)
  app.post("/api/password-reset/send-otp", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit('passwordReset', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` 
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
      res.status(400).json({ message: "Error sending verification code." });
    }
  });

  // Verify OTP and reset password
  app.post("/api/password-reset/confirm", async (req, res) => {
    try {
      const { email, otp, newPassword } = z.object({ 
        email: z.string().email(), 
        otp: z.string(),
        newPassword: z.string().min(8, "Password must be at least 8 characters")
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
        return res.status(400).json({ message: "The code has expired or is incorrect. Please request a new one." });
      }

      // Find the user
      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Hash new password and update
      const { hashPassword } = await import("../lib/auth-service");
      const passwordHash = await hashPassword(newPassword);
      
      await db.update(usersTable)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(usersTable.id, user.id));

      // Mark OTP as used
      await db.update(contactOtps)
        .set({ verified: true })
        .where(eq(contactOtps.id, record.id));

      res.json({ success: true, message: "Password updated successfully" });
    } catch (err: any) {
      console.error("Error resetting password:", err);
      if (err.errors) {
        return res.status(400).json({ message: err.errors[0]?.message || "Error resetting password" });
      }
      res.status(400).json({ message: "Error resetting password" });
    }
  });
}
