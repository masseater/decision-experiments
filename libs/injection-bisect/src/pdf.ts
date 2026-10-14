import { Effect } from "effect";
import { encode } from "fast-png";
import { extractImages, extractText, getDocumentProxy } from "unpdf";

import { ONE_AT_A_TIME, PAGE_BREAK, failure, recognizedText } from "./ocr.ts";
import type { OcrOptions } from "./ocr.ts";
import type { Reader } from "./parser.ts";
import type { ReadError } from "./read-error.ts";

const NO_IMAGES = 0;

const FIRST_PAGE = 1;

type Pdf = Awaited<ReturnType<typeof getDocumentProxy>>;

const scannedText =
  (options: OcrOptions, pdf: Pdf) =>
  (page: number): Effect.Effect<string, ReadError> =>
    Effect.tryPromise({ try: () => extractImages(pdf, page), catch: failure }).pipe(
      Effect.flatMap((images) => {
        if (images.length === NO_IMAGES) {
          return Effect.succeed("");
        }
        return recognizedText(options)(
          images.map(({ width, height, data, channels }) =>
            encode({ width, height, data, channels }),
          ),
        );
      }),
    );

const pdfReaderOf = (options: OcrOptions): Reader => ({
  format: "pdf",
  extensions: [".pdf"],
  read: (bytes) =>
    Effect.gen(function* read() {
      const pdf = yield* Effect.tryPromise({
        try: () => getDocumentProxy(Uint8Array.from(bytes)),
        catch: failure,
      });
      const { text } = yield* Effect.tryPromise({
        try: () => extractText(pdf, { mergePages: false }),
        catch: failure,
      });
      const pages = yield* Effect.forEach(
        text,
        (page, index) => {
          if (page.trim() === "") {
            return scannedText(options, pdf)(index + FIRST_PAGE);
          }
          return Effect.succeed(page);
        },
        ONE_AT_A_TIME,
      );
      return { text: pages.join(PAGE_BREAK), format: "plain" };
    }),
});

export { pdfReaderOf };
