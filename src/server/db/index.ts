import envioSchema from "../../../db";
import { drizzle } from "drizzle-orm/postgres-js";

import { env } from "@/env";
import postgres from "postgres";

const envioClient = postgres(env.ENVIO_URL, { prepare: false });

export const envioDb = drizzle(envioClient, {
  logger: process.env.NODE_ENV === "development",
  schema: { ...envioSchema },
});
