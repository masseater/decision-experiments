import { requireAppPrefix as requireAppPrefixOf } from "@decision-experiments/start-site/alchemy";

const APP_NAME = "injection-bisect";

const CI_TELEMETRY_AUDIENCE = `${APP_NAME}-ci-telemetry`;

const requireAppPrefix = requireAppPrefixOf(APP_NAME);

export { APP_NAME, CI_TELEMETRY_AUDIENCE, requireAppPrefix };
