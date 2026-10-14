import type { Entry } from "./archive.ts";

const BLOCK = 512;

const NAME = { start: 0, end: 100 } as const;

const SIZE = { start: 124, end: 136 } as const;

const TYPE = 156;

const MAGIC = { start: 257, end: 262 } as const;

const PREFIX = { start: 345, end: 500 } as const;

const OCTAL = 8;

const END = 0;

const TYPE_LENGTH = 1;

const FILE_TYPES = new Set(["0", "\0", "7"]);

const USTAR = "ustar";

const latin1 = new TextDecoder("latin1");

const utf8 = new TextDecoder();

const fieldOf = (
  header: Uint8Array,
  { start, end }: { readonly start: number; readonly end: number },
): string => utf8.decode(header.subarray(start, end)).replaceAll(/\0.*$/gsu, "");

const paddedSize = (size: number): number => Math.ceil(size / BLOCK) * BLOCK;

const isTar = (bytes: Uint8Array): boolean =>
  latin1.decode(bytes.subarray(MAGIC.start, MAGIC.end)) === USTAR;

const nameOf = (header: Uint8Array): string =>
  [fieldOf(header, PREFIX), fieldOf(header, NAME)].filter((part) => part !== "").join("/");

const isEnd = (bytes: Uint8Array, position: number): boolean =>
  position + BLOCK > bytes.length || bytes[position] === END;

const sizeOf = (header: Uint8Array): number =>
  Number.parseInt(`0${fieldOf(header, SIZE).trim()}`, OCTAL);

const entriesAt = (header: Uint8Array, body: Uint8Array): readonly Entry[] => {
  if (!FILE_TYPES.has(latin1.decode(header.subarray(TYPE, TYPE + TYPE_LENGTH)))) {
    return [];
  }
  return [{ name: nameOf(header), bytes: body }];
};

const tarEntries = (bytes: Uint8Array): readonly Entry[] => {
  const entries: Entry[] = [];
  let position = END;
  while (!isEnd(bytes, position)) {
    const header = bytes.subarray(position, position + BLOCK);
    const size = sizeOf(header);
    const body = position + BLOCK;
    entries.push(...entriesAt(header, bytes.subarray(body, body + size)));
    position = body + paddedSize(size);
  }
  return entries;
};

export { isTar, tarEntries };
