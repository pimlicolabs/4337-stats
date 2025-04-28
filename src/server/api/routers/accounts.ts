import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

// Define type for factory data
type FactoryRecord = {
  name: string;
  address: string;
};

// Function to read factory data from CSV file
const getFactoryData = (): FactoryRecord[] => {
  const filePath = path.join(process.cwd(), 'data', 'factories.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    delimiter: '\t',
    skip_empty_lines: true
  }) as FactoryRecord[];
  return records;
};

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
            WITH factory_names AS (
              SELECT name, address
              FROM (
                VALUES
                  ${sql.join(
                    getFactoryData().map(f => sql`(${f.name}, ${f.address})`),
                    sql`,`
                  )}
              ) AS t(name, address)
            )
            SELECT
                SUM(dsf.count) AS total_accounts_deployed
            FROM
                daily_stats_factories dsf
            LEFT JOIN
                factory_names fn ON fn.address = dsf.factory
            WHERE
                dsf.day >= ${input.startDate.toISOString()}
                AND dsf.day <= ${input.endDate.toISOString()}
                AND COALESCE(fn.name, 'unknown') IN (${sql.join(input.factories, sql`, `)})
                AND dsf."chainId" IN (${sql.join(input.chainIds, sql`, `)})
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
            WITH factory_names AS (
              SELECT name, address
              FROM (
                VALUES
                  ${sql.join(
                    getFactoryData().map(f => sql`(${f.name}, ${f.address})`),
                    sql`,`
                  )}
              ) AS t(name, address)
            )
            SELECT
                COALESCE(fn.name, 'unknown') AS factory_name,
                DATE_TRUNC(${input.resolution}, dsf.day) AS time,
                SUM(dsf.count) AS total_accounts_deployed
            FROM
                daily_stats_factories dsf
            LEFT JOIN
                factory_names fn ON fn.address = dsf.factory
            WHERE
                dsf.day >= ${input.startDate.toISOString()}
                AND dsf.day <= ${input.endDate.toISOString()}
                AND COALESCE(fn.name, 'unknown') IN (${sql.join(input.factories, sql`, `)})
                AND dsf."chainId" IN (${sql.join(input.chainIds, sql`, `)})
            GROUP BY
                fn.name, time
            ORDER BY
                time, fn.name;
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
            WITH factory_names AS (
              SELECT name, address
              FROM (
                VALUES
                  ${sql.join(
                    getFactoryData().map(f => sql`(${f.name}, ${f.address})`),
                    sql`,`
                  )}
              ) AS t(name, address)
            )
            SELECT
                COALESCE(fn.name, 'unknown') AS factory_name,
                dsf."chainId" as chain_id,
                SUM(dsf.count) AS count
            FROM
                daily_stats_factories dsf
            LEFT JOIN
                factory_names fn ON fn.address = dsf.factory
            WHERE
                dsf.day >= ${input.startDate.toISOString()}
                AND dsf.day <= ${input.endDate.toISOString()}
                AND dsf."chainId" IN (${sql.join(input.chainIds, sql`, `)})
                AND COALESCE(fn.name, 'unknown') IN (${sql.join(input.factories, sql`, `)})
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
    .query(async () => {
      // Table active_accounts_daily_metrics doesn't exist anymore
      // Returning empty data
      /*
      const results = await ctx.envioDb.execute<{
        factory_name: string;
        day: string;
        unique_active_senders: bigint;
      }>(sql`
            WITH factory_names AS (
              SELECT name, address
              FROM (
                VALUES
                  ${sql.join(
                    getFactoryData().map(f => sql`(${f.name}, ${f.address})`),
                    sql`,`
                  )}
              ) AS t(name, address)
            )
            SELECT
                COALESCE(fn.name, 'unknown') AS factory_name,
                date AS day,
                SUM(unique_active_senders) AS unique_active_senders
            FROM
                active_accounts_daily_metrics aadm
            LEFT JOIN
                factory_names fn ON fn.address = aadm.factory_address
            WHERE
                aadm.date >= ${input.startDate.toISOString()}
                AND aadm.date <= ${input.endDate.toISOString()}
                AND COALESCE(fn.name, 'unknown') IN (${sql.join(input.factories, sql`, `)})
                AND aadm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
            GROUP BY
                fn.name, date
            ORDER BY
                date, fn.name;
    `);

      const metricsMap: Record<string, Record<string, any>> = {};

      for (const row of results) {
        const { day, factory_name, unique_active_senders } = row;
        metricsMap[day] ??= { date: day };
        metricsMap[day][factory_name] = Number(unique_active_senders);
      }

      return Object.values(metricsMap);
      */
      
      // Return empty array as the table doesn't exist
      return [];
    }),
});
