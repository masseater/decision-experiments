import { Workers, providers, state } from "@alchemy.run/cloudflare";
import type { InferEnv } from "@alchemy.run/cloudflare";
import { startStaticSite } from "@decision-experiments/start-site/site";
import { Stack } from "alchemy";
import { Config, Effect, Option, Schema } from "effect";

import { APP_NAME, CI_TELEMETRY_AUDIENCE, requireAppPrefix } from "./app-name.ts";
import { BASE_PATH } from "./base-path.ts";
import { edgeGuard } from "./edge-guard.ts";

const COMPATIBILITY = { date: "2026-08-25" } as const;

const OWNED_ZONE = Option.none<string>();

const web = startStaticSite(BASE_PATH, COMPATIBILITY);

const ciTelemetry = Effect.gen(function* ciTelemetry() {
  const GITHUB_REPOSITORY = yield* Config.schema(Schema.String, "GITHUB_REPOSITORY").pipe(
    Config.withDefault(""),
  );
  return yield* Workers.Worker("CiTelemetry", {
    name: CI_TELEMETRY_AUDIENCE,
    main: "./ci-telemetry.worker.ts",
    compatibility: COMPATIBILITY,
    logpush: true,
    env: { GITHUB_REPOSITORY },
    observability: {
      enabled: true,
      logs: { enabled: true, invocationLogs: false, persist: true },
    },
  });
});

type CiTelemetryEnv = InferEnv<typeof ciTelemetry>;

export type { CiTelemetryEnv };
export default Stack(
  APP_NAME,
  { providers: providers(), state: state() },
  Effect.gen(function* stack() {
    const { url } = yield* web;
    yield* Option.match(OWNED_ZONE, {
      onNone: () => Effect.void,
      onSome: (zone) => edgeGuard(zone, COMPATIBILITY),
    });
    yield* ciTelemetry;
    yield* requireAppPrefix;
    return { url };
  }),
);
