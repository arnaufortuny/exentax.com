import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import compression from "compression";
import { initServerSentry, sentryRequestHandler, sentryErrorHandler } from "./lib/sentry";
import { scheduleBackups } from "./lib/backup";
import { cleanupDbRateLimits } from "./lib/rate-limiter";
import { processConsultationReminders } from "./routes/consultations";
import { setupSitemapRoute } from "./sitemap";
import { createLogger } from "./lib/logger";

const serverLog = createLogger('server');

initServerSentry();

process.on('unhandledRejection', (reason, promise) => {
  serverLog.error('Unhandled Promise Rejection', reason, { promise: String(promise) });
});

process.on('uncaughtException', (error) => {
  serverLog.error('Uncaught Exception - server will continue', error);
});

const app = express();
const isProduction = process.env.NODE_ENV === "production";

const httpServer = createServer(app);

app.use(compression());

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use(sentryRequestHandler());

function getCSP(): string {
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

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("Content-Security-Policy", getCSP());
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  
  // Performance Headers
  if (req.method === 'GET') {
    const isAsset = req.path.startsWith('/assets/') || req.path.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff2|woff)$/);
    const isStaticFile = req.path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff2|woff|ttf|eot)$/);
    const isSeoFile = req.path === '/robots.txt' || req.path.startsWith('/sitemap');
    const isJS = req.path.match(/\.js$/);
    const isCSS = req.path.match(/\.css$/);
    
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
    
    // Content-type specific optimizations
    if (isJS) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
    if (isCSS) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
    
    res.setHeader("X-DNS-Prefetch-Control", "on");
    
    // Resource hints via Link header
    const linkHints = [
      '</logo-icon.png>; rel=preload; as=image; fetchpriority=high',
      '<https://fonts.googleapis.com>; rel=preconnect',
      '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
      '<https://js.stripe.com>; rel=preconnect',
    ];
    res.setHeader("Link", linkHints.join(', '));
  }
  
  // SEO Headers for main pages
  const seoPages = ['/', '/servicios', '/faq', '/contacto', '/llc/formation', '/llc/maintenance'];
  if (seoPages.includes(req.path)) {
    res.setHeader('X-Robots-Tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    // Append canonical to existing Link header (don't overwrite preconnect hints)
    const existingLinkRaw = res.getHeader('Link');
    const existingLink = Array.isArray(existingLinkRaw) ? existingLinkRaw.join(', ') : (existingLinkRaw || '');
    const canonicalLink = `<https://exentax.com${req.path}>; rel="canonical"`;
    res.setHeader('Link', existingLink ? `${existingLink}, ${canonicalLink}` : canonicalLink);
  }
  
  // Noindex for private/auth pages
  const noindexPages = ['/dashboard', '/admin', '/auth/forgot-password'];
  if (noindexPages.some(p => req.path.startsWith(p))) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  
  // Prevent caching of API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
});

(async () => {
  const { storage } = await import("./storage");
  try {
    await storage.seedDefaultPaymentAccounts();
    serverLog.info("Payment accounts seed check completed");
  } catch (e) {
    serverLog.error("Payment accounts seed error", e);
  }

  await registerRoutes(httpServer, app);
  
  setupSitemapRoute(app);

  // Simple WebSocket logging for admin panel
  const { WebSocketServer } = await import('ws');
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url!, `http://${request.headers.host}`);
    if (pathname === '/ws/logs') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  const originalLog = console.log;
  console.log = (...args) => {
    originalLog(...args);
    const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    wss.clients.forEach(client => {
      if (client.readyState === 1) client.send(msg);
    });
  };

  app.use(sentryErrorHandler());

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    
    serverLog.error(`Request error [${status}]`, err, { status, message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
      if (process.env.NODE_ENV === "production") {
        scheduleBackups();
      }
      if (process.env.NODE_ENV === "production") {
        setInterval(async () => {
          try {
            await cleanupDbRateLimits();
          } catch (e) {
            serverLog.error("Rate limit cleanup error", e);
          }
        }, 300000);
      }
      setInterval(async () => {
        try {
          await processConsultationReminders();
        } catch (e) {
          serverLog.error("Consultation reminder error", e);
        }
      }, 600000);
    },
  );
})();
