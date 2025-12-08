// lib/db.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // <--- MUST COME FIRST

import { Pool } from "pg";

// Create pool AFTER env is loaded
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL connected");
});

export async function query(text, params) {
  const start = Date.now();

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    console.log("Query executed", {
      text,
      duration: `${duration}ms`,
      rows: res.rowCount,
    });

    return res;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * Acquire a client for manual transaction control.
 * Caller is responsible for calling `client.release()` when done.
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}

/**
 * Lightweight check to ensure DB is reachable. Some API handlers call this.
 */
export async function connectDB() {
  // execute a simple query to verify connection
  await pool.query("SELECT 1");
  return true;
}

export { pool };
