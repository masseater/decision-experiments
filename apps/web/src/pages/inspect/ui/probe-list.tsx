import type { Probe } from "@injection-bisect/core";
import { Array as Arr, Option } from "effect";
import type { ReactNode } from "react";

import { COPY } from "#/pages/inspect/model/copy";
import { formatDollars, formatMillis, formatPercent } from "#/pages/inspect/model/format";
import { cn } from "#/shared/lib/utils";

const EXCERPT_CHARS = 48;

const FIRST = 0;

const CUTOFF = 0.5;

const DEPTH_INDENT = ["pl-0", "pl-4", "pl-8", "pl-12", "pl-16", "pl-20"] as const;

const ELLIPSIS = "…";

const indentOf = (depth: number): string =>
  Option.getOrElse(
    Option.orElse(Arr.get(DEPTH_INDENT, depth), () => Arr.last(DEPTH_INDENT)),
    () => "",
  );

const excerptOf = (text: string, probe: Probe): string => {
  const slice = text.slice(probe.start, probe.end).replaceAll("\n", " ");
  if (slice.length <= EXCERPT_CHARS) {
    return slice;
  }
  return `${slice.slice(FIRST, EXCERPT_CHARS)}${ELLIPSIS}`;
};

const ordered = (probes: readonly Probe[]): readonly Probe[] =>
  probes.toSorted((left, right) => left.depth - right.depth || left.start - right.start);

const ProbeList = ({
  text,
  probes,
}: Readonly<{ text: string; probes: readonly Probe[] }>): ReactNode => (
  <ol className="flex flex-col gap-1 text-sm">
    {ordered(probes).map((probe) => (
      <li
        key={`${probe.depth}:${probe.start}`}
        className={cn("flex items-baseline gap-3", indentOf(probe.depth))}
      >
        <span
          className={cn(
            "w-14 shrink-0 text-right font-mono",
            probe.probability >= CUTOFF && "text-destructive",
          )}
        >
          {formatPercent(probe.probability)}
        </span>
        <span className="min-w-0 flex-1 truncate">{excerptOf(text, probe)}</span>
        <span className="text-muted-foreground shrink-0">
          {formatMillis(probe.millis)}
          {COPY.slash}
          {formatDollars(probe.cost)}
        </span>
      </li>
    ))}
  </ol>
);

export { ProbeList };
