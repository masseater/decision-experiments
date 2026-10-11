import { Crypto, Effect, FileSystem, Path, Schema } from "effect";
import { Hex } from "effect/encoding";

const INDENT = 2;

const benchPath = Effect.fn("benchPath")(function* benchPath(...segments: readonly string[]) {
  const path = yield* Path.Path;
  return path.join(path.resolve(import.meta.dirname, ".."), ...segments);
});

const ensureParent = Effect.fn("ensureParent")(function* ensureParent(file: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs.makeDirectory(path.dirname(file), { recursive: true });
});

const readJsonl = Effect.fn("readJsonl")(function* readJsonl<Codec extends Schema.Top>(
  schema: Codec,
  file: string,
) {
  const fs = yield* FileSystem.FileSystem;
  if (!(yield* fs.exists(file))) {
    return [];
  }
  const text = yield* fs.readFileString(file);
  const decode = Schema.decodeUnknownEffect(Schema.fromJsonString(schema));
  return yield* Effect.forEach(
    text.split("\n").filter((line) => line.trim() !== ""),
    (line) => decode(line),
  );
});

const writeJsonl = Effect.fn("writeJsonl")(function* writeJsonl<Codec extends Schema.Top>(
  schema: Codec,
  file: string,
  rows: readonly Codec["Type"][],
) {
  const fs = yield* FileSystem.FileSystem;
  const encode = Schema.encodeEffect(Schema.fromJsonString(schema));
  const lines = yield* Effect.forEach(rows, (row) => encode(row), { concurrency: "unbounded" });
  yield* ensureParent(file);
  yield* fs.writeFileString(file, lines.map((line) => `${line}\n`).join(""));
});

const writeJson = Effect.fn("writeJson")(function* writeJson<Codec extends Schema.Top>(
  schema: Codec,
  file: string,
  value: Codec["Type"],
) {
  const fs = yield* FileSystem.FileSystem;
  const text = yield* Schema.encodeEffect(Schema.fromJsonString(schema, { space: INDENT }))(value);
  yield* ensureParent(file);
  yield* fs.writeFileString(file, `${text}\n`);
});

const encodeJson = Schema.encodeEffect(Schema.fromJsonString(Schema.Unknown));

const toJson = (value: unknown): Effect.Effect<string, Schema.SchemaError> => encodeJson(value);

const sha256 = Effect.fn("sha256")(function* sha256(value: unknown) {
  const crypto = yield* Crypto.Crypto;
  const json = yield* toJson(value);
  return Hex.encode(yield* crypto.digest("SHA-256", new TextEncoder().encode(json)));
});

export { benchPath, readJsonl, sha256, toJson, writeJson, writeJsonl };
