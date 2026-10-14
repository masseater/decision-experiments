import { Option } from "effect";

import type { Parser, Unit } from "./parser.ts";
import { looksLikeProse } from "./prose.ts";

const CONTENT_LINE =
  /^(?<name>[A-Za-z][\w-]*)(?:;(?:[^:\r\n"]|"[^"]*")*)?:(?<value>(?:[^\r\n]|(?:\r\n|\r|\n)[ \t])*)/gmu;

const TEXT_PROPERTIES = new Set([
  "SUMMARY",
  "DESCRIPTION",
  "LOCATION",
  "COMMENT",
  "CONTACT",
  "RESOURCES",
  "CATEGORIES",
  "X-ALT-DESC",
  "NOTE",
  "TITLE",
  "ROLE",
  "ORG",
  "FN",
  "NICKNAME",
  "ADR",
  "LABEL",
]);

const valueUnitsOf = (text: string): readonly Unit[] =>
  [...text.matchAll(CONTENT_LINE)].flatMap((match) => {
    const [line] = match;
    const groupOf = (key: string): string =>
      Option.fromNullishOr(match.groups).pipe(
        Option.flatMapNullishOr((groups) => groups[key]),
        Option.getOrElse(() => ""),
      );
    const name = groupOf("name");
    const value = groupOf("value");
    const start = match.index + line.length - value.length;
    if (!TEXT_PROPERTIES.has(name.toUpperCase()) || !looksLikeProse(value)) {
      return [];
    }
    return [{ kind: "prose", start, end: start + value.length }];
  });

const icsParser: Parser = {
  format: "ics",
  extensions: [".ics", ".ical", ".ifb"],
  aliases: ["icalendar", "ical"],
  accepts: (text) => /^BEGIN:VCALENDAR\b/mu.test(text),
  unitsOf: valueUnitsOf,
};

const vcardParser: Parser = {
  format: "vcard",
  extensions: [".vcf", ".vcard"],
  aliases: ["vcf"],
  accepts: (text) => /^BEGIN:VCARD\b/mu.test(text),
  unitsOf: valueUnitsOf,
};

const CALENDAR_PARSERS: readonly Parser[] = [icsParser, vcardParser];

export { CALENDAR_PARSERS, icsParser, vcardParser };
