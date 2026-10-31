import { Zone } from "@alchemy.run/cloudflare";
import { Stack, isResourceOfType } from "alchemy";
import {
  Array as Arr,
  Effect,
  Match,
  Option,
  Schema,
  Record as Rec,
  String as Str,
  pipe,
} from "effect";

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
    Option.filter(({ name }) => !Str.startsWith(prefixOf(resource, prefix))(name)),
    Option.map(({ name }) => `${resource.FQN}: ${name}`),
    Option.toArray,
  );

const requireAppPrefix = (appName: string): Effect.Effect<readonly string[], never, Stack> =>
  Effect.gen(function* checkAppPrefix() {
    const prefix = `${appName}-`;
    const { name, resources } = yield* Stack;
    const offenders = [
      ...Arr.filter([`Stack: ${name}`], () => name !== appName),
      ...pipe(
        Rec.values(resources),
        Arr.flatMap((resource) => describeUnprefixed(resource, prefix)),
      ),
    ];
    if (Arr.isReadonlyArrayNonEmpty(offenders)) {
      const listed = pipe(offenders, Arr.join(", "));
      return yield* Effect.die(
        new Error(
          `Alchemy のスタック名は "${appName}"、リソース名は "${prefix}"（Zone はドメインそのもの）で始める: ${listed}`,
        ),
      );
    }
    return offenders;
  });

export { requireAppPrefix };
