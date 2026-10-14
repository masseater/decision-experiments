import { Effect } from "effect";
import { OEM, createWorker } from "tesseract.js";
import type { WorkerOptions } from "tesseract.js";

import type { Reader } from "./parser.ts";
import { ReadError } from "./read-error.ts";

interface OcrOptions {
  readonly languages?: readonly string[];
  readonly worker?: Partial<WorkerOptions>;
}

const DEFAULT_LANGUAGES = ["jpn", "eng"] as const;

const PAGE_BREAK = "\n\n";

const ONE_AT_A_TIME = { concurrency: 1 } as const;

const failure = (cause: unknown): ReadError => new ReadError({ reason: String(cause) });

const recognizedText =
  ({ languages = DEFAULT_LANGUAGES, worker = {} }: OcrOptions) =>
  (images: readonly Uint8Array[]): Effect.Effect<string, ReadError> =>
    Effect.acquireUseRelease(
      Effect.tryPromise({
        try: () => createWorker([...languages], OEM.LSTM_ONLY, worker),
        catch: failure,
      }),
      (tesseract) =>
        Effect.forEach(
          images,
          (image) => Effect.tryPromise({ try: () => tesseract.recognize(image), catch: failure }),
          ONE_AT_A_TIME,
        ).pipe(Effect.map((results) => results.map(({ data }) => data.text).join(PAGE_BREAK))),
      (tesseract) => Effect.promise(() => tesseract.terminate()),
    ).pipe(Effect.withSpan("injection-bisect.ocr"));

const imageReaderOf = (options: OcrOptions): Reader => ({
  format: "image",
  extensions: [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tif", ".tiff"],
  read: (bytes) =>
    recognizedText(options)([bytes]).pipe(Effect.map((text) => ({ text, format: "plain" }))),
});

export { ONE_AT_A_TIME, PAGE_BREAK, failure, imageReaderOf, recognizedText };
export type { OcrOptions };
