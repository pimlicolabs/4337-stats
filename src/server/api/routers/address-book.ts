import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";

export const addressBookRouter = createTRPCRouter({
  getPaymasters: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.envioDb.execute<{
      name: string;
      address: string;
      type: string;
    }>(sql`
            SELECT
                name, address
            FROM
                paymasters
    `);

    return result;
  }),
  getBundlers: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.envioDb.execute<{
      name: string;
      address: string;
    }>(sql`
            SELECT
                name, address
            FROM
                bundlers
    `);

    return result;
  }),
  getFactories: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.envioDb.execute<{
      name: string;
      address: string;
    }>(sql`
            SELECT
                name, address
            FROM
                factories
    `);

    return result;
  }),
});
