import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "../db";
import { users, passwordResetTokens, emailVerificationTokens, messages as messagesTable } from "@shared/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { sendEmail, getRegistrationOtpTemplate, getAdminNewRegistrationTemplate, getAccountLockedTemplate, getOtpEmailTemplate } from "./email";
import { EmailLanguage, getRegistrationOtpSubject, getOtpSubject, getPasswordResetSubject } from "./email-translations";
import { validatePassword, validateEmail } from "./security";
import { generateUniqueClientId, generateUniqueMessageId } from "./id-generator";
import { createLogger } from "./logger";
export { generateUniqueClientId };

const log = createLogger('auth-service');

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 15;
const PASSWORD_RESET_EXPIRY_HOURS = 24;

// Admin emails - ADMIN_EMAIL env var + fallback
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL?.toLowerCase(),
  "afortuny07@gmail.com"
].filter(Boolean) as string[];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate?: string;
  businessActivity?: string;
  clientId: string;
  preferredLanguage?: string;
}): Promise<{ user: typeof users.$inferSelect; verificationToken: string }> {
  if (!validateEmail(data.email)) {
    throw new Error("Formato de email no válido");
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message || "Contraseña no válida");
  }

  const existingUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existingUser.length > 0) {
    const existing = existingUser[0];
    if (existing.isActive === false || existing.accountStatus === 'deactivated') {
      const error = new Error("Tu cuenta ha sido desactivada. Contacta con nuestro equipo de soporte para más información.");
      (error as any).code = "ACCOUNT_DEACTIVATED";
      throw error;
    }
    throw new Error("El email ya está registrado");
  }

  const passwordHash = await hashPassword(data.password);
  const isAdmin = isAdminEmail(data.email);

  const [newUser] = await db.insert(users).values({
    id: data.clientId,
    clientId: data.clientId,
    email: data.email,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    businessActivity: data.businessActivity || null,
    preferredLanguage: data.preferredLanguage || "es",
    emailVerified: false,
    isAdmin: isAdmin,
    accountStatus: "pending",
  }).returning();

  const verificationToken = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(emailVerificationTokens).values({
    userId: newUser.id,
    token: verificationToken,
    expiresAt,
  });

  const userLang = (data.preferredLanguage || 'es') as EmailLanguage;
  try {
    await sendEmail({
      to: data.email,
      subject: getRegistrationOtpSubject(userLang),
      html: getRegistrationOtpTemplate(data.firstName, verificationToken, data.clientId, OTP_EXPIRY_MINUTES, userLang)
    });

    // Email notification to admin about new registration
    const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
    await sendEmail({
      to: adminEmail,
      subject: `[NUEVA CUENTA] ${data.firstName} ${data.lastName}`,
      html: getAdminNewRegistrationTemplate(data.clientId, data.firstName, data.lastName, data.email, data.phone)
    }).catch(() => {});

  } catch (emailError) {
    // Email error silenced
  }

  return { user: newUser, verificationToken };
}

async function logActivity(title: string, data: any) {
  log.debug(title, data);
}

