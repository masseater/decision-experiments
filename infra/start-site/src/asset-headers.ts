import { Array as Arr, Record as Rec, pipe } from "effect";

import { ASSET_CACHE_CONTROL, SECURITY_HEADERS } from "./security-headers.ts";

type PageHeaders = Readonly<{ path: string; headers: Readonly<Record<string, string>> }>;

const MAX_RULES = 100;

const headerLines = (headers: PageHeaders["headers"]): readonly string[] =>
  pipe(
    Rec.toEntries(headers),
    Arr.map(([name, value]) => `  ${name}: ${value}`),
  );

const detachLines = (headers: PageHeaders["headers"]): readonly string[] =>
  pipe(
    Rec.keys(headers),
    Arr.map((name) => `  ! ${name}`),
  );

const pageRule = ({ path, headers }: PageHeaders): readonly string[] => [
  path,
  ...detachLines(headers),
  ...headerLines(headers),
];

const assetHeaders = ({
  documentHeaders,
  pages,
}: Readonly<{
  documentHeaders: PageHeaders["headers"];
  pages: readonly PageHeaders[];
}>): string => {
  const rules = [
    ["/*", ...headerLines(SECURITY_HEADERS), ...headerLines(documentHeaders)],
    ...pipe(pages, Arr.map(pageRule)),
    ["/:app/assets/*", `  Cache-Control: ${ASSET_CACHE_CONTROL}`],
  ];
  if (rules.length > MAX_RULES) {
    throw new RangeError(`_headers は ${MAX_RULES} 個までのルールしか持てない: ${rules.length}`);
  }
  return pipe(rules, Arr.flatten, Arr.append(""), Arr.join("\n"));
};

export type { PageHeaders };
export { assetHeaders };
