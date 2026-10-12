import { sentencesOf } from "@injection-bisect/core";
import type { ReactNode } from "react";

import { COPY } from "#/pages/inspect/model/copy";
import { formatCount, formatDollars } from "#/pages/inspect/model/format";
import type { Answer, Phase, Row, Trace } from "#/pages/inspect/model/trace";
import { cn } from "#/shared/lib/utils";

import { Stat } from "./stat";

type Answered = Extract<Answer, Readonly<{ status: "answered" }>>;

const NOTHING = 0;

const labelOf = (phase: Phase): string => {
  if (phase.status === "running") {
    return `${COPY.running}…`;
  }
  if (phase.status === "failed") {
    return `${COPY.failed}: ${phase.reason}`;
  }
  if (phase.detection.status === "clean") {
    return COPY.clean;
  }
  return COPY.injected;
};

const isAlarm = (phase: Phase): boolean =>
  phase.status === "failed" || (phase.status === "done" && phase.detection.status === "injected");

const sumOf = (rows: readonly Row[], pick: (answered: Answered) => number): number => {
  let sum = NOTHING;
  for (const { answer } of rows) {
    if (answer.status === "answered") {
      sum += pick(answer);
    }
  }
  return sum;
};

const RunSummary = ({ text, trace }: Readonly<{ text: string; trace: Trace }>): ReactNode => (
  <div className="flex flex-col gap-2">
    <h2 className={cn("text-xl font-semibold", isAlarm(trace.phase) && "text-destructive")}>
      {labelOf(trace.phase)}
    </h2>
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-sm sm:grid-cols-4">
      <Stat
        label={COPY.queries}
        value={`${trace.rows.length}${COPY.times} / ${COPY.perSentence} ${sentencesOf(text).length}${COPY.times}`}
      />
      <Stat label={COPY.elapsed} value={`${formatCount(Math.round(trace.elapsed))}ms`} />
      <Stat
        label={COPY.tokens}
        value={formatCount(sumOf(trace.rows, (answer) => answer.inputTokens))}
      />
      <Stat label={COPY.spent} value={formatDollars(sumOf(trace.rows, (answer) => answer.cost))} />
    </dl>
  </div>
);

export { RunSummary };
