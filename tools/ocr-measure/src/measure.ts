import { NodeRuntime } from "@effect/platform-node";
import { PRODUCT_NAME, openRouter } from "@r_masseater/ocr-decide";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { OtlpSerialization, OtlpTracer } from "effect/observability";

import { measureDocument } from "./outcome.ts";
import { Results, resultsLayer } from "./report.ts";

const ONE_AT_A_TIME = { concurrency: 1 } as const;

const measure = Effect.gen(function* measure() {
  const results = yield* Results;
  const documents = yield* results.documents;
  const outcomes = yield* Effect.forEach(
    documents,
    (document) =>
      results.image(document).pipe(Effect.flatMap((image) => measureDocument(document, image))),
    ONE_AT_A_TIME,
  ).pipe(Effect.map((all) => all.flat()));
  yield* results.writeDetails(outcomes);
  yield* results.writeSummary({ outcomes, documents });
});

const tracing = OtlpTracer.layerFromConfig({
  resource: { serviceName: `${PRODUCT_NAME}-measure` },
}).pipe(Layer.provide(OtlpSerialization.layerJson), Layer.provide(FetchHttpClient.layer));

const services = Layer.mergeAll(openRouter, tracing, resultsLayer);

NodeRuntime.runMain(
  Layer.build(services).pipe(
    Effect.flatMap((context) => Effect.provideContext(measure, context)),
    Effect.scoped,
  ),
);
