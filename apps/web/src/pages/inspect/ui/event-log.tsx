import type { ReactNode } from "react";

import type { InspectEvent } from "#/pages/inspect/api/inspect-events";
import { COPY } from "#/pages/inspect/model/copy";
import { logOf } from "#/pages/inspect/model/log";
import type { LogLine } from "#/pages/inspect/model/log";

const LINE_CLASS: Readonly<Record<LogLine["tone"], string>> = {
  asked: "text-muted-foreground",
  answered: "",
  done: "font-semibold",
  failed: "text-destructive",
};

const EventLog = ({ events }: Readonly<{ events: readonly InspectEvent[] }>): ReactNode => (
  <div className="flex flex-col gap-2">
    <h2 className="text-lg font-semibold">{COPY.log}</h2>
    <ol className="bg-muted/40 max-h-96 overflow-auto rounded-md border p-3 font-mono text-xs leading-relaxed whitespace-pre">
      {logOf(events).map((line) => (
        <li key={line.key} className={LINE_CLASS[line.tone]}>
          {line.text}
        </li>
      ))}
    </ol>
  </div>
);

export { EventLog };
