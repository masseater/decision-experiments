import { Effect, Option, Schema } from "effect";

import type { Document, Reader } from "./parser.ts";
import { ReadError } from "./read-error.ts";

const LinesSchema = Schema.Union([Schema.String, Schema.Array(Schema.String)]);

const OutputSchema = Schema.Struct({
  text: Schema.optional(LinesSchema),
  data: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
});

const CellSchema = Schema.Struct({
  cell_type: Schema.String,
  source: LinesSchema,
  outputs: Schema.optional(Schema.Array(OutputSchema)),
});

const LanguageSchema = Schema.Struct({ name: Schema.optional(Schema.String) });

const MetadataSchema = Schema.Struct({ language_info: Schema.optional(LanguageSchema) });

const NotebookSchema = Schema.Struct({
  cells: Schema.Array(CellSchema),
  metadata: Schema.optional(MetadataSchema),
});

type Lines = typeof LinesSchema.Type;

type Output = typeof OutputSchema.Type;

type Cell = typeof CellSchema.Type;

type Notebook = typeof NotebookSchema.Type;

const decodeNotebook = Schema.decodeUnknownEffect(Schema.fromJsonString(NotebookSchema));

const isLines = Schema.is(LinesSchema);

const DEFAULT_LANGUAGE = "python";

const OUTPUT_TYPES = [
  ["text/plain", "output"],
  ["text/markdown", "output"],
  ["text/html", "html"],
] as const;

const decoder = new TextDecoder();

const joined = (lines: Lines): string => [lines].flat().join("");

const fenced =
  (language: string) =>
  (lines: Lines): string =>
    `\`\`\`${language}\n${joined(lines)}\n\`\`\``;

const fencedIf =
  (language: string) =>
  (value: unknown): readonly string[] =>
    Option.toArray(Option.map(Option.liftPredicate(value, isLines), fenced(language)));

const outputText = ({ text, data }: Output): readonly string[] => {
  const shown = Option.getOrElse(
    Option.fromNullishOr(data),
    (): Readonly<Record<string, unknown>> => ({}),
  );
  return [
    ...fencedIf("output")(text),
    ...OUTPUT_TYPES.flatMap(([type, language]) => fencedIf(language)(shown[type])),
  ];
};

const outputsOf = ({ outputs }: Cell): readonly string[] =>
  Option.getOrElse(Option.fromNullishOr(outputs), () => []).flatMap((output) => outputText(output));

const cellText =
  (language: string) =>
  (cell: Cell): readonly string[] => {
    if (cell.cell_type === "markdown") {
      return [joined(cell.source)];
    }
    if (cell.cell_type === "code") {
      return [fenced(language)(cell.source), ...outputsOf(cell)];
    }
    return [fenced("output")(cell.source)];
  };

const languageOf = ({ metadata }: Notebook): string =>
  Option.fromNullishOr(metadata).pipe(
    Option.flatMapNullishOr(({ language_info }) => language_info),
    Option.flatMapNullishOr(({ name }) => name),
    Option.getOrElse(() => DEFAULT_LANGUAGE),
  );

const markdownOf = (notebook: Notebook): string =>
  notebook.cells.flatMap(cellText(languageOf(notebook))).join("\n\n");

const looksLikeNotebook = (text: string): boolean =>
  text.trimStart().startsWith("{") && text.includes('"nbformat"') && text.includes('"cells"');

const notebookReader: Reader = {
  format: "ipynb",
  extensions: [".ipynb"],
  accepts: (bytes) => looksLikeNotebook(decoder.decode(bytes)),
  read: (bytes) =>
    decodeNotebook(decoder.decode(bytes)).pipe(
      Effect.map((notebook): Document => ({ text: markdownOf(notebook), format: "markdown" })),
      Effect.mapError((cause) => new ReadError({ reason: String(cause) })),
    ),
};

export { notebookReader };
