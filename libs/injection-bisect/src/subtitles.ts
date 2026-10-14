import { Array as Arr, Option } from "effect";

import type { Parser, Span, Unit } from "./parser.ts";

const NEXT = 1;

const BLOCK = /[^\n]*\S[^\n]*(?:\n[^\n]*\S[^\n]*)*/gu;

const TIMING = /-->/u;

const VTT_HEADER = /^\s*WEBVTT\b/u;

const SRT_START = /^\s*\d+\s*\r?\n\s*\d{1,2}:\d{2}:\d{2}[,.]\d{3}\s*-->/u;

const SKIPPED = /^(?:WEBVTT|STYLE|REGION)\b/u;

const blocksOf = (text: string): readonly Span[] =>
  [...text.matchAll(BLOCK)].map((match) => {
    const [block] = match;
    return { start: match.index, end: match.index + block.length };
  });

const linesOf = (text: string, { start, end }: Span): readonly Span[] => {
  const lines: Span[] = [];
  let from = start;
  for (const line of text.slice(start, end).split("\n")) {
    lines.push({ start: from, end: from + line.length });
    from += line.length + "\n".length;
  }
  return lines;
};

const cueText = (text: string, block: Span): readonly Unit[] => {
  const lines = linesOf(text, block);
  const payload = Arr.dropWhile(lines, ({ start, end }) => !TIMING.test(text.slice(start, end)));
  return Option.match(Option.all([Arr.get(payload, NEXT), Arr.last(payload)]), {
    onNone: () => [],
    onSome: ([first, last]) => [{ kind: "prose", start: first.start, end: last.end }],
  });
};

const blockUnits = (text: string, block: Span): readonly Unit[] => {
  const head = text.slice(block.start, block.end).trimStart();
  if (SKIPPED.test(head)) {
    return [];
  }
  if (TIMING.test(head)) {
    return cueText(text, block);
  }
  return [{ kind: "prose", ...block }];
};

const subtitleUnitsOf = (text: string): readonly Unit[] =>
  blocksOf(text).flatMap((block) => blockUnits(text, block));

const vttParser: Parser = {
  format: "vtt",
  extensions: [".vtt"],
  accepts: (text) => VTT_HEADER.test(text),
  unitsOf: subtitleUnitsOf,
};

const srtParser: Parser = {
  format: "srt",
  extensions: [".srt"],
  accepts: (text) => SRT_START.test(text),
  unitsOf: subtitleUnitsOf,
};

export { srtParser, vttParser };
