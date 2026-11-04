import { NodeRuntime, NodeServices } from "@effect/platform-node";
import {
  Array as Arr,
  Effect,
  FileSystem,
  Layer,
  Option,
  Path,
  Record as Rec,
  String as Str,
  pipe,
} from "effect";
import { Command, Flag } from "effect/cli";
import { Base64 } from "effect/encoding";

import pkg from "#package.json" with { type: "json" };

import { assetHeaders } from "./asset-headers.ts";
import type { PageHeaders } from "./asset-headers.ts";
import { contentSecurityPolicy } from "./content-security-policy.ts";

const OUTDIR = "dist/client";
const HEADERS_FILE = "_headers";
const INDEX_PAGE = /(?<=^|\/)index\.html$/u;
const HTML_EXTENSION = /\.html$/u;
const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)[^>]*>(?<body>[\s\S]*?)<\/script>/gu;
const encoder = new TextEncoder();

const scriptBodies = (html: string): readonly string[] =>
  pipe(
    html,
    Str.matchAll(INLINE_SCRIPT),
    Arr.fromIterable,
    Arr.map((match) =>
      pipe(
        Option.fromNullishOr(match.groups),
        Option.flatMap(Rec.get("body")),
        Option.getOrElse(() => ""),
      ),
    ),
  );

const scriptHash = (body: string): Effect.Effect<string> =>
  Effect.promise(() => crypto.subtle.digest("SHA-256", encoder.encode(body))).pipe(
    Effect.map((digest) => `'sha256-${Base64.encode(new Uint8Array(digest))}'`),
  );

const scriptHashes = (bodies: readonly string[]): Effect.Effect<readonly string[]> =>
  pipe(bodies, Arr.dedupe, Effect.forEach(scriptHash));

const pagePath = (page: string): string =>
  `/${pipe(page, Str.replace(INDEX_PAGE, ""), Str.replace(HTML_EXTENSION, ""))}`;

const write = Effect.fn("build.asset-headers")(function* write(clientCompute: boolean) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const entries = yield* fileSystem.readDirectory(OUTDIR, { recursive: true });
  const pages: readonly PageHeaders[] = yield* pipe(
    entries,
    Arr.filter(Str.endsWith(".html")),
    Effect.forEach((page) =>
      fileSystem.readFileString(path.join(OUTDIR, page)).pipe(
        Effect.map(scriptBodies),
        Effect.flatMap(scriptHashes),
        Effect.map((hashes) => ({
          path: pagePath(page),
          headers: {
            "Content-Security-Policy": contentSecurityPolicy({
              scriptHashes: hashes,
              clientCompute,
            }),
          },
        })),
      ),
    ),
  );
  yield* fileSystem.writeFileString(
    path.join(OUTDIR, HEADERS_FILE),
    assetHeaders({
      documentHeaders: {
        "Content-Security-Policy": contentSecurityPolicy({ scriptHashes: [], clientCompute }),
      },
      pages,
    }),
  );
});

const command = Command.make(
  "write-asset-headers",
  { clientCompute: Flag.Boolean("client-compute").pipe(Flag.withDefault(false)) },
  ({ clientCompute }) => write(clientCompute),
);

const program = Command.run(command, { version: pkg.version });

NodeRuntime.runMain(
  Layer.build(NodeServices.layer).pipe(
    Effect.flatMap((context) => Effect.provideContext(program, context)),
    Effect.scoped,
  ),
);
