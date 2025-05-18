import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import { paymastersCsv } from "@/lib/registry/csv";


export const paymastersRouter = createTRPCRouter({
  totalSponsored: publicProcedure
    .input(
      z.object({
        paymasters: z.array(z.string()), // column `name` in paymasters table
        startDate: z.date(),
        endDate: z.date(),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [totalSponsoredOps] = await ctx.envioDb.execute<{
        total_sponsored_ops: bigint;
      }>(sql`
            WITH paymaster_names AS (
              SELECT name, address
              FROM (
                VALUES
                  ${sql.join(
                    paymastersCsv.map(p => sql`(${p.name}, ${p.address})`),
                    sql`,`
                  )}
              ) AS t(name, address)
            )
            SELECT
                SUM(dsp.count) AS total_sponsored_ops
            FROM
                daily_stats_paymasters AS dsp
            LEFT JOIN
                paymaster_names pn ON pn.address = dsp.paymaster
            WHERE
                pn.name IN (${sql.join(input.paymasters, sql`, `)})
                AND dsp.day >= ${input.startDate.toISOString()}
                AND dsp.day <= ${input.endDate.toISOString()}
                AND dsp."chainId" IN (${sql.join(input.chainIds, sql`, `)})
                AND dsp.paymaster != '0x0000000000000000000000000000000000000000'
    `);

      return Number(totalSponsoredOps?.total_sponsored_ops);
    }),
  sponsoredByPaymaster: publicProcedure
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
      const results = await ctx.envioDb.execute<{
        platform: string;
        time: string;
        total_sponsored_ops: bigint;
      }>(sql`
            WITH paymaster_names AS (
              SELECT name, address
              FROM (
                VALUES
                  ${sql.join(
                    paymastersCsv.map(p => sql`(${p.name}, ${p.address})`),
                    sql`,`
                  )}
              ) AS t(name, address)
            )
            SELECT
                COALESCE(pn.name, 'unknown') AS platform,
                DATE_TRUNC(${input.resolution}, day) AS time,
                SUM(dsp.count) AS total_sponsored_ops
            FROM
                daily_stats_paymasters AS dsp
            LEFT JOIN
                paymaster_names pn ON pn.address = dsp.paymaster
            WHERE
                COALESCE(pn.name, 'unknown') IN (${sql.join(input.paymasters, sql`, `)})
                AND dsp.day >= ${input.startDate.toISOString()}
                AND dsp.day <= ${input.endDate.toISOString()}
                AND dsp."chainId" IN (${sql.join(input.chainIds, sql`, `)})
                AND dsp.paymaster != '0x0000000000000000000000000000000000000000'
            GROUP BY
                platform, time
            ORDER BY
                time, platform;
    `);

      const metricsMap: Record<string, Record<string, any>> = {};

      for (const row of results) {
        const { time, platform, total_sponsored_ops } = row;
        metricsMap[time] ??= { date: time };
        metricsMap[time][platform] = Number(total_sponsored_ops);
      }

      return Object.values(metricsMap);
    }),
  sponsoredByPaymasterByChain: publicProcedure
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
      const results = await ctx.envioDb.execute<{
        platform: string;
        chain_id: number;
        count: bigint;
      }>(sql`
            WITH paymaster_names AS (
              SELECT name, address
              FROM (
                VALUES
                  ${sql.join(
                    paymastersCsv.map(p => sql`(${p.name}, ${p.address})`),
                    sql`,`
                  )}
              ) AS t(name, address)
            )
            SELECT
                COALESCE(pn.name, 'unknown') AS platform,
                dsp."chainId" as chain_id,
                SUM(dsp.count) AS count
            FROM
                daily_stats_paymasters AS dsp
            LEFT JOIN
                paymaster_names pn ON pn.address = dsp.paymaster
            WHERE
                COALESCE(pn.name, 'unknown') IN (${sql.join(input.paymasters, sql`, `)})
                AND dsp.day >= ${input.startDate.toISOString()}
                AND dsp.day <= ${input.endDate.toISOString()}
                AND dsp."chainId" IN (${sql.join(input.chainIds, sql`, `)})
                AND dsp.paymaster != '0x0000000000000000000000000000000000000000'
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
  sponsoredByPlatformForChain: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        paymasters: z.array(z.string()),
        chainId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb.execute<{
        platform: string;
        count: bigint;
      }>(sql`
            WITH paymaster_names AS (
              SELECT name, address
              FROM (
                VALUES
                  ${sql.join(
                    paymastersCsv.map(p => sql`(${p.name}, ${p.address})`),
                    sql`,`
                  )}
              ) AS t(name, address)
            )
            SELECT
                COALESCE(pn.name, 'unknown') AS platform,
                SUM(dsp.count) AS count
            FROM
                daily_stats_paymasters AS dsp
            LEFT JOIN
                paymaster_names pn ON pn.address = dsp.paymaster
            WHERE
                COALESCE(pn.name, 'unknown') IN (${sql.join(input.paymasters, sql`, `)})
                AND dsp.day >= ${input.startDate.toISOString()}
                AND dsp.day <= ${input.endDate.toISOString()}
                AND dsp."chainId" = ${input.chainId}
                AND dsp.paymaster != '0x0000000000000000000000000000000000000000'
            GROUP BY
                platform
            ORDER BY
                platform
        `);

      return results;
    }),
});
