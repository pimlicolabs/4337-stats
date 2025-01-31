import envioSchema from "../../../db";
import { drizzle } from "drizzle-orm/postgres-js";

import { env } from "@/env";
import postgres from "postgres";

const envio3Client = postgres(env.ENVIO_URL, { prepare: false });
const envio4Client = postgres(env.ENVIO_4_URL, { prepare: false });

export const envio3Db = drizzle(envio3Client, {
  logger: process.env.NODE_ENV === "development",
  schema: { ...envioSchema },
});

export const envio4Db = drizzle(envio4Client, {
  logger: process.env.NODE_ENV === "development",
  schema: { ...envioSchema },
});
