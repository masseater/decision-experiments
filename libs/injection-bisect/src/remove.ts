import type { Span } from "./parser.ts";

const FIRST = 0;

const removeRegions = ({
  text,
  regions,
}: Readonly<{ text: string; regions: readonly Span[] }>): string => {
  const sorted = regions.toSorted((left, right) => left.start - right.start);
  let kept = "";
  let from = FIRST;
  for (const { start, end } of sorted) {
    kept += text.slice(from, Math.max(from, start));
    from = Math.max(from, end);
  }
  return kept + text.slice(from);
};

export { removeRegions };
