import { Rum, Website } from "alchemy/Cloudflare";
import { Effect } from "effect";

const ZONE = "masseater.dev";

const startStaticSite = Effect.fn("startStaticSite")(function* startStaticSite(
  basePath: string,
  compatibility: Readonly<{ date: string }>,
) {
  const { siteToken } = yield* Rum.Site("WebAnalytics", { host: ZONE });
  return yield* Website.StaticSite("Web", {
    env: { VITE_CF_BEACON_TOKEN: siteToken },
    compatibility,
    logpush: true,
    routes: [{ pattern: `${ZONE}${basePath}*`, zoneName: ZONE }],
    command: "vp build",
    outdir: "dist/client",
    assets: { htmlHandling: "auto-trailing-slash" },
    dev: { command: "vp dev" },
  });
});

export { startStaticSite };
