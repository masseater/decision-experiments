import { CALENDAR_PARSERS } from "./calendar.ts";
import { CODE_PARSERS } from "./code.ts";
import { csvParser, tsvParser } from "./csv.ts";
import { htmlParser } from "./html.ts";
import { jsonLinesParser, jsonParser } from "./json.ts";
import { markdownParser } from "./markdown.ts";
import type { Parser } from "./parser.ts";
import { SUBTITLE_PARSERS } from "./subtitles.ts";
import { xmlParser } from "./xml.ts";
import { yamlParser } from "./yaml.ts";

const OWN_PARSERS: readonly Parser[] = [
  jsonParser,
  jsonLinesParser,
  ...SUBTITLE_PARSERS,
  ...CALENDAR_PARSERS,
  xmlParser,
  yamlParser,
  tsvParser,
  csvParser,
  markdownParser,
  htmlParser,
];

const CLAIMED_NAMES = new Set(
  OWN_PARSERS.flatMap(({ format, aliases = [] }) => [format, ...aliases]),
);

const CLAIMED_EXTENSIONS = new Set(OWN_PARSERS.flatMap(({ extensions }) => extensions));

const unclaimed = ({ format, extensions, aliases = [], accepts, unitsOf }: Parser): Parser => ({
  format,
  extensions: extensions.filter((extension) => !CLAIMED_EXTENSIONS.has(extension)),
  aliases: aliases.filter((alias) => !CLAIMED_NAMES.has(alias)),
  accepts,
  unitsOf,
});

const DEFAULT_PARSERS: readonly Parser[] = [
  jsonParser,
  jsonLinesParser,
  ...SUBTITLE_PARSERS,
  ...CALENDAR_PARSERS,
  ...CODE_PARSERS.filter(({ format }) => !CLAIMED_NAMES.has(format)).map((parser) =>
    unclaimed(parser),
  ),
  xmlParser,
  yamlParser,
  tsvParser,
  csvParser,
  markdownParser,
  htmlParser,
];

export { DEFAULT_PARSERS };
