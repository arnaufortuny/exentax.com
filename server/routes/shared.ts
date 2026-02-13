import type { Express, Request, Response, NextFunction } from "express";
import { db } from "../db";
import { storage } from "../storage";
import { orders as ordersTable, users as usersTable } from "@shared/schema";
import { and, eq, gt, sql } from "drizzle-orm";
import { logAudit, getClientIp } from "../lib/security";
import { isAuthenticated, isAdmin, isAdminOrSupport, isNotUnderReview, hasPermission, hasAnyPermission } from "../lib/custom-auth";
import { createLogger } from "../lib/logger";

const log = createLogger('shared');

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const statsCache = new Map<string, CacheEntry<any>>();
const STATS_CACHE_TTL = 30000;
const STATS_CACHE_MAX_SIZE = 100;

export function getCachedData<T>(key: string): T | null {
  const entry = statsCache.get(key);
  if (entry && Date.now() - entry.timestamp < STATS_CACHE_TTL) {
    return entry.data as T;
  }
  return null;
}

export function setCachedData<T>(key: string, data: T): void {
  if (statsCache.size >= STATS_CACHE_MAX_SIZE) {
    const now = Date.now();
    const entries = Array.from(statsCache.entries());
    for (const [k, v] of entries) {
      if (now - v.timestamp >= STATS_CACHE_TTL) {
        statsCache.delete(k);
      }
    }
    if (statsCache.size >= STATS_CACHE_MAX_SIZE) {
      const oldest = Array.from(statsCache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
      for (let i = 0; i < Math.ceil(STATS_CACHE_MAX_SIZE / 4); i++) {
        statsCache.delete(oldest[i][0]);
      }
    }
  }
  statsCache.set(key, { data, timestamp: Date.now() });
}

const ipOrderTracker = new Map<string, number[]>();
const IP_BLOCK_THRESHOLD = 7;
const IP_BLOCK_DURATION = 24 * 60 * 60 * 1000;

export function startIpTrackerCleanup() {
  setInterval(() => {
    const cutoff = Date.now() - IP_BLOCK_DURATION;
    ipOrderTracker.forEach((timestamps, ip) => {
      const valid = timestamps.filter(t => t > cutoff);
      if (valid.length === 0) {
        ipOrderTracker.delete(ip);
      } else {
        ipOrderTracker.set(ip, valid);
      }
    });
  }, 3600000);
}

export function isIpBlockedFromOrders(ip: string): { blocked: boolean; ordersCount?: number } {
  const timestamps = ipOrderTracker.get(ip) || [];
  const cutoff = Date.now() - IP_BLOCK_DURATION;
  const recentCount = timestamps.filter(t => t > cutoff).length;
  return { blocked: recentCount >= IP_BLOCK_THRESHOLD, ordersCount: recentCount };
}

export function trackOrderByIp(ip: string): void {
  const timestamps = ipOrderTracker.get(ip) || [];
  timestamps.push(Date.now());
  ipOrderTracker.set(ip, timestamps);
}

export async function detectSuspiciousOrderActivity(userId: string): Promise<{ suspicious: boolean; reason?: string }> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentOrders = await db.select({ id: ordersTable.id, createdAt: ordersTable.createdAt })
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.userId, userId),
        gt(ordersTable.createdAt, oneDayAgo)
      )
    );
  
  if (recentOrders.length >= 7) {
    return { suspicious: true, reason: `Created ${recentOrders.length} orders in 24 hours` };
  }
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const veryRecentOrders = recentOrders.filter(o => o.createdAt && new Date(o.createdAt) > oneHourAgo);
  if (veryRecentOrders.length >= 4) {
    return { suspicious: true, reason: `Created ${veryRecentOrders.length} orders in 1 hour` };
  }
  
  return { suspicious: false };
}

export async function flagAccountForReview(userId: string, reason: string): Promise<void> {
  await db.update(usersTable)
    .set({ 
      accountStatus: 'pending',
      securityOtpRequired: true,
      internalNotes: sql`COALESCE(${usersTable.internalNotes}, '') || E'\n[' || NOW() || '] SECURITY FLAG: ' || ${reason}`
    })
    .where(eq(usersTable.id, userId));
  
  logAudit({ 
    action: 'account_flagged_for_review', 
    userId, 
    details: { reason }
  });
}

export const logActivity = async (title: string, data: any, _req?: any) => {
  if (process.env.NODE_ENV === 'development') {
    log.debug(`${title}:`, data);
  }
};

export function parseIdParam(req: any, paramName = 'id'): number {
  const id = Number(req.params[paramName]);
  if (isNaN(id) || id <= 0) {
    const err: any = new Error(`Invalid ${paramName} parameter`);
    err.status = 400;
    throw err;
  }
  return id;
}

export const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export { withRetry } from "../lib/db-utils";
export { db, storage, isAuthenticated, isAdmin, isAdminOrSupport, isNotUnderReview, hasPermission, hasAnyPermission, logAudit, getClientIp };
