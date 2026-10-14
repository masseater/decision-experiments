import { Effect } from "effect";
import { gunzip } from "fflate";

import type { Document, Reader } from "./parser.ts";
import { ReadError } from "./read-error.ts";
import { isTar, tarEntries } from "./tar.ts";
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

const ARCHIVE_FORMATS = ["zip", "tar", "gzip"] as const;

const GZIP = "\u001F\u008B";

const NUL = "\0";

const HEAD_START = 0;

const SKIPPED = ["__MACOSX/", ".DS_Store"];

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

const sectionsOf =
  (read: ReadEntry) =>
  (entries: readonly Entry[]): Effect.Effect<Document> =>
    Effect.forEach(
      entries,
      ({ bytes, name }) =>
        read({ bytes, name }).pipe(
          Effect.map((document) => sectionOf(name, document)),
          Effect.orElseSucceed((): readonly string[] => []),
        ),
      { concurrency: 1 },
    ).pipe(Effect.map((sections) => ({ text: sections.flat().join("\n\n"), format: "markdown" })));

const startsWith = (bytes: Uint8Array, signature: string): boolean =>
  String.fromCodePoint(...bytes.subarray(HEAD_START, signature.length)) === signature;

const gunzipped = (bytes: Uint8Array): Effect.Effect<Uint8Array, ReadError> =>
  Effect.callback<Uint8Array, ReadError>((resume) => {
    gunzip(bytes, (cause, data) => {
      if (cause === null) {
        resume(Effect.succeed(data));
      } else {
        const failure = new ReadError({ reason: String(cause) });
        resume(Effect.fail(failure));
      }
    });
  });

const archiveReadersOf = (read: ReadEntry): readonly Reader[] => [
  {
    format: "zip",
    extensions: [".zip"],
    accepts: (bytes) => startsWith(bytes, SIGNATURE),
    read: (bytes) =>
      unzipped({ bytes, keep: kept }).pipe(
        Effect.map((files) => Object.entries(files).map(([name, data]) => ({ name, bytes: data }))),
        Effect.flatMap(sectionsOf(read)),
      ),
  },
  {
    format: "tar",
    extensions: [".tar"],
    accepts: isTar,
    read: (bytes) => sectionsOf(read)(tarEntries(bytes).filter(({ name }) => kept(name))),
  },
  {
    format: "gzip",
    extensions: [".gz", ".tgz"],
    accepts: (bytes) => startsWith(bytes, GZIP),
    read: (bytes) =>
      gunzipped(bytes).pipe(Effect.flatMap((inner) => read({ bytes: inner, name: "" }))),
  },
];

export { ARCHIVE_FORMATS, archiveReadersOf };
export type { Entry, ReadEntry };
