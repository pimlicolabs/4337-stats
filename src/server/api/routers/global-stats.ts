import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";

export const globalStatsRouter = createTRPCRouter({
  totalBundledByChain: publicProcedure
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
                DATE_TRUNC(${input.resolution}, ghm.hour) AS time,
                ghm.chain_id,
                SUM(total_operation_count) AS total_ops_bundled
            FROM
                global_hourly_metrics AS ghm
            WHERE
                ghm.hour >= ${input.startDate.toISOString()}
                AND ghm.hour <= ${input.endDate.toISOString()}
                AND ghm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
                AND ghm.success = TRUE
            GROUP BY
                time,
                ghm.chain_id
            ORDER BY
                time ASC,
                ghm.chain_id ASC
    `);

      const metricsMap: Record<string, Record<string, any>> = {};

      for (const row of results) {
        const { time, chain_id, total_ops_bundled } = row;
        metricsMap[time] ??= { date: time };
        metricsMap[time][chain_id] = Number(total_ops_bundled);
      }

      return Object.values(metricsMap);
    }),
  dailyActiveUsers: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb.execute<{
        date: string;
        chain_id: number;
        total_active_accounts: bigint;
      }>(sql`
            SELECT
                aadm.date AS date,
                aadm.chain_id,
                SUM(aadm.unique_active_senders) AS total_active_accounts
            FROM
                active_accounts_daily_metrics AS aadm
            WHERE
                aadm.date >= ${input.startDate.toISOString()}
                AND aadm.date <= ${input.endDate.toISOString()}
                AND aadm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
            GROUP BY
                aadm.date,
                aadm.chain_id
            ORDER BY
                aadm.date ASC,
                aadm.chain_id ASC
    `);

      const metricsMap: Record<string, Record<string, any>> = {};

      for (const row of results) {
        const { date, chain_id, total_active_accounts } = row;
        metricsMap[date] ??= { date };
        metricsMap[date][chain_id] = Number(total_active_accounts);
      }

      return Object.values(metricsMap);
    }),
  monthlyActiveUsers: publicProcedure
    .input(
      z.object({
        month: z.date(),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.envioDb.execute<{
        total_active_accounts: bigint;
      }>(sql`
            SELECT
                SUM(aamm.unique_active_senders) AS total_active_accounts
            FROM
                active_accounts_monthly_metrics AS aamm
            WHERE
                aamm.month = ${input.month.toISOString()}
                AND aamm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
    `);

      return result[0]?.total_active_accounts;
    }),
  activeUsersByDay: publicProcedure
    .input(
      z.object({
        day: z.date(),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.envioDb.execute<{
        total_active_accounts: bigint;
      }>(sql`
            SELECT
                SUM(aadm.unique_active_senders) AS total_active_accounts
            FROM
                active_accounts_daily_metrics AS aadm
            WHERE
                aadm.date = ${input.day.toISOString()}
                AND aadm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
    `);

      return result[0]?.total_active_accounts;
    }),
});
