import { useCallback } from "react";
import type { ReactNode } from "react";

import { useModelChoice, useSelectModel } from "#/pages/inspect/model/draft";
import { MODELS } from "#/pages/inspect/model/models";
import type { ModelChoice } from "#/pages/inspect/model/models";
import { Button } from "#/shared/ui/button";

const variantOf = (selected: boolean): "default" | "outline" => {
  if (selected) {
    return "default";
  }
  return "outline";
};

const ModelOption = ({ model }: Readonly<{ model: ModelChoice }>): ReactNode => {
  const current = useModelChoice();
  const select = useSelectModel();
  const choose = useCallback(() => {
    select(model);
  }, [model, select]);
  return (
    <Button size="sm" variant={variantOf(model === current)} onClick={choose}>
      {MODELS[model]}
    </Button>
  );
};

export { ModelOption };
