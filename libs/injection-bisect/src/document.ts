import { Array as Arr, Effect, Option } from "effect";

import { emailReader } from "./email.ts";
import { OFFICE_READERS } from "./office.ts";
import type { Document, Parser, Reader } from "./parser.ts";
import { pdfReader } from "./pdf.ts";
import { ReadError } from "./read-error.ts";
import { AUTO, DEFAULT_PARSERS, isNamed, plainParser } from "./segment.ts";

const DEFAULT_READERS: readonly Reader[] = [pdfReader, ...OFFICE_READERS, emailReader];

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

const formatsOf = (formats: Formats = {}): readonly string[] => [
  AUTO,
  ...parsersOf(formats).map(({ format }) => format),
  ...readersOf(formats).map(({ format }) => format),
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
  const extension = extensionOf(input.name ?? "");
  const byExtension = Arr.findFirst([...readersOf(input), ...parsersOf(input)], ({ extensions }) =>
    extensions.includes(extension),
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
  const format = input.format ?? AUTO;
  if (format === AUTO) {
    return detected(input);
  }
  return named(input, format);
};

export { DEFAULT_READERS, formatsOf, readDocument };
export type { Formats, ReadInput };
