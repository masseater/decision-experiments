import { rootHead } from "@decision-experiments/web-ui";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";

import { RootDocument } from "#/app/shell/root-document";
import { SEARCH_INDEX_ORIGIN } from "#/shared/config";

import appCss from "#/app/styles.css?url";

const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () =>
    rootHead({ title: "ocr-decide", stylesheet: appCss, searchIndexOrigin: SEARCH_INDEX_ORIGIN }),
  shellComponent: RootDocument,
});

export { Route };
