import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { APPS } from "@/lib/registry";

// Define type for entity data
type EntityRecord = {
  name: string;
  address: string;
};

// Function to read entity data from CSV file
const getEntityData = (entityType: string): EntityRecord[] => {
  const filePath = path.join(process.cwd(), 'data', `${entityType}.csv`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    delimiter: '\t',
    skip_empty_lines: true
  }) as EntityRecord[];
  return records;
};

export const unlabeledAddressesRouter = createTRPCRouter({
  getUnlabeledBundlers: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb.execute<{
        bundler: string;
        chain_id: number;
        count: bigint;
      }>(sql`
        WITH bundler_names AS (
          SELECT address
          FROM (
            VALUES
              ${sql.join(
                getEntityData('bundlers').map(b => sql`(${b.address})`),
                sql`,`
              )}
          ) AS t(address)
        )
        SELECT
            dsb.bundler,
            dsb."chainId" as chain_id,
            SUM(dsb.count) AS count
        FROM
            daily_stats_bundlers as dsb
        LEFT JOIN
            bundler_names bn on bn.address = dsb.bundler
        WHERE
            dsb.day >= ${input.startDate.toISOString()}
            AND dsb.day <= ${input.endDate.toISOString()}
            AND bn.address IS NULL
        GROUP BY
            dsb.bundler, chain_id
        ORDER BY
            count DESC
        LIMIT 100
      `);

      return results.map(row => ({
        address: row.bundler,
        chainId: row.chain_id,
        count: Number(row.count),
      }));
    }),
  
  getUnlabeledPaymasters: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb.execute<{
        paymaster: string;
        chain_id: number;
        count: bigint;
      }>(sql`
        WITH paymaster_names AS (
          SELECT address
          FROM (
            VALUES
              ${sql.join(
                getEntityData('paymasters').map(p => sql`(${p.address})`),
                sql`,`
              )}
          ) AS t(address)
        )
        SELECT
            dsp.paymaster,
            dsp."chainId" as chain_id,
            SUM(dsp.count) AS count
        FROM
            daily_stats_paymasters AS dsp
        LEFT JOIN
            paymaster_names pn ON pn.address = dsp.paymaster
        WHERE
            dsp.day >= ${input.startDate.toISOString()}
            AND dsp.day <= ${input.endDate.toISOString()}
            AND pn.address IS NULL
            AND dsp.paymaster != '0x0000000000000000000000000000000000000000'
        GROUP BY
            dsp.paymaster, chain_id
        ORDER BY
            count DESC
        LIMIT 100
      `);

      return results.map(row => ({
        address: row.paymaster,
        chainId: row.chain_id,
        count: Number(row.count),
      }));
    }),
  getUnlabeledApps: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb.execute<{
        app: string;
        chain_id: number;
        count: bigint;
      }>(sql`
        WITH app_names AS (
          SELECT address
          FROM (
            VALUES
              ${sql.join(
                APPS.flatMap((app: { name: string; dbNames: string[] }) => 
                  app.dbNames.filter(Boolean).map((name: string) => sql`(${name.toLowerCase()})`)
                ),
                sql`,`
              )}
          ) AS t(address)
        )
        SELECT
            dsa.app,
            dsa."chainId" as chain_id,
            SUM(dsa.count) AS count
        FROM
            daily_stats_apps as dsa
        LEFT JOIN
            app_names an ON LOWER(an.address) = LOWER(dsa.app)
        WHERE
            dsa.day >= ${input.startDate.toISOString()}
            AND dsa.day <= ${input.endDate.toISOString()}
            AND an.address IS NULL
            AND dsa.app != '0x0000000000000000000000000000000000000000'
        GROUP BY
            dsa.app, chain_id
        ORDER BY
            count DESC
        LIMIT 100
      `);

      return results.map(row => ({
        address: row.app,
        chainId: row.chain_id,
        count: Number(row.count),
      }));
    }),
});
