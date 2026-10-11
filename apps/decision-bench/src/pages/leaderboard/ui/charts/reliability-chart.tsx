"use client";

import type { ReactNode } from "react";
import { Legend, Scatter, ScatterChart } from "recharts";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import type { TaskEntry } from "#/pages/leaderboard/model/ranking";
import { pointsOf, toPercentPoints } from "#/pages/leaderboard/ui/format";
import { ChartContainer } from "#/shared/ui/chart";

import { REFERENCE_COLOR } from "./chart-style";
import { ReliabilityAxes } from "./reliability-axes";
import { useLegendHandlers, useSeriesStates } from "./reliability-state";
import type { SeriesState } from "./reliability-state";

type Point = Readonly<{ label: string; confidence: number; accuracy: number; count: number }>;

type Series = Readonly<{ model: string; name: string; color: string; points: readonly Point[] }>;

type Line = Readonly<{ stroke: string; strokeWidth: number; strokeOpacity: number }>;

const SERIES_COLORS = [
  "var(--color-series-1)",
  "var(--color-series-2)",
  "var(--color-series-3)",
  "var(--color-series-4)",
  "var(--color-series-5)",
  "var(--color-series-6)",
  "var(--color-series-7)",
  "var(--color-series-8)",
] as const;
const FIRST_MARK = 1;

const MARGIN = { top: 16, right: 24, bottom: 16, left: 0 } as const;
const LEGEND_STYLE = { fontSize: 12, paddingTop: 16, cursor: "pointer" } as const;
const EMPHASIS = {
  plain: { width: 2, opacity: 1 },
  focused: { width: 3, opacity: 1 },
  faded: { width: 2, opacity: 0.15 },
} as const;

const RADIX = 10;
const FULL_PERCENT = 100;

const lowestOf = (series: readonly Series[]): number =>
  Math.min(
    FULL_PERCENT,
    ...series.flatMap(({ points }) => points.map(({ confidence }) => confidence)),
  );

const rankOf = ({ value }: Readonly<{ value: string | undefined }>): number =>
  Number.parseInt(value ?? "", RADIX);

const legendText = (value: unknown): ReactNode => (
  <span className="text-foreground">{String(value)}</span>
);

const colorOf = (mark: number): string => SERIES_COLORS[mark - FIRST_MARK] ?? REFERENCE_COLOR;

const seriesOf = (entries: readonly TaskEntry[]): readonly Series[] =>
  entries.flatMap((entry) => {
    const { calibration } = entry.result.test;
    if (calibration.status === "unavailable") {
      return [];
    }
    const label = displayLabel(entry);
    return [
      {
        model: entry.model.model,
        name: `${entry.mark} ${label}`,
        color: colorOf(entry.mark),
        points: calibration.curve.map((bin) => ({
          label,
          confidence: toPercentPoints(bin.meanPredicted),
          accuracy: toPercentPoints(bin.observedFrequency),
          count: bin.count,
        })),
      },
    ];
  });

const describe = (series: readonly Series[]): string =>
  series
    .map(
      ({ name, points }) =>
        `${name}: ${points
          .map(
            ({ confidence, accuracy, count }) =>
              `確信度 ${pointsOf(confidence)}% で正解率 ${pointsOf(accuracy)}%（${count} 件）`,
          )
          .join("、")}`,
    )
    .join("。");

const lineOf = ({
  color,
  state,
}: Readonly<{ color: string; state: SeriesState }>): Readonly<{ opacity: number; line: Line }> => {
  const { width, opacity } = EMPHASIS[state.focus];
  return { opacity, line: { stroke: color, strokeWidth: width, strokeOpacity: opacity } };
};

const ReliabilityChart = ({
  task,
  entries,
  title,
}: Readonly<{ task: string; entries: readonly TaskEntry[]; title: string }>): ReactNode => {
  const plain = seriesOf(entries);
  const series = useSeriesStates({ task, series: plain });
  const legend = useLegendHandlers({ task, series: plain });
  return (
    <ChartContainer>
      <ScatterChart desc={`${title}: ${describe(plain)}`} margin={MARGIN}>
        <ReliabilityAxes lowest={lowestOf(plain)} />
        <Legend
          wrapperStyle={LEGEND_STYLE}
          itemSorter={rankOf}
          formatter={legendText}
          onClick={legend.handleClick}
          onMouseEnter={legend.handleMouseEnter}
          onMouseLeave={legend.handleMouseLeave}
        />
        {series.map(({ model, name, color, points, state }) => {
          const { opacity, line } = lineOf({ color, state });
          return (
            <Scatter
              key={model}
              name={name}
              isAnimationActive={false}
              data={points}
              fill={color}
              fillOpacity={opacity}
              line={line}
              hide={state.hidden}
              onMouseEnter={state.handleMouseEnter}
              onMouseLeave={state.handleMouseLeave}
            />
          );
        })}
      </ScatterChart>
    </ChartContainer>
  );
};

export { ReliabilityChart };
