import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { bundlersRouter } from "./routers/bundlers";
import { paymastersRouter } from "./routers/paymasters";
import { accountsRouter } from "./routers/accounts";
import { addressBookRouter } from "./routers/address-book";
import { globalStatsRouter } from "./routers/global-stats";
import { appsRouter } from "./routers/apps";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  apps: appsRouter,
  globalStats: globalStatsRouter,
  addressBook: addressBookRouter,
  bundlers: bundlersRouter,
  paymasters: paymastersRouter,
  accounts: accountsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
