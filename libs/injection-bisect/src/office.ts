import { Array as Arr, Effect, Option, Order } from "effect";
import type { Unzipped } from "fflate";
import { Parser as XmlParser } from "htmlparser2";

import type { Reader } from "./parser.ts";
import { textIn, unzipped } from "./zip.ts";

const FIRST = 0;

const NOT_FOUND = -1;

const XML = ".xml";

const NONE = 0;

const OOXML_TEXT = ["t", "title", "description", "subject", "keywords"];

const OOXML_BLOCKS = ["p", "si", "tr", "br", "title", "description", "subject", "keywords"];

const ODF_TEXT = ["p", "h", "title", "desc", "description", "subject", "keyword"];

const DESCRIBED = new Set(["docPr", "cNvPr"]);

const DESCRIPTION_ATTRIBUTES = ["descr", "title"] as const;

const NUMBER = /\d+/u;

const PARAGRAPH_BREAK = "\n\n";

interface Kind {
  readonly format: string;
  readonly extensions: readonly string[];
  readonly marker: string;
  readonly parts: readonly string[];
  readonly text: readonly string[];
  readonly blocks: readonly string[];
}

const OOXML = { text: OOXML_TEXT, blocks: OOXML_BLOCKS } as const;

const ODF = {
  parts: ["meta.xml", "styles.xml", "content.xml"],
  text: ODF_TEXT,
  blocks: ODF_TEXT,
} as const;

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
    ...OOXML,
  },
  pptx: {
    format: "pptx",
    extensions: [".pptx"],
    marker: "ppt/presentation.xml",
    parts: ["docProps/core.xml", "ppt/slides/slide", "ppt/notesSlides/notesSlide", "ppt/comments/"],
    ...OOXML,
  },
  xlsx: {
    format: "xlsx",
    extensions: [".xlsx"],
    marker: "xl/workbook.xml",
    parts: ["docProps/core.xml", "xl/sharedStrings.xml", "xl/worksheets/sheet", "xl/comments"],
    ...OOXML,
  },
  odt: {
    format: "odt",
    extensions: [".odt", ".ott"],
    marker: "application/vnd.oasis.opendocument.text",
    ...ODF,
  },
  odp: {
    format: "odp",
    extensions: [".odp", ".otp"],
    marker: "application/vnd.oasis.opendocument.presentation",
    ...ODF,
  },
  ods: {
    format: "ods",
    extensions: [".ods", ".ots"],
    marker: "application/vnd.oasis.opendocument.spreadsheet",
    ...ODF,
  },
} as const satisfies Record<string, Kind>;

const localName = (name: string): string => name.slice(name.indexOf(":") + ":".length);

const descriptionsOf = (attributes: Readonly<Record<string, string>>): readonly string[] =>
  DESCRIPTION_ATTRIBUTES.flatMap((key) =>
    Option.toArray(Option.fromNullishOr(attributes[key])),
  ).map((value) => `${value}${PARAGRAPH_BREAK}`);

const textOfXml = (xml: string, { text, blocks }: Pick<Kind, "text" | "blocks">): string => {
  const out: string[] = [];
  let depth = NONE;
  const parser = new XmlParser(
    {
      onopentag: (name, attributes): void => {
        const local = localName(name);
        depth += Number(text.includes(local));
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
        depth -= Number(text.includes(local));
        if (blocks.includes(local)) {
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

const textOfFiles = (files: Unzipped, kind: Kind): string =>
  Arr.sort(Object.keys(files), orderOf(kind.parts))
    .map((name) => textOfXml(textIn(files)(name), kind))
    .filter((text) => text !== "")
    .join(PARAGRAPH_BREAK);

const readerOf = (kind: Kind): Reader => ({
  format: kind.format,
  extensions: kind.extensions,
  accepts: (bytes) => latin1.decode(bytes).includes(kind.marker),
  read: (bytes) =>
    unzipped({ bytes, keep: (name) => rankIn(kind.parts)(name) !== NOT_FOUND }).pipe(
      Effect.map((files) => ({ text: textOfFiles(files, kind), format: "plain" })),
    ),
});

const OFFICE_READERS: readonly Reader[] = Object.values(KINDS).map((kind) => readerOf(kind));

export { OFFICE_READERS };
