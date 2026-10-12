import type { ReactNode } from "react";

import type { InspectOutcome as Outcome } from "#/pages/inspect/api/use-inspect";
import { COPY } from "#/pages/inspect/model/copy";

import { InspectResult } from "./inspect-result";

const InspectOutcome = ({ outcome }: Readonly<{ outcome: Outcome }>): ReactNode => {
  if (outcome.status === "success") {
    return <InspectResult text={outcome.text} response={outcome.response} />;
  }
  if (outcome.status === "error") {
    return (
      <p className="text-destructive text-sm">
        {COPY.failed}
        {outcome.message}
      </p>
    );
  }
  return <p className="text-muted-foreground text-sm">{COPY[outcome.status]}</p>;
};

export { InspectOutcome };
