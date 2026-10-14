import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { Option } from "effect";

import { RootDocument } from "#/app/shell/root-document";
import { SEARCH_INDEX_ORIGIN } from "#/shared/config";

import appCss from "#/app/styles.css?url";

const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ocr-decide" },
      ...Option.match(SEARCH_INDEX_ORIGIN, {
        onNone: () => [{ name: "robots", content: "noindex" }],
        onSome: () => [],
      }),
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
});

export { Route };
