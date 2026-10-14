import { Array as Arr, Match } from "effect";
import type { Element, RootContent } from "hast";
import { refractor } from "refractor";
import jsx from "refractor/jsx";
import tsx from "refractor/tsx";

import type { Parser, Span, Unit } from "./parser.ts";
import { looksLikeProse } from "./prose.ts";

const READ = /comment|string/u;

const FIRST = 0;

refractor.register(jsx);
refractor.register(tsx);

interface Language {
  readonly format: string;
  readonly extensions: readonly string[];
  readonly aliases: readonly string[];
}

const LANGUAGES: readonly Language[] = [
  { format: "javascript", extensions: [".js", ".mjs", ".cjs"], aliases: ["js"] },
  { format: "typescript", extensions: [".ts", ".mts", ".cts"], aliases: ["ts"] },
  { format: "jsx", extensions: [".jsx"], aliases: [] },
  { format: "tsx", extensions: [".tsx"], aliases: [] },
  { format: "python", extensions: [".py"], aliases: ["py"] },
  { format: "ruby", extensions: [".rb"], aliases: ["rb"] },
  { format: "go", extensions: [".go"], aliases: ["golang"] },
  { format: "rust", extensions: [".rs"], aliases: ["rs"] },
  { format: "java", extensions: [".java"], aliases: [] },
  { format: "c", extensions: [".c", ".h"], aliases: [] },
  { format: "cpp", extensions: [".cpp", ".cc", ".hpp"], aliases: ["c++"] },
  { format: "csharp", extensions: [".cs"], aliases: ["cs", "c#"] },
  { format: "php", extensions: [".php"], aliases: [] },
  { format: "bash", extensions: [".sh", ".bash"], aliases: ["sh", "shell", "zsh"] },
  { format: "sql", extensions: [".sql"], aliases: [] },
  { format: "kotlin", extensions: [".kt", ".kts"], aliases: ["kt"] },
  { format: "swift", extensions: [".swift"], aliases: [] },
];

const isRead = ({ properties }: Element): boolean =>
  Arr.ensure(properties.className).some((name) => READ.test(String(name)));

interface Leaf {
  readonly length: number;
  readonly read: boolean;
}

const leavesOf = (node: RootContent, read: boolean): readonly Leaf[] =>
  Match.value(node).pipe(
    Match.when({ type: "text" }, ({ value }) => [{ length: value.length, read }]),
    Match.when({ type: "element" }, (element) =>
      element.children.flatMap((child) => leavesOf(child, read || isRead(element))),
    ),
    Match.orElse(() => []),
  );

const spansOf = (nodes: readonly RootContent[]): readonly Span[] => {
  const spans: Span[] = [];
  let at = FIRST;
  for (const { length, read } of nodes.flatMap((node) => leavesOf(node, false))) {
    if (read) {
      spans.push({ start: at, end: at + length });
    }
    at += length;
  }
  return spans;
};

const codeUnitsOf =
  (format: string) =>
  (text: string): readonly Unit[] =>
    spansOf(refractor.highlight(text, format).children)
      .filter(({ start, end }) => looksLikeProse(text.slice(start, end)))
      .map(({ start, end }): Unit => ({ kind: "prose", start, end }));

const CODE_PARSERS: readonly Parser[] = LANGUAGES.map(({ format, extensions, aliases }) => ({
  format,
  extensions,
  aliases,
  accepts: () => false,
  unitsOf: codeUnitsOf(format),
}));

export { CODE_PARSERS };
