import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import { APPS } from "@/lib/registry";

export const appsRouter = createTRPCRouter({
  appUsageByDate: publicProcedure
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
        app: string;
        count: bigint;
      }>(sql`
            SELECT
                (DATE_TRUNC(${input.resolution}, day::TIMESTAMP AT TIME ZONE 'UTC'))::TIMESTAMP AS time,
                dsa.app AS app,
                SUM(dsa.count) AS count
            FROM
                daily_stats_apps as dsa
            WHERE
                dsa.day >= ${input.startDate.toISOString()}
                AND dsa.day <= ${input.endDate.toISOString()}
                AND dsa."chainId" IN (${sql.join(input.chainIds, sql`, `)})
            GROUP BY
                time, app
            ORDER BY
                time, app;
    `);

      // Map app addresses to names
      const appStats = results.map((row) => {
        const appName = APPS.find((entry) =>
          entry.dbNames.some(
            (dbName) => dbName.toLowerCase() === row.app.toLowerCase(),
          ),
        );
        return {
          app: appName?.name || "Unknown",
          time: row.time,
          count: Number(row.count),
        };
      });

      const metricsMap: Record<string, Record<string, any>> = {};
      for (const row of appStats) {
        const { time, app, count } = row;
        metricsMap[time] ??= { date: time };
        metricsMap[time][app] = Number(count);
      }

      return Object.values(metricsMap);
    }),
});
