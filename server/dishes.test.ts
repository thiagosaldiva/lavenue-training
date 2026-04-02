import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@lavenue.com",
    name: "Admin L'Avenue",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@lavenue.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("dishes router", () => {
  describe("dishes.list", () => {
    it("returns an array of dishes (public access)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.dishes.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("each dish has required fields", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.dishes.list();

      const dish = result[0];
      expect(dish).toHaveProperty("id");
      expect(dish).toHaveProperty("name");
      expect(dish).toHaveProperty("category");
      expect(dish).toHaveProperty("description");
      expect(dish).toHaveProperty("ingredients");
      expect(dish).toHaveProperty("allergens");
      expect(dish).toHaveProperty("imageUrl");
      expect(dish).toHaveProperty("createdAt");
      expect(dish).toHaveProperty("updatedAt");
    });
  });

  describe("dishes.getById", () => {
    it("returns a single dish by id (public access)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const allDishes = await caller.dishes.list();
      const firstId = allDishes[0].id;

      const dish = await caller.dishes.getById({ id: firstId });
      expect(dish).toBeDefined();
      expect(dish?.name).toBe(allDishes[0].name);
    });

    it("returns undefined for non-existent id", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const dish = await caller.dishes.getById({ id: 99999 });
      expect(dish).toBeUndefined();
    });
  });

  describe("dishes.count", () => {
    it("returns the total number of dishes (public access)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const count = await caller.dishes.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe("admin-only operations", () => {
    it("rejects create from unauthenticated user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.dishes.create({
          name: "Test Dish",
          category: "entradas-frias",
        })
      ).rejects.toThrow();
    });

    it("rejects create from regular user (non-admin)", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.dishes.create({
          name: "Test Dish",
          category: "entradas-frias",
        })
      ).rejects.toThrow();
    });

    it("rejects update from unauthenticated user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.dishes.update({ id: 1, data: { name: "Hacked" } })
      ).rejects.toThrow();
    });

    it("rejects delete from regular user", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.dishes.delete({ id: 1 })
      ).rejects.toThrow();
    });

    it("rejects uploadImage from unauthenticated user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.dishes.uploadImage({
          dishId: 1,
          imageBase64: "dGVzdA==",
          fileName: "test.jpg",
          contentType: "image/jpeg",
        })
      ).rejects.toThrow();
    });

    it("allows admin to create a dish", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.dishes.create({
        name: "Vitest Prato Teste",
        category: "sobremesas",
        description: "Um prato criado pelo vitest",
        ingredients: ["chocolate", "creme"],
        allergens: ["lactose"],
        price: "R$ 42,00",
      });

      expect(result).toBeDefined();
      expect(result.id).toBeGreaterThan(0);

      // Cleanup: delete the test dish
      await caller.dishes.delete({ id: result.id });
    });

    it("allows admin to update a dish", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Create a test dish
      const created = await caller.dishes.create({
        name: "Update Test",
        category: "massas",
      });

      // Update it
      await caller.dishes.update({
        id: created.id,
        data: { name: "Updated Name", price: "R$ 99,00" },
      });

      // Verify
      const updated = await caller.dishes.getById({ id: created.id });
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.price).toBe("R$ 99,00");

      // Cleanup
      await caller.dishes.delete({ id: created.id });
    });

    it("allows admin to delete a dish", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Create a test dish
      const created = await caller.dishes.create({
        name: "Delete Test",
        category: "entradas-frias",
      });

      // Delete it
      const result = await caller.dishes.delete({ id: created.id });
      expect(result).toEqual({ success: true });

      // Verify it's gone
      const deleted = await caller.dishes.getById({ id: created.id });
      expect(deleted).toBeUndefined();
    });
  });
});
