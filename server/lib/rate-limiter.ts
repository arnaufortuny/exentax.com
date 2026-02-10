import { db } from "../db";
import { sql } from "drizzle-orm";
import { createLogger } from "./logger";

const log = createLogger('rate-limiter');

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: { windowMs: 900000, maxRequests: 5 },
  otp: { windowMs: 300000, maxRequests: 3 },
  register: { windowMs: 3600000, maxRequests: 3 },
  passwordReset: { windowMs: 600000, maxRequests: 3 },
  contact: { windowMs: 300000, maxRequests: 5 },
  consultation: { windowMs: 3600000, maxRequests: 5 },
  general: { windowMs: 60000, maxRequests: 100 },
  api: { windowMs: 60000, maxRequests: 100 },
};

const inMemoryStore = new Map<string, Map<string, number[]>>();

Object.keys(RATE_LIMITS).forEach(key => {
  inMemoryStore.set(key, new Map());
});

export function checkRateLimitInMemory(
  type: keyof typeof RATE_LIMITS, 
  identifier: string
): { allowed: boolean; retryAfter?: number } {
  const config = RATE_LIMITS[type];
  if (!config) return { allowed: true };
  
  const store = inMemoryStore.get(type)!;
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

export function cleanupInMemoryRateLimits(): void {
  const now = Date.now();
  const storeEntries = Array.from(inMemoryStore.entries());
  
  for (const [type, store] of storeEntries) {
    const config = RATE_LIMITS[type as keyof typeof RATE_LIMITS];
    if (!config) continue;
    
    const ipEntries = Array.from(store.entries());
    for (const [ip, timestamps] of ipEntries) {
      const valid = timestamps.filter((t: number) => now - t < config.windowMs);
      if (valid.length === 0) {
        store.delete(ip);
      } else {
        store.set(ip, valid);
      }
    }
  }
}

setInterval(cleanupInMemoryRateLimits, 300000);

export async function checkRateLimitDb(
  type: string,
  identifier: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const config = RATE_LIMITS[type as keyof typeof RATE_LIMITS] || RATE_LIMITS.general;
  
  try {
    const windowStart = new Date(Date.now() - config.windowMs);
    
    const result = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM rate_limit_entries 
      WHERE identifier = ${identifier} 
        AND limit_type = ${type}
        AND created_at > ${windowStart}
    `);
    
    const count = Number((result.rows[0] as any)?.count || 0);
    
    if (count >= config.maxRequests) {
      const retryAfter = Math.ceil(config.windowMs / 1000);
      return { allowed: false, retryAfter };
    }
    
    await db.execute(sql`
      INSERT INTO rate_limit_entries (identifier, limit_type, created_at)
      VALUES (${identifier}, ${type}, NOW())
    `);
    
    return { allowed: true };
  } catch (error) {
    log.error("Rate limit DB error, falling back to memory", error);
    return checkRateLimitInMemory(type as keyof typeof RATE_LIMITS, identifier);
  }
}

export async function cleanupDbRateLimits(): Promise<void> {
  try {
    const oldestAllowed = new Date(Date.now() - 3600000);
    await db.execute(sql`
      DELETE FROM rate_limit_entries 
      WHERE created_at < ${oldestAllowed}
    `);
  } catch (error) {
    log.error("Rate limit cleanup error", error);
  }
}

export function getRateLimitConfig(type: string): RateLimitConfig {
  return RATE_LIMITS[type as keyof typeof RATE_LIMITS] || RATE_LIMITS.general;
}

const isProduction = process.env.NODE_ENV === "production";

export async function checkRateLimit(
  type: string,
  identifier: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  if (isProduction) {
    return checkRateLimitDb(type, identifier);
  }
  return checkRateLimitInMemory(type as keyof typeof RATE_LIMITS, identifier);
}

export { RATE_LIMITS };
