import { burn } from "@kenjiuno/msgreader/lib/Burner.js";
import { TypeEnum } from "@kenjiuno/msgreader/lib/Reader.js";
import { Option } from "effect";

const NEXT = 1;

const FIRST = 0;

const unitOf = (letter: string): number =>
  Option.getOrElse(Option.fromNullishOr(letter.codePointAt(FIRST)), () => FIRST);

const utf16Of = (text: string): Uint8Array =>
  new Uint8Array(Uint16Array.from(text.split(""), (letter) => unitOf(letter)).buffer);

const compoundOf = (streams: Readonly<Record<string, Uint8Array>>): Uint8Array => {
  const entries = Object.entries(streams);
  return burn([
    {
      name: "Root Entry",
      type: TypeEnum.ROOT,
      length: 0,
      children: entries.map((_entry, index) => index + NEXT),
    },
    ...entries.map(([name, data]) => ({
      name,
      type: TypeEnum.DOCUMENT,
      length: data.length,
      binaryProvider: () => data,
    })),
  ]);
};

export { compoundOf, utf16Of };
