import { Array as Arr, Effect, Option, Order } from "effect";
import { strFromU8, unzip } from "fflate";
import type { Unzipped } from "fflate";
import { Parser as XmlParser } from "htmlparser2";

import type { Reader } from "./parser.ts";
import { ReadError } from "./read-error.ts";

const FIRST = 0;

const NOT_FOUND = -1;

const XML = ".xml";

const NONE = 0;

const TEXT = new Set(["t", "title", "description", "subject", "keywords"]);

const BREAK = new Set(["p", "si", "tr", "br"]);

const ENDS_BLOCK = new Set([...BREAK, ...[...TEXT].filter((name) => name !== "t")]);

const DESCRIBED = new Set(["docPr", "cNvPr"]);

const DESCRIPTION_ATTRIBUTES = ["descr", "title"] as const;

const NUMBER = /\d+/u;

const PARAGRAPH_BREAK = "\n\n";

interface Kind {
  readonly format: string;
  readonly extensions: readonly string[];
  readonly marker: string;
  readonly parts: readonly string[];
}

const KINDS = {
  docx: {
    format: "docx",
    extensions: [".docx"],
    marker: "word/document.xml",
    parts: [
      "docProps/core.xml",
      "word/header",
      "word/document.xml",
      "word/footnotes.xml",
      "word/endnotes.xml",
      "word/footer",
      "word/comments",
    ],
  },
  pptx: {
    format: "pptx",
    extensions: [".pptx"],
    marker: "ppt/presentation.xml",
    parts: ["docProps/core.xml", "ppt/slides/slide", "ppt/notesSlides/notesSlide", "ppt/comments/"],
  },
  xlsx: {
    format: "xlsx",
    extensions: [".xlsx"],
    marker: "xl/workbook.xml",
    parts: ["docProps/core.xml", "xl/sharedStrings.xml", "xl/worksheets/sheet", "xl/comments"],
  },
} as const satisfies Record<string, Kind>;

const localName = (name: string): string => name.slice(name.indexOf(":") + ":".length);

const descriptionsOf = (attributes: Readonly<Record<string, string>>): readonly string[] =>
  DESCRIPTION_ATTRIBUTES.flatMap((key) =>
    Option.toArray(Option.fromNullishOr(attributes[key])),
  ).map((value) => `${value}${PARAGRAPH_BREAK}`);

const textOfXml = (xml: string): string => {
  const out: string[] = [];
  let depth = NONE;
  const parser = new XmlParser(
    {
      onopentag: (name, attributes): void => {
        const local = localName(name);
        depth += Number(TEXT.has(local));
        if (DESCRIBED.has(local)) {
          out.push(...descriptionsOf(attributes));
        }
      },
      ontext: (data): void => {
        if (depth > NONE) {
          out.push(data);
        }
      },
      onclosetag: (name): void => {
        const local = localName(name);
        depth -= Number(TEXT.has(local));
        if (ENDS_BLOCK.has(local)) {
          out.push(PARAGRAPH_BREAK);
        }
      },
    },
    { xmlMode: true, decodeEntities: true },
  );
  parser.end(xml);
  return out
    .join("")
    .replaceAll(/\n{3,}/gu, "\n\n")
    .trim();
};

const numberIn = (name: string): number =>
  Option.fromNullishOr(NUMBER.exec(name)).pipe(
    Option.map(([digits]) => Number(digits)),
    Option.getOrElse(() => FIRST),
  );

const rankIn =
  (parts: readonly string[]) =>
  (name: string): number =>
    parts.findIndex((part) => name.startsWith(part) && name.endsWith(XML));

const orderOf = (parts: readonly string[]): Order.Order<string> =>
  Order.combine(
    Order.mapInput(Order.Number, rankIn(parts)),
    Order.mapInput(Order.Number, numberIn),
  );

const latin1 = new TextDecoder("latin1");

const failure = (cause: unknown): ReadError => new ReadError({ reason: String(cause) });

const settled = (cause: unknown, files: Unzipped): Effect.Effect<Unzipped, ReadError> =>
  Option.match(Option.fromNullishOr(cause), {
    onNone: () => Effect.succeed(files),
    onSome: (error) => Effect.fail(failure(error)),
  });

const keep =
  (parts: readonly string[]) =>
  ({ name }: { readonly name: string }): boolean =>
    rankIn(parts)(name) !== NOT_FOUND;

const filesOf = (bytes: Uint8Array, parts: readonly string[]): Effect.Effect<Unzipped, ReadError> =>
  Effect.callback<Unzipped, ReadError>((resume) => {
    unzip(bytes, { filter: keep(parts) }, (cause, files) => {
      resume(settled(cause, files));
    });
  });

const textOfFiles = (files: Unzipped, parts: readonly string[]): string =>
  Arr.sort(Object.keys(files), orderOf(parts))
    .map((name) => textOfXml(strFromU8(files[name] ?? new Uint8Array())))
    .filter((text) => text !== "")
    .join(PARAGRAPH_BREAK);

const readerOf = ({ format, extensions, marker, parts }: Kind): Reader => ({
  format,
  extensions,
  accepts: (bytes) => latin1.decode(bytes).includes(marker),
  read: (bytes) =>
    filesOf(bytes, parts).pipe(
      Effect.map((files) => ({ text: textOfFiles(files, parts), format: "plain" })),
    ),
});

const OFFICE_READERS: readonly Reader[] = Object.values(KINDS).map((kind) => readerOf(kind));

export { OFFICE_READERS };
