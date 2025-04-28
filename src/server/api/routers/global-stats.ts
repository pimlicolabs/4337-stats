import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";

export const globalStatsRouter = createTRPCRouter({
  dailyActiveUsers: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async ({ input }) => {
      // Table active_accounts_daily_metrics doesn't exist anymore
      // Returning empty data
      /*
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
      */
      
      // Return empty array as the table doesn't exist
      return [];
    }),
  monthlyActiveUsers: publicProcedure
    .input(
      z.object({
        month: z.date(),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async () => {
      // Table active_accounts_monthly_metrics doesn't exist anymore
      // Returning empty data
      /*
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
      */
      
      // Return 0 as the table doesn't exist
      return 0n;
    }),
  activeUsersByDay: publicProcedure
    .input(
      z.object({
        day: z.date(),
        chainIds: z.array(z.number()),
      }),
    )
    .query(async () => {
      // Table active_accounts_daily_metrics doesn't exist anymore
      // Returning empty data
      /*
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
      */
      
      // Return 0 as the table doesn't exist
      return 0n;
    }),
});
