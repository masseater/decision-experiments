import { Effect, Option } from "effect";
import { read, utils } from "xlsx";

import { hasStream } from "./cfb.ts";
import type { Reader } from "./parser.ts";
import { ReadError } from "./read-error.ts";

const XLS = [".xls", ".xlt"];

const KINDS = {
  xlsx: [".xlsx", ".xlsm", ".xltx", ".xltm"],
  xlsb: [".xlsb"],
  ods: [".ods", ".ots", ".fods"],
  numbers: [".numbers"],
} as const;

const WORKBOOKS = new Set(["Workbook", "Book"]);

const csvOf = (bytes: Uint8Array): Effect.Effect<string, ReadError> =>
  Effect.try({
    try: () => {
      const { Sheets, SheetNames } = read(bytes, { type: "array" });
      return SheetNames.flatMap((name) =>
        Option.toArray(
          Option.map(Option.fromNullishOr(Sheets[name]), (sheet) => utils.sheet_to_csv(sheet)),
        ),
      ).join("\n");
    },
    catch: (cause) => new ReadError({ reason: String(cause) }),
  }).pipe(Effect.withSpan("injection-bisect.spreadsheet"));

const readerOf = ([format, extensions]: readonly [string, readonly string[]]): Reader => ({
  format,
  extensions,
  read: (bytes) => csvOf(bytes).pipe(Effect.map((text) => ({ text, format: "csv" }))),
});

const SPREADSHEET_READERS: readonly Reader[] = [
  { ...readerOf(["xls", XLS]), accepts: hasStream((name) => WORKBOOKS.has(name)) },
  ...Object.entries(KINDS).map((kind) => readerOf(kind)),
];

export { SPREADSHEET_READERS };
