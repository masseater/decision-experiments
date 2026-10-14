import { Stack } from "alchemy";
import { Website, providers, state } from "alchemy/Cloudflare";
import { Effect } from "effect";

import { APP_NAME, requireAppPrefix } from "./app-name.ts";
import { BASE_PATH } from "./base-path.ts";

const ZONE = "masseater.dev";

const COMPATIBILITY = { date: "2026-08-25" } as const;

const web = Website.StaticSite("Web", {
  compatibility: COMPATIBILITY,
  logpush: true,
  routes: [{ pattern: `${ZONE}${BASE_PATH}*`, zoneName: ZONE }],
  command: "vp build",
  outdir: "dist/client",
  assets: { htmlHandling: "auto-trailing-slash" },
  dev: { command: "vp dev" },
});

export default Stack(
  APP_NAME,
  { providers: providers(), state: state() },
  Effect.gen(function* stack() {
    const { url } = yield* web;
    yield* requireAppPrefix;
    return { url };
  }),
);
