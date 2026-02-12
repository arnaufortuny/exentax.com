import { createLogger } from "./logger";

const log = createLogger('metrics');

interface RouteMetric {
  path: string;
  method: string;
  count: number;
  totalMs: number;
  avgMs: number;
  maxMs: number;
  minMs: number;
  errorCount: number;
  lastHour: { count: number; totalMs: number; errorCount: number; timestamp: number };
}

const metrics = new Map<string, RouteMetric>();
const MAX_TRACKED_ROUTES = 200;

export function recordApiMetric(method: string, path: string, durationMs: number, statusCode: number) {
  const normalizedPath = normalizePath(path);
  const key = `${method}:${normalizedPath}`;

  let metric = metrics.get(key);
  if (!metric) {
    if (metrics.size >= MAX_TRACKED_ROUTES) {
      const entries = Array.from(metrics.entries())
        .sort((a, b) => a[1].count - b[1].count);
      if (entries.length > 0) {
        metrics.delete(entries[0][0]);
      }
    }
    metric = {
      path: normalizedPath,
      method,
      count: 0,
      totalMs: 0,
      avgMs: 0,
      maxMs: 0,
      minMs: Infinity,
      errorCount: 0,
      lastHour: { count: 0, totalMs: 0, errorCount: 0, timestamp: Date.now() },
    };
    metrics.set(key, metric);
  }

  metric.count++;
  metric.totalMs += durationMs;
  metric.avgMs = Math.round(metric.totalMs / metric.count);
  metric.maxMs = Math.max(metric.maxMs, durationMs);
  metric.minMs = Math.min(metric.minMs, durationMs);
  if (statusCode >= 400) metric.errorCount++;

  const now = Date.now();
  if (now - metric.lastHour.timestamp > 3600000) {
    metric.lastHour = { count: 0, totalMs: 0, errorCount: 0, timestamp: now };
  }
  metric.lastHour.count++;
  metric.lastHour.totalMs += durationMs;
  if (statusCode >= 400) metric.lastHour.errorCount++;
}

export function getApiMetrics() {
  const all = Array.from(metrics.values()).map(m => ({
    ...m,
    minMs: m.minMs === Infinity ? 0 : m.minMs,
    lastHourAvgMs: m.lastHour.count > 0 ? Math.round(m.lastHour.totalMs / m.lastHour.count) : 0,
  }));

  const sorted = all.sort((a, b) => b.count - a.count);
  const slowest = [...all].sort((a, b) => b.avgMs - a.avgMs).slice(0, 10);
  const totalRequests = all.reduce((sum, m) => sum + m.count, 0);
  const totalErrors = all.reduce((sum, m) => sum + m.errorCount, 0);
  const overallAvgMs = totalRequests > 0
    ? Math.round(all.reduce((sum, m) => sum + m.totalMs, 0) / totalRequests)
    : 0;

  return {
    routes: sorted.slice(0, 50),
    slowest,
    summary: {
      totalRequests,
      totalErrors,
      errorRate: totalRequests > 0 ? Number(((totalErrors / totalRequests) * 100).toFixed(2)) : 0,
      overallAvgMs,
      trackedRoutes: all.length,
    },
  };
}

function normalizePath(path: string): string {
  return path
    .replace(/\/\d+/g, '/:id')
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid')
    .split('?')[0];
}
