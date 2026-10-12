import { openRouter } from "@injection-bisect/core";
import { env } from "cloudflare:workers";
import { ConfigProvider, Layer } from "effect";

import { makeRunRequest } from "#/shared/observability/index.server";

const workersConfig = ConfigProvider.fromUnknown(env);

const workersConfigLive = ConfigProvider.layer(workersConfig);

const runRequest = makeRunRequest(openRouter.pipe(Layer.provide(workersConfigLive)));

export { runRequest };
