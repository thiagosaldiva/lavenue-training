import { createClient } from "@libsql/client";
import fs from "fs";
import { config } from "dotenv";

async function run() {
  console.log("Fixing local DB...");
  if (fs.existsSync("local.db")) {
    const local = createClient({ url: "file:local.db" });
    try {
      await local.execute("ALTER TABLE dishes ADD COLUMN isActive INTEGER DEFAULT 1");
      console.log("Added isActive to local.db");
    } catch(e) { 
      console.log("local.db alter failed or column exists:", e.message); 
    }
  }

  console.log("Fixing Turso DB...");
  config({ path: ".env.production" });
  if (process.env.DATABASE_URL) {
    const remote = createClient({ url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN });
    try {
      await remote.execute("ALTER TABLE dishes ADD COLUMN isActive INTEGER DEFAULT 1");
      console.log("Added isActive to Turso");
    } catch(e) { 
      console.log("Turso alter failed or column exists:", e.message); 
    }
  }
}
run();
