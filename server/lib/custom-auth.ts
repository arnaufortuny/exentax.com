import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import express from "express";
import { db } from "../db";
import { users } from "@shared/models/auth";
import { userNotifications, messages as messagesTable } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { sendEmail, getWelcomeEmailTemplate } from "./email";
import {
  createUser,
  loginUser,
  verifyEmailToken,
  createPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
  resendVerificationEmail,
} from "./auth-service";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  const isProduction = process.env.NODE_ENV === "production" || process.env.REPLIT_ENVIRONMENT === "production";
  
  return session({
    secret: process.env.SESSION_SECRET || "easy-us-llc-secret-key-2024",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      maxAge: sessionTtl,
      sameSite: isProduction ? "none" : "lax",
    },
  });
}

declare module "express-session" {
  interface SessionData {
    userId: string;
    email: string;
    isAdmin: boolean;
  }
}

export function setupCustomAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // JSON body parser must be before session and routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  app.use(getSession());

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone, birthDate } = req.body;

      if (!email || !password || !firstName || !lastName || !phone) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" });
      }

      const clientId = Math.floor(10000000 + Math.random() * 90000000).toString();
      const { user } = await createUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        birthDate,
        clientId,
      });

      // NOTIFICATION: Welcome
      await db.insert(userNotifications).values({
        userId: user.id,
        title: "¡Bienvenido a Easy US LLC!",
        message: "Gracias por confiar en nosotros para crear tu empresa en EE.UU. Explora tu panel para comenzar.",
        type: 'info',
        isRead: false
      });

      // Send Welcome Email with Client ID
      sendEmail({
        to: user.email!,
        subject: "¡Bienvenido a Easy US LLC!",
        html: getWelcomeEmailTemplate(user.firstName || "Cliente", clientId)
      }).catch(() => {});

      req.session.userId = user.id;
      req.session.email = user.email!;
      req.session.isAdmin = user.isAdmin;

      // Save session explicitly before responding
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Error al guardar la sesión" });
        }
        
        res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: user.emailVerified,
          },
          message: "Cuenta creada. Revisa tu email para verificar tu cuenta.",
        });
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Error al crear la cuenta" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ message: "Email y contraseña son obligatorios" });
        }

        const user = await loginUser(email, password);

        if (!user) {
          return res.status(401).json({ message: "Email o contraseña incorrectos" });
        }

        if (user.accountStatus === 'deactivated') {
          return res.status(403).json({ message: "Tu cuenta ha sido desactivada. Contacta a nuestro servicio de atención al cliente para más información." });
        }

        req.session.userId = user.id;
        req.session.email = user.email!;
        req.session.isAdmin = user.isAdmin;

        // Save session explicitly before responding
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Error al guardar la sesión" });
          }
          
          res.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
              emailVerified: user.emailVerified,
              isAdmin: user.isAdmin,
            },
          });
        });
      } catch (error: any) {
        if (error.locked) {
          return res.status(403).json({ message: error.message });
        }
        console.error("Login error:", error);
        res.status(500).json({ message: "Error al iniciar sesión" });
      }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  // Also support GET for logout redirect
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });

  // Verify email endpoint
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { code } = req.body;
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const success = await verifyEmailToken(userId, code);

      if (!success) {
        return res.status(400).json({ message: "Código inválido o expirado" });
      }

      res.json({ success: true, message: "Email verificado correctamente" });
    } catch (error) {
      // Email error silenced
      res.status(500).json({ message: "Error al verificar el email" });
    }
  });

  // Resend verification email
  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const success = await resendVerificationEmail(userId);

      if (!success) {
        return res.status(400).json({ message: "Error al enviar el código" });
      }

      res.json({ success: true, message: "Código enviado" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Error al enviar el código" });
    }
  });

  // Request password reset OTP
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email es obligatorio" });
      }

      await createPasswordResetOtp(email);

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: "Si el email existe en nuestro sistema, recibirás un código de verificación",
      });
    } catch (error) {
      res.status(500).json({ message: "Error al procesar la solicitud" });
    }
  });

  // Verify password reset OTP
  app.post("/api/auth/verify-reset-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: "Email y código son obligatorios" });
      }

      const isValid = await verifyPasswordResetOtp(email, otp);

      if (!isValid) {
        return res.status(400).json({ message: "Código inválido o expirado" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error al verificar el código" });
    }
  });

  // Reset password with OTP
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, otp, password } = req.body;

      if (!email || !otp || !password) {
        return res.status(400).json({ message: "Email, código y contraseña son obligatorios" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" });
      }

      const success = await resetPasswordWithOtp(email, otp, password);

      if (!success) {
        return res.status(400).json({ message: "Código inválido o expirado" });
      }

      res.json({ success: true, message: "Contraseña actualizada correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar la contraseña" });
    }
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        streetType: user.streetType,
        city: user.city,
        province: user.province,
        postalCode: user.postalCode,
        country: user.country,
        businessActivity: user.businessActivity,
        idNumber: user.idNumber,
        idType: user.idType,
        birthDate: user.birthDate,
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
        accountStatus: user.accountStatus,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Error al obtener el usuario" });
    }
  });

  // Update user profile
  app.patch("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const { firstName, lastName, phone, address, businessActivity } = req.body;

      await db.update(users)
        .set({
          firstName,
          lastName,
          phone,
          address,
          businessActivity,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      const [updatedUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          address: updatedUser.address,
          businessActivity: updatedUser.businessActivity,
          emailVerified: updatedUser.emailVerified,
        },
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Error al actualizar el perfil" });
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "No autenticado" });
  }
  next();
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const [user] = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);

  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "No autorizado" });
  }

  next();
};
