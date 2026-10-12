import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useCallback } from "react";
import type { ReactNode } from "react";

import { useDraftText, useSetDraftText } from "#/pages/inspect/model/draft";
import type { Example } from "#/pages/inspect/model/examples";
import { Button } from "#/shared/ui/button";

const variantOf = (selected: boolean): "secondary" | "outline" => {
  if (selected) {
    return "secondary";
  }
  return "outline";
};

const iconOf = (kind: Example["kind"]): ReactNode => {
  if (kind === "injected") {
    return <ShieldAlert />;
  }
  return <ShieldCheck />;
};

const ExamplePicker = ({ example }: Readonly<{ example: Example }>): ReactNode => {
  const text = useDraftText();
  const setText = useSetDraftText();
  const choose = useCallback(() => {
    setText(example.text);
  }, [setText, example.text]);
  return (
    <Button size="sm" variant={variantOf(text === example.text)} onClick={choose}>
      {iconOf(example.kind)}
      {example.name}
    </Button>
  );
};

export { ExamplePicker };
