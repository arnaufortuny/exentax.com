import * as Sentry from "@sentry/react";

export function initSentry() {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        if (event.exception) {
          console.error("[Sentry] Captured exception:", event.exception);
        }
        return event;
      },
    });
  }
}

export function captureError(error: Error, context?: Record<string, any>) {
  console.error("[Error]", error.message, context);
  if (import.meta.env.PROD) {
    Sentry.captureException(error, { extra: context });
  }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, level);
  }
}

export { Sentry };
