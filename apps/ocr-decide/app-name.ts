import { requireAppPrefix as requireAppPrefixOf } from "@decision-experiments/start-site/alchemy";

const APP_NAME = "ocr-decide";

const requireAppPrefix = requireAppPrefixOf(APP_NAME);

export { APP_NAME, requireAppPrefix };
