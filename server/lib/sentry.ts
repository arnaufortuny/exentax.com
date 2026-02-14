import * as Sentry from "@sentry/node";
import type { Request, Response, NextFunction } from "express";
import { createLogger } from "./logger";

const log = createLogger('sentry');

let isInitialized = false;

export function initServerSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    log.info("No SENTRY_DSN set, error monitoring disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || "1.0.0",
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    ignoreErrors: [
      "ECONNRESET",
      "ECONNREFUSED",
      "ETIMEDOUT",
      "socket hang up",
      "Rate limit exceeded",
    ],
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers['cookie'];
        delete event.request.headers['authorization'];
      }
      return event;
    },
  });
  isInitialized = true;
  log.info("Server error monitoring initialized");
}

export function sentryRequestHandler() {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (isInitialized) {
      Sentry.setContext("request", {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
      if (req.session?.userId) {
        Sentry.setUser({ id: req.session.userId });
      }
      Sentry.setTag("route", req.route?.path || req.path);
    }
    next();
  };
}

export function sentryErrorHandler() {
  return (err: Error, req: Request, _res: Response, next: NextFunction) => {
    if (isInitialized) {
      Sentry.withScope((scope) => {
        scope.setExtra("url", req.url);
        scope.setExtra("method", req.method);
        scope.setExtra("params", req.params);
        scope.setExtra("query", req.query);
        if (req.session?.userId) {
          scope.setUser({ id: req.session.userId });
        }
        scope.setTag("route", req.route?.path || req.path);
        scope.setTag("method", req.method);
        Sentry.captureException(err);
      });
    }
    next(err);
  };
}

export function captureServerError(error: Error, context?: Record<string, unknown>) {
  log.error(error.message, error, context);
  if (isInitialized) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureException(error);
    });
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!isInitialized) return;
  Sentry.captureMessage(message, level);
}

export { Sentry };
