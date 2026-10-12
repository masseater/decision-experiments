import type { ReactNode } from "react";

import type { InspectState } from "#/pages/inspect/api/use-inspect";

import { EventLog } from "./event-log";
import { RunSummary } from "./run-summary";
import { TraceView } from "./trace-view";

const RunView = ({ state }: Readonly<{ state: InspectState }>): ReactNode => {
  if (state.status === "idle") {
    return "";
  }
  if (state.status === "error") {
    return <p className="text-destructive text-sm">{state.message}</p>;
  }
  return (
    <section aria-live="polite" className="flex flex-col gap-8">
      <RunSummary text={state.text} trace={state.trace} />
      <TraceView text={state.text} trace={state.trace} />
      <EventLog events={state.events} />
    </section>
  );
};

export { RunView };
