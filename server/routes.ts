import type { Express } from "express";
import type { Server } from "http";
import { setupCustomAuth } from "./lib/custom-auth";
import { storage } from "./storage";
import { db } from "./db";
import { contactOtps } from "@shared/schema";
import { sql } from "drizzle-orm";
import { getSystemHealth } from "./lib/security";
import { createLogger } from "./lib/logger";

const log = createLogger('routes');
import { setupOAuth } from "./oauth";
import { checkAndSendReminders } from "./calendar-service";
import { processAbandonedApplications } from "./lib/abandoned-service";
import { startBackupService } from "./lib/backup-service";
import { csrfMiddleware, getCsrfToken, validateCsrf } from "./lib/csrf";
import { isTokenAuth, exchangeAuthCode } from "./lib/token-auth";
import { checkRateLimit as checkApiRateLimit } from "./lib/rate-limiter";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { startIpTrackerCleanup } from "./routes/shared";
import { checkPoolHealth } from "./lib/db-utils";
import { registerAdminOrderRoutes } from "./routes/admin-orders";
import { registerAdminUserRoutes } from "./routes/admin-users";
import { registerAdminBillingRoutes } from "./routes/admin-billing";
import { registerAdminCommsRoutes } from "./routes/admin-comms";
import { registerAdminDocumentsRoutes } from "./routes/admin-documents";
import { registerConsultationRoutes } from "./routes/consultations";
import { registerUserProfileRoutes } from "./routes/user-profile";
import { registerUserDocumentRoutes } from "./routes/user-documents";
import { registerUserSecurityRoutes } from "./routes/user-security";
import { registerOrderRoutes } from "./routes/orders";
import { registerLlcRoutes } from "./routes/llc";
import { registerMaintenanceRoutes } from "./routes/maintenance";
import { registerAccountingRoutes } from "./routes/accounting";
import { registerMessageRoutes } from "./routes/messages";
import { registerContactRoutes } from "./routes/contact";
import { registerAuthExtRoutes } from "./routes/auth-ext";
import { registerAdminRoleRoutes } from "./routes/admin-roles";
import { registerPushRoutes } from "./routes/push";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Cleanup expired OTPs every 10 minutes
  setInterval(async () => {
    try {
      // Use a timeout for the query to prevent it from hanging and potentially causing connection termination
      const cleanupPromise = db.delete(contactOtps).where(
        sql`${contactOtps.expiresAt} < NOW()`
      );
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OTP cleanup query timeout')), 15000)
      );

      await Promise.race([cleanupPromise, timeoutPromise]);
    } catch (e) {
      log.error("OTP cleanup error", e);
    }
  }, 600000);
  
  app.use("/api/", async (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString().split(',')[0] || "unknown";
    
    const rateCheck = await checkApiRateLimit('api', ip);
    if (!rateCheck.allowed) {
      res.setHeader('Retry-After', String(rateCheck.retryAfter || 60));
      return res.status(429).json({ message: "Too many requests. Please wait a minute." });
    }
    
    next();
  });
  
  // Start IP tracker cleanup (hourly)
  startIpTrackerCleanup();

  // Set up Custom Auth
  setupCustomAuth(app);

  // Set up Google OAuth
  setupOAuth(app);
  
  // Set up Object Storage routes for file uploads
  registerObjectStorageRoutes(app);

  // CSRF Protection - initialize token first
  app.use(csrfMiddleware);
  
  // CSRF Token endpoint
  app.get("/api/csrf-token", (req, res) => {
    getCsrfToken(req, res);
  });
  
  // CSRF Validation for ALL state-changing endpoints (must be after csrfMiddleware)
  const csrfExemptPaths = [
    "/api/stripe/webhook",
    "/api/webhook",
    "/api/consultations/book-free",
    "/api/contact/send-otp",
    "/api/contact/verify-otp",
    "/api/messages",
    "/api/newsletter/subscribe",
    "/api/auth/exchange-code",
    "/api/calculator/consultation",
  ];
  
  app.use((req, res, next) => {
    const isExempt = csrfExemptPaths.some(path => req.path.startsWith(path));
    const isMutatingMethod = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    const isApiRoute = req.path.startsWith("/api/");
    
    if (isApiRoute && isMutatingMethod && !isExempt && !isTokenAuth(req)) {
      return validateCsrf(req, res, next);
    }
    next();
  });

  app.post("/api/auth/exchange-code", (req, res) => {
    const { code } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Code required" });
    }
    const token = exchangeAuthCode(code);
    if (!token) {
      return res.status(401).json({ message: "Invalid or expired code" });
    }
    res.json({ token });
  });

  // Schedule compliance reminder checks every hour
  setInterval(async () => {
    try {
      await checkAndSendReminders();
    } catch (e) {
      log.error("Compliance reminder check error", e);
    }
    try {
      await processAbandonedApplications();
    } catch (e) {
      log.error("Abandoned applications check error", e);
    }
  }, 3600000);

  setTimeout(async () => {
    try {
      await checkAndSendReminders();
      log.info("Initial compliance reminder check completed");
    } catch (e) {
      log.error("Initial compliance reminder check error", e);
    }
    try {
      await processAbandonedApplications();
      log.info("Initial abandoned applications check completed");
    } catch (e) {
      log.error("Initial abandoned applications check error", e);
    }
    
    // Start backup service for Object Storage
    startBackupService();
  }, 30000);

  app.get("/api/healthz", async (_req, res) => {
    try {
      const health = await getSystemHealth();
      const poolHealth = await checkPoolHealth();
      const result = {
        ...health,
        pool: poolHealth,
        status: health.status === 'unhealthy' || !poolHealth.healthy ? 'unhealthy' : health.status,
      };
      res.status(result.status === 'unhealthy' ? 503 : 200).json(result);
    } catch (error) {
      res.status(503).json({ status: 'unhealthy', error: 'Health check failed' });
    }
  });

    // === Activity Tracking ===
    app.post("/api/activity/track", async (req, res) => {
      const { action, details } = req.body;
      if (action === "CLICK_ELEGIR_ESTADO") {
        log.debug("Selección de Estado", { details });
      }
      res.json({ success: true });
    });

  // === API Routes ===

  // Admin Orders (extracted to server/routes/admin-orders.ts)
  registerAdminOrderRoutes(app);

  // Admin Users (extracted to server/routes/admin-users.ts)
  registerAdminUserRoutes(app);

  // Admin Billing (extracted to server/routes/admin-billing.ts)
  registerAdminBillingRoutes(app);

  // Admin Communications (newsletter, consultations, guests, messages)
  registerAdminCommsRoutes(app);

  // Admin Documents (extracted to server/routes/admin-documents.ts)
  registerAdminDocumentsRoutes(app);

  // Admin Roles & Permissions
  registerAdminRoleRoutes(app);

  // User Documents (extracted to server/routes/user-documents.ts)
  registerUserDocumentRoutes(app);

  // User Profile, Notifications (extracted to server/routes/user-profile.ts)
  registerUserProfileRoutes(app);

  // User Security & Verification (extracted to server/routes/user-security.ts)
  registerUserSecurityRoutes(app);

  // Orders (extracted to server/routes/orders.ts)
  registerOrderRoutes(app);

  // Messages API (extracted to server/routes/messages.ts)
  registerMessageRoutes(app);

  // LLC Applications (extracted to server/routes/llc.ts)
  registerLlcRoutes(app);

  // Maintenance (extracted to server/routes/maintenance.ts)
  registerMaintenanceRoutes(app);

  // Contact & Newsletter (extracted to server/routes/contact.ts)
  registerContactRoutes(app);

  // Auth Extension Routes (registration OTP, password reset)
  registerAuthExtRoutes(app);

  // Consultation Booking System (extracted to server/routes/consultations.ts)
  registerConsultationRoutes(app);

  // Push Notifications
  registerPushRoutes(app);

  // Accounting (extracted to server/routes/accounting.ts)
  registerAccountingRoutes(app);

  // Seed Data
  try {
    await seedDatabase();
  } catch (e) {
    log.error("Database seeding error", e);
  }

  return httpServer;
}

