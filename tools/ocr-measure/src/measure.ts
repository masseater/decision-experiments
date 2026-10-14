import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { SummarySchema } from "@ocr-decide/measurements/schema";
import {
  CUTOFF,
  DEFAULT_GENERATOR_MODEL,
  INVOICE_FIELDS,
  PRODUCT_NAME,
  REREAD_BELOW,
  openRouter,
} from "@r_masseater/ocr-decide";
import { DateTime, Effect, FileSystem, Layer, Schema } from "effect";
import { FetchHttpClient } from "effect/http";
import { OtlpSerialization, OtlpTracer } from "effect/observability";

import { measureDocument } from "./outcome.ts";
import type { Outcome } from "./outcome.ts";
import { DocumentsSchema } from "./sample.ts";
import { GROUPS, summarize } from "./summarize.ts";

const INDENT = { space: 2 } as const;

const ONE_AT_A_TIME = { concurrency: 1 } as const;

const DATA = new URL("../data/", import.meta.url);

const DETAILS = new URL("../results/details.json", import.meta.url);

const SUMMARY = new URL("../../../libs/ocr-measurements/summary.json", import.meta.url);

const DetailsSchema = Schema.fromJsonString(
  Schema.Array(
    Schema.Struct({
      id: Schema.String,
      method: Schema.String,
      model: Schema.String,
      seconds: Schema.Finite,
      costUsd: Schema.Finite,
      values: Schema.Unknown,
    }),
  ),
  INDENT,
);

type Detail = (typeof DetailsSchema.Type)[number];

const valuesOf = ({ extraction }: Outcome): unknown => {
  if (extraction.status === "failed") {
    return { failed: extraction.reason };
  }
  return extraction.value.values;
};

const detailOf = (outcome: Outcome): Detail => {
  const { id, method, model, seconds, costUsd } = outcome;
  return { id, method, model, seconds, costUsd, values: valuesOf(outcome) };
};

const measure = Effect.gen(function* measure() {
  const fs = yield* FileSystem.FileSystem;
  const documents = yield* fs
    .readFileString(new URL("documents.json", DATA).pathname)
    .pipe(Effect.flatMap(Schema.decodeEffect(DocumentsSchema)));
  const outcomes = yield* Effect.forEach(
    documents,
    (document) =>
      fs
        .readFile(new URL(`${document.id}.png`, DATA).pathname)
        .pipe(Effect.flatMap((image) => measureDocument(document, image))),
    ONE_AT_A_TIME,
  );
  const flat = outcomes.flat();
  const details = yield* Schema.encodeEffect(DetailsSchema)(
    flat.map((outcome) => detailOf(outcome)),
  );
  yield* fs.writeFileString(DETAILS.pathname, `${details}\n`);
  const summary = yield* Schema.encodeEffect(Schema.fromJsonString(SummarySchema, INDENT))({
    generatedAt: DateTime.formatIso(yield* DateTime.now),
    documents: documents.length,
    generatorModel: DEFAULT_GENERATOR_MODEL,
    cutoff: CUTOFF,
    rereadBelow: REREAD_BELOW,
    fields: INVOICE_FIELDS.map(({ id, label }) => ({ id, label })),
    groups: GROUPS,
    runs: summarize({ outcomes: flat, documents }),
  });
  yield* fs.writeFileString(SUMMARY.pathname, `${summary}\n`);
});

const tracing = OtlpTracer.layerFromConfig({
  resource: { serviceName: `${PRODUCT_NAME}-measure` },
}).pipe(Layer.provide(OtlpSerialization.layerJson), Layer.provide(FetchHttpClient.layer));

const services = Layer.mergeAll(openRouter, tracing, NodeServices.layer);

NodeRuntime.runMain(
  Layer.build(services).pipe(
    Effect.flatMap((context) => Effect.provideContext(measure, context)),
    Effect.scoped,
  ),
);
