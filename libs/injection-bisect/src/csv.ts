import { Option } from "effect";

import type { Parser, Unit } from "./parser.ts";
import { looksLikeProse } from "./prose.ts";

const COMMA_FIELD = /(?:"(?<quoted>(?:[^"]|"")*)"|(?<plain>[^,\r\n]*))(?:,|\r?\n|$)/gu;

const TAB_FIELD = /(?:"(?<quoted>(?:[^"]|"")*)"|(?<plain>[^\t\r\n]*))(?:\t|\r?\n|$)/gu;

const QUOTE = '"'.length;

const FIELDS = { comma: COMMA_FIELD, tab: TAB_FIELD } as const;

const QUOTED = /"(?:[^"]|"")*"/gu;

const LINE_BREAK = /\r\n|\r|\n/u;

const NONE = 0;

const ROWS = { comma: 3, tab: 2 } as const;

const DELIMITERS = { comma: /,/gu, tab: /\t/gu } as const;

const delimitersIn = (line: string, delimiter: keyof typeof FIELDS): number =>
  [...line.replaceAll(QUOTED, "").matchAll(DELIMITERS[delimiter])].length;

const looksLikeTable =
  (delimiter: keyof typeof FIELDS) =>
  (text: string): boolean => {
    const counts = text
      .split(LINE_BREAK)
      .filter((line) => line.trim() !== "")
      .map((line) => delimitersIn(line, delimiter));
    const [first = NONE] = counts;
    return (
      counts.length >= ROWS[delimiter] && first > NONE && counts.every((count) => count === first)
    );
  };

const groupOf = (
  groups: Readonly<Partial<Record<string, string>>> | undefined,
  name: string,
): Option.Option<string> =>
  Option.fromNullishOr(groups).pipe(Option.flatMapNullishOr((found) => found[name]));

const fieldsOf = (text: string, delimiter: keyof typeof FIELDS): readonly Unit[] =>
  [...text.matchAll(FIELDS[delimiter])].flatMap((match) =>
    Option.match(groupOf(match.groups, "quoted"), {
      onSome: (quoted) => [{ start: match.index + QUOTE, value: quoted }],
      onNone: () => [
        { start: match.index, value: Option.getOrElse(groupOf(match.groups, "plain"), () => "") },
      ],
    })
      .filter(({ value }) => looksLikeProse(value.trim()))
      .map(({ start, value }): Unit => ({ kind: "prose", start, end: start + value.length })),
  );

const csvParser: Parser = {
  format: "csv",
  extensions: [".csv"],
  accepts: looksLikeTable("comma"),
  unitsOf: (text) => fieldsOf(text, "comma"),
};

const tsvParser: Parser = {
  format: "tsv",
  extensions: [".tsv", ".tab"],
  accepts: looksLikeTable("tab"),
  unitsOf: (text) => fieldsOf(text, "tab"),
};

export { csvParser, tsvParser };
