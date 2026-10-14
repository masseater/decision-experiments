import { Effect } from "effect";
import { expect, test } from "vite-plus/test";

import { ENGLISH_MARK, foundIn } from "./__tests__/fake-judge.ts";
import { SCANNED_PDF, SCANNED_PNG } from "./__tests__/scans.ts";
import { readersWith } from "./readers.ts";

const OCR_TIMEOUT = 120_000;

const LANGUAGE_DATA = new URL("4.0.0_best_int", import.meta.resolve("@tesseract.js-data/eng"))
  .pathname;

const readers = readersWith({
  languages: ["eng"],
  worker: { langPath: LANGUAGE_DATA, cacheMethod: "none" },
});

test(
  "reads the text in an image and finds the injection",
  () =>
    Effect.runPromise(
      Effect.gen(function* image() {
        const { document, found, cleaned } = yield* foundIn({
          bytes: SCANNED_PNG,
          name: "note",
          readers,
        });
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
        const { document, found } = yield* foundIn({
          bytes: SCANNED_PDF,
          name: "scan.pdf",
          readers,
        });
        expect(document.text).toContain("Meeting notes for Monday.");
        expect(found.join("").toLowerCase()).toContain(ENGLISH_MARK);
      }),
    ),
  OCR_TIMEOUT,
);
