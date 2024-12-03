import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { bundlersRouter } from "./routers/bundlers";
import { paymastersRouter } from "./routers/paymasters";
import { accountFactorysRouter } from "./routers/factories";
import { addressBookRouter } from "./routers/address-book";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  addressBook: addressBookRouter,
  bundlers: bundlersRouter,
  paymasters: paymastersRouter,
  factories: accountFactorysRouter,
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
