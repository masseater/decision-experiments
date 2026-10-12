import { DEFAULT_CUTOFF } from "@injection-bisect/core";
import type { Detection, Region } from "@injection-bisect/core";
import { Array as Arr, Option } from "effect";
import { useCallback } from "react";
import type { ChangeEvent, ReactNode } from "react";

import type { InspectOutcome } from "#/pages/inspect/api/use-inspect";
import { useDraftText, useSetDraftText, useView } from "#/pages/inspect/model/draft";
import type { View } from "#/pages/inspect/model/draft";
import { MAX_CHARS } from "#/pages/inspect/model/models";
import { HighlightTextarea } from "#/shared/ui/highlight-textarea";

type Tone = "none" | "miss" | "hit" | "injection";

interface Piece {
  readonly start: number;
  readonly text: string;
  readonly tone: Tone;
}

const TONE_CLASS: Readonly<Record<Tone, string>> = {
  none: "",
  miss: "rounded-sm bg-primary/10",
  hit: "rounded-sm bg-destructive/20",
  injection: "rounded-sm bg-destructive/40",
};

const FIRST = 0;

const NEXT = 1;

const LAST = -1;

const covers = (span: Readonly<Region | Detection["probes"][number]>, at: number): boolean =>
  span.start <= at && at < span.end;

const regionsOf = (detection: Detection): readonly Region[] => {
  if (detection.status === "injected") {
    return detection.regions;
  }
  return [];
};

const toneOf = (probability: number): Tone => {
  if (probability >= DEFAULT_CUTOFF) {
    return "hit";
  }
  return "miss";
};

const stepTone = (detection: Detection, depth: number, at: number): Tone => {
  const probe = Arr.findFirst(detection.probes, (each) => each.depth === depth && covers(each, at));
  return Option.match(probe, {
    onNone: (): Tone => "none",
    onSome: ({ probability }): Tone => toneOf(probability),
  });
};

const toneAt = (detection: Detection, view: View, at: number): Tone => {
  if (view.status === "step") {
    return stepTone(detection, view.depth, at);
  }
  if (regionsOf(detection).some((region) => covers(region, at))) {
    return "injection";
  }
  return "none";
};

const piecesOf = (text: string, detection: Detection, view: View): readonly Piece[] => {
  const cuts = new Set([FIRST, text.length]);
  for (const span of [...detection.probes, ...regionsOf(detection)]) {
    cuts.add(span.start);
    cuts.add(span.end);
  }
  const sorted = [...cuts].toSorted((left, right) => left - right);
  return sorted.slice(FIRST, LAST).map((start, index) => ({
    start,
    text: text.slice(start, sorted[index + NEXT]),
    tone: toneAt(detection, view, start),
  }));
};

const overlayOf = (text: string, outcome: InspectOutcome, view: View): readonly Piece[] => {
  if (outcome.status !== "success" || outcome.text !== text) {
    return [{ start: FIRST, text, tone: "none" }];
  }
  return piecesOf(text, outcome.response, view);
};

const OverlaidText = ({ outcome }: Readonly<{ outcome: InspectOutcome }>): ReactNode => {
  const text = useDraftText();
  const setText = useSetDraftText();
  const view = useView();
  const edit = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    [setText],
  );
  return (
    <HighlightTextarea maxLength={MAX_CHARS} value={text} onChange={edit}>
      {overlayOf(text, outcome, view).map((piece) => (
        <span key={piece.start} className={TONE_CLASS[piece.tone]}>
          {piece.text}
        </span>
      ))}
    </HighlightTextarea>
  );
};

export { OverlaidText };
