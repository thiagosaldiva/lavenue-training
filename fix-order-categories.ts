import { createClient } from "@libsql/client";
import fs from "fs";
import { config } from "dotenv";

const categoryOrder: Record<string, number> = { 
  "entradas": 1, 
  "massas": 2, 
  "pratos-principais": 3, 
  "sobremesas": 4 
};

async function reorderDB(client: any) {
  const result = await client.execute("SELECT * FROM dishes");
  let dishes = result.rows as any[];
  
  dishes.sort((a, b) => {
    if (a.category !== b.category) return (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
    return a.id - b.id;
  });
  
  console.log(`Found ${dishes.length} dishes to reorder.`);
  
  for (let i = 0; i < dishes.length; i++) {
    const dish = dishes[i];
    const newSort = i * 10;
    await client.execute({
      sql: "UPDATE dishes SET sortOrder = ? WHERE id = ?",
      args: [newSort, dish.id]
    });
  }
}

async function run() {
  console.log("Fixing local DB...");
  if (fs.existsSync("local.db")) {
    const local = createClient({ url: "file:local.db" });
    try {
      await reorderDB(local);
      console.log("Local DB perfectly reordered!");
    } catch(e: any) { 
      console.log("local.db fail:", e.message); 
    }
  }

  console.log("Fixing Turso DB...");
  config({ path: ".env.production" });
  if (process.env.DATABASE_URL) {
    const remote = createClient({ url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN });
    try {
      await reorderDB(remote);
      console.log("Turso DB perfectly reordered!");
    } catch(e: any) { 
      console.log("Turso fail:", e.message); 
    }
  }
}
run();
