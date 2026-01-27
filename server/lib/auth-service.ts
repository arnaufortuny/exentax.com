import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "../db";
import { users, passwordResetTokens, emailVerificationTokens } from "@shared/models/auth";
import { eq, and, gt } from "drizzle-orm";
import { sendEmail } from "./email";

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 15;
const PASSWORD_RESET_EXPIRY_HOURS = 24;

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
  const prefix = "CLI";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate?: string;
  clientId: string;
}): Promise<{ user: typeof users.$inferSelect; verificationToken: string }> {
  const existingUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existingUser.length > 0) {
    throw new Error("El email ya está registrado");
  }

  const passwordHash = await hashPassword(data.password);
  const isAdminEmail = data.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

  const [newUser] = await db.insert(users).values({
    id: data.clientId,
    clientId: data.clientId,
    email: data.email,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    emailVerified: false,
    isAdmin: isAdminEmail,
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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0E1215;">¡Bienvenido a Easy US LLC!</h1>
          <p>Hola \${data.firstName},</p>
          <p>Gracias por registrarte. Tu código de verificación es:</p>
          <div style="background: #6EDC8A; color: #0E1215; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            \${verificationToken}
          </div>
          <p>Este código expira en \${OTP_EXPIRY_MINUTES} minutos.</p>
          <p>Tu ID de cliente es: <strong>\${clientId}</strong></p>
          <p>Saludos,<br>El equipo de Easy US LLC</p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
  }

  return { user: newUser, verificationToken };
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

  if (user.isActive === false || user.accountStatus === 'suspended') {
    const error = new Error("CUENTA BLOQUEADA TEMPORALMENTE. Por su seguridad su cuenta ha sido temporalmente desactivada, porfavor contacte con nuestro equipo o revise su email para desbloquear su cuenta.");
    (error as any).locked = true;
    throw error;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  
  if (!isValid) {
    // Increment login attempts
    const newAttempts = (user.loginAttempts || 0) + 1;
    const updates: any = { loginAttempts: newAttempts };
    
    if (newAttempts >= 5) {
      // Lock account for 1 hour and update status
      updates.lockUntil = new Date(Date.now() + 60 * 60 * 1000);
      updates.accountStatus = 'suspended';
      
      const msgId = `MSG-${Math.floor(10000000 + Math.random() * 90000000)}`;

      // Send lock email from Claudia
      try {
        await sendEmail({
          to: user.email!,
          subject: "Seguridad Easy US LLC - Cuenta Desactivada Temporalmente",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #0E1215;">Seguridad de tu cuenta</h1>
              <p>Hola ${user.firstName || ''},</p>
              <p>Soy <strong>Claudia, Agente de Seguridad</strong> de Easy US LLC.</p>
              <p>Por su seguridad, su cuenta ha sido temporalmente desactivada tras detectar múltiples intentos de acceso fallidos.</p>
              <p>Para desbloquear su cuenta y verificar su identidad, necesitamos que nos envíe lo siguiente respondiendo a este correo o a través de nuestro soporte:</p>
              <ul>
                <li>Imagen del DNI/Pasaporte de alta resolución (ambas caras).</li>
                <li>Su fecha de nacimiento confirmada.</li>
              </ul>
              <p>Su Ticket ID de referencia es: <strong>${msgId}</strong></p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.BASE_URL || 'https://easyusllc.com'}/forgot-password" style="background: #6EDC8A; color: #0E1215; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold;">
                  Restablecer contraseña
                </a>
              </div>
              <p>Saludos,<br>Claudia<br>Seguridad Easy US LLC</p>
            </div>
          `
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
      accountStatus: user.accountStatus === 'suspended' ? 'active' : user.accountStatus 
    }).where(eq(users.id, user.id));
  }

  return user;
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user) {
    return null;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt,
  });

  const resetLink = `\${process.env.BASE_URL || 'https://easyusllc.com'}/reset-password?token=\${token}`;

  try {
    await sendEmail({
      to: email,
      subject: "Easy US LLC - Recuperar contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0E1215;">Recuperar contraseña</h1>
          <p>Hola \${user.firstName || ''},</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${resetLink}" style="background: #6EDC8A; color: #0E1215; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold;">
              Restablecer contraseña
            </a>
          </div>
          <p>Este enlace expira en \${PASSWORD_RESET_EXPIRY_HOURS} horas.</p>
          <p>Si no solicitaste este cambio, ignora este email.</p>
          <p>Saludos,<br>El equipo de Easy US LLC</p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send password reset email:", emailError);
  }

  return token;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const [tokenRecord] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!tokenRecord) {
    return false;
  }

  const passwordHash = await hashPassword(newPassword);

  await db.update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, tokenRecord.userId));

  await db.update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.id, tokenRecord.id));

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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0E1215;">Código de verificación</h1>
          <p>Hola \${user.firstName || ''},</p>
          <p>Tu nuevo código de verificación es:</p>
          <div style="background: #6EDC8A; color: #0E1215; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            \${verificationToken}
          </div>
          <p>Este código expira en \${OTP_EXPIRY_MINUTES} minutos.</p>
          <p>Saludos,<br>El equipo de Easy US LLC</p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
    return false;
  }

  return true;
}
