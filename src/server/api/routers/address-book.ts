import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { paymasters, bundlers, factories } from "../../../../db/schema";

export const addressBookRouter = createTRPCRouter({
  getPaymasters: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.envioDb
      .select({
        name: paymasters.name,
        address: paymasters.address,
        type: paymasters.type,
      })
      .from(paymasters)
      .execute();

    return result;
  }),
  getBundlers: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.envioDb
      .select({
        name: bundlers.name,
        address: bundlers.address,
      })
      .from(bundlers)
      .execute();

    return result;
  }),
  getFactories: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.envioDb
      .select({
        name: factories.name,
        address: factories.address,
      })
      .from(factories)
      .execute();

    return result;
  }),
});