async function seedDatabase() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    await storage.createProduct({
      name: "New Mexico LLC",
      description: "Constitución rápida en el estado más eficiente. Ideal para bajo coste de mantenimiento.",
      price: 89900,
      features: [
        "Tasas del estado pagadas",
        "Registered Agent (12 meses)",
        "Articles of Organization oficiales",
        "Operating Agreement profesional",
        "EIN del IRS",
        "BOI Report presentado",
        "Declaraciones fiscales año 1",
        "Soporte completo 12 meses"
      ],
    });
    await storage.createProduct({
      name: "Wyoming LLC",
      description: "Constitución premium en el estado más prestigioso de USA. Máxima privacidad y protección.",
      price: 119900,
      features: [
        "Tasas del estado pagadas",
        "Registered Agent (12 meses)",
        "EIN del IRS garantizado",
        "Articles of Organization oficiales",
        "Operating Agreement profesional",
        "BOI Report presentado",
        "Annual Report año 1",
        "Declaraciones fiscales año 1",
        "Soporte completo 12 meses"
      ],
    });
    await storage.createProduct({
      name: "Delaware LLC",
      description: "El estándar para startups y empresas tecnológicas. Reconocimiento legal global.",
      price: 159900,
      features: [
        "Tasas del estado pagadas",
        "Registered Agent (12 meses)",
        "Articles of Organization oficiales",
        "Operating Agreement profesional",
        "EIN del IRS",
        "BOI Report presentado",
        "Declaraciones fiscales año 1",
        "Soporte completo 12 meses"
      ],
    });
  }
}
