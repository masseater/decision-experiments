import type { Region } from "@injection-bisect/core";
import type { ReactNode } from "react";

interface Segment {
  readonly kind: "plain" | "injection";
  readonly start: number;
  readonly text: string;
}

const FIRST = 0;

const segmentsOf = (text: string, regions: readonly Region[]): readonly Segment[] => {
  const segments: Segment[] = [];
  let cursor = FIRST;
  for (const region of regions) {
    if (region.start > cursor) {
      segments.push({ kind: "plain", start: cursor, text: text.slice(cursor, region.start) });
    }
    segments.push({
      kind: "injection",
      start: region.start,
      text: text.slice(region.start, region.end),
    });
    cursor = region.end;
  }
  if (cursor < text.length) {
    segments.push({ kind: "plain", start: cursor, text: text.slice(cursor) });
  }
  return segments;
};

const HighlightedText = ({
  text,
  regions,
}: Readonly<{ text: string; regions: readonly Region[] }>): ReactNode => (
  <p className="rounded-md border p-4 text-sm leading-relaxed whitespace-pre-wrap">
    {segmentsOf(text, regions).map((segment) => {
      if (segment.kind === "injection") {
        return (
          <mark key={segment.start} className="bg-destructive/20 text-foreground rounded-sm">
            {segment.text}
          </mark>
        );
      }
      return <span key={segment.start}>{segment.text}</span>;
    })}
  </p>
);

export { HighlightedText };
