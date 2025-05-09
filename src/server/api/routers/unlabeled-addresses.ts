import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { APPS, ACCOUNT_FACTORIES } from "@/lib/registry";
import { getAddress } from "viem";

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

// Function to get bundler data
const getBundlerData = (): EntityRecord[] => {
  const filePath = path.join(process.cwd(), 'data', 'bundlers.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    delimiter: '\t',
    skip_empty_lines: true
  }) as EntityRecord[];
  return records.map(r => {
    return {
      ...r,
      address: getAddress(r.address),
    }
  });
};

// Function to get paymaster data
const getPaymasterData = (): EntityRecord[] => {
  const filePath = path.join(process.cwd(), 'data', 'paymasters.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    delimiter: '\t',
    skip_empty_lines: true
  }) as EntityRecord[];
  return records.map(r => {
    return {
      ...r,
      address: getAddress(r.address),
    }
  });
};

export const unlabeledAddressesRouter = createTRPCRouter({
  getUnlabeledFactories: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.envioDb.execute<{
        factory: string;
        chain_id: number;
        count: bigint;
      }>(sql`
        WITH factory_names AS (
          SELECT address
          FROM (
            VALUES
              ${sql.join(
                getEntityData('factories').map(f => sql`(${f.address})`),
                sql`,`
              )}
          ) AS t(address)
        )
        SELECT
            dsf.factory,
            dsf."chainId" as chain_id,
            SUM(dsf.count) AS count
        FROM
            daily_stats_factories as dsf
        LEFT JOIN
            factory_names fn on fn.address = dsf.factory
        WHERE
            dsf.day >= ${input.startDate.toISOString()}
            AND dsf.day <= ${input.endDate.toISOString()}
            AND fn.address IS NULL
            AND dsf.factory != '0x0000000000000000000000000000000000000000'
        GROUP BY
            dsf.factory, chain_id
        ORDER BY
            count DESC
        LIMIT 100
      `);

      return results.map(row => ({
        address: row.factory,
        chainId: row.chain_id,
        count: Number(row.count),
      }));
    }),
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
            dsp.paymaster
        ORDER BY
            count DESC
        LIMIT 100
      `);

      return results.map(row => ({
        address: row.paymaster,
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
    
  // New endpoint to get UserOperation data for smart labeling
  getUserOperationsForSmartLabeling: publicProcedure
    .input(
      z.object({
        address: z.string(),
        addressType: z.enum(["bundler", "paymaster"]),
        limit: z.number().default(1000),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get the first 1000 UserOperations for the given address
      let results;
      
      if (input.addressType === "bundler") {
        // If we're labeling a bundler, we want to find paymasters it works with
        results = await ctx.envioDb.execute<{
          paymaster: string;
          count: bigint;
        }>(sql`
          WITH random_userops AS (
            SELECT 
              "paymaster"
            FROM 
              "EntryPoint_UserOperationEvent"
            WHERE 
              "transactionFrom" = ${input.address}
              AND "paymaster" != '0x0000000000000000000000000000000000000000'
            ORDER BY 
              "id"
            LIMIT ${input.limit}
          )
          SELECT
            "paymaster",
            COUNT(*) as count
          FROM
            random_userops
          GROUP BY
            "paymaster"
        `);
        
        // Get all labeled paymasters
        const labeledPaymasters = getPaymasterData();
        
        // Map results to include labels
        return results.map(row => {
          const normalizedAddress = getAddress(row.paymaster);
          const label = labeledPaymasters.find(p => getAddress(p.address) === normalizedAddress)?.name || null;
          
          return {
            address: normalizedAddress,
            count: Number(row.count),
            label,
          };
        });
      } else {
        // If we're labeling a paymaster, we want to find bundlers it works with
        results = await ctx.envioDb.execute<{
          bundler: string;
          count: bigint;
        }>(sql`
          WITH random_userops AS (
            SELECT 
              "transactionFrom"
            FROM 
              "EntryPoint_UserOperationEvent"
            WHERE 
              "paymaster" = ${input.address}
            ORDER BY 
              "id"
            LIMIT ${input.limit}
          )
          SELECT
            "transactionFrom" as bundler,
            COUNT(*) as count
          FROM
            random_userops
          GROUP BY
            "transactionFrom"
        `);
        
        // Get all labeled bundlers
        const labeledBundlers = getBundlerData();
        
        // Map results to include labels
        return results.map(row => {
          const normalizedAddress = getAddress(row.bundler);
          const label = labeledBundlers.find(b => getAddress(b.address) === normalizedAddress)?.name || null;
          
          return {
            address: normalizedAddress,
            count: Number(row.count),
            label,
          };
        });
      }
    }),
});
