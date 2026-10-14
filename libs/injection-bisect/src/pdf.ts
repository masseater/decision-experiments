import { Effect } from "effect";
import { extractText, getDocumentProxy } from "unpdf";

import type { Reader } from "./parser.ts";
import { ReadError } from "./read-error.ts";

const MAGIC = "%PDF-";

const HEAD = 0;

const ascii = new TextDecoder("latin1");

const failure = (cause: unknown): ReadError => new ReadError({ reason: String(cause) });

const pdfReader: Reader = {
  format: "pdf",
  extensions: [".pdf"],
  accepts: (bytes) => ascii.decode(bytes.subarray(HEAD, MAGIC.length)) === MAGIC,
  read: (bytes) =>
    Effect.tryPromise({ try: () => getDocumentProxy(Uint8Array.from(bytes)), catch: failure }).pipe(
      Effect.flatMap((pdf) =>
        Effect.tryPromise({ try: () => extractText(pdf, { mergePages: false }), catch: failure }),
      ),
      Effect.map(({ text }) => ({ text: text.join("\n\n"), format: "plain" })),
    ),
};

export { pdfReader };
