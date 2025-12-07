#!/usr/bin/env node

/**
 * runSeed.js
 * Executes the database seed file against the PostgreSQL database.
 *
 * Usage:
 *   node scripts/runSeed.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------
// 1. Load seed.sql
// -------------------------------
const seedPath = path.join(__dirname, "..", "database", "seed.sql");

if (!fs.existsSync(seedPath)) {
  console.error("❌ seed.sql not found at:", seedPath);
  process.exit(1);
}

const seedSQL = fs.readFileSync(seedPath, "utf8");

// -------------------------------
// 2. Create dedicated pool
// (Serverless pool should NOT be used for CLI scripts)
// -------------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// -------------------------------
// 3. Run seed SQL
// -------------------------------
async function runSeed() {
  console.log("🌱 Running database seed...");

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Execute entire SQL file
    await client.query(seedSQL);

    await client.query("COMMIT");
    console.log("✅ Database seeding completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Failed to run seed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// -------------------------------
// 4. Execute
// -------------------------------
runSeed();
