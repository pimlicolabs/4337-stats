import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import { and, gte, lte, inArray } from "drizzle-orm";
import { bundlerHourlyMetrics } from "../../../../db/schema";

export const bundlersRouter = createTRPCRouter({
  getTotalBundledOps: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        bundlers: z.array(z.string()),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.envioDb
        .select({
          total_ops_bundled: sql<string>`SUM(${bundlerHourlyMetrics.totalOperationCount})`,
        })
        .from(bundlerHourlyMetrics)
        .where(
          and(
            gte(bundlerHourlyMetrics.hour, input.startDate),
            lte(bundlerHourlyMetrics.hour, input.endDate),
            inArray(bundlerHourlyMetrics.chainId, input.chainIds),
            inArray(bundlerHourlyMetrics.bundlerName, input.bundlers),
          ),
        )
        .execute();

      return Number(result[0]?.total_ops_bundled);
    }),
  getBundledOpsByPlatform: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        bundlers: z.array(z.string()),
        chainIds: z.array(z.number()),
        resolution: z.enum(["hour", "day", "week", "month"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb
        .select({
          platform: sql<string>`COALESCE(${bundlerHourlyMetrics.bundlerName}, 'unknown')`,
          time: sql<string>`(DATE_TRUNC(${input.resolution}, ${bundlerHourlyMetrics.hour}::TIMESTAMP AT TIME ZONE 'UTC'))::TIMESTAMP`,
          total_ops_bundled: sql<string>`SUM(${bundlerHourlyMetrics.totalOperationCount})`,
        })
        .from(bundlerHourlyMetrics)
        .where(
          and(
            gte(bundlerHourlyMetrics.hour, input.startDate),
            lte(bundlerHourlyMetrics.hour, input.endDate),
            inArray(bundlerHourlyMetrics.chainId, input.chainIds),
            inArray(bundlerHourlyMetrics.bundlerName, input.bundlers),
          ),
        )
        .groupBy(sql`COALESCE(${bundlerHourlyMetrics.bundlerName}, 'unknown')`, sql`time`)
        .orderBy(sql`time`, sql`COALESCE(${bundlerHourlyMetrics.bundlerName}, 'unknown')`)
        .execute();

      const metricsMap: Record<string, Record<string, any>> = {};

      for (const row of results) {
        const { time, platform, total_ops_bundled } = row;
        metricsMap[time] ??= { date: time };
        metricsMap[time][platform] = Number(total_ops_bundled);
      }

      return Object.values(metricsMap);
    }),
  getBundledOpsByChain: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        bundlers: z.array(z.string()),
        chainIds: z.array(z.number()),
        resolution: z.enum(["hour", "day", "week", "month"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb
        .select({
          platform: sql<string>`COALESCE(${bundlerHourlyMetrics.bundlerName}, 'unknown')`,
          chain_id: bundlerHourlyMetrics.chainId,
          count: sql<string>`SUM(${bundlerHourlyMetrics.totalOperationCount})`,
        })
        .from(bundlerHourlyMetrics)
        .where(
          and(
            gte(bundlerHourlyMetrics.hour, input.startDate),
            lte(bundlerHourlyMetrics.hour, input.endDate),
            inArray(bundlerHourlyMetrics.chainId, input.chainIds),
            inArray(bundlerHourlyMetrics.bundlerName, input.bundlers),
          ),
        )
        .groupBy(sql`COALESCE(${bundlerHourlyMetrics.bundlerName}, 'unknown')`, bundlerHourlyMetrics.chainId)
        .orderBy(sql`COALESCE(${bundlerHourlyMetrics.bundlerName}, 'unknown')`, bundlerHourlyMetrics.chainId)
        .execute();

      const metricsMap: Record<
        string,
        Array<{ chain: number; count: number }>
      > = {};

      for (const row of results) {
        const { platform, chain_id, count } = row;
        metricsMap[platform] ??= [];
        metricsMap[platform].push({
          chain: chain_id,
          count: Number(count),
        });
      }

      return metricsMap;
    }),
});
