"use client";

import type { ReactNode } from "react";
import { CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";

import { pointsOf } from "#/pages/leaderboard/ui/format";
import { ChartContainer } from "#/shared/ui/chart";

import { AXIS_TICK, PERCENT_SCALE, SERIES_COLOR, TOOLTIP_STYLE } from "./chart-style";
import { intervalBar } from "./interval-bar";

type ScatterPoint = Readonly<{
  label: string;
  measure: number;
  skill: number;
  error: readonly [number, number];
}>;

type Axis = Readonly<{
  name: string;
  domain: readonly [number, (dataMax: number) => number];
  format: (value: unknown) => string;
}>;

const Y_LABEL = { value: "skill", angle: -90, position: "insideLeft", fontSize: 12 } as const;
const POINT_LABEL = { dataKey: "label", position: "right", fontSize: 12 } as const;
const MARGIN = { top: 16, right: 24, bottom: 16, left: 0 } as const;

const xLabel = (name: string): Readonly<Record<string, number | string>> => ({
  value: name,
  position: "insideBottom",
  offset: -4,
  fontSize: 12,
});

const describe = (points: readonly ScatterPoint[], axis: Axis): string =>
  points
    .map(
      ({ label, measure, skill }) =>
        `${label} ${axis.name} ${axis.format(measure)}、skill ${pointsOf(skill)}`,
    )
    .join("。");

const ScoreScatter = ({
  points,
  axis,
  title,
}: Readonly<{ points: readonly ScatterPoint[]; axis: Axis; title: string }>): ReactNode => (
  <ChartContainer>
    <ScatterChart title={title} desc={describe(points, axis)} margin={MARGIN}>
      <CartesianGrid />
      <XAxis
        type="number"
        dataKey="measure"
        name={axis.name}
        domain={axis.domain}
        tick={AXIS_TICK}
        tickFormatter={axis.format}
        label={xLabel(axis.name)}
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
      <Scatter isAnimationActive={false} data={points} fill={SERIES_COLOR} label={POINT_LABEL}>
        {intervalBar("y")}
      </Scatter>
    </ScatterChart>
  </ChartContainer>
);

export { ScoreScatter };
export type { Axis, ScatterPoint };
