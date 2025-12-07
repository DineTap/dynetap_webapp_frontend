import { cache } from "react";
import { headers, cookies } from "next/headers";

import { createTRPCContext, createCallerFactory } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  const ckies = await cookies();
  const mappedCookies = new Map(ckies);
  const accessToken = mappedCookies.get("access-token")?.value;

  if (accessToken) {
    heads.set("authorization", accessToken);
  }

  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const createCaller = createCallerFactory(appRouter);

export const api = createCaller(createContext);
