"use client";

import type { ReactNode } from "react";
import { CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import type { TaskEntry } from "#/pages/leaderboard/model/ranking";
import { ChartContainer } from "#/shared/ui/chart";

import { AXIS_TICK, ORIGIN, PERCENT_SCALE, SERIES_COLOR, TOOLTIP_STYLE } from "./chart-style";
import { pointsOf, toPercentPoints } from "./format";

const X_LABEL = {
  value: "p50 レイテンシ（ms）",
  position: "insideBottom",
  offset: -4,
  fontSize: 12,
} as const;
const Y_LABEL = { value: "skill", angle: -90, position: "insideLeft", fontSize: 12 } as const;
const POINT_LABEL = { dataKey: "label", position: "top", fontSize: 12 } as const;
const MARGIN = { top: 16, right: 24, bottom: 16, left: 0 } as const;
const HEADROOM = 1.3;
const TICK_STEP = 100;
const LATENCY_DOMAIN: [number, (dataMax: number) => number] = [
  ORIGIN,
  (dataMax) => Math.ceil((dataMax * HEADROOM) / TICK_STEP) * TICK_STEP,
];

const toPoints = (
  entries: readonly TaskEntry[],
): readonly Readonly<{ label: string; latency: number; skill: number }>[] =>
  entries
    .filter(({ result }) => result.support === "supported")
    .map((entry) => ({
      label: displayLabel(entry),
      latency: entry.result.p50Ms,
      skill: toPercentPoints(entry.result.test.skill),
    }));

const SpeedChart = ({ entries }: Readonly<{ entries: readonly TaskEntry[] }>): ReactNode => (
  <ChartContainer>
    <ScatterChart margin={MARGIN}>
      <CartesianGrid />
      <XAxis
        type="number"
        dataKey="latency"
        name="p50 ms"
        domain={LATENCY_DOMAIN}
        tick={AXIS_TICK}
        label={X_LABEL}
      />
      <YAxis
        type="number"
        dataKey="skill"
        name="skill"
        domain={PERCENT_SCALE}
        tick={AXIS_TICK}
        label={Y_LABEL}
      />
      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={pointsOf} />
      <Scatter
        isAnimationActive={false}
        data={toPoints(entries)}
        fill={SERIES_COLOR}
        label={POINT_LABEL}
      />
    </ScatterChart>
  </ChartContainer>
);

export { SpeedChart };