export async function verifyEmailToken(userId: string, token: string): Promise<boolean> {
  const [tokenRecord] = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.userId, userId),
        eq(emailVerificationTokens.token, token),
        eq(emailVerificationTokens.used, false),
        gt(emailVerificationTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!tokenRecord) {
    return false;
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    return false;
  }

  await db.update(emailVerificationTokens)
    .set({ used: true })
    .where(eq(emailVerificationTokens.id, tokenRecord.id));

  if (!user.emailVerified && user.accountStatus === "pending") {
    await db.update(users)
      .set({ 
        emailVerified: true, 
        accountStatus: "active",
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  } else if (!user.emailVerified) {
    await db.update(users)
      .set({ 
        emailVerified: true, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  return true;
}

export async function loginUser(email: string, password: string): Promise<typeof users.$inferSelect | null> {
  if (!validateEmail(email)) {
    return null;
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user || !user.passwordHash) {
    return null;
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    const error = new Error("ACCOUNT_LOCKED_TEMPORARILY");
    (error as any).locked = true;
    (error as any).code = "ACCOUNT_LOCKED";
    throw error;
  }

  if (user.isActive === false || user.accountStatus === 'deactivated') {
    const error = new Error("ACCOUNT_DEACTIVATED");
    (error as any).locked = true;
    (error as any).code = "ACCOUNT_DEACTIVATED";
    (error as any).status = 403;
    logActivity("Intento de Login en Cuenta Desactivada", { userId: user.id, email: user.email });
    throw error;
  }

  // Allow login for accounts under review, but with restricted access
  // (restriction is handled in the routes, not here)

  const isValid = await verifyPassword(password, user.passwordHash);
  
  if (!isValid) {
    // Increment login attempts
    const newAttempts = (user.loginAttempts || 0) + 1;
    const updates: any = { loginAttempts: newAttempts };
    
    if (newAttempts >= 4) {
      // Deactivate account after 4 failed attempts (permanent until admin review)
      updates.accountStatus = 'deactivated';
      updates.isActive = false;
      updates.lockUntil = null;
      
      const msgId = await generateUniqueMessageId();

      // Send deactivation email
      try {
        const secLang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
        const secSubjects: Record<string, string> = { en: 'Security Easy US LLC - Account Deactivated', ca: 'Seguretat Easy US LLC - Compte Desactivat', fr: 'Sécurité Easy US LLC - Compte Désactivé', de: 'Sicherheit Easy US LLC - Konto Deaktiviert', it: 'Sicurezza Easy US LLC - Account Disattivato', pt: 'Segurança Easy US LLC - Conta Desativada' };
        await sendEmail({
          to: user.email!,
          subject: secSubjects[secLang] || "Seguridad Easy US LLC - Cuenta Desactivada",
          html: getAccountLockedTemplate(user.firstName || '', msgId)
        });

        // Add to messages for admin visibility
        await db.insert(messagesTable).values({
          userId: user.id,
          name: "Sistema de Seguridad",
          email: "seguridad@easyusllc.com",
          subject: "Cuenta Desactivada - 4 Intentos Fallidos",
          content: `Cuenta desactivada permanentemente por seguridad tras 4 intentos fallidos de inicio de sesión. Se requiere verificación de identidad para reactivar. Ticket ID: ${msgId}`,
          status: "unread",
          type: "support",
          messageId: msgId
        });

        logActivity("Cuenta Desactivada por Seguridad", { userId: user.id, email: user.email, attempts: newAttempts });
      } catch (e) {
        log.error("Error handling account deactivation", e);
      }
    }
    
    await db.update(users).set(updates).where(eq(users.id, user.id));
    return null;
  }

  // Reset attempts on successful login
  if (user.loginAttempts > 0 || user.lockUntil) {
    await db.update(users).set({ 
      loginAttempts: 0, 
      lockUntil: null,
      accountStatus: user.accountStatus,
      updatedAt: new Date()
    }).where(eq(users.id, user.id));
  }

  return user;
}

export async function createPasswordResetOtp(email: string): Promise<{ success: boolean; userId?: string }> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user) {
    return { success: false };
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token: otp,
    expiresAt,
  });

  const lang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
  try {
    const { getOtpEmailTemplate } = await import("./email");
    await sendEmail({
      to: email,
      subject: getPasswordResetSubject(lang),
      html: getOtpEmailTemplate(otp, user.firstName || undefined, lang),
    });
  } catch (emailError) {
    // Email error silenced
  }

  return { success: true, userId: user.id };
}

export async function verifyPasswordResetOtp(email: string, otp: string): Promise<boolean> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return false;

  const [tokenRecord] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.userId, user.id),
        eq(passwordResetTokens.token, otp),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .orderBy(sql`${passwordResetTokens.createdAt} DESC`)
    .limit(1);

  return !!tokenRecord;
}

export async function resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<boolean> {
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message || "Contraseña no válida");
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return false;

  const [tokenRecord] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.userId, user.id),
        eq(passwordResetTokens.token, otp),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!tokenRecord) {
    return false;
  }

  const passwordHash = await hashPassword(newPassword);

  await db.update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.id, tokenRecord.id));

  // Also unlock account if it was locked due to too many attempts
  await db.update(users)
    .set({ 
      passwordHash, 
      updatedAt: new Date(),
      loginAttempts: 0,
      lockUntil: null,
      accountStatus: 'active' 
    })
    .where(eq(users.id, tokenRecord.userId));

  return true;
}

export async function resendVerificationEmail(userId: string): Promise<boolean> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (!user || !user.email) {
    return false;
  }

  const verificationToken = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(emailVerificationTokens).values({
    userId: user.id,
    token: verificationToken,
    expiresAt,
  });

  const lang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
  try {
    await sendEmail({
      to: user.email,
      subject: getOtpSubject(lang),
      html: getOtpEmailTemplate(verificationToken, user.firstName || undefined, lang)
    });
  } catch (emailError) {
    // Email error silenced
    return false;
  }

  return true;
}
