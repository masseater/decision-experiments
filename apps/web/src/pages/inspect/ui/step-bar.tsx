import type { Probe } from "@injection-bisect/core";
import type { ReactNode } from "react";

import { COPY } from "#/pages/inspect/model/copy";
import { RESULT } from "#/pages/inspect/model/draft";
import type { View } from "#/pages/inspect/model/draft";

import { StepOption } from "./step-option";

const NEXT = 1;

interface Step {
  readonly view: View;
  readonly label: string;
}

const stepsOf = (probes: readonly Probe[]): readonly Step[] => [
  ...[...new Set(probes.map((probe) => probe.depth))]
    .toSorted((left, right) => left - right)
    .map((depth): Step => ({
      view: { status: "step", depth },
      label: `${depth + NEXT}${COPY.step}`,
    })),
  { view: RESULT, label: COPY.result },
];

const StepBar = ({ probes }: Readonly<{ probes: readonly Probe[] }>): ReactNode => (
  <div className="flex flex-wrap gap-2">
    {stepsOf(probes).map((step) => (
      <StepOption key={step.label} view={step.view} label={step.label} />
    ))}
  </div>
);

export { StepBar };
