import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { getAddress } from "viem";

// Define types for entity records
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

  return records.map(r => {
    return {
      ...r,
      address: getAddress(r.address),
    }
  });
};

export const addressBookRouter = createTRPCRouter({
  getPaymasters: publicProcedure.query(async () => {
    const paymasters = getEntityData('paymasters');
    return paymasters;
  }),
  getBundlers: publicProcedure.query(async () => {
    const bundlers = getEntityData('bundlers');
    return bundlers;
  }),
  getFactories: publicProcedure.query(async () => {
    const factories = getEntityData('factories');
    return factories;
  }),
});
