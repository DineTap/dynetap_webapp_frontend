import { createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "./routers/auth";
import { menusRouter } from "./routers/menus";
import { paymentsRouter } from "./routers/payments";
import { languagesRouter } from "./routers/languages";
import { checkoutRouter } from "./routers/checkout";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  menus: menusRouter,
  auth: authRouter,
  payments: paymentsRouter,
  languages: languagesRouter,
  checkout: checkoutRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
