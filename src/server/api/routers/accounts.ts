import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";

export const accountsRouter = createTRPCRouter({
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
            LEFT JOIN
                factories f ON f.address = fhm.factory_address
            WHERE
                hour >= ${input.startDate.toISOString()}
                AND hour <= ${input.endDate.toISOString()}
                AND COALESCE(name, 'unknown') IN (${sql.join(input.factories, sql`, `)})
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
                COALESCE(f.name, 'unknown') AS factory_name,
                DATE_TRUNC(${input.resolution}, fhm.hour) AS time,
                SUM(fhm.total_accounts_deployed) AS total_accounts_deployed
            FROM
                factory_hourly_metrics fhm
            LEFT JOIN
                factories f ON f.address = fhm.factory_address
            WHERE
                fhm.hour >= ${input.startDate.toISOString()}
                AND fhm.hour <= ${input.endDate.toISOString()}
                AND COALESCE(f.name, 'unknown') IN (${sql.join(input.factories, sql`, `)})
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
                COALESCE(name, 'unknown') AS factory_name,
                chain_id,
                SUM(total_accounts_deployed) AS count
            FROM
                factory_hourly_metrics as fhm
            LEFT JOIN
                factories f ON f.address = fhm.factory_address
            WHERE
                hour >= ${input.startDate.toISOString()}
                AND hour <= ${input.endDate.toISOString()}
                AND chain_id IN (${sql.join(input.chainIds, sql`, `)})
                AND COALESCE(name, 'unknown') IN (${sql.join(input.factories, sql`, `)})
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
  uniqueSendersByFactoryByDay: publicProcedure
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
        factory_name: string;
        day: string;
        unique_active_senders: bigint;
      }>(sql`
            SELECT
                COALESCE(f.name, 'unknown') AS factory_name,
                date AS day,
                SUM(unique_active_senders) AS unique_active_senders
            FROM
                active_accounts_daily_metrics aadm
            LEFT JOIN
                factories f ON f.address = aadm.factory_address
            WHERE
                aadm.date >= ${input.startDate.toISOString()}
                AND aadm.date <= ${input.endDate.toISOString()}
                AND COALESCE(f.name, 'unknown') IN (${sql.join(input.factories, sql`, `)})
                AND aadm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
            GROUP BY
                f.name, date
            ORDER BY
                date, f.name;
    `);

      const metricsMap: Record<string, Record<string, any>> = {};

      for (const row of results) {
        const { day, factory_name, unique_active_senders } = row;
        metricsMap[day] ??= { date: day };
        metricsMap[day][factory_name] = Number(unique_active_senders);
      }

      return Object.values(metricsMap);
    }),
});
