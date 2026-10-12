import type { ReactNode } from "react";

import { COPY } from "#/pages/inspect/model/copy";
import type { Trace } from "#/pages/inspect/model/trace";

import { TraceRow } from "./trace-row";

const MIN_SPAN = 1;

const TraceView = ({ text, trace }: Readonly<{ text: string; trace: Trace }>): ReactNode => (
  <div className="flex flex-col gap-2">
    <h2 className="text-lg font-semibold">{COPY.trace}</h2>
    <ol className="flex flex-col">
      {trace.rows.map((row) => (
        <TraceRow
          key={row.id}
          row={row}
          excerpt={text.slice(row.start, row.end)}
          total={Math.max(trace.elapsed, MIN_SPAN)}
        />
      ))}
    </ol>
  </div>
);

export { TraceView };
