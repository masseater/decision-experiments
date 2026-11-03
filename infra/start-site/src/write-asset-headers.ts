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
import { Base64 } from "effect/encoding";

import { assetHeaders } from "./asset-headers.ts";
import type { PageHeaders } from "./asset-headers.ts";
import { contentSecurityPolicy } from "./security-headers.ts";

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

const program = Effect.gen(function* write() {
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
          headers: { "Content-Security-Policy": contentSecurityPolicy(hashes) },
        })),
      ),
    ),
  );
  yield* fileSystem.writeFileString(
    path.join(OUTDIR, HEADERS_FILE),
    assetHeaders({
      documentHeaders: { "Content-Security-Policy": contentSecurityPolicy([]) },
      pages,
    }),
  );
});

NodeRuntime.runMain(
  Layer.build(NodeServices.layer).pipe(
    Effect.flatMap((context) =>
      Effect.provideContext(program.pipe(Effect.withSpan("build.asset-headers")), context),
    ),
    Effect.scoped,
  ),
);
