import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

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
  max: 25,
  min: 2,
  allowExitOnIdle: false,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Database connection established');
  }
});

export const db = drizzle(pool, { schema });
