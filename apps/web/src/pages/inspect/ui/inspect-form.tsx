import { useCallback } from "react";
import type { ReactNode } from "react";

import type { InspectState } from "#/pages/inspect/api/use-inspect";
import { COPY } from "#/pages/inspect/model/copy";
import {
  NO_FOCUS,
  useApiKey,
  useDraftText,
  useRun,
  useSetFocus,
  useSetRun,
} from "#/pages/inspect/model/draft";
import type { Run } from "#/pages/inspect/model/draft";
import { Button } from "#/shared/ui/button";

import { ApiKeyField } from "./api-key-field";
import { OverlaidText } from "./overlaid-text";

const FIRST_RUN = 0;

const NEXT = 1;

const nextIdOf = (run: Run): number => {
  if (run.status === "started") {
    return run.id + NEXT;
  }
  return FIRST_RUN;
};

const isRunning = (state: InspectState): boolean =>
  state.status === "streaming" && state.trace.phase.status === "running";

const InspectForm = ({ state }: Readonly<{ state: InspectState }>): ReactNode => {
  const text = useDraftText();
  const apiKey = useApiKey();
  const run = useRun();
  const setRun = useSetRun();
  const setFocus = useSetFocus();
  const submit = useCallback(() => {
    setFocus(NO_FOCUS);
    setRun({ status: "started", id: nextIdOf(run), text, apiKey });
  }, [setFocus, setRun, run, text, apiKey]);
  const ready = !isRunning(state) && text.trim() !== "" && apiKey !== "";
  return (
    <section className="flex flex-col gap-3">
      <OverlaidText state={state} />
      <div className="flex flex-wrap gap-2">
        <ApiKeyField />
        <Button disabled={!ready} onClick={submit}>
          {COPY.submit}
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">{COPY.keyNote}</p>
    </section>
  );
};

export { InspectForm };
