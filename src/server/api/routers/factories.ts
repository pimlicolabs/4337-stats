import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import { and, gte, lte, inArray, eq } from "drizzle-orm";
import { factoryHourlyMetrics, factories } from "../../../../db/schema";

export const accountFactorysRouter = createTRPCRouter({
  getTotalAccountsDeployed: publicProcedure
    .input(
      z.object({
        factories: z.array(z.string()), // column `name` in factories table
        startDate: z.date(),
        endDate: z.date(),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb
        .select({
          total_accounts_deployed: sql<string>`SUM(${factoryHourlyMetrics.totalAccountsDeployed})`,
        })
        .from(factoryHourlyMetrics)
        .leftJoin(
          factories,
          eq(factoryHourlyMetrics.factoryAddress, factories.address)
        )
        .where(
          and(
            gte(factoryHourlyMetrics.hour, input.startDate),
            lte(factoryHourlyMetrics.hour, input.endDate),
            inArray(factories.name, input.factories),
            inArray(factoryHourlyMetrics.chainId, input.chainIds)
          )
        )
        .execute();

      return Number(results[0]?.total_accounts_deployed ?? 0);
    }),
  getDeploymentsByFactory: publicProcedure
    .input(
      z.object({
        factories: z.array(z.string()), // column `name` in factories table
        startDate: z.date(),
        endDate: z.date(),
        chainIds: z.array(z.number()),
        resolution: z.enum(["hour", "day", "week", "month"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb
        .select({
          factory_name: factories.name,
          time: sql<string>`DATE_TRUNC(${input.resolution}, ${factoryHourlyMetrics.hour})`,
          total_accounts_deployed: sql<string>`SUM(${factoryHourlyMetrics.totalAccountsDeployed})`,
        })
        .from(factoryHourlyMetrics)
        .leftJoin(
          factories,
          eq(factoryHourlyMetrics.factoryAddress, factories.address)
        )
        .where(
          and(
            gte(factoryHourlyMetrics.hour, input.startDate),
            lte(factoryHourlyMetrics.hour, input.endDate),
            inArray(factories.name, input.factories),
            inArray(factoryHourlyMetrics.chainId, input.chainIds)
          )
        )
        .groupBy(sql`${factories.name}, time`)
        .orderBy(sql`time, ${factories.name}`)
        .execute();

      const metricsMap: Record<string, Record<string, any>> = {};

      for (const row of results) {
        const { time, factory_name, total_accounts_deployed } = row;
        if (time && factory_name) {
          const timeStr = time.toString();
          metricsMap[timeStr] ??= { date: timeStr };
          metricsMap[timeStr][factory_name] = Number(total_accounts_deployed ?? 0);
        }
      }

      return Object.values(metricsMap);
    }),
  getAccountsDeployedByChain: publicProcedure
    .input(
      z.object({
        factories: z.array(z.string()), // column `name` in factories table
        startDate: z.date(),
        endDate: z.date(),
        chainIds: z.array(z.number()),
        resolution: z.enum(["hour", "day", "week", "month"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb
        .select({
          factory_name: factories.name,
          chain_id: factoryHourlyMetrics.chainId,
          count: sql<string>`SUM(${factoryHourlyMetrics.totalAccountsDeployed})`,
        })
        .from(factoryHourlyMetrics)
        .leftJoin(
          factories,
          eq(factoryHourlyMetrics.factoryAddress, factories.address)
        )
        .where(
          and(
            gte(factoryHourlyMetrics.hour, input.startDate),
            lte(factoryHourlyMetrics.hour, input.endDate),
            inArray(factoryHourlyMetrics.chainId, input.chainIds),
            inArray(factories.name, input.factories)
          )
        )
        .groupBy(sql`${factories.name}, ${factoryHourlyMetrics.chainId}`)
        .orderBy(sql`${factories.name}, ${factoryHourlyMetrics.chainId}`)
        .execute();

      const metricsMap: Record<
        string,
        Array<{ chain: number; count: number }>
      > = {};

      for (const row of results) {
        const { factory_name, chain_id, count } = row;
        if (factory_name && chain_id !== null) {
          metricsMap[factory_name] ??= [];
          metricsMap[factory_name].push({
            chain: chain_id,
            count: Number(count ?? 0),
          });
        }
      }


      return metricsMap;
    }),
});
