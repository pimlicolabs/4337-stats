import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import { and, gte, lte, inArray, eq } from "drizzle-orm";
import {
  globalHourlyMetrics,
  activeAccountsDailyMetrics,
  activeAccountsMonthlyMetrics,
} from "../../../../db/schema";

export const globalStatsRouter = createTRPCRouter({
  getTotalBundledOpsPerChain: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        chainIds: z.array(z.number()),
        resolution: z.enum(["hour", "day", "week", "month"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb
        .select({
          time: sql<string>`DATE_TRUNC(${input.resolution}, ${globalHourlyMetrics.hour})`,
          chain_id: globalHourlyMetrics.chainId,
          total_ops_bundled: sql<string>`SUM(${globalHourlyMetrics.totalOperationCount})`,
        })
        .from(globalHourlyMetrics)
        .where(
          and(
            sql`${globalHourlyMetrics.hour} >= ${input.startDate.toISOString()}`,
            sql`${globalHourlyMetrics.hour} <= ${input.endDate.toISOString()}`,
            inArray(globalHourlyMetrics.chainId, input.chainIds),
            eq(globalHourlyMetrics.success, true)
          )
        )
        .groupBy(sql`time, ${globalHourlyMetrics.chainId}`)
        .orderBy(sql`time ASC, ${globalHourlyMetrics.chainId} ASC`)
        .execute();

      const metricsMap: Record<string, Record<string, any>> = {};

      for (const row of results) {
        const { time, chain_id, total_ops_bundled } = row;
        if (time && chain_id !== null) {
          const timeStr = time.toString();
          metricsMap[timeStr] ??= { date: timeStr };
          metricsMap[timeStr][chain_id] = Number(total_ops_bundled ?? 0);
        }
      }

      return Object.values(metricsMap);
    }),
  getDailyActiveUsers: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb
        .select({
          date: activeAccountsDailyMetrics.date,
          chain_id: activeAccountsDailyMetrics.chainId,
          total_active_accounts: sql<string>`SUM(${activeAccountsDailyMetrics.uniqueActiveSenders})`,
        })
        .from(activeAccountsDailyMetrics)
        .where(
          and(
            sql`${activeAccountsDailyMetrics.date} >= ${input.startDate.toISOString()}`,
            sql`${activeAccountsDailyMetrics.date} <= ${input.endDate.toISOString()}`,
            inArray(activeAccountsDailyMetrics.chainId, input.chainIds)
          )
        )
        .groupBy(sql`${activeAccountsDailyMetrics.date}, ${activeAccountsDailyMetrics.chainId}`)
        .orderBy(sql`${activeAccountsDailyMetrics.date} ASC, ${activeAccountsDailyMetrics.chainId} ASC`)
        .execute();

      const metricsMap: Record<string, Record<string, any>> = {};

      for (const row of results) {
        const { date, chain_id, total_active_accounts } = row;
        if (date && chain_id !== null) {
          const dateStr = date.toString();
          metricsMap[dateStr] ??= { date: dateStr };
          metricsMap[dateStr][chain_id] = Number(total_active_accounts ?? 0);
        }
      }

      return Object.values(metricsMap);
    }),
  getTotalActiveUsersByMonth: publicProcedure
    .input(
      z.object({
        month: z.date(),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.envioDb
        .select({
          total_active_accounts: sql<string>`SUM(${activeAccountsMonthlyMetrics.uniqueActiveSenders})`,
        })
        .from(activeAccountsMonthlyMetrics)
        .where(
          and(
            sql`${activeAccountsMonthlyMetrics.month} = ${input.month.toISOString()}`,
            inArray(activeAccountsMonthlyMetrics.chainId, input.chainIds)
          )
        )
        .execute();

      return Number(result[0]?.total_active_accounts ?? 0);
    }),
  getTotalActiveUsersByDay: publicProcedure
    .input(
      z.object({
        day: z.date(),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.envioDb
        .select({
          total_active_accounts: sql<string>`SUM(${activeAccountsDailyMetrics.uniqueActiveSenders})`,
        })
        .from(activeAccountsDailyMetrics)
        .where(
          and(
            sql`${activeAccountsDailyMetrics.date} = ${input.day.toISOString()}`,
            inArray(activeAccountsDailyMetrics.chainId, input.chainIds)
          )
        )
        .execute();

      return Number(result[0]?.total_active_accounts ?? 0);
    }),
});
