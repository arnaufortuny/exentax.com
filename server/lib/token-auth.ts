import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { createLogger } from "./logger";

const log = createLogger("token-auth");

const TOKEN_EXPIRY = "7d";

interface TokenPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  isSupport: boolean;
  iat?: number;
  exp?: number;
}

function getSecret(): string {
  return process.env.SESSION_SECRET || process.env.JWT_SECRET || "dev-fallback-secret";
}

export function signAuthToken(user: { id: string; email: string; isAdmin: boolean; isSupport: boolean }): string {
  return jwt.sign(
    { userId: user.id, email: user.email, isAdmin: user.isAdmin, isSupport: user.isSupport },
    getSecret(),
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

export function tokenAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.session?.userId) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.slice(7);
  const payload = verifyAuthToken(token);
  if (!payload) {
    return next();
  }

  req.session.userId = payload.userId;
  req.session.email = payload.email;
  req.session.isAdmin = payload.isAdmin;
  req.session.isSupport = payload.isSupport;

  (req as any)._tokenAuth = true;

  next();
}

export function isTokenAuth(req: Request): boolean {
  return !!(req as any)._tokenAuth;
}

export async function refreshAuthToken(req: Request): Promise<string | null> {
  if (!req.session?.userId) return null;
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
    if (!user) return null;
    return signAuthToken({ id: user.id, email: user.email!, isAdmin: user.isAdmin, isSupport: user.isSupport });
  } catch {
    return null;
  }
}

const authCodes = new Map<string, { token: string; expiresAt: number }>();

export function createAuthCode(token: string): string {
  const code = require("crypto").randomBytes(32).toString("hex");
  authCodes.set(code, { token, expiresAt: Date.now() + 60000 });
  return code;
}

export function exchangeAuthCode(code: string): string | null {
  const entry = authCodes.get(code);
  if (!entry) return null;
  authCodes.delete(code);
  if (Date.now() > entry.expiresAt) return null;
  return entry.token;
}

setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of authCodes) {
    if (now > entry.expiresAt) authCodes.delete(code);
  }
}, 60000);
