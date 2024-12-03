import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";

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
      const result = await ctx.envioDb.execute<{
        total_ops_bundled: bigint;
      }>(sql`
            SELECT
                SUM(total_operation_count) AS total_ops_bundled
            FROM
                bundler_hourly_metrics
            WHERE
                hour >= ${input.startDate.toISOString()}
                AND hour <= ${input.endDate.toISOString()}
                AND chain_id IN (${sql.join(input.chainIds, sql`, `)})
                AND bundler_name IN (${sql.join(input.bundlers, sql`, `)})
    `);

      return Number(result[0]?.total_ops_bundled);
    }),
  getBundledOpsCount: publicProcedure
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
                COALESCE(bundler_name, 'unknown') AS platform,
                (DATE_TRUNC(${input.resolution}, hour::TIMESTAMP AT TIME ZONE 'UTC'))::TIMESTAMP AS time,
                SUM(total_operation_count) AS total_ops_bundled
            FROM
                bundler_hourly_metrics
            WHERE
                hour >= ${input.startDate.toISOString()}
                AND hour <= ${input.endDate.toISOString()}
                AND chain_id IN (${sql.join(input.chainIds, sql`, `)})
                AND bundler_name IN (${sql.join(input.bundlers, sql`, `)})
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
      const results = await ctx.envioDb.execute<{
        platform: string;
        chain_id: number;
        total_ops_bundled: bigint;
      }>(sql`
            SELECT
                COALESCE(bundler_name, 'unknown') AS platform,
                chain_id,
                SUM(total_operation_count) AS total_ops_bundled
            FROM
                bundler_hourly_metrics
            WHERE
                hour >= ${input.startDate.toISOString()}
                AND hour <= ${input.endDate.toISOString()}
                AND chain_id IN (${sql.join(input.chainIds, sql`, `)})
                AND bundler_name IN (${sql.join(input.bundlers, sql`, `)})
            GROUP BY
                platform, chain_id
            ORDER BY
                platform, chain_id
        `);

      const metricsMap: Record<
        string,
        Array<{ chain: number; total_ops_bundled: number }>
      > = {};

      for (const row of results) {
        const { platform, chain_id, total_ops_bundled } = row;
        metricsMap[platform] ??= [];
        metricsMap[platform].push({
          chain: chain_id,
          total_ops_bundled: Number(total_ops_bundled),
        });
      }

      return metricsMap;
    }),
});
