import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { getAllDishes, getDishById, createDish, updateDish, deleteDish, getDishCount } from "./db";
import { storagePut } from "./storage";
import { z } from "zod";
import { nanoid } from "nanoid";

const dishInputSchema = z.object({
  name: z.string().min(1),
  nameFr: z.string().default(""),
  category: z.enum(["entradas", "massas", "pratos-principais", "sobremesas"]),
  description: z.string().default(""),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  preparation: z.string().default(""),
  curiosity: z.string().default(""),
  imageUrl: z.string().default(""),
  imageKey: z.string().default(""),
  price: z.string().default(""),
  isNew: z.boolean().default(false),
  isPromo: z.boolean().default(false),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  dishes: router({
    // Public: list all dishes
    list: publicProcedure.query(async () => {
      return getAllDishes();
    }),

    // Public: get single dish
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getDishById(input.id);
      }),

    // Admin: create dish
    create: adminProcedure
      .input(dishInputSchema)
      .mutation(async ({ input }) => {
        return createDish(input);
      }),

    // Admin: update dish
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: dishInputSchema.partial(),
      }))
      .mutation(async ({ input }) => {
        return updateDish(input.id, input.data);
      }),

    // Admin: delete dish
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteDish(input.id);
        return { success: true };
      }),

    // Admin: reorder dishes
    reorder: adminProcedure
      .input(z.array(z.object({ id: z.number(), sortOrder: z.number() })))
      .mutation(async ({ input }) => {
        // Run updates sequentially
        for (const item of input) {
          await updateDish(item.id, { sortOrder: item.sortOrder } as any);
        }
        return { success: true };
      }),

    // Admin: upload image for a dish
    uploadImage: adminProcedure
      .input(z.object({
        dishId: z.number().optional().default(0),
        imageBase64: z.string(),
        fileName: z.string(),
        contentType: z.string().default("image/jpeg"),
      }))
      .mutation(async ({ input }) => {
        // Decode base64 to buffer
        const buffer = Buffer.from(input.imageBase64, "base64");
        
        // Generate unique key
        const ext = input.fileName.split(".").pop() || "jpg";
        const key = `dishes/${input.dishId}-${nanoid(8)}.${ext}`;
        
        // Upload to S3 (Local)
        const { url } = await storagePut(key, buffer, input.contentType);
        
        // Update dish with new image URL if it exists
        if (input.dishId !== 0) {
          await updateDish(input.dishId, { imageUrl: url, imageKey: key });
        }
        
        return { url, key };
      }),

    // Public: get dish count
    count: publicProcedure.query(async () => {
      return getDishCount();
    }),
  }),
});

export type AppRouter = typeof appRouter;
