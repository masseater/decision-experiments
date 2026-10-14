import { Array as Arr, Match, Option, Order } from "effect";

import { CODE_PARSERS } from "./code.ts";
import { csvParser, tsvParser } from "./csv.ts";
import { htmlParser } from "./html.ts";
import { jsonParser } from "./json.ts";
import { markdownParser } from "./markdown.ts";
import type { Parser, Span } from "./parser.ts";
import { srtParser, vttParser } from "./subtitles.ts";
import { xmlParser } from "./xml.ts";
import { yamlParser } from "./yaml.ts";

const FIRST = 0;

const AUTO = "auto";

const SENTENCE =
  /(?:[^\n。．！？.!?]|[.!?](?!\s|$)|(?<![>\n])\n(?![^\S\n]*(?:\n|[-*#<>|]|\d+[.)]|$)))+[。．！？.!?]*[^\S\n]*\n*/gu;

const spanOf = (sentence: string, index: number): readonly Span[] => {
  if (sentence.trim() === "") {
    return [];
  }
  return [{ start: index, end: index + sentence.length }];
};

const proseSentencesOf = (text: string): readonly Span[] =>
  [...text.matchAll(SENTENCE)].flatMap((match) => spanOf(match[FIRST], match.index));

const plainParser: Parser = {
  format: "plain",
  extensions: [".txt"],
  accepts: () => true,
  unitsOf: (text) => [{ kind: "prose", start: FIRST, end: text.length }],
};

const isNamed =
  (name: string) =>
  ({ format, aliases = [] }: Parser): boolean => {
    const lowered = name.toLowerCase();
    return format === lowered || aliases.includes(lowered);
  };

const byStart = Order.mapInput(Order.Number, ({ start }: Span) => start);

const DEFAULT_PARSERS: readonly Parser[] = [
  jsonParser,
  vttParser,
  srtParser,
  ...CODE_PARSERS,
  xmlParser,
  yamlParser,
  tsvParser,
  csvParser,
  markdownParser,
  htmlParser,
];

const segmenterOf = (
  parsers: readonly Parser[],
): ((document: Readonly<{ text: string; format?: string }>) => readonly Span[]) => {
  const detected = (text: string): Parser =>
    Option.getOrElse(
      Arr.findFirst(parsers, (parser) => parser.accepts(text)),
      () => plainParser,
    );
  const named = (format: string, text: string): Parser =>
    Option.getOrElse(Arr.findFirst([...parsers, plainParser], isNamed(format)), () =>
      detected(text),
    );
  const segmentsOf = (parser: Parser, text: string): readonly Span[] =>
    parser.unitsOf(text).flatMap((unit) => {
      const inner = text.slice(unit.start, unit.end);
      const spans = Match.value(unit).pipe(
        Match.when({ kind: "prose" }, () => proseSentencesOf(inner)),
        Match.when({ kind: "whole" }, () => spanOf(inner, FIRST)),
        Match.when({ kind: "nested" }, ({ format }) => segmentsOf(named(format, inner), inner)),
        Match.exhaustive,
      );
      return spans.map(({ start, end }) => ({ start: start + unit.start, end: end + unit.start }));
    });
  const chosen = (format: string, text: string): Parser => {
    if (format === AUTO) {
      return detected(text);
    }
    return named(format, text);
  };
  return ({ text, format = AUTO }) => Arr.sort(segmentsOf(chosen(format, text), text), byStart);
};

const sentencesOf = segmenterOf(DEFAULT_PARSERS);

export { AUTO, DEFAULT_PARSERS, isNamed, plainParser, segmenterOf, sentencesOf };
