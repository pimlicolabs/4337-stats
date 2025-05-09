import { drizzle } from "drizzle-orm/postgres-js";

import { env } from "@/env";
import postgres from "postgres";

const envioClient = postgres(env.ENVIO_4_URL, { 
  prepare: false,
  max: 10,  // Increase connection pool size
  idle_timeout: 20,  // Reduce idle timeout to free connections faster
  connect_timeout: 10  // Reduce connection timeout
});

export const envioDb = drizzle(envioClient, {
  logger: process.env.NODE_ENV === "development",
  schema: {},
});
