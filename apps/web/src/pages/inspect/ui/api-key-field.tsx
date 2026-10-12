import { useCallback } from "react";
import type { ChangeEvent, ReactNode } from "react";

import { COPY } from "#/pages/inspect/model/copy";
import { useApiKey, useSetApiKey } from "#/pages/inspect/model/draft";
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
    <div className="flex-1">
      <Input
        type="password"
        autoComplete="off"
        placeholder={COPY.apiKey}
        aria-label={COPY.apiKey}
        value={apiKey}
        onChange={edit}
      />
    </div>
  );
};

export { ApiKeyField };
