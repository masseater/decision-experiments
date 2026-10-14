import { Option } from "effect";

import type { Span, Unit } from "./parser.ts";
import { looksLikeProse } from "./prose.ts";

const NOT_FOUND = -1;

const START = 0;

const NEXT = 1;

const FOLD = /(?:\r\n|\r|\n)[ \t]/gu;

const NOTHING = /(?!)/gu;

interface Located {
  readonly text: string;
  readonly folded?: boolean;
}

interface View {
  readonly text: string;
  readonly offsets: readonly number[];
}

const foldsIn = (folded: boolean): RegExp => {
  if (folded) {
    return FOLD;
  }
  return NOTHING;
};

const viewOf = ({ text, folded = false }: Located): View => {
  const folds = text.matchAll(foldsIn(folded));
  const removed = new Set(
    Array.from(folds, (match) => {
      const [found] = match;
      return Array.from({ length: found.length }, (_unit, at) => match.index + at);
    }).flat(),
  );
  const offsets = Array.from({ length: text.length }, (_unit, at) => at).filter(
    (at) => !removed.has(at),
  );
  return {
    text: offsets.map((at) => text.charAt(at)).join(""),
    offsets: [...offsets, text.length],
  };
};

const locatorOf = (view: View): ((value: string) => Option.Option<Span>) => {
  const cursors = new Map<string, number>();
  return (value) => {
    const start = view.text.indexOf(value, cursors.get(value) ?? START);
    if (value === "" || start === NOT_FOUND) {
      return Option.none();
    }
    const end = start + value.length;
    cursors.set(value, end);
    return Option.all([
      Option.fromNullishOr(view.offsets[start]),
      Option.fromNullishOr(view.offsets[end - NEXT]),
    ]).pipe(Option.map(([from, last]) => ({ start: from, end: last + NEXT })));
  };
};

const proseUnitsOf =
  (located: Located) =>
  (values: readonly string[]): readonly Unit[] => {
    const locate = locatorOf(viewOf(located));
    return values
      .flatMap((value) => Option.toArray(locate(value)))
      .filter(({ start, end }) => looksLikeProse(located.text.slice(start, end).trim()))
      .map(({ start, end }) => ({ kind: "prose", start, end }));
  };

export { proseUnitsOf };
export type { Located };
