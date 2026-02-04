import { db } from "../db";
import { sql, desc } from "drizzle-orm";
import { checkRateLimitInMemory, checkRateLimit as checkRateLimitAuto } from "./rate-limiter";
import { auditLogs } from "@shared/schema";

export { checkRateLimitInMemory as checkRateLimit };
export { checkRateLimitAuto };

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
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "La contraseña debe contener al menos una letra mayúscula" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "La contraseña debe contener al menos una letra minúscula" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "La contraseña debe contener al menos un número" };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: "La contraseña debe contener al menos un símbolo especial (!@#$%^&*...)" };
  }
  return { valid: true };
}

export function getPasswordRequirements(): string[] {
  return [
    "Mínimo 8 caracteres",
    "Al menos una mayúscula (A-Z)",
    "Al menos una minúscula (a-z)",
    "Al menos un número (0-9)",
    "Al menos un símbolo (!@#$%^&*...)"
  ];
}

export type AuditAction = 
  | 'user_login'
  | 'user_logout'
  | 'user_register'
  | 'password_change'
  | 'password_reset'
  | 'admin_password_reset'
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
  | 'security_otp_required'
  | 'ip_order_blocked'
  | 'backup_completed'
  | 'backup_failed'
  | 'admin_create_maintenance_order'
  | 'consultation_booked'
  | 'consultation_cancelled'
  | 'consultation_type_created'
  | 'consultation_updated'
  | 'consultation_rescheduled'
  | 'accounting_transaction_created'
  | 'accounting_transaction_updated'
  | 'accounting_transaction_deleted';

interface AuditLogEntry {
  action: AuditAction;
  userId?: string;
  targetId?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const memoryAuditLogs: AuditLogEntry[] = [];
const MAX_MEMORY_LOGS = 1000;

export function logAudit(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date(),
  };
  
  memoryAuditLogs.push(logEntry);
  if (memoryAuditLogs.length > MAX_MEMORY_LOGS) {
    memoryAuditLogs.shift();
  }
  
  db.insert(auditLogs).values({
    action: entry.action,
    userId: entry.userId || null,
    targetId: entry.targetId || null,
    ip: entry.ip || null,
    userAgent: entry.userAgent || null,
    details: entry.details || null,
  }).catch(err => {
    console.error("[AUDIT] Failed to persist audit log:", err.message);
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUDIT] ${entry.action}:`, {
      userId: entry.userId,
      targetId: entry.targetId,
      ip: entry.ip,
      details: entry.details
    });
  }
}

export function getRecentAuditLogs(limit: number = 100): AuditLogEntry[] {
  return memoryAuditLogs.slice(-limit).reverse();
}

export async function getAuditLogsFromDb(options: {
  limit?: number;
  offset?: number;
  action?: string;
  userId?: string;
} = {}): Promise<{ logs: any[]; total: number }> {
  const { limit = 100, offset = 0, action, userId } = options;
  
  try {
    let query = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
    
    const logs = await query.limit(limit).offset(offset);
    
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(auditLogs);
    const total = Number(countResult[0]?.count || 0);
    
    return { logs, total };
  } catch (error) {
    console.error("[AUDIT] Failed to fetch logs from DB:", error);
    return { logs: [], total: 0 };
  }
}

export async function cleanupOldAuditLogs(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await db.execute(sql`
      DELETE FROM audit_logs 
      WHERE created_at < ${cutoffDate}
    `);
    
    return Number((result as any).rowCount || 0);
  } catch (error) {
    console.error("[AUDIT] Failed to cleanup old logs:", error);
    return 0;
  }
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
