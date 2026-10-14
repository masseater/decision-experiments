import { Effect } from "effect";

import { emailOf, looksLikeEmail } from "./email.ts";
import type { Document, Reader } from "./parser.ts";

const SEPARATOR = /^From .*\r?\n/mu;

const SEPARATORS = /^From .*\r?\n/gmu;

const FROM_LINE = "From ";

const encoder = new TextEncoder();

const latin1 = new TextDecoder("latin1");

const decoder = new TextDecoder();

const escaped = (text: string): string =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const htmlOf = ({ text, format }: Document): string => {
  if (format === "html") {
    return text;
  }
  return text
    .split("\n")
    .map((line) => `<p>${escaped(line)}</p>`)
    .join("\n");
};

const messagesOf = (text: string): readonly string[] =>
  text
    .split(SEPARATORS)
    .filter((message) => message.trim() !== "")
    .map((message) => message.replaceAll(/^>(?=>*From )/gmu, ""));

const looksLikeMbox = (bytes: Uint8Array): boolean => {
  const head = latin1.decode(bytes);
  return head.startsWith(FROM_LINE) && looksLikeEmail(encoder.encode(head.replace(SEPARATOR, "")));
};

const mboxReader: Reader = {
  format: "mbox",
  extensions: [".mbox", ".mbx"],
  accepts: looksLikeMbox,
  read: (bytes) =>
    Effect.forEach(
      messagesOf(decoder.decode(bytes)),
      (message) => emailOf(encoder.encode(message)),
      {
        concurrency: 1,
      },
    ).pipe(
      Effect.map((documents) => ({
        text: documents.map((document) => htmlOf(document)).join("\n<hr>\n"),
        format: "html",
      })),
    ),
};

export { mboxReader };
