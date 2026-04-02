import { db } from '../server/db.ts';
import { dishes } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

async function run() {
  console.log("Updating all existing dishes from entradas-frias to entradas...");
  try {
    const changes = await db.update(dishes)
      .set({ category: 'entradas' })
      .where(eq(dishes.category, 'entradas-frias'));
    console.log("Database update complete! Replaced category legacy.");
  } catch (err) {
    console.error("Migration failed", err);
  }
}

run();
