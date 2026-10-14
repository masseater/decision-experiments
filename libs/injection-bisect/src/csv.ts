import { Option } from "effect";

import type { Parser, Unit } from "./parser.ts";
import { looksLikeProse } from "./prose.ts";

const COMMA_FIELD = /(?:"(?<quoted>(?:[^"]|"")*)"|(?<plain>[^,\r\n]*))(?:,|\r?\n|$)/gu;

const TAB_FIELD = /(?:"(?<quoted>(?:[^"]|"")*)"|(?<plain>[^\t\r\n]*))(?:\t|\r?\n|$)/gu;

const QUOTE = '"'.length;

const FIELDS = { comma: COMMA_FIELD, tab: TAB_FIELD } as const;

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
  accepts: () => false,
  unitsOf: (text) => fieldsOf(text, "comma"),
};

const tsvParser: Parser = {
  format: "tsv",
  extensions: [".tsv", ".tab"],
  accepts: () => false,
  unitsOf: (text) => fieldsOf(text, "tab"),
};

export { csvParser, tsvParser };
