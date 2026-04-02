import { eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { InsertUser, users, dishes, InsertDish, Dish } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    try {
      const dbUrl = process.env.DATABASE_URL || "file:local.db";
      const dbToken = process.env.DATABASE_AUTH_TOKEN;
      const client = createClient({
        url: dbUrl,
        ...(dbToken ? { authToken: dbToken } : {})
      });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= DISH CRUD =============

export async function getAllDishes(): Promise<Dish[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dishes).orderBy(dishes.sortOrder, dishes.id);
}

export async function getDishById(id: number): Promise<Dish | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(dishes).where(eq(dishes.id, id)).limit(1);
  return result[0];
}

export async function createDish(dish: Omit<InsertDish, "id" | "createdAt" | "updatedAt">): Promise<Dish> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(dishes).values(dish).returning();
  if (!result || result.length === 0) throw new Error("Failed to create dish");
  return result[0];
}

export async function updateDish(id: number, updates: Partial<InsertDish>): Promise<Dish | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(dishes).set(updates).where(eq(dishes.id, id));
  return getDishById(id);
}

export async function deleteDish(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(dishes).where(eq(dishes.id, id));
}

export async function searchDishes(query: string): Promise<Dish[]> {
  const db = await getDb();
  if (!db) return [];
  
  const q = `%${query}%`;
  return db.select().from(dishes).where(
    or(
      like(dishes.name, q),
      like(dishes.nameFr, q),
      like(dishes.description, q),
      like(dishes.curiosity, q),
      sql`${dishes.ingredients} LIKE ${q}`
    )
  ).orderBy(dishes.sortOrder, dishes.id);
}

export async function getDishCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(dishes);
  return result[0]?.count ?? 0;
}
