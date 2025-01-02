import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import { and, gte, lte, inArray, eq } from "drizzle-orm";
import { paymasterHourlyMetricsNew, paymasters } from "../../../../db/schema";

export const paymastersRouter = createTRPCRouter({
  getTotalOpsSponsored: publicProcedure
    .input(
      z.object({
        paymasters: z.array(z.string()), // column `name` in paymasters table
        startDate: z.date(),
        endDate: z.date(),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [totalSponsoredOps] = await ctx.envioDb
        .select({
          total_sponsored_ops: sql<string>`SUM(${paymasterHourlyMetricsNew.totalSponsoredOperationCount})`,
        })
        .from(paymasterHourlyMetricsNew)
        .leftJoin(
          paymasters,
          eq(paymasterHourlyMetricsNew.paymasterAddress, paymasters.address)
        )
        .where(
          and(
            gte(paymasterHourlyMetricsNew.hour, input.startDate),
            lte(paymasterHourlyMetricsNew.hour, input.endDate),
            inArray(paymasters.name, input.paymasters),
            inArray(paymasterHourlyMetricsNew.chainId, input.chainIds)
          )
        )
        .execute();

      return Number(totalSponsoredOps?.total_sponsored_ops);
    }),
  getSponsoredByPaymaster: publicProcedure
    .input(
      z.object({
        paymasters: z.array(z.string()), // column `name` in paymasters table
        startDate: z.date(),
        endDate: z.date(),
        chainIds: z.array(z.number()),
        resolution: z.enum(["hour", "day", "week", "month"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb
        .select({
          platform: paymasters.name,
          time: sql<string>`DATE_TRUNC(${input.resolution}, ${paymasterHourlyMetricsNew.hour})`,
          total_sponsored_ops: sql<string>`SUM(${paymasterHourlyMetricsNew.totalSponsoredOperationCount})`,
        })
        .from(paymasterHourlyMetricsNew)
        .leftJoin(
          paymasters,
          eq(paymasterHourlyMetricsNew.paymasterAddress, paymasters.address)
        )
        .where(
          and(
            gte(paymasterHourlyMetricsNew.hour, input.startDate),
            lte(paymasterHourlyMetricsNew.hour, input.endDate),
            inArray(paymasters.name, input.paymasters),
            inArray(paymasterHourlyMetricsNew.chainId, input.chainIds)
          )
        )
        .groupBy(sql`platform, time`)
        .orderBy(sql`time, platform`)
        .execute();

      const metricsMap: Record<string, Record<string, any>> = {};

      for (const row of results) {
        const { time, platform, total_sponsored_ops } = row;
        if (time && platform) {
          const timeStr = time.toString();
          metricsMap[timeStr] ??= { date: timeStr };
          metricsMap[timeStr][platform] = Number(total_sponsored_ops ?? 0);
        }
      }

      return Object.values(metricsMap);
    }),
  getSponsoredOpsByChain: publicProcedure
    .input(
      z.object({
        paymasters: z.array(z.string()), // column `name` in paymasters table
        startDate: z.date(),
        endDate: z.date(),
        chainIds: z.array(z.number()),
        resolution: z.enum(["hour", "day", "week", "month"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb
        .select({
          platform: paymasters.name,
          chain_id: paymasterHourlyMetricsNew.chainId,
          count: sql<string>`SUM(${paymasterHourlyMetricsNew.totalSponsoredOperationCount})`,
        })
        .from(paymasterHourlyMetricsNew)
        .leftJoin(
          paymasters,
          eq(paymasterHourlyMetricsNew.paymasterAddress, paymasters.address)
        )
        .where(
          and(
            gte(paymasterHourlyMetricsNew.hour, input.startDate),
            lte(paymasterHourlyMetricsNew.hour, input.endDate),
            inArray(paymasterHourlyMetricsNew.chainId, input.chainIds),
            inArray(paymasters.name, input.paymasters)
          )
        )
        .groupBy(sql`${paymasters.name}, ${paymasterHourlyMetricsNew.chainId}`)
        .orderBy(sql`${paymasters.name}, ${paymasterHourlyMetricsNew.chainId}`)
        .execute();

      const metricsMap: Record<
        string,
        Array<{ chain: number; count: number }>
      > = {};

      for (const row of results) {
        const { platform, chain_id, count } = row;
        if (platform && chain_id !== null) {
          metricsMap[platform] ??= [];
          metricsMap[platform].push({
            chain: chain_id,
            count: Number(count ?? 0),
          });
        }
      }

      return metricsMap;
    }),
});
