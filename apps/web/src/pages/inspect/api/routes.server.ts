import { detect, withApiKey } from "@injection-bisect/core";
import type { Detection, InjectionJudge } from "@injection-bisect/core";
import { Duration, Effect, Schema } from "effect";

import { MAX_CHARS } from "#/pages/inspect/model/models";
import { createRouter } from "#/shared/api/index.server";

import { runRequest } from "./runtime.server";

type InspectResponse =
  | (Detection & { readonly millis: number })
  | { readonly status: "failed"; readonly reason: string };

const InspectRequest = Schema.Struct({
  text: Schema.String.check(Schema.isNonEmpty(), Schema.isMaxLength(MAX_CHARS)),
  apiKey: Schema.String.check(Schema.isNonEmpty()),
});

type InspectInput = typeof InspectRequest.Type;

const inspectBody = Schema.toStandardSchemaV1(InspectRequest);

const inspect = Effect.fn("inspect.request")(function* inspect(text: string) {
  const [elapsed, detection] = yield* Effect.timed(detect(text, {}));
  yield* Effect.logInfo("inspected").pipe(
    Effect.annotateLogs({
      chars: text.length,
      status: detection.status,
      probes: detection.probes.length,
    }),
  );
  return { ...detection, millis: Duration.toMillis(elapsed) };
});

const failed = (reason: string): Effect.Effect<InspectResponse> =>
  Effect.succeed({ status: "failed", reason });

const respond = (
  text: string,
  apiKey: string,
): Effect.Effect<InspectResponse, never, InjectionJudge> =>
  inspect(text).pipe(
    withApiKey(apiKey),
    Effect.catchTag("JudgeError", ({ reason }) => failed(reason)),
  );

const inspectRoutes = createRouter("/api/inspect").post(
  "/",
  ({ body }) => runRequest(respond(body.text, body.apiKey)),
  { body: inspectBody },
);

type InspectRoutes = typeof inspectRoutes;

export type { InspectInput, InspectResponse, InspectRoutes };
export { inspectRoutes };
