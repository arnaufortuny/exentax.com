import * as Sentry from "@sentry/node";
import type { Request, Response, NextFunction } from "express";

let isInitialized = false;

export function initServerSentry() {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      beforeSend(event) {
        if (event.exception) {
          console.error("[Sentry Server] Captured exception");
        }
        return event;
      },
    });
    isInitialized = true;
    console.log("[Sentry] Server monitoring initialized");
  }
}

export function sentryRequestHandler() {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (isInitialized) {
      Sentry.setContext("request", {
        url: req.url,
        method: req.method,
      });
    }
    next();
  };
}

export function sentryErrorHandler() {
  return (err: Error, req: Request, _res: Response, next: NextFunction) => {
    if (isInitialized) {
      Sentry.captureException(err, {
        extra: {
          url: req.url,
          method: req.method,
        },
      });
    }
    next(err);
  };
}

export function captureServerError(error: Error, context?: Record<string, unknown>) {
  console.error("[Server Error]", error.message, context);
  if (isInitialized) {
    Sentry.captureException(error, { extra: context });
  }
}

export { Sentry };
