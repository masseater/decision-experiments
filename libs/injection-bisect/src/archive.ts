import { Effect } from "effect";

import type { Document, Reader } from "./parser.ts";
import type { ReadError } from "./read-error.ts";
import { unzipped } from "./zip.ts";

interface Entry {
  readonly bytes: Uint8Array;
  readonly name: string;
}

type ReadEntry = (entry: Entry) => Effect.Effect<Document, ReadError>;

const SIGNATURE = "PK\u0003\u0004";

const FENCE = /`+/gu;

const SHORTEST_FENCE = 3;

const LONGER = 1;

const ARCHIVE_FORMAT = "zip";

const NUL = "\0";

const HEAD_START = 0;

const SKIPPED = ["__MACOSX/", ".DS_Store"];

const latin1 = new TextDecoder("latin1");

const kept = (name: string): boolean =>
  !name.endsWith("/") && !SKIPPED.some((skipped) => name.includes(skipped));

const fenceFor = (text: string): string => {
  const runs = Array.from(text.matchAll(FENCE), ([run]) => run.length + LONGER);
  return "`".repeat(Math.max(SHORTEST_FENCE, ...runs));
};

const sectionOf = (name: string, { text, format }: Document): readonly string[] => {
  if (text.includes(NUL) || text.trim() === "") {
    return [];
  }
  const fence = fenceFor(text);
  return [`## ${name}`, `${fence}${format}\n${text}\n${fence}`];
};

const archiveReaderOf = (read: ReadEntry): Reader => ({
  format: ARCHIVE_FORMAT,
  extensions: [".zip"],
  accepts: (bytes) => latin1.decode(bytes.subarray(HEAD_START, SIGNATURE.length)) === SIGNATURE,
  read: (bytes) =>
    unzipped({ bytes, keep: kept }).pipe(
      Effect.flatMap((files) =>
        Effect.forEach(
          Object.entries(files),
          ([name, data]) =>
            read({ bytes: data, name }).pipe(
              Effect.map((document) => sectionOf(name, document)),
              Effect.orElseSucceed((): readonly string[] => []),
            ),
          { concurrency: 1 },
        ),
      ),
      Effect.map((sections) => ({ text: sections.flat().join("\n\n"), format: "markdown" })),
    ),
});

export { ARCHIVE_FORMAT, archiveReaderOf };
export type { Entry, ReadEntry };
