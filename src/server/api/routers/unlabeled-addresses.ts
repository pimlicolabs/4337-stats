import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { APPS, ACCOUNT_FACTORIES, PAYMASTERS, BUNDLERS } from "@/lib/registry/index";
import { getAddress } from "viem";
import { bundlersCsv, paymastersCsv } from "@/lib/registry/csv";

// Create maps for faster lookups
const paymasterAddressMap = new Map<string, typeof paymastersCsv[0]>();
const bundlerAddressMap = new Map<string, typeof bundlersCsv[0]>();
const paymasterNameMap = new Map<string, typeof PAYMASTERS[0]>();
const bundlerNameMap = new Map<string, typeof BUNDLERS[0]>();

// Initialize paymaster maps
paymastersCsv.forEach(paymaster => {
  try {
    const normalizedAddress = getAddress(paymaster.address);
    paymasterAddressMap.set(normalizedAddress, paymaster);
  } catch (e) {
    // Skip invalid addresses
  }
});

PAYMASTERS.forEach(paymaster => {
  paymasterNameMap.set(paymaster.name.toLowerCase(), paymaster);
});

// Initialize bundler maps
bundlersCsv.forEach(bundler => {
  try {
    const normalizedAddress = getAddress(bundler.address);
    bundlerAddressMap.set(normalizedAddress, bundler);
  } catch (e) {
    // Skip invalid addresses
  }
});

BUNDLERS.forEach(bundler => {
  bundlerNameMap.set(bundler.name.toLowerCase(), bundler);
});

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
            dsb.bundler
        ORDER BY
            count DESC
        LIMIT 100
      `);

      return results.map(row => ({
        address: row.bundler,
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
    
  // Get random user operations for a specific paymaster or bundler
  getRandomUserOperationsFor: publicProcedure
    .input(
      z.object({
        address: z.string(),
        addressType: z.enum(["bundler", "paymaster"]),
        limit: z.number().default(1000),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.addressType === "bundler") {
        const results = await ctx.envioDb.execute<{
          userOpHash: string;
          chainId: number;
          timestamp: Date;
        }>(sql`
          SELECT 
            "userOpHash",
            "chainId",
            "timestamp"
          FROM 
            "EntryPoint_UserOperationEvent"
          WHERE 
            "transactionFrom" = ${input.address}
          ORDER BY 
            "id"
          LIMIT ${input.limit}
        `);
        
        return results.map(row => ({
          userOpHash: row.userOpHash,
          chainId: row.chainId,
          timestamp: row.timestamp,
        }));
      } else {
        const results = await ctx.envioDb.execute<{
          userOpHash: string;
          chainId: number;
          timestamp: Date;
        }>(sql`
          SELECT 
            "userOpHash",
            "chainId",
            "timestamp"
          FROM 
            "EntryPoint_UserOperationEvent"
          WHERE 
            "paymaster" = ${input.address}
          ORDER BY 
            "id"
          LIMIT ${input.limit}
        `);
        
        return results.map(row => ({
          userOpHash: row.userOpHash,
          chainId: row.chainId,
          timestamp: row.timestamp,
        }));
      }
    }),

  // Get statistics for user operations related to a paymaster or bundler
  getRandomUserOperationStatsFor: publicProcedure
    .input(
      z.object({
        address: z.string(),
        addressType: z.enum(["bundler", "paymaster"]),
        limit: z.number().default(1000),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.addressType === "bundler") {
        // For bundlers, analyze paymasters they work with
        const results = await ctx.envioDb.execute<{
          paymaster: string;
          count: bigint;
          label: string | null;
          color: string;
        }>(sql`
          WITH 
            random_userops AS (
              SELECT 
                "paymaster"
              FROM 
                "EntryPoint_UserOperationEvent"
              WHERE 
                "transactionFrom" = ${input.address}
              ORDER BY 
                "id"
              LIMIT ${input.limit}
            ),
            paymaster_counts AS (
              SELECT
                "paymaster",
                COUNT(*) as count
              FROM
                random_userops
              GROUP BY
                "paymaster"
            )
          SELECT
            pc."paymaster" as paymaster,
            pc.count
          FROM
            paymaster_counts pc
          ORDER BY
            pc.count DESC
        `);
        
        // Calculate total count
        const totalCount = results.reduce((sum, row) => sum + Number(row.count), 0);
        
        // Process results and add labels and colors from paymastersCsv
        return results.map(row => {
          const normalizedAddress = getAddress(row.paymaster);
          const count = Number(row.count);
          
          // Get matching paymaster from map
          const matchingPaymaster = paymasterAddressMap.get(normalizedAddress);
          
          // Get registry entry from map to get color
          const registryEntry = matchingPaymaster ? paymasterNameMap.get(matchingPaymaster.name.toLowerCase()) : undefined;
          
          return {
            address: normalizedAddress,
            count,
            percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
            label: matchingPaymaster ? matchingPaymaster.name : 'Unknown',
            color: registryEntry ? registryEntry.color : '#94a3b8'
          };
        });
      } else {
        // For paymasters, analyze bundlers they work with
        const results = await ctx.envioDb.execute<{
          bundler: string;
          count: bigint;
          label: string | null;
          color: string;
        }>(sql`
          WITH 
            random_userops AS (
              SELECT 
                "transactionFrom"
              FROM 
                "EntryPoint_UserOperationEvent"
              WHERE 
                "paymaster" = ${input.address}
              ORDER BY 
                "id"
              LIMIT ${input.limit}
            ),
            bundler_counts AS (
              SELECT
                "transactionFrom" as bundler,
                COUNT(*) as count
              FROM
                random_userops
              GROUP BY
                "transactionFrom"
            )
          SELECT
            bc.bundler,
            bc.count
          FROM
            bundler_counts bc
          ORDER BY
            bc.count DESC
        `);
        
        // Calculate total count
        const totalCount = results.reduce((sum, row) => sum + Number(row.count), 0);
        
        // Process results and add labels and colors from bundlersCsv
        return results.map(row => {
          const normalizedAddress = getAddress(row.bundler);
          const count = Number(row.count);
          
          // Get matching bundler from map
          const matchingBundler = bundlerAddressMap.get(normalizedAddress);
          
          // Get registry entry from map to get color
          const registryEntry = matchingBundler ? bundlerNameMap.get(matchingBundler.name.toLowerCase()) : undefined;
          
          return {
            address: normalizedAddress,
            count,
            percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
            label: matchingBundler ? matchingBundler.name : 'Unknown',
            color: registryEntry ? registryEntry.color : '#94a3b8'
          };
        });
      }
    }),
});
