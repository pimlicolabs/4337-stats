import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import { bundlersCsv } from "@/lib/registry/csv";


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
            WITH bundler_names AS (
              SELECT name, address
              FROM (
                VALUES
                  ${sql.join(
                    bundlersCsv.map(b => sql`(${b.name}, ${b.address})`),
                    sql`,`
                  )}
              ) AS t(name, address)
            )
            SELECT
                SUM(dsb.count) AS total_ops_bundled
            FROM
                daily_stats_bundlers as dsb
            LEFT JOIN
                bundler_names bn on bn.address = dsb.bundler
            WHERE
                dsb.day >= ${input.startDate.toISOString()}
                AND dsb.day <= ${input.endDate.toISOString()}
                AND dsb."chainId" IN (${sql.join(input.chainIds, sql`, `)})
                AND COALESCE(bn.name, 'unknown') IN (${sql.join(input.bundlers, sql`, `)})
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
                DATE_TRUNC(${input.resolution}, dsb.day) AS time,
                dsb."chainId" as chain_id,
                SUM(dsb.count) AS total_ops_bundled
            FROM
                daily_stats_bundlers as dsb
            WHERE
                dsb.day >= ${input.startDate.toISOString()}
                AND dsb.day <= ${input.endDate.toISOString()}
                AND dsb."chainId" IN (${sql.join(input.chainIds, sql`, `)})
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
            WITH bundler_names AS (
              SELECT name, address
              FROM (
                VALUES
                  ${sql.join(
                    bundlersCsv.map(b => sql`(${b.name}, ${b.address})`),
                    sql`,`
                  )}
              ) AS t(name, address)
            )
            SELECT
                COALESCE(bn.name, 'unknown') AS platform,
                (DATE_TRUNC(${input.resolution}, day::TIMESTAMP AT TIME ZONE 'UTC'))::TIMESTAMP AS time,
                SUM(dsb.count) AS total_ops_bundled
            FROM
                daily_stats_bundlers as dsb
            LEFT JOIN
                bundler_names bn on bn.address = dsb.bundler
            WHERE
                dsb.day >= ${input.startDate.toISOString()}
                AND dsb.day <= ${input.endDate.toISOString()}
                AND dsb."chainId" IN (${sql.join(input.chainIds, sql`, `)})
                AND COALESCE(bn.name, 'unknown') IN (${sql.join(input.bundlers, sql`, `)})
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
            WITH bundler_names AS (
              SELECT name, address
              FROM (
                VALUES
                  ${sql.join(
                    bundlersCsv.map(b => sql`(${b.name}, ${b.address})`),
                    sql`,`
                  )}
              ) AS t(name, address)
            )
            SELECT
                COALESCE(bn.name, 'unknown') AS platform,
                dsb."chainId" as chain_id,
                SUM(dsb.count) AS count
            FROM
                daily_stats_bundlers as dsb
            LEFT JOIN
                bundler_names bn on bn.address = dsb.bundler
            WHERE
                dsb.day >= ${input.startDate.toISOString()}
                AND dsb.day <= ${input.endDate.toISOString()}
                AND dsb."chainId" IN (${sql.join(input.chainIds, sql`, `)})
                AND COALESCE(bn.name, 'unknown') IN (${sql.join(input.bundlers, sql`, `)})
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
            WITH bundler_names AS (
              SELECT name, address
              FROM (
                VALUES
                  ${sql.join(
                    bundlersCsv.map(b => sql`(${b.name}, ${b.address})`),
                    sql`,`
                  )}
              ) AS t(name, address)
            )
            SELECT
                COALESCE(bn.name, 'unknown') AS platform,
                SUM(dsb.count) AS count
            FROM
                daily_stats_bundlers as dsb
            LEFT JOIN
                bundler_names bn on bn.address = dsb.bundler
            WHERE
                dsb.day >= ${input.startDate.toISOString()}
                AND dsb.day <= ${input.endDate.toISOString()}
                AND dsb."chainId" = ${input.chainId}
                AND COALESCE(bn.name, 'unknown') IN (${sql.join(input.bundlers, sql`, `)})
            GROUP BY
                platform
            ORDER BY
                platform
        `);

      return results;
    }),
});
