import { useCallback } from "react";
import type { ChangeEvent, ReactNode } from "react";

import { COPY } from "#/pages/inspect/model/copy";
import { useModel, useSetModel } from "#/pages/inspect/model/draft";
import { MODELS } from "#/pages/inspect/model/models";

const ModelField = (): ReactNode => {
  const model = useModel();
  const setModel = useSetModel();
  const pick = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setModel(event.target.value);
    },
    [setModel],
  );
  return (
    <select
      aria-label={COPY.model}
      value={model}
      onChange={pick}
      className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 rounded-md border bg-transparent px-2 font-mono text-sm shadow-xs outline-none focus-visible:ring-3"
    >
      {MODELS.map((id) => (
        <option key={id} value={id}>
          {id}
        </option>
      ))}
    </select>
  );
};

export { ModelField };
