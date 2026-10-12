import { HTTPClient } from "@openrouter/sdk/lib/http.js";
import { Config, Effect, Option } from "effect";

const APP = "https://github.com/masseater/mst-ja-decision-bench/bench";
const REPO = "masseater/mst-ja-decision-bench";

const isSet = (name: string): Effect.Effect<boolean> =>
  Config.option(Config.NonEmptyString(name)).pipe(
    Effect.map(Option.isSome),
    Effect.orElseSucceed(() => false),
  );

const contextOf = Effect.gen(function* contextOf() {
  if (yield* isSet("GITHUB_ACTIONS")) {
    return "github-actions";
  }
  if (yield* isSet("CLAUDE_CODE_REMOTE")) {
    return "claude-code-cloud";
  }
  if (yield* isSet("CLAUDECODE")) {
    return "claude-code";
  }
  return "local";
});

const hiddenApp = (): HTTPClient =>
  new HTTPClient().addHook("beforeRequest", (request) => {
    request.headers.set("X-OpenRouter-App-Visibility", "hidden");
  });

const attribution = contextOf.pipe(
  Effect.map((context) => ({
    httpReferer: `${APP}/${context}`,
    appTitle: `${REPO} ${context} bench`,
    httpClient: hiddenApp(),
  })),
);

export { attribution };
