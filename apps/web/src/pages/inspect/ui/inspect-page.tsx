import { useCallback } from "react";
import type { ReactNode } from "react";

import { useInspect } from "#/pages/inspect/api/use-inspect";
import { COPY } from "#/pages/inspect/model/copy";
import { RESULT, useApiKey, useDraftText, useSetView } from "#/pages/inspect/model/draft";
import { Button } from "#/shared/ui/button";

import { ApiKeyField } from "./api-key-field";
import { InspectOutcome } from "./inspect-outcome";
import { OverlaidText } from "./overlaid-text";

const InspectPage = (): ReactNode => {
  const text = useDraftText();
  const apiKey = useApiKey();
  const setView = useSetView();
  const { submit: inspect, outcome } = useInspect();
  const submit = useCallback(() => {
    setView(RESULT);
    inspect({ text, apiKey });
  }, [inspect, setView, text, apiKey]);
  const ready = outcome.status !== "pending" && text.trim() !== "" && apiKey !== "";
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold">{COPY.title}</h1>
      <OverlaidText outcome={outcome} />
      <div className="flex flex-wrap gap-2">
        <ApiKeyField />
        <Button disabled={!ready} onClick={submit}>
          {COPY.submit}
        </Button>
      </div>
      <InspectOutcome outcome={outcome} />
    </main>
  );
};

export { InspectPage };
