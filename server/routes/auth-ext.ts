import type { Express, Response } from "express";
import { z } from "zod";
import { db, logAudit, getClientIp , asyncHandler } from "./shared";
import { contactOtps, users as usersTable } from "@shared/schema";
import { and, eq, gt } from "drizzle-orm";
import { checkRateLimit } from "../lib/security";
import { sendEmail, getOtpEmailTemplate } from "../lib/email";
import { EmailLanguage, getOtpSubject } from "../lib/email-translations";
import { createLogger } from "../lib/logger";

const log = createLogger('auth');

export function registerAuthExtRoutes(app: Express) {
  app.post("/api/auth/check-email", asyncHandler(async (req: any, res: Response) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = await checkRateLimit('general', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` });
      }

      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      const [existingUser] = await db.select({
        id: usersTable.id,
        isActive: usersTable.isActive,
        accountStatus: usersTable.accountStatus,
      }).from(usersTable).where(eq(usersTable.email, email.trim().toLowerCase())).limit(1);
      
      const isDeactivated = existingUser ? (existingUser.isActive === false || existingUser.accountStatus === 'deactivated') : false;
      
      res.json({ 
        exists: !!existingUser,
        deactivated: isDeactivated,
      });
    } catch (err) {
      res.status(400).json({ message: "Invalid email" });
    }
  }));
  
  // Send OTP for account registration (email verification before creating account)
  app.post("/api/register/send-otp", asyncHandler(async (req: any, res: Response) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = await checkRateLimit('register', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` 
        });
      }

      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      const browserLang = (req.body.preferredLanguage || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'es') as EmailLanguage;
      const supportedLangs: string[] = ['es', 'en', 'ca', 'fr', 'de', 'it', 'pt'];
      const lang = supportedLangs.includes(browserLang) ? browserLang : 'es' as EmailLanguage;

      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (existingUser) {
        if (existingUser.isActive === false || existingUser.accountStatus === 'deactivated') {
          const deactMsgs: Record<string, string> = {
            es: "Tu cuenta ha sido desactivada. Contacta con nuestro equipo de soporte para más información.",
            en: "Your account has been deactivated. Contact our support team for more information.",
            ca: "El teu compte ha estat desactivat. Contacta amb el nostre equip de suport.",
            fr: "Votre compte a été désactivé. Contactez notre équipe d'assistance.",
            de: "Ihr Konto wurde deaktiviert. Kontaktieren Sie unser Support-Team.",
            it: "Il tuo account è stato disattivato. Contatta il nostro team di supporto.",
            pt: "Sua conta foi desativada. Entre em contato com nossa equipe de suporte.",
          };
          const userLang = (existingUser.preferredLanguage || lang || 'es') as string;
          return res.status(403).json({ 
            message: deactMsgs[userLang] || deactMsgs.es,
            code: "ACCOUNT_DEACTIVATED"
          });
        }
        const regMsgs: Record<string, string> = {
          es: "Este email ya está registrado. Por favor, inicia sesión.",
          en: "This email is already registered. Please log in.",
          ca: "Aquest email ja està registrat. Si us plau, inicia sessió.",
          fr: "Cet email est déjà enregistré. Veuillez vous connecter.",
          de: "Diese E-Mail ist bereits registriert. Bitte melden Sie sich an.",
          it: "Questa email è già registrata. Effettua il login.",
          pt: "Este email já está registrado. Por favor, faça login.",
        };
        return res.status(400).json({ message: regMsgs[lang] || regMsgs.es });
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await db.insert(contactOtps).values({
        email,
        otp,
        otpType: "account_verification",
        expiresAt,
      });
      await sendEmail({
        to: email,
        subject: getOtpSubject(lang),
        html: getOtpEmailTemplate(otp, undefined, lang),
      });

      logAudit({ action: 'user_register', ip, details: { email, step: 'otp_sent' } });
      res.json({ success: true });
    } catch (err) {
      log.error("Error sending registration OTP", err);
      res.status(400).json({ message: "Error sending verification code." });
    }
  }));

  // Verify OTP for account registration
  app.post("/api/register/verify-otp", asyncHandler(async (req: any, res: Response) => {
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
      log.error("Error verifying registration OTP", err);
      res.status(400).json({ message: "Could not verify the code. Please try again." });
    }
  }));

  // Verify name before sending password reset OTP
  // Returns uniform "checking" delay and same structure regardless of account existence
  app.post("/api/password-reset/verify-name", asyncHandler(async (req: any, res: Response) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = await checkRateLimit('passwordReset', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` 
        });
      }

      const { email, fullName } = z.object({ 
        email: z.string().email(),
        fullName: z.string().min(2).max(200)
      }).parse(req.body);

      const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();

      const levenshtein = (a: string, b: string): number => {
        const m = a.length, n = b.length;
        if (m === 0) return n;
        if (n === 0) return m;
        const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            dp[i][j] = Math.min(
              dp[i - 1][j] + 1,
              dp[i][j - 1] + 1,
              dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
          }
        }
        return dp[m][n];
      };

      const fuzzyMatch = (a: string, b: string): boolean => {
        if (a === b) return true;
        const maxDist = Math.max(1, Math.floor(Math.max(a.length, b.length) * 0.25));
        return levenshtein(a, b) <= maxDist;
      };
      
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      
      if (!existingUser) {
        return res.json({ match: "exact" });
      }

      if (existingUser.isActive === false || existingUser.accountStatus === 'deactivated') {
        return res.json({ match: "exact" });
      }
      
      const accountFullName = normalize(`${existingUser.firstName || ""} ${existingUser.lastName || ""}`);
      const inputName = normalize(fullName);
      
      if (!accountFullName || accountFullName.length < 2) {
        return res.json({ match: "exact" });
      }

      if (accountFullName === inputName) {
        return res.json({ match: "exact" });
      }

      if (fuzzyMatch(accountFullName, inputName)) {
        return res.json({ match: "exact" });
      }

      const accountParts = accountFullName.split(" ").filter(Boolean);
      const inputParts = inputName.split(" ").filter(Boolean);

      const fuzzyMatchingParts = inputParts.filter(part => 
        accountParts.some(aPart => fuzzyMatch(part, aPart))
      );
      
      if (fuzzyMatchingParts.length > 0 && fuzzyMatchingParts.length >= Math.min(accountParts.length, inputParts.length) * 0.5) {
        return res.json({ match: "partial" });
      }

      logAudit({ action: 'password_reset_name_mismatch', ip, details: { email } });
      return res.json({ match: "none" });
    } catch (err) {
      log.error("Error verifying name for password reset", err);
      res.status(400).json({ message: "Error verifying identity." });
    }
  }));

  // Send OTP for password reset (forgot password)
  app.post("/api/password-reset/send-otp", asyncHandler(async (req: any, res: Response) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = await checkRateLimit('passwordReset', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` 
        });
      }

      const { email, fullName } = z.object({ 
        email: z.string().email(),
        fullName: z.string().min(2).max(200)
      }).parse(req.body);
      
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      
      if (!existingUser) {
        return res.json({ success: true });
      }
      
      if (existingUser.isActive === false || existingUser.accountStatus === 'deactivated') {
        return res.json({ success: true, deactivated: true });
      }

      const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
      const levenshtein = (a: string, b: string): number => {
        const m = a.length, n = b.length;
        if (m === 0) return n;
        if (n === 0) return m;
        const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
          }
        }
        return dp[m][n];
      };
      const fuzzyMatch = (a: string, b: string): boolean => {
        if (a === b) return true;
        return levenshtein(a, b) <= Math.max(1, Math.floor(Math.max(a.length, b.length) * 0.25));
      };

      const accountFullName = normalize(`${existingUser.firstName || ""} ${existingUser.lastName || ""}`);
      const inputName = normalize(fullName);
      
      if (accountFullName && accountFullName.length >= 2) {
        const accountParts = accountFullName.split(" ").filter(Boolean);
        const inputParts = inputName.split(" ").filter(Boolean);
        const fuzzyMatchingParts = inputParts.filter(part => 
          accountParts.some(aPart => fuzzyMatch(part, aPart))
        );
        
        if (fuzzyMatchingParts.length === 0) {
          logAudit({ action: 'password_reset_blocked_name', ip, details: { email } });
          return res.status(403).json({ message: "Identity verification failed. The name does not match our records." });
        }
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await db.insert(contactOtps).values({
        email,
        otp,
        otpType: "password_reset",
        expiresAt,
      });

      const resetLang = ((existingUser as any)?.preferredLanguage || 'es') as EmailLanguage;
      await sendEmail({
        to: email,
        subject: getOtpSubject(resetLang),
        html: getOtpEmailTemplate(otp, existingUser?.firstName || undefined, resetLang),
      });

      logAudit({ action: 'password_reset', ip, details: { email } });
      res.json({ success: true });
    } catch (err) {
      log.error("Error sending password reset OTP", err);
      res.status(400).json({ message: "Error sending verification code." });
    }
  }));

  // Verify OTP and reset password
  app.post("/api/password-reset/confirm", asyncHandler(async (req: any, res: Response) => {
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

      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (user.isActive === false || user.accountStatus === 'deactivated') {
        return res.status(403).json({ 
          success: false,
          code: "ACCOUNT_DEACTIVATED",
          message: "This account has been deactivated. Contact support for more information."
        });
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
      log.error("Error resetting password", err);
      if (err.errors) {
        return res.status(400).json({ message: err.errors[0]?.message || "Error resetting password" });
      }
      res.status(400).json({ message: "Error resetting password" });
    }
  }));
}
