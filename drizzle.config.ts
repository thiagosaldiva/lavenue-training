import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL || "file:local.db";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: connectionString,
    ...(process.env.DATABASE_AUTH_TOKEN ? { authToken: process.env.DATABASE_AUTH_TOKEN } : {}),
  },
});
