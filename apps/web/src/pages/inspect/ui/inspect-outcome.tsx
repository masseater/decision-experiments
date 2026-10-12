import type { ReactNode } from "react";

import type { InspectOutcome as Outcome } from "#/pages/inspect/api/use-inspect";
import { COPY } from "#/pages/inspect/model/copy";

import { InspectResult } from "./inspect-result";

const contentOf = (outcome: Outcome): ReactNode => {
  if (outcome.status === "success") {
    return <InspectResult detection={outcome.response} />;
  }
  if (outcome.status === "error") {
    return <p className="text-destructive text-sm">{outcome.message}</p>;
  }
  if (outcome.status === "pending") {
    return <p className="text-muted-foreground text-sm">{COPY.pending}</p>;
  }
  return "";
};

const InspectOutcome = ({ outcome }: Readonly<{ outcome: Outcome }>): ReactNode => (
  <section aria-live="polite">{contentOf(outcome)}</section>
);

export { InspectOutcome };
