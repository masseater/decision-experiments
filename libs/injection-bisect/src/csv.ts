import { Array as Arr } from "effect";
import { parse } from "papaparse";

import type { Parser, Unit } from "./parser.ts";
import { looksLikeProse } from "./prose.ts";

const DELIMITERS = { comma: ",", tab: "\t" } as const;

type Delimiter = keyof typeof DELIMITERS;

const ROWS = { comma: 2, tab: 1 } as const;

const COLUMNS = 2;

const looksLikeTable =
  (delimiter: Delimiter) =>
  (text: string): boolean => {
    const { data, errors, meta } = parse(text, {
      delimiter: DELIMITERS[delimiter],
      header: true,
      skipEmptyLines: true,
    });
    return (
      Arr.isReadonlyArrayEmpty(errors) &&
      data.length >= ROWS[delimiter] &&
      (meta.fields ?? []).length >= COLUMNS
    );
  };

const fieldsOf = (text: string, delimiter: Delimiter): readonly Unit[] => {
  const { data } = parse<readonly string[]>(text, { delimiter: DELIMITERS[delimiter] });
  let cursor = 0;
  return data.flat().flatMap((value) => {
    const raw = value.replaceAll('"', '""');
    if (raw === "") {
      return [];
    }
    const start = text.indexOf(raw, cursor);
    cursor = start + raw.length;
    if (!looksLikeProse(value.trim())) {
      return [];
    }
    return [{ kind: "prose", start, end: cursor } as const];
  });
};

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
