import type { ReactNode } from "react";

import type { InspectResponse } from "#/pages/inspect/api/routes.server";
import { COPY } from "#/pages/inspect/model/copy";
import { formatDollars, formatMillis, totalCost } from "#/pages/inspect/model/format";

import { HighlightedText } from "./highlighted-text";
import { ProbeList } from "./probe-list";
import { Verdict } from "./verdict";

const InspectResult = ({
  text,
  response,
}: Readonly<{ text: string; response: InspectResponse }>): ReactNode => {
  if (response.status === "failed") {
    return (
      <p className="text-destructive text-sm">
        {COPY.failed}
        {response.reason}
      </p>
    );
  }
  return (
    <section className="flex flex-col gap-4">
      <Verdict status={response.status} probability={response.probability} />
      <p className="text-muted-foreground text-sm">
        {COPY.requests}
        {response.probes.length}
        {COPY.times}
        {COPY.separator}
        {formatMillis(response.millis)}
        {COPY.separator}
        {formatDollars(totalCost(response.probes))}
      </p>
      {response.status === "injected" && <HighlightedText text={text} regions={response.regions} />}
      <ProbeList text={text} probes={response.probes} />
    </section>
  );
};

export { InspectResult };
