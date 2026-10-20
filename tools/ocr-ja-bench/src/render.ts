import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Schema } from "effect";
import { chromium } from "playwright-core";

import { htmlOf } from "./html.ts";
import { SyntheticPagesSchema } from "./page.ts";

const CHROMIUM = "/opt/pw-browsers/chromium";

const DATA = new URL("../data/", import.meta.url);

const DRAFTS = new URL("../.cache/html/", import.meta.url);

const ONE_AT_A_TIME = { concurrency: 1 } as const;

const SCALE = { clean: 2, small: 1, degraded: 1 } as const;

const render = Effect.gen(function* render() {
  const fs = yield* FileSystem.FileSystem;
  const pages = yield* fs
    .readFileString(new URL("synthetic.json", DATA).pathname)
    .pipe(Effect.flatMap(Schema.decodeEffect(SyntheticPagesSchema)));
  yield* fs.makeDirectory(DRAFTS.pathname, { recursive: true });
  const browser = yield* Effect.acquireRelease(
    Effect.promise(() => chromium.launch({ executablePath: CHROMIUM })),
    (opened) => Effect.promise(() => opened.close()),
  );
  yield* Effect.forEach(
    pages,
    (page) =>
      Effect.gen(function* screenshot() {
        const draft = new URL(`${page.id}.html`, DRAFTS);
        yield* fs.writeFileString(draft.pathname, htmlOf(page));
        const tab = yield* Effect.promise(() =>
          browser.newPage({ deviceScaleFactor: SCALE[page.condition] }),
        );
        yield* Effect.promise(() => tab.goto(draft.href));
        yield* Effect.promise(() => tab.evaluate("document.fonts.ready"));
        const image = yield* Effect.promise(() => tab.locator("body").screenshot({ type: "png" }));
        yield* fs.writeFile(new URL(`synthetic/${page.id}.png`, DATA).pathname, image);
        yield* Effect.promise(() => tab.close());
      }).pipe(Effect.withSpan("ocr-ja-bench.render", { attributes: { id: page.id } })),
    ONE_AT_A_TIME,
  );
}).pipe(Effect.scoped);

NodeRuntime.runMain(
  Layer.build(NodeServices.layer).pipe(
    Effect.flatMap((context) => Effect.provideContext(render, context)),
    Effect.scoped,
  ),
);
