"use client";

import type { ComponentProps, ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

import { cn } from "#/shared/lib/utils";

const INITIAL_DIMENSION = { width: 320, height: 200 } as const;

const ChartContainer = ({
  className,
  children,
  ...props
}: ComponentProps<"div"> &
  Readonly<{ children: ComponentProps<typeof ResponsiveContainer>["children"] }>): ReactNode => (
  <div
    data-slot="chart"
    className={cn(
      "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-layer]:outline-hidden [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_line]:stroke-border [&_.recharts-surface]:outline-hidden",
      className,
    )}
    {...props}
  >
    <ResponsiveContainer initialDimension={INITIAL_DIMENSION}>{children}</ResponsiveContainer>
  </div>
);

export { ChartContainer };
