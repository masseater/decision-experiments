import { NodeRuntime } from "@effect/platform-node";
import { provideAtEntry } from "@ocr-decide/tooling";
import { Effect } from "effect";

import { outcomeOf } from "./details.ts";
import { Results, resultsLayer } from "./report.ts";

const rescore = Effect.gen(function* rescore() {
  const results = yield* Results;
  const documents = yield* results.documents;
  const details = yield* results.details;
  yield* results.writeSummary({ outcomes: details.map((detail) => outcomeOf(detail)), documents });
});

NodeRuntime.runMain(rescore.pipe(provideAtEntry(resultsLayer)));
