import { Array as Arr, Match } from "effect";
import type { Element, RootContent } from "hast";
import { refractor } from "refractor";
import jsx from "refractor/jsx";
import tsx from "refractor/tsx";

import { GRAMMARS, MORE_LANGUAGES, NEVER } from "./more-languages.ts";
import type { Language } from "./more-languages.ts";
import type { Parser, Span, Unit } from "./parser.ts";
import { looksLikeProse } from "./prose.ts";

const READ = /comment|string|attr-value/u;

const FIRST = 0;

for (const language of [jsx, tsx, ...GRAMMARS]) {
  refractor.register(language);
}

const FENCE = /^\s*(?:```|~~~)/mu;

const LANGUAGES: readonly Language[] = [
  {
    format: "typescript",
    extensions: [".ts", ".mts", ".cts"],
    aliases: ["ts"],
    signature: /^(?:export )?(?:interface \w+(?:<[^>\n]*>)? \{|type \w+(?:<[^>\n]*>)? = )/mu,
  },
  {
    format: "javascript",
    extensions: [".js", ".mjs", ".cjs"],
    aliases: ["js"],
    signature:
      /^#!.*\bnode\b|^(?:import .+ from ["']|export (?:default|const|function|class) |const \w+ = require\()/mu,
  },
  { format: "jsx", extensions: [".jsx"], aliases: [], signature: NEVER },
  { format: "tsx", extensions: [".tsx"], aliases: [], signature: NEVER },
  {
    format: "python",
    extensions: [".py"],
    aliases: ["py"],
    signature:
      /^#!.*python|^(?:from [\w.]+ import |def \w+\(.*\)(?: -> .+)?:$|if __name__ == ["']__main__["']:)/mu,
  },
  {
    format: "ruby",
    extensions: [".rb"],
    aliases: ["rb"],
    signature: /^#!.*ruby|^(?:require ["'][\w/]+["']|def \w+[?!]?(?:\(.*\))?)$/mu,
  },
  {
    format: "kotlin",
    extensions: [".kt", ".kts"],
    aliases: ["kt"],
    signature: /^(?:fun main\(|import kotlinx?\.)/mu,
  },
  {
    format: "go",
    extensions: [".go"],
    aliases: ["golang"],
    signature: /^package \w+$(?=[\s\S]*^func )/mu,
  },
  {
    format: "rust",
    extensions: [".rs"],
    aliases: ["rs"],
    signature: /^(?:use (?:std|crate)::|fn main\(\)|pub fn \w+)/mu,
  },
  {
    format: "java",
    extensions: [".java"],
    aliases: [],
    signature: /^(?:package [\w.]+;|import java\.)/mu,
  },
  {
    format: "cpp",
    extensions: [".cpp", ".cc", ".hpp"],
    aliases: ["c++"],
    signature: /^(?:#include <(?:iostream|vector|string|memory)>|using namespace std;)/mu,
  },
  { format: "c", extensions: [".c", ".h"], aliases: [], signature: /^#include\s*[<"]/mu },
  {
    format: "csharp",
    extensions: [".cs"],
    aliases: ["cs", "c#"],
    signature: /^(?:using System[\w.]*;|namespace [\w.]+)/mu,
  },
  { format: "php", extensions: [".php"], aliases: [], signature: /^(?:#!.*php|<\?php)/u },
  {
    format: "bash",
    extensions: [".sh", ".bash"],
    aliases: ["sh", "shell", "zsh"],
    signature: /^#!.*\b(?:ba|z|k)?sh\b/u,
  },
  {
    format: "sql",
    extensions: [".sql"],
    aliases: [],
    signature:
      /^(?:SELECT .+ FROM |INSERT INTO |CREATE (?:TABLE|INDEX|VIEW) |UPDATE \w+ SET |DELETE FROM )/mu,
  },
  {
    format: "swift",
    extensions: [".swift"],
    aliases: [],
    signature: /^import (?:SwiftUI|Foundation|UIKit)$/mu,
  },
  ...MORE_LANGUAGES,
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

const CODE_PARSERS: readonly Parser[] = LANGUAGES.map(
  ({ format, extensions, aliases, signature }) => ({
    format,
    extensions,
    aliases,
    accepts: (text) => signature.test(text) && !FENCE.test(text),
    unitsOf: codeUnitsOf(format),
  }),
);

export { CODE_PARSERS };
