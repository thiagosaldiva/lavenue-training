import { createClient } from "@libsql/client";

async function run() {
  const client = createClient({ url: "file:local.db" });
  try {
    console.log("Adding sortOrder column...");
    await client.execute("ALTER TABLE dishes ADD COLUMN sortOrder INTEGER NOT NULL DEFAULT 0");
    console.log("✅ Column sortOrder added!");
  } catch (err) {
    if (err.message.includes("duplicate column name")) {
      console.log("ℹ️ Column sortOrder already exists.");
    } else {
      console.error("❌ Failed to add column:", err.message);
    }
  }

  try {
    console.log("Migrating category names...");
    // Update all existing dishes from entradas-frias to entradas
    await client.execute("UPDATE dishes SET category = 'entradas' WHERE category = 'entradas-frias'");
    console.log("✅ Categories migrated!");
  } catch (err) {
    console.error("❌ Failed to migrate categories:", err.message);
  }
}

run();
