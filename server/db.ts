import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { createLogger } from "./lib/logger";

const log = createLogger('db');

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let connectionString = process.env.DATABASE_URL!;
if (!connectionString.includes("sslmode=")) {
  connectionString += (connectionString.includes("?") ? "&" : "?") + "sslmode=no-verify";
}

export const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 60000,
  max: 20,
  min: 2,
  allowExitOnIdle: false,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
  log.error('Database pool error', err);
});

pool.on('connect', () => {
  log.debug('Database connection established');
});

export const db = drizzle(pool, { schema });

export async function checkDatabaseHealth(): Promise<{ healthy: boolean; latencyMs?: number; error?: string }> {
  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return { healthy: true, latencyMs: Date.now() - start };
    } finally {
      client.release();
    }
  } catch (err: any) {
    log.error('Database health check failed', err);
    return { healthy: false, latencyMs: Date.now() - start, error: err.message };
  }
}
