import { Effect } from "effect";
import { expect, test } from "vite-plus/test";

import { ENGLISH_MARK, cleanedOf } from "./__tests__/fake-judge.ts";
import type { Cleaned } from "./__tests__/fake-judge.ts";
import { SCANNED_PDF, SCANNED_PNG } from "./__tests__/scans.ts";
import { readDocument, readersWith } from "./document.ts";
import type { JudgeError } from "./judge-error.ts";
import type { Document } from "./parser.ts";
import type { ReadError } from "./read-error.ts";

const OCR_TIMEOUT = 120_000;

const LANGUAGE_DATA = new URL(
  "../node_modules/@tesseract.js-data/eng/4.0.0_best_int",
  import.meta.url,
).pathname;

const readers = readersWith({
  languages: ["eng"],
  worker: { langPath: LANGUAGE_DATA, cacheMethod: "none" },
});

const foundIn = (
  bytes: Uint8Array,
  name: string,
): Effect.Effect<Cleaned & { readonly document: Document }, ReadError | JudgeError> =>
  readDocument({ bytes, name, readers }).pipe(
    Effect.flatMap((document) =>
      cleanedOf(document).pipe(Effect.map((cleaned) => ({ document, ...cleaned }))),
    ),
  );

test(
  "reads the text in an image and finds the injection",
  () =>
    Effect.runPromise(
      Effect.gen(function* image() {
        const { document, found, cleaned } = yield* foundIn(SCANNED_PNG, "note");
        expect(document.text).toContain("Meeting notes for Monday.");
        expect(found.join("").toLowerCase()).toContain(ENGLISH_MARK);
        expect(cleaned.toLowerCase()).not.toContain(ENGLISH_MARK);
      }),
    ),
  OCR_TIMEOUT,
);

test(
  "reads a PDF page that has only an image",
  () =>
    Effect.runPromise(
      Effect.gen(function* scanned() {
        const { document, found } = yield* foundIn(SCANNED_PDF, "scan.pdf");
        expect(document.text).toContain("Meeting notes for Monday.");
        expect(found.join("").toLowerCase()).toContain(ENGLISH_MARK);
      }),
    ),
  OCR_TIMEOUT,
);
