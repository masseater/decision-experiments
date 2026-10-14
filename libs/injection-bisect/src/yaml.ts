import { Match, Option } from "effect";
import { Parser as YamlParser } from "yaml";

import type { Parser, Span, Unit } from "./parser.ts";
import { looksLikeProse } from "./prose.ts";

const NOT_FOUND = -1;

const COMMENT = "#".length;

const QUOTE = '"'.length;

interface SourceToken {
  readonly type: string;
  readonly offset: number;
  readonly source: string;
}

const isSourceToken = (value: unknown): value is SourceToken =>
  Match.value(value).pipe(
    Match.when({ type: Match.string, offset: Match.number, source: Match.string }, () => true),
    Match.orElse(() => false),
  );

const spanIn = (text: string, token: SourceToken): Option.Option<Span> => {
  const end = token.offset + token.source.length;
  return Match.value(token.type).pipe(
    Match.when("comment", () => Option.some({ start: token.offset + COMMENT, end })),
    Match.when("scalar", () => Option.some({ start: token.offset, end })),
    Match.whenOr("single-quoted-scalar", "double-quoted-scalar", () =>
      Option.some({ start: token.offset + QUOTE, end: end - QUOTE }),
    ),
    Match.when("block-scalar", () => {
      const start = text.indexOf(token.source, token.offset);
      if (start === NOT_FOUND) {
        return Option.none();
      }
      return Option.some({ start, end: start + token.source.length });
    }),
    Match.orElse(() => Option.none()),
  );
};

const childrenOf = (value: unknown): readonly unknown[] =>
  Match.value(value).pipe(
    Match.when(Array.isArray, (items: readonly unknown[]) => items),
    Match.when(Match.record, (record) =>
      Object.entries(record)
        .filter(([key]) => key !== "source")
        .map(([, child]) => child),
    ),
    Match.orElse(() => []),
  );

const ownSpan = (text: string, value: unknown): readonly Span[] => {
  if (isSourceToken(value)) {
    return Option.toArray(spanIn(text, value));
  }
  return [];
};

const spansIn = (text: string, value: unknown): readonly Span[] => [
  ...ownSpan(text, value),
  ...childrenOf(value).flatMap((child) => spansIn(text, child)),
];

const yamlUnitsOf = (text: string): readonly Unit[] =>
  [...new YamlParser().parse(text)]
    .flatMap((token) => spansIn(text, token))
    .filter(({ start, end }) => looksLikeProse(text.slice(start, end)))
    .toSorted((left, right) => left.start - right.start)
    .map(({ start, end }): Unit => ({ kind: "prose", start, end }));

const yamlParser: Parser = {
  format: "yaml",
  extensions: [".yaml", ".yml"],
  accepts: () => false,
  unitsOf: yamlUnitsOf,
};

export { yamlParser };
