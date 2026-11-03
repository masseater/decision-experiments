import {
  WEB_ANALYTICS_BEACON,
  WEB_ANALYTICS_REPORT_ORIGIN,
} from "@decision-experiments/web-ui/web-analytics";
import { BACKDROP_STYLE_HASH } from "@masseater.dev/ui/backdrop-palette";
import { Array as Arr, pipe } from "effect";

const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Resource-Policy": "same-origin",
} as const;

const ASSET_CACHE_CONTROL = "public, max-age=31536000, immutable";

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

export { ASSET_CACHE_CONTROL, SECURITY_HEADERS, contentSecurityPolicy };
