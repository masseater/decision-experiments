import { Array as Arr, Match, Option, Order } from "effect";

import { htmlParser } from "./html.ts";
import type { Parser, Span } from "./parser.ts";

const FIRST = 0;

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
  accepts: () => true,
  unitsOf: (text) => [{ kind: "prose", start: FIRST, end: text.length }],
};

const byStart = Order.mapInput(Order.Number, ({ start }: Span) => start);

const DEFAULT_PARSERS: readonly Parser[] = [htmlParser];

const segmenterOf = (parsers: readonly Parser[]): ((text: string) => readonly Span[]) => {
  const detected = (text: string): Parser =>
    Option.getOrElse(
      Arr.findFirst(parsers, (parser) => parser.accepts(text)),
      () => plainParser,
    );
  const named = (format: string, text: string): Parser =>
    Option.getOrElse(
      Arr.findFirst([...parsers, plainParser], (parser) => parser.format === format),
      () => detected(text),
    );
  const segmentsOf = (parser: Parser, text: string): readonly Span[] =>
    parser.unitsOf(text).flatMap((unit) => {
      const inner = text.slice(unit.start, unit.end);
      const spans = Match.value(unit).pipe(
        Match.when({ kind: "prose" }, () => proseSentencesOf(inner)),
        Match.when({ kind: "nested" }, ({ format }) => segmentsOf(named(format, inner), inner)),
        Match.exhaustive,
      );
      return spans.map(({ start, end }) => ({ start: start + unit.start, end: end + unit.start }));
    });
  return (text) => Arr.sort(segmentsOf(detected(text), text), byStart);
};

const sentencesOf = segmenterOf(DEFAULT_PARSERS);

export { DEFAULT_PARSERS, plainParser, segmenterOf, sentencesOf };
