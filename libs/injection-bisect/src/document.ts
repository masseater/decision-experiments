import { Array as Arr, Effect, Option } from "effect";

import { ARCHIVE_FORMAT, archiveReaderOf } from "./archive.ts";
import type { Document, Parser, Reader } from "./parser.ts";
import { DEFAULT_PARSERS } from "./parsers.ts";
import { ReadError } from "./read-error.ts";
import { DEFAULT_READERS } from "./readers.ts";
import { AUTO, isNamed, plainParser } from "./segment.ts";

const NOT_FOUND = -1;

interface Formats {
  readonly parsers?: readonly Parser[];
  readonly readers?: readonly Reader[];
}

interface ReadInput extends Formats {
  readonly bytes: Uint8Array;
  readonly format?: string;
  readonly name?: string;
}

const decoder = new TextDecoder();

const extensionOf = (name: string): string => {
  const dot = name.lastIndexOf(".");
  if (dot === NOT_FOUND) {
    return "";
  }
  return name.slice(dot).toLowerCase();
};

const parsersOf = ({ parsers = DEFAULT_PARSERS }: Formats): readonly Parser[] => [
  ...parsers,
  plainParser,
];

const readersOf = ({ readers = DEFAULT_READERS }: Formats): readonly Reader[] => readers;

const archivesOf = <Archive>(formats: Formats, archive: Archive): readonly Archive[] => {
  if (Arr.isReadonlyArrayEmpty(readersOf(formats))) {
    return [];
  }
  return [archive];
};

const formatsOf = (formats: Formats = {}): readonly string[] => [
  AUTO,
  ...parsersOf(formats).map(({ format }) => format),
  ...readersOf(formats).map(({ format }) => format),
  ...archivesOf(formats, ARCHIVE_FORMAT),
];

const named = (input: ReadInput, format: string): Effect.Effect<Document, ReadError> =>
  Option.match(
    Arr.findFirst(readersOf(input), (reader) => reader.format === format),
    {
      onSome: (reader) => reader.read(input.bytes),
      onNone: () =>
        Option.match(Arr.findFirst(parsersOf(input), isNamed(format)), {
          onSome: (parser) =>
            Effect.succeed({ text: decoder.decode(input.bytes), format: parser.format }),
          onNone: () => Effect.fail(new ReadError({ reason: `unknown format: ${format}` })),
        }),
    },
  );

const detected = (input: ReadInput): Effect.Effect<Document, ReadError> => {
  const name = input.name ?? "";
  const extension = extensionOf(name);
  const fileName = name.slice(name.lastIndexOf("/") + "/".length).toLowerCase();
  const byExtension = Arr.findFirst(
    [...readersOf(input), ...parsersOf(input)],
    ({ extensions }) => extensions.includes(extension) || extensions.includes(fileName),
  );
  const byContent = Arr.findFirst(readersOf(input), (reader) => reader.accepts(input.bytes));
  return Option.match(
    Option.orElse(byExtension, () => byContent),
    {
      onSome: ({ format }) => named(input, format),
      onNone: () => Effect.succeed({ text: decoder.decode(input.bytes), format: AUTO }),
    },
  );
};

const readDocument = (input: ReadInput): Effect.Effect<Document, ReadError> => {
  const archiveReader = archiveReaderOf(({ bytes, name }) =>
    readDocument({ ...input, bytes, name, format: AUTO }),
  );
  const withArchive = {
    ...input,
    readers: [...readersOf(input), ...archivesOf(input, archiveReader)],
  };
  const format = input.format ?? AUTO;
  if (format === AUTO) {
    return detected(withArchive);
  }
  return named(withArchive, format);
};

export { formatsOf, readDocument };
export type { Formats, ReadInput };
