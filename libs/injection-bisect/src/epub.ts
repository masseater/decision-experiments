import { Array as Arr, Effect, Option } from "effect";
import type { Unzipped } from "fflate";
import { Parser as XmlParser } from "htmlparser2";

import type { Document, Reader } from "./parser.ts";
import { textIn, unzipped } from "./zip.ts";

const MARKER = "application/epub+zip";

const CONTAINER = "META-INF/container.xml";

const ROOT_FILE = /full-path="(?<path>[^"]+)"/u;

const CONTENT = /\.(?:opf|x?html?)$/iu;

const BODY = /<body[^>]*>(?<body>[\s\S]*)<\/body>/iu;

const METADATA = new Set(["title", "description", "subject", "creator"]);

const NOT_FOUND = -1;

const HEAD_START = 0;

const HEAD_END = 128;

interface Package {
  readonly metadata: readonly string[];
  readonly spine: readonly string[];
}

const latin1 = new TextDecoder("latin1");

const localName = (name: string): string => name.slice(name.indexOf(":") + ":".length);

const escaped = (text: string): string =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const packageOf = (opf: string): Package => {
  const metadata: string[] = [];
  const manifest = new Map<string, string>();
  const order: string[] = [];
  let reading = "";
  const parser = new XmlParser(
    {
      onopentag: (name, attributes): void => {
        const local = localName(name);
        reading = Option.getOrElse(
          Option.liftPredicate(local, (tag) => METADATA.has(tag)),
          () => "",
        );
        Option.map(
          Option.all([
            Option.fromNullishOr(attributes["id"]),
            Option.fromNullishOr(attributes["href"]),
          ]),
          ([id, href]) => manifest.set(id, href),
        );
        Option.map(Option.fromNullishOr(attributes["idref"]), (idref) => order.push(idref));
      },
      ontext: (data): void => {
        if (reading !== "" && data.trim() !== "") {
          metadata.push(data.trim());
        }
      },
      onclosetag: (): void => {
        reading = "";
      },
    },
    { xmlMode: true, decodeEntities: true },
  );
  parser.end(opf);
  return {
    metadata,
    spine: order.flatMap((idref) => Option.toArray(Option.fromNullishOr(manifest.get(idref)))),
  };
};

const directoryOf = (path: string): string =>
  path.slice(HEAD_START, path.lastIndexOf("/") + "/".length);

const rootOf = (files: Unzipped): string =>
  Option.fromNullishOr(ROOT_FILE.exec(textIn(files)(CONTAINER))).pipe(
    Option.flatMapNullishOr((match) => match.groups),
    Option.flatMapNullishOr((groups) => groups["path"]),
    Option.orElse(() => Arr.findFirst(Object.keys(files), (name) => name.endsWith(".opf"))),
    Option.getOrElse(() => ""),
  );

const bodyOf = (html: string): string =>
  Option.fromNullishOr(BODY.exec(html)).pipe(
    Option.flatMapNullishOr((match) => match.groups),
    Option.flatMapNullishOr((groups) => groups["body"]),
    Option.getOrElse(() => html),
  );

const documentOf = (files: Unzipped): Document => {
  const root = rootOf(files);
  const { metadata, spine } = packageOf(textIn(files)(root));
  const base = directoryOf(root);
  const chapters = spine
    .map((href) => `${base}${decodeURIComponent(href)}`)
    .filter((path) => path in files)
    .map((path) => bodyOf(textIn(files)(path)));
  return {
    text: [...metadata.map((line) => `<p>${escaped(line)}</p>`), ...chapters].join("\n"),
    format: "html",
  };
};

const epubReader: Reader = {
  format: "epub",
  extensions: [".epub"],
  accepts: (bytes) =>
    latin1.decode(bytes.subarray(HEAD_START, HEAD_END)).indexOf(MARKER) !== NOT_FOUND,
  read: (bytes) =>
    unzipped({ bytes, keep: (name) => name === CONTAINER || CONTENT.test(name) }).pipe(
      Effect.map(documentOf),
    ),
};

export { epubReader };
