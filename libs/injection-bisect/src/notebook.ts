import {
  isCode,
  isDisplayData,
  isError,
  isExecuteResult,
  isMarkdown,
  isStream,
} from "@jupyterlab/nbformat";
import type { ICell, INotebookContent, IOutput, MultilineString } from "@jupyterlab/nbformat";
import { Effect, Option, Predicate, Result, Schema } from "effect";

import type { Document, Reader } from "./parser.ts";
import { ReadError } from "./read-error.ts";

const isNotebook = (value: unknown): value is INotebookContent =>
  Predicate.hasProperty(value, "nbformat") &&
  Predicate.hasProperty(value, "cells") &&
  Array.isArray(value.cells);

const NotebookFromJson = Schema.fromJsonString(Schema.declare(isNotebook));

const decodeNotebook = Schema.decodeUnknownEffect(NotebookFromJson);

const notebookResultOf = Schema.decodeUnknownResult(NotebookFromJson);

const DEFAULT_LANGUAGE = "python";

const OUTPUT_TYPES = [
  ["text/plain", "output"],
  ["text/markdown", "output"],
  ["text/html", "html"],
] as const;

const decoder = new TextDecoder();

const isLines = (value: unknown): value is MultilineString =>
  Predicate.isString(value) ||
  (Array.isArray(value) && value.every((line) => Predicate.isString(line)));

const joined = (lines: MultilineString): string => [lines].flat().join("");

const fenced =
  (language: string) =>
  (lines: MultilineString): string =>
    `\`\`\`${language}\n${joined(lines)}\n\`\`\``;

const outputText = (output: IOutput): readonly string[] => {
  if (isStream(output)) {
    return [fenced("output")(output.text)];
  }
  if (isError(output)) {
    return [fenced("output")(`${output.ename}: ${output.evalue}`)];
  }
  if (isExecuteResult(output) || isDisplayData(output)) {
    return OUTPUT_TYPES.flatMap(([type, language]) =>
      Option.toArray(
        Option.map(Option.liftPredicate(output.data[type], isLines), fenced(language)),
      ),
    );
  }
  return [];
};

const cellText =
  (language: string) =>
  (cell: ICell): readonly string[] => {
    if (isMarkdown(cell)) {
      return [joined(cell.source)];
    }
    if (isCode(cell)) {
      return [fenced(language)(cell.source), ...cell.outputs.flatMap(outputText)];
    }
    return [fenced("output")(cell.source)];
  };

const languageOf = ({ metadata }: INotebookContent): string =>
  Option.fromNullishOr(metadata.language_info).pipe(
    Option.map(({ name }) => name),
    Option.getOrElse(() => DEFAULT_LANGUAGE),
  );

const markdownOf = (notebook: INotebookContent): string =>
  notebook.cells.flatMap(cellText(languageOf(notebook))).join("\n\n");

const notebookReader: Reader = {
  format: "ipynb",
  extensions: [".ipynb"],
  accepts: (bytes) => Result.isSuccess(notebookResultOf(decoder.decode(bytes))),
  read: (bytes) =>
    decodeNotebook(decoder.decode(bytes)).pipe(
      Effect.flatMap((notebook) =>
        Effect.try({
          try: (): Document => ({ text: markdownOf(notebook), format: "markdown" }),
          catch: (cause) => new ReadError({ reason: String(cause) }),
        }),
      ),
      Effect.mapError((cause) => new ReadError({ reason: String(cause) })),
    ),
};

export { notebookReader };
