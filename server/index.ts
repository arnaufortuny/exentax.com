import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import compression from "compression";
import path from "path";
import { initServerSentry } from "./lib/sentry";
import { scheduleBackups } from "./lib/backup";

initServerSentry();

const app = express();

// Files served through protected routes in routes.ts - not statically
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

app.use((req, res, next) => {
  // Security Headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://*.stripe.com; connect-src 'self' https://api.stripe.com wss://*.replit.dev; frame-src 'self' https://js.stripe.com; frame-ancestors 'self' https://*.replit.dev https://*.replit.app;");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  
  // Performance Headers
  if (req.method === 'GET') {
    const isAsset = req.path.startsWith('/assets/') || req.path.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff2|woff)$/);
    const isStaticFile = req.path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff2|woff|ttf|eot)$/);
    const isSeoFile = req.path === '/robots.txt' || req.path.startsWith('/sitemap');
    
    if (isAsset) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Vary', 'Accept-Encoding');
    } else if (isStaticFile) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (isSeoFile) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Robots-Tag', 'all');
    }
    
    res.setHeader("X-DNS-Prefetch-Control", "on");
    res.setHeader("Link", "</logo-icon.png>; rel=preload; as=image, </favicon.png>; rel=icon");
  }
  
  // SEO Headers for main pages
  const seoPages = ['/', '/servicios', '/faq', '/contacto', '/llc/formation', '/llc/maintenance'];
  if (seoPages.includes(req.path)) {
    res.setHeader('X-Robots-Tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    res.setHeader('Link', '<https://easyusllc.com' + req.path + '>; rel="canonical"');
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
  await registerRoutes(httpServer, app);

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

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    
    // Log error for debugging but don't re-throw to prevent unhandled rejections
    console.error(`[Error ${status}]`, message, err.stack || '');
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
    },
  );
})();
