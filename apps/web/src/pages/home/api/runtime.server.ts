import { featureFlagsLive } from "#/shared/flags/index.server";
import { makeRunRequest } from "#/shared/observability/index.server";

const runRequest = makeRunRequest(featureFlagsLive);

export { runRequest };
