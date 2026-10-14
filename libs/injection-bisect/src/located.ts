import { Option } from "effect";
import escapeStringRegexp from "escape-string-regexp";

import type { Span, Unit } from "./parser.ts";
import { looksLikeProse } from "./prose.ts";

const START = 0;

interface Located {
  readonly text: string;
  readonly between?: string;
}

const locatorOf = ({ text, between = "" }: Located): ((value: string) => Option.Option<Span>) => {
  const cursors = new Map<string, number>();
  return (value) => {
    const pattern = new RegExp(
      Array.from(value, (letter) => escapeStringRegexp(letter)).join(between),
      "gu",
    );
    pattern.lastIndex = cursors.get(value) ?? START;
    return Option.fromNullishOr(pattern.exec(text)).pipe(
      Option.filter(() => value !== ""),
      Option.map((match) => {
        const [found] = match;
        const end = match.index + found.length;
        cursors.set(value, end);
        return { start: match.index, end };
      }),
    );
  };
};

const proseUnitsOf =
  (located: Located) =>
  (values: readonly string[]): readonly Unit[] => {
    const locate = locatorOf(located);
    return values
      .flatMap((value) => Option.toArray(locate(value)))
      .filter(({ start, end }) => looksLikeProse(located.text.slice(start, end).trim()))
      .map(({ start, end }) => ({ kind: "prose", start, end }));
  };

export { proseUnitsOf };
