import { parse } from "@plussub/srt-vtt-parser";
import { Result } from "effect";

import { assParser } from "./ass.ts";
import { proseUnitsOf } from "./located.ts";
import type { Parser, Unit } from "./parser.ts";

const NONE = 0;

const LINE_BREAK = /\r\n?/gu;

const VTT_HEADER = /^\s*WEBVTT\b/u;

const NOTE = /^NOTE\b.*(?:\r\n?|\n)?(?:.+(?:\r\n?|\n)?)*/gmu;

const cuesOf = (text: string): readonly string[] =>
  Result.match(
    Result.try(() => parse(text.replaceAll(LINE_BREAK, "\n"))),
    {
      onFailure: () => [],
      onSuccess: ({ entries }) => entries.flatMap(({ text: cue }) => cue.split("\n")),
    },
  );

const notesOf = (text: string): readonly string[] =>
  Array.from(text.matchAll(NOTE), ([note]) => note.trimEnd());

const subtitleUnitsOf = (text: string): readonly Unit[] =>
  proseUnitsOf(text)([...notesOf(text), ...cuesOf(text)]);

const hasCues = (text: string): boolean => cuesOf(text).length > NONE;

const vttParser: Parser = {
  format: "vtt",
  extensions: [".vtt"],
  accepts: (text) => VTT_HEADER.test(text) && hasCues(text),
  unitsOf: subtitleUnitsOf,
};

const srtParser: Parser = {
  format: "srt",
  extensions: [".srt"],
  accepts: (text) => !VTT_HEADER.test(text) && hasCues(text),
  unitsOf: subtitleUnitsOf,
};

const SUBTITLE_PARSERS: readonly Parser[] = [vttParser, srtParser, assParser];

export { SUBTITLE_PARSERS, srtParser, vttParser };
