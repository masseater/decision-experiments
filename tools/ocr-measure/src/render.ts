import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Schema } from "effect";
import { chromium } from "playwright-core";

import { htmlOf } from "./html.ts";
import { DocumentsSchema } from "./sample.ts";

const CHROMIUM = "/opt/pw-browsers/chromium";

const DATA = new URL("../data/", import.meta.url);

const ONE_AT_A_TIME = { concurrency: 1 } as const;

const SCALE = { clean: 1.5, degraded: 0.75 } as const;

const render = Effect.gen(function* render() {
  const fs = yield* FileSystem.FileSystem;
  const documents = yield* fs
    .readFileString(new URL("documents.json", DATA).pathname)
    .pipe(Effect.flatMap(Schema.decodeEffect(DocumentsSchema)));
  const browser = yield* Effect.acquireRelease(
    Effect.promise(() => chromium.launch({ executablePath: CHROMIUM })),
    (opened) => Effect.promise(() => opened.close()),
  );
  yield* Effect.forEach(
    documents,
    (document) =>
      Effect.gen(function* screenshot() {
        const page = yield* Effect.promise(() =>
          browser.newPage({ deviceScaleFactor: SCALE[document.condition] }),
        );
        yield* Effect.promise(() => page.setContent(htmlOf(document)));
        const image = yield* Effect.promise(() => page.locator("body").screenshot({ type: "png" }));
        yield* fs.writeFile(new URL(`${document.id}.png`, DATA).pathname, image);
        yield* Effect.promise(() => page.close());
      }).pipe(Effect.withSpan("ocr-measure.render", { attributes: { id: document.id } })),
    ONE_AT_A_TIME,
  );
}).pipe(Effect.scoped);

NodeRuntime.runMain(
  Layer.build(NodeServices.layer).pipe(
    Effect.flatMap((context) => Effect.provideContext(render, context)),
    Effect.scoped,
  ),
);
