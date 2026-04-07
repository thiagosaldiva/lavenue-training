import { config } from "dotenv";
config({ path: ".env.production" });
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { dishes } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  const tursoClient = createClient({ 
    url: process.env.DATABASE_URL!, 
    authToken: process.env.DATABASE_AUTH_TOKEN!
  });
  const tursoDb = drizzle(tursoClient);

  const allDishes = await tursoDb.select().from(dishes);
  
  const catWeights: Record<string, number> = {
    "entradas": 1000,
    "massas": 2000,
    "pratos-principais": 3000,
    "sobremesas": 4000,
  };
  
  allDishes.sort((a, b) => {
      const wA = catWeights[a.category] || 5000;
      const wB = catWeights[b.category] || 5000;
      if (wA !== wB) return wA - wB;
      
      const soA = a.sortOrder ?? 9999;
      const soB = b.sortOrder ?? 9999;
      if (soA !== soB) return soA - soB;
      
      return a.name.localeCompare(b.name);
  });
  
  console.log("Aplicando nova ordem...");
  for (let i = 0; i < allDishes.length; i++) {
     const newOrder = (i + 1) * 10;
     await tursoDb.update(dishes).set({ sortOrder: newOrder }).where(eq(dishes.id, allDishes[i].id));
  }
  console.log("Cardápio magicamente organizado por categoria no banco de dados!");
}
main().catch(console.error);
