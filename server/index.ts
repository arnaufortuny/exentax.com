import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import compression from "compression";

const app = express();
const httpServer = createServer(app);

// Improved health check logic: 
// Only respond with "OK" if it's explicitly a health check or a Replit bot.
// This prevents blocking the actual website for real users.
httpServer.on('request', (req, res) => {
  try {
    const url = req.url || '/';
    const accept = req.headers['accept'] || '';
    const userAgent = req.headers['user-agent'] || '';
    const isReplit = !!(req.headers['x-replit-deployment-id'] || userAgent.includes('Replit'));
    
    // Respond OK only for:
    // 1. Explicit health check paths
    // 2. The root path IF it's a Replit bot or NOT seeking HTML
    if (url === '/health' || url === '/healthz' || 
       (url === '/' && (isReplit || !accept.includes('text/html')))) {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'close'
      });
      res.end('OK');
      return;
    }
  } catch (e) {}
});

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
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.stripe.com; connect-src 'self' https://api.stripe.com; frame-src 'self' https://js.stripe.com;");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // Performance Headers
  if (req.method === 'GET') {
    const isAsset = req.path.startsWith('/assets/') || req.path.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff2|woff)$/);
    if (isAsset) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Pre-connect and hints
    res.setHeader("X-DNS-Prefetch-Control", "on");
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
    },
  );
})();
