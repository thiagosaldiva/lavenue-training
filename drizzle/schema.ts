import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Dishes table for the L'Avenue training menu.
 */
export const dishes = sqliteTable("dishes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  nameFr: text("nameFr").default(""),
  category: text("category", { enum: ["entradas-frias", "entradas", "massas", "pratos-principais", "sobremesas"] }).notNull(),
  description: text("description").default(""),
  ingredients: text("ingredients", { mode: "json" }).$type<string[]>().default([]),
  allergens: text("allergens", { mode: "json" }).$type<string[]>().default([]),
  preparation: text("preparation").default(""),
  curiosity: text("curiosity").default(""),
  imageUrl: text("imageUrl").default(""),
  imageKey: text("imageKey").default(""),
  price: text("price").default(""),
  isNew: integer("isNew", { mode: "boolean" }).default(false),
  isPromo: integer("isPromo", { mode: "boolean" }).default(false),
  isActive: integer("isActive", { mode: "boolean" }).default(true),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Dish = typeof dishes.$inferSelect;
export type InsertDish = typeof dishes.$inferInsert;
