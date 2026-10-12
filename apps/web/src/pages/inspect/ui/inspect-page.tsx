import { useCallback } from "react";
import type { ChangeEvent, ReactNode } from "react";

import { useInspect } from "#/pages/inspect/api/use-inspect";
import { COPY } from "#/pages/inspect/model/copy";
import { useDraftText, useModelChoice, useSetDraftText } from "#/pages/inspect/model/draft";
import { MAX_CHARS } from "#/pages/inspect/model/models";
import { Button } from "#/shared/ui/button";
import { Textarea } from "#/shared/ui/textarea";

import { InspectOutcome } from "./inspect-outcome";
import { ModelPicker } from "./model-picker";

const TEXT_ROWS = 10;

const InspectPage = (): ReactNode => {
  const text = useDraftText();
  const setText = useSetDraftText();
  const model = useModelChoice();
  const { submit: inspect, outcome } = useInspect();
  const edit = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    [setText],
  );
  const submit = useCallback(() => {
    inspect({ text, model });
  }, [inspect, text, model]);
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{COPY.title}</h1>
        <p className="text-muted-foreground text-sm">{COPY.lead}</p>
      </header>
      <Textarea rows={TEXT_ROWS} maxLength={MAX_CHARS} value={text} onChange={edit} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ModelPicker />
        <Button disabled={outcome.status === "pending" || text.trim() === ""} onClick={submit}>
          {COPY.submit}
        </Button>
      </div>
      <InspectOutcome outcome={outcome} />
    </main>
  );
};

export { InspectPage };
