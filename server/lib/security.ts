import { db } from "../db";
import { sql } from "drizzle-orm";

const RATE_LIMITS: Record<string, { windowMs: number; maxRequests: number }> = {
  login: { windowMs: 900000, maxRequests: 5 },
  otp: { windowMs: 300000, maxRequests: 3 },
  register: { windowMs: 3600000, maxRequests: 3 },
  passwordReset: { windowMs: 600000, maxRequests: 3 },
  contact: { windowMs: 300000, maxRequests: 5 },
  general: { windowMs: 60000, maxRequests: 100 },
};

const rateLimitStore = new Map<string, Map<string, number[]>>();

Object.keys(RATE_LIMITS).forEach(key => {
  rateLimitStore.set(key, new Map());
});

export function checkRateLimit(type: keyof typeof RATE_LIMITS, identifier: string): { allowed: boolean; retryAfter?: number } {
  const config = RATE_LIMITS[type];
  const store = rateLimitStore.get(type)!;
  const now = Date.now();
  
  const timestamps = store.get(identifier) || [];
  const validTimestamps = timestamps.filter(t => now - t < config.windowMs);
  
  if (validTimestamps.length >= config.maxRequests) {
    const oldestValid = Math.min(...validTimestamps);
    const retryAfter = Math.ceil((config.windowMs - (now - oldestValid)) / 1000);
    return { allowed: false, retryAfter };
  }
  
  validTimestamps.push(now);
  store.set(identifier, validTimestamps);
  return { allowed: true };
}

export function cleanupRateLimits(): void {
  const now = Date.now();
  const storeEntries = Array.from(rateLimitStore.entries());
  for (let i = 0; i < storeEntries.length; i++) {
    const [type, store] = storeEntries[i];
    const config = RATE_LIMITS[type as keyof typeof RATE_LIMITS];
    const ipEntries = Array.from(store.entries());
    for (let j = 0; j < ipEntries.length; j++) {
      const [ip, timestamps] = ipEntries[j];
      const valid = timestamps.filter((t: number) => now - t < config.windowMs);
      if (valid.length === 0) {
        store.delete(ip);
      } else {
        store.set(ip, valid);
      }
    }
  }
}

setInterval(cleanupRateLimits, 300000);

export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#96;')
    .trim();
}

export function sanitizeObject<T extends Record<string, any>>(obj: T, fieldsToSanitize: (keyof T)[]): T {
  const result = { ...obj };
  for (const field of fieldsToSanitize) {
    if (typeof result[field] === 'string') {
      result[field] = sanitizeHtml(result[field] as string) as T[keyof T];
    }
  }
  return result;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s+\-().]{6,20}$/;
  return phoneRegex.test(phone);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "La contraseña debe tener al menos 8 caracteres" };
  }
  if (password.length > 128) {
    return { valid: false, message: "La contraseña es demasiado larga" };
  }
  return { valid: true };
}

export type AuditAction = 
  | 'user_login'
  | 'user_logout'
  | 'user_register'
  | 'password_change'
  | 'password_reset'
  | 'order_created'
  | 'order_status_change'
  | 'order_completed'
  | 'payment_received'
  | 'payment_link_update'
  | 'admin_user_update'
  | 'admin_order_update'
  | 'admin_send_email'
  | 'document_upload'
  | 'document_request'
  | 'account_locked'
  | 'account_unlocked'
  | 'account_status_change'
  | 'account_flagged_for_review'
  | 'security_otp_required';

interface AuditLogEntry {
  action: AuditAction;
  userId?: string;
  targetId?: string;
  ip?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const auditLogs: AuditLogEntry[] = [];
const MAX_AUDIT_LOGS = 10000;

export function logAudit(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date(),
  };
  
  auditLogs.push(logEntry);
  
  if (auditLogs.length > MAX_AUDIT_LOGS) {
    auditLogs.shift();
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUDIT] ${entry.action}:`, {
      userId: entry.userId,
      targetId: entry.targetId,
      details: entry.details
    });
  }
}

export function getRecentAuditLogs(limit: number = 100): AuditLogEntry[] {
  return auditLogs.slice(-limit).reverse();
}

export async function checkDatabaseHealth(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    return { healthy: true, latencyMs: Date.now() - start };
  } catch (error) {
    return { 
      healthy: false, 
      latencyMs: Date.now() - start, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getSystemHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: { healthy: boolean; latencyMs: number };
  memory: { usedMB: number; totalMB: number; percentUsed: number };
  uptime: number;
}> {
  const dbHealth = await checkDatabaseHealth();
  
  const memUsage = process.memoryUsage();
  const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const percentUsed = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
  
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (!dbHealth.healthy) {
    status = 'unhealthy';
  } else if (dbHealth.latencyMs > 1000 || percentUsed > 90) {
    status = 'degraded';
  }
  
  return {
    status,
    database: { healthy: dbHealth.healthy, latencyMs: dbHealth.latencyMs },
    memory: { usedMB, totalMB, percentUsed },
    uptime: process.uptime(),
  };
}

export function getClientIp(req: { ip?: string; headers: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ip.trim();
  }
  return req.ip || 'unknown';
}
