import { NodeRuntime, NodeServices } from "@effect/platform-node";
import {
  DEFAULT_CUTOFF,
  DEFAULT_MODEL,
  PRODUCT_NAME,
  detect,
  openRouter,
} from "@injection-bisect/core";
import type { Detection } from "@injection-bisect/core";
import { Console, Effect, Layer, Option, Schema } from "effect";
import { Argument, Command, Flag } from "effect/cli";
import { FetchHttpClient } from "effect/http";
import { OtlpSerialization, OtlpTracer } from "effect/observability";

import pkg from "#package.json" with { type: "json" };

const tracing = OtlpTracer.layerFromConfig({
  resource: { serviceName: PRODUCT_NAME },
}).pipe(Layer.provide(OtlpSerialization.layerJson));

const services = Layer.mergeAll(openRouter, tracing).pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provideMerge(NodeServices.layer),
);

const encodeJson = Schema.encodeUnknownEffect(Schema.fromJsonString(Schema.Unknown));

const reportOf = (detection: Detection, input: string): unknown => {
  if (detection.status === "clean") {
    return detection;
  }
  return {
    ...detection,
    regions: detection.regions.map((region) => ({
      ...region,
      text: input.slice(region.start, region.end),
    })),
  };
};

const command = Command.make(
  PRODUCT_NAME,
  {
    text: Argument.String("text").pipe(Argument.optional),
    file: Flag.FileText("file").pipe(Flag.optional),
    model: Flag.String("model").pipe(Flag.withDefault(DEFAULT_MODEL)),
    cutoff: Flag.Finite("cutoff").pipe(Flag.withDefault(DEFAULT_CUTOFF)),
  },
  ({ text, file, model, cutoff }) =>
    Effect.gen(function* inspect() {
      const input = Option.getOrElse(
        Option.orElse(text, () => file),
        () => "",
      );
      const detection = yield* detect(input, { model, cutoff });
      yield* Console.log(yield* encodeJson(reportOf(detection, input)));
    }),
);

const program = Command.run(command, { version: pkg.version });

NodeRuntime.runMain(
  Layer.build(services).pipe(
    Effect.flatMap((context) => Effect.provideContext(program, context)),
    Effect.scoped,
  ),
);
