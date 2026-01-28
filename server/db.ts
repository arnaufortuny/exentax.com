import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Add SSL mode to connection string if not present to resolve warnings and improve stability
const connectionString = process.env.DATABASE_URL!;
const finalUrl = !connectionString.includes("sslmode=") 
  ? `${connectionString}${connectionString.includes("?") ? "&" : "?"}sslmode=require`
  : connectionString;

export const pool = new Pool({ 
  connectionString: finalUrl,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 20000, // Safe timeout for all environments
  idleTimeoutMillis: 30000,
  max: 10,
});
export const db = drizzle(pool, { schema });
