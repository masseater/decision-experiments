import { CATEGORIES } from "@ocr-decide/measurements/ja-bench-schema";
import { DateTime, Effect } from "effect";

import { ENGINES } from "./engines.ts";
import { Results } from "./results.ts";
import { summarizeEngine } from "./summarize.ts";

const NOTHING = 0;

const ONE_AT_A_TIME = { concurrency: 1 } as const;

const writeReport = Effect.gen(function* writeReport() {
  const results = yield* Results;
  const pages = yield* results.pages;
  const read = yield* Effect.forEach(
    ENGINES,
    (engine) => results.read(engine).pipe(Effect.map((found) => ({ engine, found }))),
    ONE_AT_A_TIME,
  );
  const runs = read
    .filter(({ found }) => found.readings.length > NOTHING)
    .map(({ engine, found }) => summarizeEngine({ engine, results: found, pages }))
    .toSorted((left, right) => right.accuracy - left.accuracy);
  const now = yield* DateTime.now;
  yield* results.writeSummary({
    generatedAt: DateTime.formatIso(now),
    pages: pages.length,
    categories: CATEGORIES.map(({ id, label, source }) => ({
      id,
      label,
      source,
      pages: pages.filter(({ category }) => category === id).length,
    })),
    runs,
  });
});

export { writeReport };
