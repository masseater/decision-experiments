import { startStaticSite } from "@decision-experiments/start-site/site";
import { Stack } from "alchemy";
import { providers, state } from "alchemy/Cloudflare";
import { Effect } from "effect";

import { APP_NAME, requireAppPrefix } from "./app-name.ts";
import { BASE_PATH } from "./base-path.ts";

const COMPATIBILITY = { date: "2026-08-25" } as const;

const web = startStaticSite(BASE_PATH, COMPATIBILITY);

export default Stack(
  APP_NAME,
  { providers: providers(), state: state() },
  Effect.gen(function* stack() {
    const { url } = yield* web;
    yield* requireAppPrefix;
    return { url };
  }),
);
