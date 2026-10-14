import { Option } from "effect";

import type { Parser, Unit } from "./parser.ts";
import { looksLikeProse } from "./prose.ts";

const DEFAULT_FIELDS = 10;

const FORMAT = /^\[Events\][\s\S]*?^Format:(?<fields>[^\r\n]*)/mu;

const EVENT = /^(?:Dialogue|Comment):[^\r\n]*|^Title:[^\r\n]*/gmu;

const FIRST = 0;

const TEXT_FIELD = 1;

const fieldCountOf = (text: string): number =>
  Option.fromNullishOr(FORMAT.exec(text)).pipe(
    Option.flatMapNullishOr((match) => match.groups),
    Option.flatMapNullishOr((groups) => groups["fields"]),
    Option.match({
      onNone: () => DEFAULT_FIELDS,
      onSome: (fields) => fields.split(",").length,
    }),
  );

const textStart = (line: string, fields: number): number => {
  const body = line.indexOf(":") + ":".length;
  if (line.startsWith("Title:")) {
    return body;
  }
  const before = line
    .slice(body)
    .split(",")
    .slice(FIRST, fields - TEXT_FIELD);
  return body + before.join(",").length + ",".length;
};

const assUnitsOf = (text: string): readonly Unit[] => {
  const fields = fieldCountOf(text);
  return [...text.matchAll(EVENT)].flatMap((match) => {
    const [line] = match;
    const start = match.index + textStart(line, fields);
    const end = match.index + line.length;
    if (!looksLikeProse(text.slice(start, end))) {
      return [];
    }
    return [{ kind: "prose", start, end }];
  });
};

const assParser: Parser = {
  format: "ass",
  extensions: [".ass", ".ssa"],
  aliases: ["ssa"],
  accepts: (text) => /^\[Script Info\]/mu.test(text),
  unitsOf: assUnitsOf,
};

export { assParser };
