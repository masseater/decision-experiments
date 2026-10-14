import { useCallback } from "react";
import type { ChangeEvent, ReactNode } from "react";

import { COPY } from "#/pages/extract/model/copy";
import { useApiKey, useSetApiKey } from "#/pages/extract/model/draft";
import { Input } from "#/shared/ui/input";

const ApiKeyField = (): ReactNode => {
  const apiKey = useApiKey();
  const setApiKey = useSetApiKey();
  const edit = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setApiKey(event.target.value);
    },
    [setApiKey],
  );
  return (
    <Input
      type="password"
      autoComplete="off"
      placeholder={COPY.apiKey}
      aria-label={COPY.apiKey}
      value={apiKey}
      onChange={edit}
    />
  );
};

export { ApiKeyField };
