import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Optimized connection string processing with simplified pool
let connectionString = process.env.DATABASE_URL!;
if (!connectionString.includes("sslmode=")) {
  connectionString += (connectionString.includes("?") ? "&" : "?") + "sslmode=no-verify";
}

export const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000, // Increase idle timeout to 30s
  max: 20, // Increase max connections to 20
});
export const db = drizzle(pool, { schema });
