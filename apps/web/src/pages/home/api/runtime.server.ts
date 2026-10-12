import { featureFlagsLive } from "#/pages/home/config/feature-flags.server";
import { makeRunRequest } from "#/shared/observability/index.server";

const runRequest = makeRunRequest(featureFlagsLive);

export { runRequest };
