// lib/migrations.js
import fs from "fs";
import path from "path";
import { query } from "@/lib/db";

export async function runMigrations() {
  console.log("🔍 Looking for migration files...");

  const migrationsDir = path.join(process.cwd(), "migrations");
  const files = fs.readdirSync(migrationsDir).sort(); // ensures 001, 002 order

  for (const file of files) {
    if (!file.endsWith(".sql")) continue;

    console.log(`\n⏳ Running migration: ${file}`);

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

    try {
      await query(sql);
      console.log(`✅ Migration success: ${file}`);
    } catch (err) {
      console.error(`❌ Migration error in ${file}:`, err);
      throw err; // stops remaining migrations
    }
  }

  console.log("\n✨ All migrations completed");
}
