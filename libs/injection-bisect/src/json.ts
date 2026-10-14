import { Array as Arr } from "effect";
import { parseTree, visit } from "jsonc-parser";
import type { ParseError } from "jsonc-parser";

import type { Parser, Span, Unit } from "./parser.ts";
import { looksLikeProse } from "./prose.ts";

const OPENING = /^\s*[[{]/u;

const QUOTE = '"'.length;

const FIRST = 0;

const COMMENT_MARK = "//".length;

const BLOCK_END = "*/".length;

const looksLikeJson = (text: string): boolean => {
  if (!OPENING.test(text)) {
    return false;
  }
  const errors: ParseError[] = [];
  parseTree(text, errors);
  return Arr.isArrayEmpty(errors);
};

const commentSpan = (text: string, start: number, end: number): Span => {
  if (text.startsWith("//", start)) {
    return { start: start + COMMENT_MARK, end };
  }
  return { start: start + COMMENT_MARK, end: end - BLOCK_END };
};

const jsonUnitsOf = (text: string): readonly Unit[] => {
  const spans: Span[] = [];
  visit(text, {
    onLiteralValue: (value: unknown, offset, length) => {
      if (typeof value === "string") {
        spans.push({ start: offset + QUOTE, end: offset + length - QUOTE });
      }
    },
    onComment: (offset, length) => {
      spans.push(commentSpan(text, offset, offset + length));
    },
  });
  return spans
    .filter(({ start, end }) => looksLikeProse(text.slice(start, end)))
    .map(({ start, end }): Unit => ({ kind: "prose", start, end }));
};

const jsonParser: Parser = {
  format: "json",
  extensions: [".json", ".jsonc", ".jsonld", ".geojson", ".har", ".webmanifest"],
  accepts: looksLikeJson,
  unitsOf: jsonUnitsOf,
};

const LINE = /[^\n]+/gu;

const MIN_RECORDS = 2;

const recordsOf = (text: string): readonly Span[] =>
  Array.from(text.matchAll(LINE), (match) => ({
    start: match.index,
    end: match.index + match[FIRST].length,
  })).filter(({ start, end }) => text.slice(start, end).trim() !== "");

const looksLikeJsonLines = (text: string): boolean => {
  const records = recordsOf(text);
  return (
    records.length >= MIN_RECORDS &&
    records.every(({ start, end }) => looksLikeJson(text.slice(start, end)))
  );
};

const jsonLinesParser: Parser = {
  format: "jsonl",
  aliases: ["ndjson"],
  extensions: [".jsonl", ".ndjson"],
  accepts: looksLikeJsonLines,
  unitsOf: (text) =>
    recordsOf(text).map(({ start, end }): Unit => ({ kind: "nested", format: "json", start, end })),
};

export { jsonLinesParser, jsonParser };
