import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import express from "express";
import { db } from "../db";
import { users } from "@shared/models/auth";
import { userNotifications, messages as messagesTable } from "@shared/schema";
import { eq, sql, and, inArray, desc, gt } from "drizzle-orm";
import { sendEmail, getWelcomeEmailTemplate } from "./email";
import { generateUniqueClientId } from "./id-generator";
import { createLogger } from "./logger";

const log = createLogger('auth');
import { EmailLanguage, getWelcomeNotificationTitle, getWelcomeNotificationMessage, getWelcomeEmailSubject, getDefaultClientName, getSecurityOtpSubject } from "./email-translations";
import { checkRateLimit, logAudit, getClientIp } from "./security";
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
  
  // Require SESSION_SECRET in production, use random fallback only in development
  const envSecret = process.env.SESSION_SECRET;
  if (!envSecret && isProduction) {
    throw new Error("SESSION_SECRET environment variable is required in production");
  }
  const sessionSecret = envSecret || require("crypto").randomBytes(32).toString("hex");
  if (!envSecret) {
    log.warn("Using random session secret for development. Set SESSION_SECRET in production.");
  }
  
  return session({
    secret: sessionSecret,
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
    isSupport: boolean;
    staffRoleId: number | null;
    staffPermissions: string[];
  }
}

