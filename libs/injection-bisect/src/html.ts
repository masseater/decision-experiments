import { Array as Arr, Match, Option, Order } from "effect";
import { parse } from "parse5";
import type { DefaultTreeAdapterMap } from "parse5";

import type { Span } from "./segment.ts";

type Node = DefaultTreeAdapterMap["node"];

type Element = DefaultTreeAdapterMap["element"];

const TAG = /<(?:[a-z][\w-]*[\s/>]|\/[a-z]|!--|!doctype)/iu;

const COMMENT_OPEN = "<!--".length;

const COMMENT_CLOSE = "-->".length;

const LINE_BY_LINE = new Set(["script", "style"]);

const MARKUP_ATTRIBUTES = new Set([
  "class",
  "style",
  "srcset",
  "sizes",
  "d",
  "points",
  "transform",
]);

const PROSE = /\s|[^ -~]/u;

const QUOTE = /["']/u;

const NO_SPANS: readonly Span[] = [];

const looksLikeHtml = (text: string): boolean => TAG.test(text);

const linesIn = (text: string, { start, end }: Span): readonly Span[] => {
  const spans: Span[] = [];
  let from = start;
  for (const line of text.slice(start, end).split("\n")) {
    if (line.trim() !== "") {
      spans.push({ start: from, end: from + line.length });
    }
    from += line.length + "\n".length;
  }
  return spans;
};

const valueSpan = (text: string, { start, end }: Span): Span => {
  const equals = text.indexOf("=", start) + "=".length;
  const leading = text.slice(equals, end).search(/\S/u) + equals;
  if (QUOTE.test(text.charAt(leading))) {
    return { start: leading + "'".length, end: end - "'".length };
  }
  return { start: leading, end };
};

const attributeSpans = (text: string, element: Element): readonly Span[] =>
  element.attrs.flatMap(({ name, value }) =>
    Option.fromNullishOr(element.sourceCodeLocation).pipe(
      Option.flatMapNullishOr((location) => location.attrs),
      Option.flatMapNullishOr((attrs) => attrs[name]),
      Option.filter(() => !MARKUP_ATTRIBUTES.has(name) && PROSE.test(value)),
      Option.map(({ startOffset, endOffset }) =>
        valueSpan(text, { start: startOffset, end: endOffset }),
      ),
      Option.toArray,
    ),
  );

const locationOf = (node: Node): Option.Option<Span> =>
  Option.fromNullishOr(node.sourceCodeLocation).pipe(
    Option.map(({ startOffset, endOffset }) => ({ start: startOffset, end: endOffset })),
  );

const parentTagOf = (node: Node): string =>
  Match.value(node).pipe(
    Match.when({ parentNode: Match.defined }, ({ parentNode }) =>
      Option.getOrElse(
        Option.map(Option.fromNullishOr(parentNode), ({ nodeName }) => nodeName),
        () => "",
      ),
    ),
    Match.orElse(() => ""),
  );

const ownSpans = (text: string, node: Node): readonly Span[] =>
  Match.value(node).pipe(
    Match.when({ nodeName: "#comment" }, (comment) =>
      Option.match(locationOf(comment), {
        onNone: () => NO_SPANS,
        onSome: ({ start, end }) => [{ start: start + COMMENT_OPEN, end: end - COMMENT_CLOSE }],
      }),
    ),
    Match.when({ nodeName: "#text", value: Match.string }, (textNode) =>
      Option.match(
        Option.filter(locationOf(textNode), () => textNode.value.trim() !== ""),
        {
          onNone: () => NO_SPANS,
          onSome: (span) => {
            if (LINE_BY_LINE.has(parentTagOf(textNode))) {
              return linesIn(text, span);
            }
            return [span];
          },
        },
      ),
    ),
    Match.when({ attrs: Match.defined }, (element) => attributeSpans(text, element)),
    Match.orElse(() => NO_SPANS),
  );

const childrenOf = (node: Node): readonly Node[] =>
  Match.value(node).pipe(
    Match.when({ childNodes: Match.defined }, ({ childNodes }) => childNodes),
    Match.orElse(() => []),
  );

const spansIn = (text: string, node: Node): readonly Span[] => [
  ...ownSpans(text, node),
  ...childrenOf(node).flatMap((child) => spansIn(text, child)),
];

const byStart = Order.mapInput(Order.Number, ({ start }: Span) => start);

const htmlUnitsOf = (text: string): readonly Span[] =>
  Arr.sort(
    spansIn(text, parse(text, { sourceCodeLocationInfo: true })).filter(
      ({ start, end }) => text.slice(start, end).trim() !== "",
    ),
    byStart,
  );

export { htmlUnitsOf, looksLikeHtml };
