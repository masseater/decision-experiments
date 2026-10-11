"use client";

import type { ReactNode } from "react";
import {
  CartesianGrid,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TaskResult } from "#/pages/leaderboard/model/summary";
import { pointsOf, toPercentPoints } from "#/pages/leaderboard/ui/format";
import { ChartContainer } from "#/shared/ui/chart";

import {
  AXIS_TICK,
  FULL_PERCENT,
  ORIGIN,
  PERCENT_SCALE,
  REFERENCE_COLOR,
  SERIES_COLOR,
  TOOLTIP_STYLE,
} from "./chart-style";

const X_LABEL = { value: "確信度", position: "insideBottom", offset: -4, fontSize: 12 } as const;
const Y_LABEL = {
  value: "実際の正解率",
  angle: -90,
  position: "insideLeft",
  fontSize: 12,
} as const;
const MARGIN = { top: 16, right: 24, bottom: 16, left: 0 } as const;
const HORIZONTAL = "x";
const VERTICAL = "y";
const DIAGONAL = [
  { [HORIZONTAL]: ORIGIN, [VERTICAL]: ORIGIN },
  { [HORIZONTAL]: FULL_PERCENT, [VERTICAL]: FULL_PERCENT },
] as const;
const DASH = "4 4";

const toPoints = (
  result: Readonly<TaskResult>,
): readonly Readonly<{ confidence: number; accuracy: number; count: number }>[] => {
  if (result.test.calibration.status === "unavailable") {
    return [];
  }
  return result.test.calibration.curve.map((bin) => ({
    confidence: toPercentPoints(bin.meanPredicted),
    accuracy: toPercentPoints(bin.observedFrequency),
    count: bin.count,
  }));
};

const describe = (result: Readonly<TaskResult>): string =>
  toPoints(result)
    .map(
      ({ confidence, accuracy, count }) =>
        `確信度 ${pointsOf(confidence)}% で正解率 ${pointsOf(accuracy)}%（${count} 件）`,
    )
    .join("、");

const ReliabilityChart = ({
  result,
  title,
}: Readonly<{ result: TaskResult; title: string }>): ReactNode => (
  <ChartContainer>
    <ScatterChart title={title} desc={describe(result)} margin={MARGIN}>
      <CartesianGrid />
      <XAxis
        type="number"
        dataKey="confidence"
        name="確信度"
        domain={PERCENT_SCALE}
        tick={AXIS_TICK}
        label={X_LABEL}
      />
      <YAxis
        type="number"
        dataKey="accuracy"
        name="実際の正解率"
        domain={PERCENT_SCALE}
        tick={AXIS_TICK}
        label={Y_LABEL}
      />
      <ReferenceLine segment={DIAGONAL} stroke={REFERENCE_COLOR} strokeDasharray={DASH} />
      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={pointsOf} />
      <Scatter isAnimationActive={false} data={toPoints(result)} fill={SERIES_COLOR} line />
    </ScatterChart>
  </ChartContainer>
);

export { ReliabilityChart };
