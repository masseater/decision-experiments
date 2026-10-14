import { Reader as CompoundReader } from "@kenjiuno/msgreader/lib/Reader.js";
import { Effect, Option } from "effect";

import { ReadError } from "./read-error.ts";

const COMPOUND_FILE = "ÐÏ\u0011à¡±\u001Aá";

const BIT = 2;

const SET = 1;

const latin1 = new TextDecoder("latin1");

const utf16le = new TextDecoder("utf-16le");

const viewOf = (bytes: Uint8Array): DataView =>
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

const hasFlag =
  (flag: number) =>
  (value: number): boolean =>
    Math.floor(value / flag) % BIT === SET;

const nameInDirectory = (name: string): string => name.replaceAll(/(?<letter>.)/gu, "$<letter>\0");

const hasStream =
  (name: string) =>
  (bytes: Uint8Array): boolean => {
    const text = latin1.decode(bytes);
    return text.startsWith(COMPOUND_FILE) && text.includes(nameInDirectory(name));
  };

const streamsOf = (
  bytes: Uint8Array,
): Effect.Effect<(name: string) => Option.Option<Uint8Array>, ReadError> =>
  Effect.try({
    try: () => {
      const reader = new CompoundReader(viewOf(bytes));
      reader.parse();
      const root = reader.rootFolder();
      return (name: string) => Option.fromNullishOr(root.readFile(name));
    },
    catch: (cause) => new ReadError({ reason: String(cause) }),
  });

const streamIn =
  (stream: (name: string) => Option.Option<Uint8Array>) =>
  (name: string): Effect.Effect<Uint8Array, ReadError> =>
    Effect.fromOption(stream(name)).pipe(
      Effect.mapError(() => new ReadError({ reason: `missing stream: ${name}` })),
    );

const streamReaderOf = (
  bytes: Uint8Array,
): Effect.Effect<(name: string) => Effect.Effect<Uint8Array, ReadError>, ReadError> =>
  streamsOf(bytes).pipe(Effect.map(streamIn));

export { hasFlag, hasStream, latin1, streamReaderOf, utf16le, viewOf };
