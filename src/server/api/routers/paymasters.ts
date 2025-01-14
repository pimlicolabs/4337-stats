import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";

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
            SELECT
                SUM(total_sponsored_operation_count) AS total_sponsored_ops
            FROM
                paymaster_hourly_metrics_new AS phm
            WHERE
                phm.hour >= ${input.startDate.toISOString()}
                AND phm.hour <= ${input.endDate.toISOString()}
                AND phm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
                AND phm.paymaster_address != '0x0000000000000000000000000000000000000000'
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
            SELECT
                COALESCE(name, 'unknown') AS platform,
                DATE_TRUNC(${input.resolution}, hour) AS time,
                SUM(total_sponsored_operation_count) AS total_sponsored_ops
            FROM
                paymaster_hourly_metrics_new AS phm
            LEFT JOIN
                paymasters p ON p.address = phm.paymaster_address
            WHERE
                phm.hour >= ${input.startDate.toISOString()}
                AND phm.hour <= ${input.endDate.toISOString()}
                AND phm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
                AND phm.paymaster_address != '0x0000000000000000000000000000000000000000'
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
            SELECT
                COALESCE(name, 'unknown') AS platform,
                chain_id,
                SUM(total_sponsored_operation_count) AS count
            FROM
                paymaster_hourly_metrics_new AS phm
            LEFT JOIN
                paymasters p ON p.address = phm.paymaster_address
            WHERE
                phm.hour >= ${input.startDate.toISOString()}
                AND phm.hour <= ${input.endDate.toISOString()}
                AND phm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
                AND phm.paymaster_address != '0x0000000000000000000000000000000000000000'
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
});
