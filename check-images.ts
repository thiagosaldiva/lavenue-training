import { config } from "dotenv";
config({ path: ".env.production" });
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { dishes } from "./drizzle/schema";
import fs from "fs";
import path from "path";

async function main() {
  const tursoClient = createClient({ 
    url: process.env.DATABASE_URL!, 
    authToken: process.env.DATABASE_AUTH_TOKEN!
  });
  const tursoDb = drizzle(tursoClient);

  const allDishes = await tursoDb.select().from(dishes);
  
  let missing = 0;
  const localDir = path.join(process.cwd(), "client", "public");

  for (const dish of allDishes) {
    if (dish.imageUrl) {
      if (dish.imageUrl.startsWith("http")) continue; // External URL
      
      const fullPath = path.join(localDir, dish.imageUrl);
      if (!fs.existsSync(fullPath)) {
        console.log(`MISSING locally: Dish ${dish.id} (${dish.name}) -> ${dish.imageUrl}`);
        missing++;
      } else {
         const dir = path.dirname(fullPath);
         const base = path.basename(fullPath);
         const files = fs.readdirSync(dir);
         if (!files.includes(base)) {
             console.log(`CASE SENSITIVITY MISMATCH: Dish ${dish.id} -> ${dish.imageUrl}`);
             missing++;
             
             // Auto-fix by finding the actual file
             const actualFile = files.find(f => f.toLowerCase() === base.toLowerCase());
             if (actualFile) {
                console.log(`  -> Actual file is: ${actualFile}. Need to fix DB.`);
             }
         }
      }
    } else {
        console.log(`NO IMAGE: Dish ${dish.id} (${dish.name})`);
        missing++;
    }
  }
  console.log(`Total problematic images: ${missing}`);
}
main().catch(console.error);
