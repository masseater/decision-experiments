import { DEFAULT_CUTOFF } from "@injection-bisect/core";
import type { Region } from "@injection-bisect/core";
import { Array as Arr, Option, Order } from "effect";

import type { Focus } from "./draft";
import type { Answer, Phase, Row, Trace } from "./trace";

type Tone = "none" | "pending" | "miss" | "hit" | "injection";

interface Piece {
  readonly start: number;
  readonly text: string;
  readonly tone: Tone;
  readonly answer: boolean;
}

interface Span {
  readonly start: number;
  readonly end: number;
}

const FIRST = 0;

const NEXT = 1;

const LAST = -1;

const byDepth = Order.mapInput(Order.Number, (row: Row) => row.depth);

const toneOf = (answer: Answer): Tone => {
  if (answer.status === "pending") {
    return "pending";
  }
  if (answer.probability >= DEFAULT_CUTOFF) {
    return "hit";
  }
  return "miss";
};

const covers = (span: Span, at: number): boolean => span.start <= at && at < span.end;

const regionsOf = (phase: Phase): readonly Region[] => {
  if (phase.status === "done" && phase.detection.status === "injected") {
    return phase.detection.regions;
  }
  return [];
};

const deepestAt = (rows: readonly Row[], at: number): Option.Option<Row> => {
  const covering = rows.filter((row) => covers(row, at));
  return Arr.last(Arr.sort(covering, byDepth));
};

const rowTone = (rows: readonly Row[], at: number): Tone =>
  Option.match(deepestAt(rows, at), {
    onNone: (): Tone => "none",
    onSome: (row) => toneOf(row.answer),
  });

const visibleRows = (trace: Trace, focus: Focus): readonly Row[] => {
  if (focus.status === "probe") {
    return trace.rows.filter((row) => row.id === focus.id);
  }
  return trace.rows;
};

const toneAt = (trace: Trace, focus: Focus, at: number): Tone => {
  if (focus.status === "none" && regionsOf(trace.phase).some((region) => covers(region, at))) {
    return "injection";
  }
  return rowTone(visibleRows(trace, focus), at);
};

const piecesOf = ({
  text,
  trace,
  focus,
  answer,
}: Readonly<{
  text: string;
  trace: Trace;
  focus: Focus;
  answer: readonly Span[];
}>): readonly Piece[] => {
  const cuts = new Set([FIRST, text.length]);
  for (const span of [...trace.rows, ...regionsOf(trace.phase), ...answer]) {
    cuts.add(span.start);
    cuts.add(span.end);
  }
  const sorted = [...cuts].toSorted((left, right) => left - right);
  return sorted.slice(FIRST, LAST).map((start, index) => ({
    start,
    text: text.slice(start, sorted[index + NEXT]),
    tone: toneAt(trace, focus, start),
    answer: answer.some((span) => covers(span, start)),
  }));
};

export type { Piece, Tone };
export { piecesOf, toneOf };
