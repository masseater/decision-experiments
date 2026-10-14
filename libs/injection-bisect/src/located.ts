import { Option } from "effect";

import type { Span, Unit } from "./parser.ts";
import { looksLikeProse } from "./prose.ts";

const NOT_FOUND = -1;

const START = 0;

const locatorOf = (text: string): ((value: string) => Option.Option<Span>) => {
  const cursors = new Map<string, number>();
  return (value) => {
    const start = text.indexOf(value, cursors.get(value) ?? START);
    if (value === "" || start === NOT_FOUND) {
      return Option.none();
    }
    const end = start + value.length;
    cursors.set(value, end);
    return Option.some({ start, end });
  };
};

const proseUnitsOf =
  (text: string) =>
  (values: readonly string[]): readonly Unit[] => {
    const locate = locatorOf(text);
    return values
      .flatMap((value) => Option.toArray(locate(value)))
      .filter(({ start, end }) => looksLikeProse(text.slice(start, end).trim()))
      .map(({ start, end }) => ({ kind: "prose", start, end }));
  };

export { proseUnitsOf };
