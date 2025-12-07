// scripts/runMigrations.js
// Run with: node scripts/runMigrations.js

import { runMigrations } from "../lib/migrations.js";
import dotenv from "dotenv";

// Load .env.local or environment variables
dotenv.config({ path: ".env.local" });

async function main() {
  console.log("===========================================");
  console.log("🔄 Starting database migrations...");
  console.log("===========================================");

  try {
    await runMigrations();
    console.log("===========================================");
    console.log("🎉 Migrations completed successfully!");
    console.log("===========================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

main();
