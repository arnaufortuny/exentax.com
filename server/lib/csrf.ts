import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER = "x-csrf-token";
const CSRF_COOKIE = "csrf_token";

declare module "express-session" {
  interface SessionData {
    csrfToken?: string;
  }
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

export function validateCsrf(req: Request, res: Response, next: NextFunction) {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  
  if (safeMethods.includes(req.method)) {
    return next();
  }
  
  const tokenFromHeader = req.headers[CSRF_HEADER] as string;
  const tokenFromBody = req.body?._csrf;
  const tokenFromQuery = req.query?._csrf as string;
  const submittedToken = tokenFromHeader || tokenFromBody || tokenFromQuery;
  
  if (!submittedToken || submittedToken !== req.session.csrfToken) {
    return res.status(403).json({ 
      message: "Token CSRF inválido. Por favor, recarga la página e intenta de nuevo." 
    });
  }
  
  next();
}

export function getCsrfToken(req: Request, res: Response) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  res.json({ csrfToken: req.session.csrfToken });
}
