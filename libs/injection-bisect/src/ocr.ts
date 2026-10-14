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

const HEAD = { start: 0, end: 12 } as const;

const SIGNATURES = ["\u0089PNG", "\u00FF\u00D8\u00FF", "GIF8", "II*\u0000", "MM\u0000*"] as const;

const WEBP = /^RIFF[\s\S]{4}WEBP/u;

const PAGE_BREAK = "\n\n";

const ONE_AT_A_TIME = { concurrency: 1 } as const;

const failure = (cause: unknown): ReadError => new ReadError({ reason: String(cause) });

const looksLikeImage = (bytes: Uint8Array): boolean => {
  const head = String.fromCodePoint(...bytes.subarray(HEAD.start, HEAD.end));
  return SIGNATURES.some((signature) => head.startsWith(signature)) || WEBP.test(head);
};

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
  accepts: looksLikeImage,
  read: (bytes) =>
    recognizedText(options)([bytes]).pipe(Effect.map((text) => ({ text, format: "plain" }))),
});

export { ONE_AT_A_TIME, PAGE_BREAK, failure, imageReaderOf, recognizedText };
export type { OcrOptions };
