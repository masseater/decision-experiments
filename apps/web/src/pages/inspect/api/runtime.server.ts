import { openRouterPerRequest } from "@injection-bisect/core";

import { makeRunRequest } from "#/shared/observability/index.server";

const runRequest = makeRunRequest(openRouterPerRequest);

export { runRequest };
