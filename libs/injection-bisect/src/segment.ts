import { htmlUnitsOf, looksLikeHtml } from "./html.ts";

interface Span {
  readonly start: number;
  readonly end: number;
}

const FIRST = 0;

const SENTENCE =
  /(?:[^\n。．！？.!?]|[.!?](?!\s|$)|(?<![>\n])\n(?![^\S\n]*(?:\n|[-*#<>|]|\d+[.)]|$)))+[。．！？.!?]*[^\S\n]*\n*/gu;

const spanOf = (sentence: string, index: number): readonly Span[] => {
  if (sentence.trim() === "") {
    return [];
  }
  return [{ start: index, end: index + sentence.length }];
};

const sentencesIn = (text: string, { start, end }: Span): readonly Span[] =>
  [...text.slice(start, end).matchAll(SENTENCE)].flatMap((match) =>
    spanOf(match[FIRST], start + match.index),
  );

const sentencesOf = (text: string): readonly Span[] => {
  if (looksLikeHtml(text)) {
    return htmlUnitsOf(text).flatMap((unit) => sentencesIn(text, unit));
  }
  return sentencesIn(text, { start: FIRST, end: text.length });
};

export { sentencesOf };
export type { Span };
