import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "../db";
import { users, passwordResetTokens, emailVerificationTokens, messages as messagesTable } from "@shared/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { sendEmail, getRegistrationOtpTemplate, getAdminNewRegistrationTemplate, getAccountLockedTemplate, getOtpEmailTemplate } from "./email";

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

export function generateClientId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

export async function generateUniqueClientId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const clientId = generateClientId();
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.clientId, clientId)).limit(1);
    if (existing.length === 0) {
      return clientId;
    }
    attempts++;
  }
  
  return Date.now().toString().slice(-8);
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
}): Promise<{ user: typeof users.$inferSelect; verificationToken: string }> {
  const existingUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existingUser.length > 0) {
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
    emailVerified: false,
    isAdmin: isAdmin,
    accountStatus: "active",
  }).returning();

  const verificationToken = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(emailVerificationTokens).values({
    userId: newUser.id,
    token: verificationToken,
    expiresAt,
  });

  try {
    await sendEmail({
      to: data.email,
      subject: "Bienvenido a Easy US LLC - Verifica tu cuenta",
      html: getRegistrationOtpTemplate(data.firstName, verificationToken, data.clientId, OTP_EXPIRY_MINUTES)
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
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUTH] ${title}:`, data);
  }
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

  await db.update(emailVerificationTokens)
    .set({ used: true })
    .where(eq(emailVerificationTokens.id, tokenRecord.id));

  await db.update(users)
    .set({ 
      emailVerified: true, 
      accountStatus: "active",
      updatedAt: new Date() 
    })
    .where(eq(users.id, userId));

  return true;
}

export async function loginUser(email: string, password: string): Promise<typeof users.$inferSelect | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user || !user.passwordHash) {
    return null;
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    const error = new Error("CUENTA BLOQUEADA TEMPORALMENTE. Por su seguridad su cuenta ha sido temporalmente desactivada, porfavor contacte con nuestro equipo o revise su email para desbloquear su cuenta.");
    (error as any).locked = true;
    throw error;
  }

  if (user.isActive === false || user.accountStatus === 'deactivated') {
    const error = new Error("Tu cuenta ha sido desactivada. Contacta con nuestro equipo de soporte para más información.");
    (error as any).locked = true;
    (error as any).status = 403;
    logActivity("Intento de Login en Cuenta Desactivada", { userId: user.id, email: user.email });
    throw error;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  
  if (!isValid) {
    // Increment login attempts
    const newAttempts = (user.loginAttempts || 0) + 1;
    const updates: any = { loginAttempts: newAttempts };
    
    if (newAttempts >= 5) {
      // Lock account for 1 hour (temporary lock, not deactivation)
      updates.lockUntil = new Date(Date.now() + 60 * 60 * 1000);
      
      const msgId = Math.floor(10000000 + Math.random() * 90000000).toString();

      // Send lock email
      try {
        await sendEmail({
          to: user.email!,
          subject: "Seguridad Easy US LLC - Cuenta Bloqueada Temporalmente",
          html: getAccountLockedTemplate(user.firstName || 'Cliente', msgId)
        });

        // Add to messages for admin visibility
        await db.insert(messagesTable).values({
          userId: user.id,
          name: "Claudia (Seguridad)",
          email: "seguridad@easyusllc.com",
          subject: "Cuenta Bloqueada - Verificación Requerida",
          content: `Cuenta desactivada temporalmente por seguridad. Se ha solicitado DNI y fecha de nacimiento. Ticket ID: ${msgId}`,
          status: "unread",
          type: "support",
          messageId: msgId
        });

      } catch (e) {
        console.error("Error handling account lock:", e);
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

  try {
    const { getEmailHeader, getEmailFooter, getOtpEmailTemplate } = await import("./email");
    await sendEmail({
      to: email,
      subject: "Código de verificación - Easy US LLC",
      html: getOtpEmailTemplate(otp),
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

  try {
    await sendEmail({
      to: user.email,
      subject: "Easy US LLC - Código de verificación",
      html: getOtpEmailTemplate(verificationToken, user.firstName || 'Cliente')
    });
  } catch (emailError) {
    // Email error silenced
    return false;
  }

  return true;
}
