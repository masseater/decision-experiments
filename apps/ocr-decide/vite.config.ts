import { startSiteConfig } from "@decision-experiments/start-site/vite";

import { BASE_PATH } from "./base-path.ts";
import { SEARCH_INDEX_ORIGIN } from "./src/shared/config/search.ts";

export default startSiteConfig({
  basePath: BASE_PATH,
  searchIndexOrigin: SEARCH_INDEX_ORIGIN,
});
