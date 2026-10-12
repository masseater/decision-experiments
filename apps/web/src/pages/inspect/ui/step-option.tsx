import { useCallback } from "react";
import type { ReactNode } from "react";

import { useSetView, useView } from "#/pages/inspect/model/draft";
import type { View } from "#/pages/inspect/model/draft";
import { Button } from "#/shared/ui/button";

const variantOf = (selected: boolean): "default" | "outline" => {
  if (selected) {
    return "default";
  }
  return "outline";
};

const sameView = (left: View, right: View): boolean =>
  JSON.stringify(left) === JSON.stringify(right);

const StepOption = ({ view, label }: Readonly<{ view: View; label: string }>): ReactNode => {
  const current = useView();
  const setView = useSetView();
  const choose = useCallback(() => {
    setView(view);
  }, [setView, view]);
  return (
    <Button size="sm" variant={variantOf(sameView(view, current))} onClick={choose}>
      {label}
    </Button>
  );
};

export { StepOption };
