import { createServer } from "http";
import fs from "fs";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";
const port = parseInt(process.env.PORT || "5000", 10);

let cachedIndexHtml: string | null = null;
if (isProduction) {
  try {
    const candidates = [
      path.resolve(process.cwd(), "dist", "public", "index.html"),
      path.resolve(__dirname, "public", "index.html"),
      path.resolve(__dirname, "..", "dist", "public", "index.html"),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        cachedIndexHtml = fs.readFileSync(candidate, "utf-8");
        break;
      }
    }
  } catch (_e) {}
}

let expressApp: any = null;

const httpServer = createServer((req, res) => {
  if (expressApp) {
    return expressApp(req, res);
  }
  if (req.url === "/_health" || req.url === "/_health/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("ok");
  }
  const url = req.url || "/";
  if (url.startsWith("/api/") || url.startsWith("/ws/")) {
    res.writeHead(503, { "Content-Type": "application/json", "Retry-After": "5" });
    return res.end(JSON.stringify({ message: "Service starting, please retry shortly" }));
  }
  const html = cachedIndexHtml || "<!DOCTYPE html><html><head><title>Exentax</title></head><body><p>Loading...</p><script>setTimeout(function(){location.reload()},1000)</script></body></html>";
  res.writeHead(200, { "Content-Type": "text/html", "Cache-Control": "no-cache, no-store, must-revalidate" });
  res.end(html);
});

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on 0.0.0.0:${port}`);
  initializeApp();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

async function initializeApp() {
  try {
    const express = (await import("express")).default;
    const compression = (await import("compression")).default;
    const { createLogger } = await import("./lib/logger");
    const { setupStaticFiles, setupSPAFallback } = await import("./static");
    const { ZodError } = await import("zod");

    const serverLog = createLogger('server');

    const { captureServerError } = await import("./lib/sentry");

    process.on('unhandledRejection', (reason, promise) => {
      serverLog.error('Unhandled Promise Rejection', reason, { promise: String(promise) });
      captureServerError(reason instanceof Error ? reason : new Error(String(reason)), { type: 'unhandledRejection' });
    });

    process.on('uncaughtException', (error) => {
      serverLog.error('Uncaught Exception - server will continue', error);
      captureServerError(error, { type: 'uncaughtException' });
    });

    const app = express();
    let lazyRecordApiMetric: ((method: string, p: string, durationMs: number, statusCode: number) => void) | null = null;

    app.use(compression());

    app.get("/_health", async (_req: any, res: any) => {
      try {
        const { checkDatabaseHealth } = await import("./db");
        const dbHealth = await checkDatabaseHealth();
        if (!dbHealth.healthy) {
          res.status(503).setHeader('Retry-After', '5').json({
            status: 'unhealthy',
            database: { healthy: false, error: dbHealth.error },
          });
          return;
        }
        res.status(200).json({
          status: 'healthy',
          database: { healthy: true, latencyMs: dbHealth.latencyMs },
        });
      } catch {
        res.status(200).send("ok");
      }
    });

    const getCSP = (): string => {
      const baseCSP = {
        "default-src": ["'self'"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "img-src": ["'self'", "data:", "blob:", "https://*.stripe.com", "https://lh3.googleusercontent.com", "https://exentax.com"],
        "connect-src": ["'self'", "https://api.stripe.com", "https://accounts.google.com", "wss://*.replit.dev", "wss://*.replit.app"],
        "frame-src": ["'self'", "https://js.stripe.com", "https://accounts.google.com"],
        "frame-ancestors": ["'self'", "https://*.replit.dev", "https://*.replit.app"],
      };

      if (isProduction) {
        return [
          `default-src ${baseCSP["default-src"].join(" ")}`,
          `script-src 'self' https://js.stripe.com https://accounts.google.com`,
          `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
          `font-src ${baseCSP["font-src"].join(" ")}`,
          `img-src ${baseCSP["img-src"].join(" ")}`,
          `connect-src ${baseCSP["connect-src"].join(" ")}`,
          `frame-src ${baseCSP["frame-src"].join(" ")}`,
          `frame-ancestors ${baseCSP["frame-ancestors"].join(" ")}`,
        ].join("; ");
      } else {
        return [
          `default-src ${baseCSP["default-src"].join(" ")}`,
          `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://accounts.google.com`,
          `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
          `font-src ${baseCSP["font-src"].join(" ")}`,
          `img-src ${baseCSP["img-src"].join(" ")}`,
          `connect-src ${baseCSP["connect-src"].join(" ")}`,
          `frame-src ${baseCSP["frame-src"].join(" ")}`,
          `frame-ancestors ${baseCSP["frame-ancestors"].join(" ")}`,
        ].join("; ");
      }
    }

    app.use((req: any, res: any, next: any) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
      res.setHeader("Content-Security-Policy", getCSP());
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
      res.setHeader("Cross-Origin-Resource-Policy", "same-origin");

      if (req.method === 'GET') {
        const isAsset = req.path.startsWith('/assets/') || req.path.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff2|woff)$/);
        const isStaticFile = req.path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff2|woff|ttf|eot)$/);
        const isSeoFile = req.path === '/robots.txt' || req.path.startsWith('/sitemap');

        if (isAsset && isProduction) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.setHeader('Vary', 'Accept-Encoding');
        } else if (isAsset && !isProduction) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        } else if (isStaticFile && isProduction) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (isStaticFile && !isProduction) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        } else if (isSeoFile) {
          res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
          res.setHeader('X-Robots-Tag', 'all');
        }

        res.setHeader("X-DNS-Prefetch-Control", "on");

        const linkHints = [
          '</logo-icon.png>; rel=preload; as=image; fetchpriority=high',
          '<https://fonts.googleapis.com>; rel=preconnect',
          '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
          '<https://js.stripe.com>; rel=preconnect',
        ];
        res.setHeader("Link", linkHints.join(', '));
      }

      const seoPages = ['/', '/servicios', '/faq', '/contacto', '/llc/formation', '/llc/maintenance'];
      if (seoPages.includes(req.path)) {
        res.setHeader('X-Robots-Tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        const existingLinkRaw = res.getHeader('Link');
        const existingLink = Array.isArray(existingLinkRaw) ? existingLinkRaw.join(', ') : (existingLinkRaw || '');
        const canonicalLink = `<https://exentax.com${req.path}>; rel="canonical"`;
        res.setHeader('Link', existingLink ? `${existingLink}, ${canonicalLink}` : canonicalLink);
      }

      const noindexPages = ['/dashboard', '/admin', '/auth/forgot-password'];
      if (noindexPages.some(p => req.path.startsWith(p))) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      }

      if (req.path.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }

      if (req.path.startsWith('/api/') && lazyRecordApiMetric) {
        const start = process.hrtime.bigint();
        const metricFn = lazyRecordApiMetric;
        res.on('finish', () => {
          const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
          metricFn(req.method, req.path, Math.round(durationMs), res.statusCode);
        });
      }

      next();
    });

    if (isProduction) {
      try {
        setupStaticFiles(app);
        serverLog.info("Static files setup complete");
      } catch (e) {
        serverLog.error("Failed to setup static files", e);
      }
    }

    const { initServerSentry, sentryRequestHandler, sentryErrorHandler } = await import("./lib/sentry");
    initServerSentry();
    app.use(sentryRequestHandler());

    if (!isProduction) {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    const { storage } = await import("./storage");
    try {
      await storage.seedDefaultPaymentAccounts();
      serverLog.info("Payment accounts seed check completed");
    } catch (e) {
      serverLog.error("Payment accounts seed error (non-fatal)", e);
    }

    const { registerRoutes } = await import("./routes");
    await registerRoutes(httpServer, app);

    const { setupSitemapRoute } = await import("./sitemap");
    setupSitemapRoute(app);

    const { WebSocketServer } = await import('ws');
    const wss = new WebSocketServer({ noServer: true });

    httpServer.on('upgrade', (request: any, socket: any, head: any) => {
      const { pathname } = new URL(request.url!, `http://${request.headers.host}`);
      if (pathname === '/ws/logs') {
        wss.handleUpgrade(request, socket, head, (ws: any) => {
          wss.emit('connection', ws, request);
        });
      }
    });

    const originalLog = console.log;
    console.log = (...args: any[]) => {
      originalLog(...args);
      const msg = args.map((arg: any) => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
      wss.clients.forEach((client: any) => {
        if (client.readyState === 1) client.send(msg);
      });
    };

    app.use(sentryErrorHandler());

    app.use((err: any, _req: any, res: any, _next: any) => {
      if (res.headersSent) return;

      if (err instanceof ZodError) {
        const details = err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details,
        });
        return;
      }

      const errMsg = (err.message || '').toLowerCase();
      const isDbConnectionError =
        err.code === 'ECONNREFUSED' ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'ENOTFOUND' ||
        errMsg.includes('connection terminated') ||
        errMsg.includes('connection refused') ||
        errMsg.includes('too many clients') ||
        errMsg.includes('cannot acquire') ||
        (errMsg.includes('database') && errMsg.includes('unavailable'));

      if (isDbConnectionError) {
        res.setHeader('Retry-After', '5');
        res.status(503).json({
          message: 'Service temporarily unavailable. Please try again shortly.',
          code: 'SERVICE_UNAVAILABLE',
        });
        serverLog.error('Database connection error', err);
        return;
      }

      const status = err.status || err.statusCode || 500;
      const message = status >= 500
        ? 'Internal Server Error'
        : (err.message || 'Internal Server Error');

      const response: { message: string; code?: string } = { message };
      if (err.code && typeof err.code === 'string') {
        response.code = err.code;
      }

      res.status(status).json(response);

      if (status >= 500) {
        serverLog.error(`Request error [${status}]`, err);
      }
    });

    if (isProduction) {
      setupSPAFallback(app);
    }

    expressApp = app;
    serverLog.info("Express app active - full application ready");

    try {
      const { recordApiMetric } = await import("./lib/api-metrics");
      lazyRecordApiMetric = recordApiMetric;
    } catch (_e) {}

    serverLog.info("Application fully initialized and ready");

    if (isProduction) {
      try {
        const { scheduleBackups } = await import("./lib/backup");
        scheduleBackups();
      } catch (e) {
        serverLog.error("Backup scheduling failed (non-fatal)", e);
      }
      try {
        const { cleanupDbRateLimits } = await import("./lib/rate-limiter");
        const { runWatchedTask } = await import("./lib/task-watchdog");
        runWatchedTask("rate-limit-cleanup", 300000, cleanupDbRateLimits);
      } catch (e) {
        serverLog.error("Rate limit cleanup failed (non-fatal)", e);
      }
    }
    try {
      const { processConsultationReminders } = await import("./routes/consultations");
      const { runWatchedTask } = await import("./lib/task-watchdog");
      runWatchedTask("consultation-reminders", 600000, processConsultationReminders);
    } catch (e) {
      serverLog.error("Consultation reminders failed (non-fatal)", e);
    }
  } catch (error) {
    console.error("FATAL: Application initialization failed:", error);
  }
}
