import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";

export const bundlersRouter = createTRPCRouter({
  totalOps: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        bundlers: z.array(z.string()),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.envioDb.execute<{
        total_ops_bundled: bigint;
      }>(sql`
            SELECT
                SUM(bhm.total_operation_count) AS total_ops_bundled
            FROM
                bundler_hourly_metrics_v2 as bhm
            LEFT JOIN
                bundlers b on b.address = bhm.bundler_address
            WHERE
                bhm.hour >= ${input.startDate.toISOString()}
                AND bhm.hour <= ${input.endDate.toISOString()}
                AND bhm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
                AND COALESCE(b.name, 'unknown') IN (${sql.join(input.bundlers, sql`, `)})
    `);

      return Number(result[0]?.total_ops_bundled);
    }),
  totalOpsByChain: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        chainIds: z.array(z.number()),
        resolution: z.enum(["hour", "day", "week", "month"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb.execute<{
        time: string;
        chain_id: number;
        total_ops_bundled: bigint;
      }>(sql`
            SELECT
                DATE_TRUNC(${input.resolution}, bhm.hour) AS time,
                bhm.chain_id,
                SUM(bhm.total_operation_count) AS total_ops_bundled
            FROM
                bundler_hourly_metrics_v2 as bhm
            LEFT JOIN
                bundlers b on b.address = bhm.bundler_address
            WHERE
                bhm.hour >= ${input.startDate.toISOString()}
                AND bhm.hour <= ${input.endDate.toISOString()}
                AND bhm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
            GROUP BY
                time,
                chain_id
            ORDER BY
                time ASC,
                chain_id ASC
    `);

      const metricsMap: Record<string, Record<string, any>> = {};

      for (const row of results) {
        const { time, chain_id, total_ops_bundled } = row;
        metricsMap[time] ??= { date: time };
        metricsMap[time][chain_id] = Number(total_ops_bundled);
      }

      return Object.values(metricsMap);
    }),
  opsByPlatformByDate: publicProcedure
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
      const results = await ctx.envioDb.execute<{
        platform: string;
        time: string;
        total_ops_bundled: bigint;
      }>(sql`
            SELECT
                COALESCE(b.name, 'unknown') AS platform,
                (DATE_TRUNC(${input.resolution}, hour::TIMESTAMP AT TIME ZONE 'UTC'))::TIMESTAMP AS time,
                SUM(bhm.total_operation_count) AS total_ops_bundled
            FROM
                bundler_hourly_metrics_v2 as bhm
            LEFT JOIN
                bundlers b on b.address = bhm.bundler_address
            WHERE
                bhm.hour >= ${input.startDate.toISOString()}
                AND bhm.hour <= ${input.endDate.toISOString()}
                AND bhm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
                AND COALESCE(b.name, 'unknown') IN (${sql.join(input.bundlers, sql`, `)})
            GROUP BY
                platform, time
            ORDER BY
                time, platform;
    `);

      const metricsMap: Record<string, Record<string, any>> = {};

      for (const row of results) {
        const { time, platform, total_ops_bundled } = row;
        metricsMap[time] ??= { date: time };
        metricsMap[time][platform] = Number(total_ops_bundled);
      }

      return Object.values(metricsMap);
    }),
  opsByPlatformByChain: publicProcedure
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
      const results = await ctx.envioDb.execute<{
        platform: string;
        chain_id: number;
        count: bigint;
      }>(sql`
            SELECT
                COALESCE(b.name, 'unknown') AS platform,
                chain_id,
                SUM(total_operation_count) AS count
            FROM
                bundler_hourly_metrics_v2 as bhm
            LEFT JOIN
                bundlers b on b.address = bhm.bundler_address
            WHERE
                bhm.hour >= ${input.startDate.toISOString()}
                AND bhm.hour <= ${input.endDate.toISOString()}
                AND bhm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
                AND COALESCE(b.name, 'unknown') IN (${sql.join(input.bundlers, sql`, `)})
            GROUP BY
                platform, chain_id
            ORDER BY
                platform, chain_id
        `);

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
  opsByPlatformForChain: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        bundlers: z.array(z.string()),
        chainId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb.execute<{
        platform: string;
        count: bigint;
      }>(sql`
            SELECT
                COALESCE(b.name, 'unknown') AS platform,
                SUM(bhm.total_operation_count) AS count
            FROM
                bundler_hourly_metrics_v2 as bhm
            LEFT JOIN
                bundlers b on b.address = bhm.bundler_address
            WHERE
                bhm.hour >= ${input.startDate.toISOString()}
                AND bhm.hour <= ${input.endDate.toISOString()}
                AND bhm.chain_id = ${input.chainId}
                AND COALESCE(b.name, 'unknown') IN (${sql.join(input.bundlers, sql`, `)})
            GROUP BY
                platform
            ORDER BY
                platform
        `);

      return results;
    }),
});
