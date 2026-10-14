import { Stack, isResourceOfType } from "alchemy";
import { Zone } from "alchemy/Cloudflare";
import { Array as Arr, Effect, Match, Option, Schema } from "effect";

const isZone = (resource: unknown): boolean => isResourceOfType(resource, Zone.Zone.Type);

const decodeNamed = Schema.decodeUnknownOption(Schema.Struct({ name: Schema.String }));

const prefixOf = (resource: unknown, prefix: string): string =>
  Match.value(resource).pipe(
    Match.when(isZone, () => ""),
    Match.orElse(() => prefix),
  );

const describeUnprefixed = (
  resource: Readonly<{ FQN: string; Props: unknown }>,
  prefix: string,
): readonly string[] =>
  decodeNamed(resource.Props).pipe(
    Option.filter(({ name }) => !name.startsWith(prefixOf(resource, prefix))),
    Option.map(({ name }) => `${resource.FQN}: ${name}`),
    Option.toArray,
  );

const requireAppPrefix = (appName: string): Effect.Effect<readonly string[], never, Stack> =>
  Effect.gen(function* checkAppPrefix() {
    const prefix = `${appName}-`;
    const { name, resources } = yield* Stack;
    const offenders = [
      ...Arr.filter([`Stack: ${name}`], () => name !== appName),
      ...Object.values(resources).flatMap((resource) => describeUnprefixed(resource, prefix)),
    ];
    if (Arr.isReadonlyArrayNonEmpty(offenders)) {
      return yield* Effect.die(
        new Error(
          `Alchemy のスタック名は "${appName}"、リソース名は "${prefix}"（Zone はドメインそのもの）で始める: ${offenders.join(", ")}`,
        ),
      );
    }
    return offenders;
  });

export { requireAppPrefix };
