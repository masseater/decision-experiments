import { Predicate, Result } from "effect";
import ICAL from "ical.js";

import { proseUnitsOf } from "./located.ts";
import type { Parser, Unit } from "./parser.ts";

type Component = InstanceType<typeof ICAL.Component>;

const FOLD = String.raw`(?:\r\n|\r|\n)?[ \t]?`;

const escaped = (value: string): string =>
  value
    .replaceAll("\\", String.raw`\\`)
    .replaceAll(";", ";")
    .replaceAll(",", String.raw`\,`)
    .replaceAll("\n", String.raw`\n`);

const textsIn = (component: Component): readonly string[] => [
  ...component
    .getAllProperties()
    .filter(({ type }) => type === "text")
    .flatMap((property): readonly unknown[] => property.getValues().flat())
    .filter((value) => Predicate.isString(value)),
  ...component.getAllSubcomponents().flatMap((child) => textsIn(child)),
];

const valueUnitsOf = (text: string): readonly Unit[] =>
  proseUnitsOf({ text, between: FOLD })(
    Result.match(
      Result.try(() => ICAL.Component.fromString(text)),
      {
        onFailure: () => [],
        onSuccess: (component) => textsIn(component).map((value) => escaped(value)),
      },
    ),
  );

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
