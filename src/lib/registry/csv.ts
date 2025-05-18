import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { getAddress } from "viem";


type PaymasterRecord = {
  name: string;
  address: string;
};


// Function to read paymaster data from CSV file
const getPaymasterData = (): PaymasterRecord[] => {
  const filePath = path.join(process.cwd(), 'data', 'paymasters.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    delimiter: '\t',
    skip_empty_lines: true
  }) as PaymasterRecord[];

  return records.map(r => {
    return {
      ...r,
      address: getAddress(r.address)
    }
  });
};

export const paymastersCsv = getPaymasterData()

// Define type for bundler data
type BundlerRecord = {
  name: string;
  address: string;
};

// Function to read bundler data from CSV file
const getBundlerData = (): BundlerRecord[] => {
  const filePath = path.join(process.cwd(), 'data', 'bundlers.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    delimiter: '\t',
    skip_empty_lines: true
  }) as BundlerRecord[];
  return records.map(r => {
    return {
      ...r,
      address: getAddress(r.address),
    }
  });
};

export const bundlersCsv = getBundlerData();
