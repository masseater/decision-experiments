import { useCallback } from "react";
import type { ChangeEvent, ReactNode } from "react";

import { COPY } from "#/pages/inspect/model/copy";
import { useModel, useSetModel } from "#/pages/inspect/model/draft";
import { MODELS } from "#/pages/inspect/model/models";
import { cn } from "#/shared/lib/utils";

import { SELECT_CLASS } from "./select-class";

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
      className={cn(SELECT_CLASS, "font-mono")}
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
