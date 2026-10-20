import { NodeRuntime } from "@effect/platform-node";
import { Effect, Layer } from "effect";

import { writeReport } from "./report.ts";
import { resultsLayer } from "./results.ts";

NodeRuntime.runMain(
  Layer.build(resultsLayer).pipe(
    Effect.flatMap((context) => Effect.provideContext(writeReport, context)),
    Effect.scoped,
  ),
);
