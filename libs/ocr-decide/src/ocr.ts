import { Effect } from "effect";
import { OEM, createWorker } from "tesseract.js";
import type { WorkerOptions } from "tesseract.js";

import type { Fragment } from "./fragment.ts";
import { OcrError } from "./ocr-error.ts";

interface OcrRequest {
  readonly image: Uint8Array;
}

interface OcrOptions {
  readonly languages?: readonly string[];
  readonly worker?: Partial<WorkerOptions>;
}

const DEFAULT_LANGUAGES = ["jpn", "eng"] as const;

const PERCENT = 100;

const BLOCKS = { blocks: true } as const;

const CJK = String.raw`[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]`;

const SPACE_BETWEEN_CJK = new RegExp(String.raw`(?<=${CJK})\s+(?=${CJK})`, "gu");

const failure = (cause: unknown): OcrError => new OcrError({ reason: String(cause) });

const readFragments = ({
  image,
  languages = DEFAULT_LANGUAGES,
  worker = {},
}: OcrRequest & OcrOptions): Effect.Effect<readonly Fragment[], OcrError> =>
  Effect.acquireUseRelease(
    Effect.tryPromise({
      try: () => createWorker([...languages], OEM.LSTM_ONLY, worker),
      catch: failure,
    }),
    (tesseract) =>
      Effect.tryPromise({ try: () => tesseract.recognize(image, {}, BLOCKS), catch: failure }),
    (tesseract) => Effect.promise(() => tesseract.terminate()),
  ).pipe(
    Effect.map(({ data }) =>
      (data.blocks ?? [])
        .flatMap((block) => block.paragraphs)
        .flatMap((paragraph) => paragraph.lines)
        .map((line) => ({
          text: line.text.trim().replaceAll(SPACE_BETWEEN_CJK, ""),
          confidence: line.confidence / PERCENT,
          box: line.bbox,
        }))
        .filter(({ text }) => text !== ""),
    ),
    Effect.withSpan("ocr-decide.ocr"),
  );

export { readFragments };
export type { OcrOptions };
