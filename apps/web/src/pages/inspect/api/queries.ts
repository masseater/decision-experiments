import { createIsomorphicFn } from "@tanstack/react-start";
import { Effect } from "effect";

import { browserClient, createQueries, serverClient } from "#/shared/api";

import type { InspectRoutes } from "./routes.server";

const loadInspectRoutes = (): Promise<InspectRoutes> =>
  Effect.runPromise(
    Effect.promise(() => import("./routes.server")).pipe(
      Effect.map((module) => module.inspectRoutes),
    ),
  );

const client = createIsomorphicFn()
  .server(() => serverClient<InspectRoutes>(loadInspectRoutes))
  .client(() => browserClient<InspectRoutes>());

const inspectQueries = createQueries<InspectRoutes>(client());

export { inspectQueries };
