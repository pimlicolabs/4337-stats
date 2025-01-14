import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";

export const accountFactorysRouter = createTRPCRouter({
  totalDeployments: publicProcedure
    .input(
      z.object({
        factories: z.array(z.string()), // column `name` in factories table
        startDate: z.date(),
        endDate: z.date(),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb.execute<{
        total_accounts_deployed: bigint;
      }>(sql`
            SELECT
                SUM(total_accounts_deployed) AS total_accounts_deployed
            FROM
                factory_hourly_metrics fhm
            JOIN
                factories f ON f.address = fhm.factory_address
            WHERE
                hour >= ${input.startDate.toISOString()}
                AND hour <= ${input.endDate.toISOString()}
                AND name IN (${sql.join(input.factories, sql`, `)})
                AND chain_id IN (${sql.join(input.chainIds, sql`, `)})
    `);

      return Number(results[0]?.total_accounts_deployed);
    }),
  deploymentsByFactory: publicProcedure
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
      const results = await ctx.envioDb.execute<{
        factory_name: string;
        time: string;
        total_accounts_deployed: bigint;
      }>(sql`
            SELECT
                f.name AS factory_name,
                DATE_TRUNC(${input.resolution}, fhm.hour) AS time,
                SUM(fhm.total_accounts_deployed) AS total_accounts_deployed
            FROM
                factory_hourly_metrics fhm
            JOIN
                factories f ON f.address = fhm.factory_address
            WHERE
                fhm.hour >= ${input.startDate.toISOString()}
                AND fhm.hour <= ${input.endDate.toISOString()}
                AND f.name IN (${sql.join(input.factories, sql`, `)})
                AND fhm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
            GROUP BY
                f.name, time
            ORDER BY
                time, f.name;
    `);

      const metricsMap: Record<string, Record<string, any>> = {};

      for (const row of results) {
        const { time, factory_name, total_accounts_deployed } = row;
        metricsMap[time] ??= { date: time };
        metricsMap[time][factory_name] = Number(total_accounts_deployed);
      }

      return Object.values(metricsMap);
    }),
  deploymentsByChain: publicProcedure
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
      const results = await ctx.envioDb.execute<{
        factory_name: string;
        chain_id: number;
        count: bigint;
      }>(sql`
            SELECT
                name AS factory_name,
                chain_id,
                SUM(total_accounts_deployed) AS count
            FROM
                factory_hourly_metrics as fhm
            JOIN
                factories f ON f.address = fhm.factory_address
            WHERE
                hour >= ${input.startDate.toISOString()}
                AND hour <= ${input.endDate.toISOString()}
                AND chain_id IN (${sql.join(input.chainIds, sql`, `)})
                AND name IN (${sql.join(input.factories, sql`, `)})
            GROUP BY
                factory_name, chain_id
            ORDER BY
                factory_name, chain_id
        `);

      const metricsMap: Record<
        string,
        Array<{ chain: number; count: number }>
      > = {};

      for (const row of results) {
        const { factory_name, chain_id, count } = row;
        metricsMap[factory_name] ??= [];
        metricsMap[factory_name].push({
          chain: chain_id,
          count: Number(count),
        });
      }

      return metricsMap;
    }),
});
