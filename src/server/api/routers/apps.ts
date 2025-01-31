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
      const results = await ctx.envio4Db.execute<{
        time: string;
        targets: string;
        count: bigint;
      }>(sql`
            SELECT
                (DATE_TRUNC(${input.resolution}, hour::TIMESTAMP AT TIME ZONE 'UTC'))::TIMESTAMP AS time,
                ahm.targets AS targets,
                SUM(ahm.count) AS count
            FROM
                apps_hourly_metrics as ahm
            WHERE
                ahm.hour >= ${input.startDate.toISOString()}
                AND ahm.hour <= ${input.endDate.toISOString()}
                AND ahm.chain_id IN (${sql.join(input.chainIds, sql`, `)})
            GROUP BY
                time, targets
            ORDER BY
                time, targets;
    `);

      console.log(results);

      // parse targets field
      const appStats = results.flatMap((row) =>
        row.targets
          .replace(/[{}]/g, "")
          .split(",")
          .map((app) => {
            const appName = APPS.find((entry) =>
              entry.dbNames.some(
                (dbName) => dbName.toLowerCase() === app.toLowerCase(),
              ),
            );
            return {
              app: appName?.name || "Unknown",
              time: row.time,
              count: Number(row.count),
            };
          }),
      );

      const metricsMap: Record<string, Record<string, any>> = {};
      for (const row of appStats) {
        const { time, app, count } = row;
        metricsMap[time] ??= { date: time };
        metricsMap[time][app] = Number(count);
      }

      return Object.values(metricsMap);
    }),
});
