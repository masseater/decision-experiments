import {
  WEB_ANALYTICS_BEACON,
  WEB_ANALYTICS_REPORT_ORIGIN,
} from "@decision-experiments/web-ui/web-analytics";
import { BACKDROP_STYLE_HASH } from "@masseater.dev/ui/backdrop-palette";
import { Array as Arr, pipe } from "effect";

const WEB_ANALYTICS_SCRIPT_ORIGIN = new URL(WEB_ANALYTICS_BEACON.src).origin;

const OPENROUTER_ORIGIN = "https://openrouter.ai";

const NPM_CDN = "https://cdn.jsdelivr.net/npm/";

const contentSecurityPolicy = (scriptHashes: readonly string[]): string =>
  pipe(
    [
      "default-src 'self'",
      Arr.join(
        [
          "script-src 'self' 'wasm-unsafe-eval'",
          WEB_ANALYTICS_SCRIPT_ORIGIN,
          NPM_CDN,
          ...scriptHashes,
        ],
        " ",
      ),
      "worker-src 'self' blob:",
      `style-src 'self' ${BACKDROP_STYLE_HASH}`,
      "style-src-attr 'unsafe-inline'",
      "img-src 'self' data: blob:",
      `connect-src 'self' ${WEB_ANALYTICS_REPORT_ORIGIN} ${OPENROUTER_ORIGIN} ${NPM_CDN}`,
      "object-src 'none'",
      "base-uri 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ],
    Arr.join("; "),
  );

export { contentSecurityPolicy };
