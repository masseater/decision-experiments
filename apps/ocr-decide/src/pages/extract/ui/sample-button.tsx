import { Button } from "@decision-experiments/web-ui";
import { useCallback } from "react";
import type { ReactNode } from "react";

import { useOpenPicture } from "#/pages/extract/api/use-open-picture";

const SampleButton = ({ name, label }: Readonly<{ name: string; label: string }>): ReactNode => {
  const open = useOpenPicture();
  const click = useCallback(() => {
    open(name, `${import.meta.env.BASE_URL}samples/${name}`);
  }, [name, open]);
  return (
    <Button variant="outline" onClick={click}>
      {label}
    </Button>
  );
};

export { SampleButton };
