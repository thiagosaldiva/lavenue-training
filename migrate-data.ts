import { config } from "dotenv";
config({ path: ".env.production" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users, dishes } from "./drizzle/schema";

async function main() {
  console.log("Connecting to local DB...");
  const localClient = createClient({ url: "file:local.db" });
  const localDb = drizzle(localClient);

  console.log("Connecting to Turso DB...");
  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL");
  
  const tursoClient = createClient({ 
    url: process.env.DATABASE_URL, 
    authToken: process.env.DATABASE_AUTH_TOKEN 
  });
  const tursoDb = drizzle(tursoClient);

  console.log("Reading local users...");
  const allUsers = await localDb.select().from(users);
  if (allUsers.length > 0) {
    console.log(`Inserting ${allUsers.length} users into Turso...`);
    for (const user of allUsers) {
      await tursoDb.insert(users).values(user).onConflictDoNothing();
    }
  }

  console.log("Reading local dishes...");
  const allDishes = await localDb.select().from(dishes);
  if (allDishes.length > 0) {
    console.log(`Inserting ${allDishes.length} dishes into Turso...`);
    for (const dish of allDishes) {
       await tursoDb.insert(dishes)
         .values(dish)
         .onConflictDoUpdate({
           target: dishes.id,
           set: dish
         });
    }
  }

  console.log("Migration complete!");
}
main().catch(console.error);
