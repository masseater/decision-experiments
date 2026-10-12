import { Stack, isResourceOfType } from "alchemy";
import { Zone } from "alchemy/Cloudflare";
import { Array as Arr, Effect, Match, Option, Schema } from "effect";

const APP_NAME = "injection-bisect";

const PREFIX = `${APP_NAME}-`;

const CI_TELEMETRY_AUDIENCE = `${PREFIX}ci-telemetry`;

const isZone = (resource: unknown): boolean => isResourceOfType(resource, Zone.Zone.Type);

const decodeNamed = Schema.decodeUnknownOption(Schema.Struct({ name: Schema.String }));

const prefixOf = (resource: unknown): string =>
  Match.value(resource).pipe(
    Match.when(isZone, () => ""),
    Match.orElse(() => PREFIX),
  );

const describeUnprefixed = (
  resource: Readonly<{ FQN: string; Props: unknown }>,
): readonly string[] =>
  decodeNamed(resource.Props).pipe(
    Option.filter(({ name }) => !name.startsWith(prefixOf(resource))),
    Option.map(({ name }) => `${resource.FQN}: ${name}`),
    Option.toArray,
  );

const requireAppPrefix = Effect.gen(function* requireAppPrefix() {
  const { name, resources } = yield* Stack;
  const offenders = [
    ...Arr.filter([`Stack: ${name}`], () => name !== APP_NAME),
    ...Object.values(resources).flatMap((resource) => describeUnprefixed(resource)),
  ];
  if (Arr.isReadonlyArrayNonEmpty(offenders)) {
    return yield* Effect.die(
      new Error(
        `Alchemy のスタック名は "${APP_NAME}"、リソース名は "${PREFIX}"（Zone はドメインそのもの）で始める: ${offenders.join(", ")}`,
      ),
    );
  }
  return offenders;
});

export { APP_NAME, CI_TELEMETRY_AUDIENCE, requireAppPrefix };
