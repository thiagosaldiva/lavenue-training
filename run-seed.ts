import { dishes as menuItems } from "./seed-db.mjs";
import { dishes } from "./drizzle/schema";
import { getDb } from "./server/db";

async function main() {
  const db = await getDb();
  if (!db) {
    throw new Error("Failed to get DB instance");
  }

  const currentItems = await db.select().from(dishes);
  if (currentItems.length > 0) {
    console.log(`Already seeded! Found ${currentItems.length} dishes.`);
    return;
  }

  console.log(`Seeding ${menuItems.length} dishes...`);
  let count = 0;
  for (const item of menuItems) {
    const { name, nameFr, category, description, imageUrl, price } = item;
    
    const ingredients = item.ingredients ? JSON.parse(item.ingredients) : [];
    const allergens = item.allergens ? JSON.parse(item.allergens) : [];
    const preparation = item.preparation || "";
    const curiosity = item.curiosity || "";
    const isNew = item.isNew || false;
    const isPromo = item.isPromo || false;
    
    await db.insert(dishes).values({
      name, 
      nameFr, 
      category: category as any, 
      description, 
      ingredients, 
      allergens, 
      preparation, 
      curiosity, 
      imageUrl, 
      price, 
      isNew, 
      isPromo
    });
    console.log(`  ✓ Inserted ${name}`);
    count++;
  }
  
  console.log(`\nDone! Successfully seeded ${count} dishes!`);
}

main().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
