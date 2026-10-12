import { Stack, makeRandom } from "alchemy";
import { D1, Rules, Ruleset, Website, providers, state } from "alchemy/Cloudflare";
import type { InferEnv } from "alchemy/Cloudflare";
import { Effect } from "effect";

const TRACE_SAMPLING_RATE = 0.1;
const ZONE = "masseater.dev";
const BASE_PATH = "/decision-bench";
const LEGACY_HOST = "mst-ja-decision-bench.masseater.dev";
const LEGACY_REDIRECT_LIST = "mst_ja_decision_bench_legacy_host";

const web = Effect.gen(function* web() {
  const DB = yield* D1.Database("DB", { migrations: "./drizzle" });
  const BETTER_AUTH_SECRET = yield* makeRandom("BetterAuthSecret");
  return yield* Website.Vite("Web", {
    compatibility: { date: "2026-08-25" },
    domain: LEGACY_HOST,
    routes: [{ pattern: `${ZONE}${BASE_PATH}*`, zoneName: ZONE }],
    env: { BETTER_AUTH_SECRET, DB },
    observability: {
      enabled: true,
      logs: {
        enabled: true,
        invocationLogs: true,
        persist: true,
      },
      traces: { enabled: true, headSamplingRate: TRACE_SAMPLING_RATE, persist: true },
    },
    viteEnvironments: { entry: "ssr", children: ["rsc"] },
  });
});

const legacyHostRedirect = Effect.gen(function* legacyHostRedirect() {
  const list = yield* Rules.List("LegacyHostRedirects", {
    name: LEGACY_REDIRECT_LIST,
    kind: "redirect",
    items: [
      {
        redirect: {
          sourceUrl: `${LEGACY_HOST}/`,
          targetUrl: `https://${ZONE}${BASE_PATH}/`,
          statusCode: 301,
          subpathMatching: true,
          preservePathSuffix: true,
          preserveQueryString: true,
        },
      },
    ],
  });
  return yield* Ruleset.AccountEntrypoint("BulkRedirects", {
    phase: "http_request_redirect",
    rules: [
      {
        action: "redirect",
        expression: `http.request.full_uri in $${LEGACY_REDIRECT_LIST}`,
        actionParameters: { fromList: { name: list.name, key: "http.request.full_uri" } },
      },
    ],
  });
});

type WebEnv = InferEnv<typeof web>;

export type { WebEnv };
export default Stack(
  "mst-ja-decision-bench",
  { providers: providers(), state: state() },
  Effect.gen(function* stack() {
    const { url } = yield* web;
    yield* legacyHostRedirect;
    return { url };
  }),
);
