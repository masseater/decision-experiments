import type { ReactNode } from "react";

import { MODEL_CHOICES } from "#/pages/inspect/model/models";

import { ModelOption } from "./model-option";

const ModelPicker = (): ReactNode => (
  <div className="flex flex-wrap gap-2">
    {MODEL_CHOICES.map((model) => (
      <ModelOption key={model} model={model} />
    ))}
  </div>
);

export { ModelPicker };
