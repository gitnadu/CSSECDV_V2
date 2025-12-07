import { Pool } from "pg";

// IMPORTANT: Next.js serverless functions may run many times,
// so we must avoid creating a NEW pool each time.
// We store the pool in globalThis to reuse it across invocations.

let pool;

if (!global.pgPool) {
  global.pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  global.pgPool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client", err);
  });

  global.pgPool.on("connect", () => {
    console.log("✅ PostgreSQL connected (Next.js serverless pool)");
  });
}

pool = global.pgPool;

// ----- Query helper -----
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

// ----- Get client (for transactions) -----
export async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query;
  const originalRelease = client.release;

  const timeout = setTimeout(() => {
    console.error("⚠️ Client has been checked out for more than 5 seconds!");
  }, 5000);

  client.query = (...args) => {
    client.lastQuery = args;
    return originalQuery.apply(client, args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease.apply(client);
  };

  return client;
}

export { pool };
