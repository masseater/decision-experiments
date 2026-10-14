import { Array as Arr } from "effect";
import { parseTree, visit } from "jsonc-parser";
import type { ParseError } from "jsonc-parser";

import type { Parser, Span, Unit } from "./parser.ts";
import { looksLikeProse } from "./prose.ts";

const OPENING = /^\s*[[{]/u;

const QUOTE = '"'.length;

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
  extensions: [".json", ".jsonc"],
  accepts: looksLikeJson,
  unitsOf: jsonUnitsOf,
};

export { jsonParser };
