import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";

export const globalStatsRouter = createTRPCRouter({
  getTotalBundledOpsPerChain: publicProcedure
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
});