export function setupCustomAuth(app: Express) {
  app.set("trust proxy", 1);
  
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  
  app.use(getSession());

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone, birthDate, businessActivity, preferredLanguage } = req.body;

      if (!email || !password || !firstName || !lastName || !phone) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const clientId = await generateUniqueClientId();
      const supportedLangs = ['es', 'en', 'ca', 'fr', 'de', 'it', 'pt'];
      const lang = supportedLangs.includes(preferredLanguage) ? preferredLanguage : 'es';
      const { user } = await createUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        birthDate,
        businessActivity,
        clientId,
        preferredLanguage: lang,
      });

      // NOTIFICATION: Welcome (translated on frontend via i18n keys)
      const emailLang = lang as EmailLanguage;
      await db.insert(userNotifications).values({
        userId: user.id,
        title: 'i18n:ntf.welcome.title',
        message: 'i18n:ntf.welcome.message',
        type: 'info',
        isRead: false
      });

      // Send Welcome Email with Client ID (in user's language)
      sendEmail({
        to: user.email!,
        subject: getWelcomeEmailSubject(emailLang),
        html: getWelcomeEmailTemplate(user.firstName || getDefaultClientName(emailLang), emailLang)
      }).catch(() => {});

      req.session.regenerate((regenErr) => {
        if (regenErr) {
          log.error("Session regeneration error", regenErr);
          return res.status(500).json({ message: "Error creating session" });
        }

        req.session.userId = user.id;
        req.session.email = user.email!;
        req.session.isAdmin = user.isAdmin;
        req.session.isSupport = user.isSupport;

        req.session.save((err) => {
          if (err) {
            log.error("Session save error", err);
            return res.status(500).json({ message: "Error saving session" });
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
            message: "Account created. Check your email to verify your account.",
          });
        });
      });
    } catch (error: any) {
      log.error("Registration error", error);
      res.status(400).json({ message: error.message || "Error creating account" });
    }
  });

  // Login endpoint with rate limiting and security OTP verification
  app.post("/api/auth/login", async (req, res) => {
      try {
        const ip = getClientIp(req);
        const rateCheck = checkRateLimit('login', ip);
        if (!rateCheck.allowed) {
          return res.status(429).json({ 
            message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` 
          });
        }

        const { email, password, securityOtp } = req.body;

        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await loginUser(email, password);

        if (!user) {
          const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
          logAudit({ action: 'user_login', ip, details: { email, success: false } });
          return res.status(401).json({ 
            message: "Incorrect email or password",
            hint: existingUser ? undefined : "no_account"
          });
        }

        if (user.accountStatus === 'deactivated') {
          const deactMsgs: Record<string, string> = {
            es: "Tu cuenta ha sido desactivada. Contacta con nuestro equipo de soporte para más información.",
            en: "Your account has been deactivated. Contact our support team for more information.",
            ca: "El teu compte ha estat desactivat. Contacta amb el nostre equip de suport.",
            fr: "Votre compte a été désactivé. Contactez notre équipe d'assistance.",
            de: "Ihr Konto wurde deaktiviert. Kontaktieren Sie unser Support-Team.",
            it: "Il tuo account è stato disattivato. Contatta il nostro team di supporto.",
            pt: "Sua conta foi desativada. Entre em contato com nossa equipe de suporte.",
          };
          const userLang = (user.preferredLanguage || 'es') as string;
          return res.status(403).json({ message: deactMsgs[userLang] || deactMsgs.es, code: "ACCOUNT_DEACTIVATED" });
        }

        // Check if user has organization docs (skip security OTP if they do)
        const { applicationDocuments: appDocsTable, orders: ordersTable } = await import("@shared/schema");
        const userOrders = await db.select({ id: ordersTable.id }).from(ordersTable).where(eq(ordersTable.userId, user.id));
        const orderIds = userOrders.map(o => o.id);
        
        let hasOrgDocs = false;
        if (orderIds.length > 0) {
          const orgDocs = await db.select()
            .from(appDocsTable)
            .where(
              and(
                inArray(appDocsTable.orderId, orderIds),
                eq(appDocsTable.documentType, "organization_docs")
              )
            )
            .limit(1);
          hasOrgDocs = orgDocs.length > 0;
        }
        
        // Determine if security OTP is required
        const newLoginCount = (user.loginCount || 0) + 1;
        const ipChanged = user.lastLoginIp && user.lastLoginIp !== ip;
        const lastOtpCheck = user.lastSecurityOtpAt ? new Date(user.lastSecurityOtpAt) : null;
        const daysSinceOtpCheck = lastOtpCheck ? (Date.now() - lastOtpCheck.getTime()) / (1000 * 60 * 60 * 24) : 999;
        
        // Require OTP every 3 logins, on IP change, or if marked as required - unless they have org docs
        const requiresSecurityOtp = !hasOrgDocs && !user.isAdmin && (
          user.securityOtpRequired ||
          (newLoginCount % 3 === 0) ||
          (ipChanged && daysSinceOtpCheck > 1)
        );
        
        if (requiresSecurityOtp && !securityOtp) {
          // Generate and send security OTP
          const { contactOtps } = await import("@shared/schema");
          const { sendEmail, getOtpEmailTemplate } = await import("./email");
          
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
          
          await db.insert(contactOtps).values({
            email: user.email!,
            otp,
            otpType: "security_verification",
            expiresAt,
          });
          
          const secLang = (user.preferredLanguage || 'es') as EmailLanguage;
          await sendEmail({
            to: user.email!,
            subject: getSecurityOtpSubject(secLang),
            html: getOtpEmailTemplate(otp, user.firstName || undefined, secLang, ip),
          });
          
          return res.status(200).json({ 
            requiresSecurityOtp: true,
            message: "For security, we have sent a verification code to your email."
          });
        }
        
        // Verify security OTP if provided
        if (securityOtp) {
          const { contactOtps } = await import("@shared/schema");
          const [otpRecord] = await db.select()
            .from(contactOtps)
            .where(
              and(
                eq(contactOtps.email, user.email!),
                eq(contactOtps.otp, securityOtp),
                eq(contactOtps.otpType, "security_verification"),
                gt(contactOtps.expiresAt, new Date())
              )
            )
            .orderBy(desc(contactOtps.expiresAt))
            .limit(1);
          
          if (!otpRecord) {
            return res.status(400).json({ message: "Incorrect or expired verification code." });
          }
          
          // Mark OTP as used
          await db.update(contactOtps).set({ verified: true }).where(eq(contactOtps.id, otpRecord.id));
        }
        
        // Update login tracking
        await db.update(users)
          .set({
            lastLoginIp: ip,
            loginCount: newLoginCount,
            securityOtpRequired: false,
            lastSecurityOtpAt: securityOtp ? new Date() : user.lastSecurityOtpAt,
            loginAttempts: 0,
          })
          .where(eq(users.id, user.id));

        req.session.regenerate((regenErr) => {
          if (regenErr) {
            log.error("Session regeneration error", regenErr);
            return res.status(500).json({ message: "Error creating session" });
          }

          req.session.userId = user.id;
          req.session.email = user.email!;
          req.session.isAdmin = user.isAdmin;
          req.session.isSupport = user.isSupport;

          req.session.save((err) => {
            if (err) {
              log.error("Session save error", err);
              return res.status(500).json({ message: "Error saving session" });
            }
            
            logAudit({ action: 'user_login', userId: user.id, ip, details: { email, success: true, loginCount: newLoginCount } });
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
                accountStatus: user.accountStatus,
                preferredLanguage: user.preferredLanguage || 'es',
              },
            });
          });
        });
      } catch (error: any) {
        if (error.locked) {
          logAudit({ action: 'account_locked', ip: getClientIp(req), details: { reason: 'too_many_attempts' } });
          return res.status(403).json({ message: error.message });
        }
        log.error("Login error", error);
        res.status(500).json({ message: "Error logging in" });
      }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        log.error("Logout error", err);
        return res.status(500).json({ message: "Error logging out" });
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
        return res.status(401).json({ message: "Not authenticated" });
      }

      const success = await verifyEmailToken(userId, code);

      if (!success) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      // Email error silenced
      res.status(500).json({ message: "Error verifying email" });
    }
  });

  // Resend verification email
  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const success = await resendVerificationEmail(userId);

      if (!success) {
        return res.status(400).json({ message: "Error sending code" });
      }

      res.json({ success: true, message: "Code sent" });
    } catch (error) {
      log.error("Resend verification error", error);
      res.status(500).json({ message: "Error sending code" });
    }
  });

  // Request password reset OTP
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      await createPasswordResetOtp(email);

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: "If the email exists in our system, you will receive a verification code",
      });
    } catch (error) {
      res.status(500).json({ message: "Error processing request" });
    }
  });

  // Verify password reset OTP
  app.post("/api/auth/verify-reset-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: "Email and code are required" });
      }

      const isValid = await verifyPasswordResetOtp(email, otp);

      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error verifying code" });
    }
  });

  // Reset password with OTP
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, otp, password } = req.body;

      if (!email || !otp || !password) {
        return res.status(400).json({ message: "Email, code and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const success = await resetPasswordWithOtp(email, otp, password);

      if (!success) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating password" });
    }
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      const userData: any = {
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
        isSupport: user.isSupport,
        accountStatus: user.accountStatus,
        profileImageUrl: user.profileImageUrl,
        googleId: user.googleId ? true : false,
        preferredLanguage: user.preferredLanguage || 'es',
        createdAt: user.createdAt,
        pendingProfileChanges: user.pendingProfileChanges || null,
        pendingChangesExpiresAt: user.pendingChangesExpiresAt || null,
        identityVerificationStatus: user.identityVerificationStatus || 'none',
        identityVerificationNotes: user.identityVerificationNotes || null,
        userType: user.userType || 'client',
        staffRoleId: user.staffRoleId || null,
        staffPermissions: [] as string[],
      };

      if (user.staffRoleId) {
        const { staffRoles } = await import("@shared/schema");
        const [role] = await db.select().from(staffRoles)
          .where(eq(staffRoles.id, user.staffRoleId)).limit(1);
        if (role && role.isActive) {
          userData.staffPermissions = (role.permissions || []) as string[];
        }
      }

      res.json(userData);
    } catch (error) {
      log.error("Get user error", error);
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // Update user profile
  app.patch("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { firstName, lastName, phone, address, streetType, city, province, postalCode, country, idNumber, idType, businessActivity, preferredLanguage } = req.body;

      if (idNumber && idNumber.trim()) {
        const digits = idNumber.replace(/\D/g, '');
        if (digits.length > 0 && digits.length < 7) {
          return res.status(400).json({ message: "ID number must have at least 7 digits" });
        }
      }
      
      // Get current user to check for significant changes
      const [currentUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Count significant field changes (sensitive fields that require review)
      const sensitiveFields = ['idNumber', 'idType', 'address', 'streetType', 'city', 'province', 'postalCode', 'country'];
      let significantChanges = 0;
      
      const currentValues: Record<string, any> = {
        idNumber: currentUser.idNumber,
        idType: currentUser.idType,
        address: currentUser.address,
        streetType: currentUser.streetType,
        city: currentUser.city,
        province: currentUser.province,
        postalCode: currentUser.postalCode,
        country: currentUser.country,
      };
      
      const newValues: Record<string, any> = { idNumber, idType, address, streetType, city, province, postalCode, country };
      
      for (const field of sensitiveFields) {
        const oldVal = currentValues[field] || '';
        const newVal = newValues[field] || '';
        if (newVal && oldVal !== newVal) {
          significantChanges++;
        }
      }
      
      const updateData: any = {
        firstName,
        lastName,
        phone,
        address,
        streetType,
        city,
        province,
        postalCode,
        country,
        idNumber,
        idType,
        businessActivity,
        preferredLanguage,
        updatedAt: new Date(),
      };

      await db.update(users)
        .set(updateData)
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
          streetType: updatedUser.streetType,
          city: updatedUser.city,
          province: updatedUser.province,
          postalCode: updatedUser.postalCode,
          country: updatedUser.country,
          idNumber: updatedUser.idNumber,
          idType: updatedUser.idType,
          businessActivity: updatedUser.businessActivity,
          emailVerified: updatedUser.emailVerified,
          accountStatus: updatedUser.accountStatus,
        },
        accountUnderReview: false,
      });
    } catch (error) {
      log.error("Update user error", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });
}

// Middleware to check if account is under review or deactivated (restricts most actions)
export const isNotUnderReview: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const [user] = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
  
  if (user?.accountStatus === 'pending') {
    const msgs: Record<string, string> = {
      es: "Tu cuenta está en revisión. Nuestro equipo está realizando verificaciones de seguridad.",
      en: "Your account is under review. Our team is performing security checks.",
      ca: "El teu compte està en revisió. El nostre equip està realitzant verificacions de seguretat.",
      fr: "Votre compte est en cours de révision. Notre équipe effectue des vérifications de sécurité.",
      de: "Ihr Konto wird überprüft. Unser Team führt Sicherheitsüberprüfungen durch.",
      it: "Il tuo account è in revisione. Il nostro team sta effettuando verifiche di sicurezza.",
      pt: "Sua conta está em revisão. Nossa equipe está realizando verificações de segurança.",
    };
    const lang = (user.preferredLanguage || 'es') as string;
    return res.status(403).json({ 
      message: msgs[lang] || msgs.es,
      code: "ACCOUNT_UNDER_REVIEW"
    });
  }
  
  if (user?.accountStatus === 'deactivated') {
    const msgs: Record<string, string> = {
      es: "Tu cuenta ha sido desactivada. Contacta con nuestro equipo de soporte para más información.",
      en: "Your account has been deactivated. Contact our support team for more information.",
      ca: "El teu compte ha estat desactivat. Contacta amb el nostre equip de suport per a més informació.",
      fr: "Votre compte a été désactivé. Contactez notre équipe d'assistance pour plus d'informations.",
      de: "Ihr Konto wurde deaktiviert. Kontaktieren Sie unser Support-Team für weitere Informationen.",
      it: "Il tuo account è stato disattivato. Contatta il nostro team di supporto per maggiori informazioni.",
      pt: "Sua conta foi desativada. Entre em contato com nossa equipe de suporte para mais informações.",
    };
    const lang = (user.preferredLanguage || 'es') as string;
    return res.status(403).json({ 
      message: msgs[lang] || msgs.es,
      code: "ACCOUNT_DEACTIVATED"
    });
  }
  
  next();
};

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const [user] = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);

  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Not authorized" });
  }

  next();
};

export const isAdminOrSupport: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const [user] = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);

  if (!user || (!user.isAdmin && !user.isSupport)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  next();
};

export function hasPermission(...requiredPermissions: string[]): RequestHandler {
  return async (req: any, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (user.isAdmin) {
      return next();
    }

    if (!user.staffRoleId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { staffRoles } = await import("@shared/schema");
    const [role] = await db.select().from(staffRoles)
      .where(and(eq(staffRoles.id, user.staffRoleId), eq(staffRoles.isActive, true)))
      .limit(1);

    if (!role) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const userPerms = (role.permissions || []) as string[];
    const hasAll = requiredPermissions.every(p => userPerms.includes(p));
    if (!hasAll) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}

export function hasAnyPermission(...requiredPermissions: string[]): RequestHandler {
  return async (req: any, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (user.isAdmin) {
      return next();
    }

    if (!user.staffRoleId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { staffRoles } = await import("@shared/schema");
    const [role] = await db.select().from(staffRoles)
      .where(and(eq(staffRoles.id, user.staffRoleId), eq(staffRoles.isActive, true)))
      .limit(1);

    if (!role) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const userPerms = (role.permissions || []) as string[];
    const hasAny = requiredPermissions.some(p => userPerms.includes(p));
    if (!hasAny) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}
