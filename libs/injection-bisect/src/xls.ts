import { Array as Arr, Effect } from "effect";

import { hasFlag, hasStream, streamReaderOf, viewOf } from "./cfb.ts";
import type { Reader } from "./parser.ts";

const WORKBOOK = "Workbook";

const RECORD = { sst: 252, continued: 60, string: 519, sheet: 133 } as const;

const HEADER = 4;

const LENGTH = 2;

const SST_COUNTS = 8;

const UNIQUE = 4;

const SHEET_NAME = 6;

const HIGH_BYTE = 1;

const EXTENDED = 4;

const RICH = 8;

const isHighByte = hasFlag(HIGH_BYTE);

const isExtended = hasFlag(EXTENDED);

const isRich = hasFlag(RICH);

const RUN = 4;

const BYTE_VALUES = 256;

const NONE = 0;

const NEXT = 1;

const LITTLE_ENDIAN = true;

const EMPTY = new Uint8Array();

interface BiffRecord {
  readonly type: number;
  readonly data: Uint8Array;
}

const recordsOf = (stream: Uint8Array): readonly BiffRecord[] => {
  const view = viewOf(stream);
  const records: BiffRecord[] = [];
  let position = NONE;
  while (position + HEADER <= view.byteLength) {
    const length = view.getUint16(position + LENGTH, LITTLE_ENDIAN);
    const body = position + HEADER;
    records.push({
      type: view.getUint16(position, LITTLE_ENDIAN),
      data: stream.subarray(body, body + length),
    });
    position = body + length;
  }
  return records;
};

const optionalRead = (flag: boolean, read: () => number): number => {
  if (!flag) {
    return NONE;
  }
  return read();
};

class Cursor {
  private readonly segments: readonly Uint8Array[];

  private segment = NONE;

  private offset: number;

  public constructor(segments: readonly Uint8Array[], start: number) {
    this.segments = segments;
    this.offset = start;
  }

  private current(): Uint8Array {
    return this.segments[this.segment] ?? EMPTY;
  }

  private atEnd(): boolean {
    return this.offset >= this.current().length;
  }

  private nextSegment(): void {
    this.segment += NEXT;
    this.offset = NONE;
  }

  public byte(): number {
    if (this.atEnd()) {
      this.nextSegment();
    }
    const value = this.current()[this.offset] ?? NONE;
    this.offset += NEXT;
    return value;
  }

  public uint16(): number {
    return this.byte() + this.byte() * BYTE_VALUES;
  }

  public uint32(): number {
    return this.uint16() + this.uint16() * BYTE_VALUES * BYTE_VALUES;
  }

  public skip(count: number): void {
    for (let index = NONE; index < count; index += NEXT) {
      this.byte();
    }
  }

  private unit(high: boolean): number {
    if (high) {
      return this.uint16();
    }
    return this.byte();
  }

  public chars(count: number, highByte: boolean): string {
    let high = highByte;
    const units: number[] = [];
    for (let index = NONE; index < count; index += NEXT) {
      if (this.atEnd()) {
        this.nextSegment();
        high = isHighByte(this.byte());
      }
      units.push(this.unit(high));
    }
    return String.fromCodePoint(...units);
  }

  public string(): string {
    const count = this.uint16();
    const flags = this.byte();
    const runs = optionalRead(isRich(flags), () => this.uint16());
    const extra = optionalRead(isExtended(flags), () => this.uint32());
    const text = this.chars(count, isHighByte(flags));
    this.skip(runs * RUN + extra);
    return text;
  }
}

const stringsIn = (segments: readonly Uint8Array[]): readonly string[] => {
  const [first = EMPTY] = segments;
  const total = viewOf(first).getUint32(UNIQUE, LITTLE_ENDIAN);
  const cursor = new Cursor(segments, SST_COUNTS);
  return Array.from({ length: total }, () => cursor.string());
};

const sheetNameOf = (data: Uint8Array): string => {
  const name = data.subarray(SHEET_NAME);
  return new Cursor(
    [Uint8Array.of(name[NONE] ?? NONE, NONE, ...name.subarray(NEXT))],
    NONE,
  ).string();
};

const isContinued = ({ type }: BiffRecord): boolean => type === RECORD.continued;

const sharedStringGroups = (records: readonly BiffRecord[]): readonly (readonly Uint8Array[])[] =>
  records.flatMap(({ type, data }, index) => {
    if (type !== RECORD.sst) {
      return [];
    }
    const continued = Arr.takeWhile(records.slice(index + NEXT), isContinued);
    return [[data, ...continued.map((record) => record.data)]];
  });

const textOf = (stream: Uint8Array): string => {
  const records = recordsOf(stream);
  const cells = records.flatMap(({ type, data }) => {
    if (type === RECORD.string) {
      return [new Cursor([data], NONE).string()];
    }
    if (type === RECORD.sheet) {
      return [sheetNameOf(data)];
    }
    return [];
  });
  return [...cells, ...sharedStringGroups(records).flatMap((group) => stringsIn(group))]
    .filter((text) => text.trim() !== "")
    .join("\n\n");
};

const xlsReader: Reader = {
  format: "xls",
  extensions: [".xls", ".xlt"],
  accepts: hasStream(WORKBOOK),
  read: (bytes) =>
    Effect.gen(function* xls() {
      const stream = yield* streamReaderOf(bytes);
      const workbook = yield* stream(WORKBOOK);
      return { text: textOf(workbook), format: "plain" };
    }),
};

export { xlsReader };
