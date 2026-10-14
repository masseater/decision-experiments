import MsgReaderModule from "@kenjiuno/msgreader";
import type { FieldsData } from "@kenjiuno/msgreader";
import { Effect, Option, Predicate } from "effect";

import type { Document, Reader } from "./parser.ts";
import { ReadError } from "./read-error.ts";

const COMPOUND_FILE = "\u00D0\u00CF\u0011\u00E0\u00A1\u00B1\u001A\u00E1";

const PROPERTY_STREAM = "__substg1.0_".replaceAll(/(?<letter>.)/gu, "$<letter>\0");

const latin1 = new TextDecoder("latin1");

const isMsgReader = (candidate: unknown): candidate is typeof MsgReaderModule =>
  Predicate.isFunction(candidate);

const MsgReader = Option.liftPredicate(MsgReaderModule, Predicate.hasProperty("default")).pipe(
  Option.map(({ default: nested }) => nested),
  Option.filter(isMsgReader),
  Option.getOrElse(() => MsgReaderModule),
);

const escaped = (text: string): string =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const presentIn = (parts: readonly (string | null | undefined)[]): string =>
  parts.flatMap((part) => Option.toArray(Option.fromNullishOr(part))).join(" ");

const addressOf = ({ name, email, smtpAddress }: FieldsData): string =>
  presentIn([name, Option.getOrElse(Option.fromNullishOr(smtpAddress), () => email)]);

const headersOf = (fields: FieldsData): readonly string[] => [
  `From: ${presentIn([fields.senderName, fields.senderEmail])}`,
  `To: ${Option.getOrElse(Option.fromNullishOr(fields.recipients), () => [])
    .map((recipient) => addressOf(recipient))
    .join(", ")}`,
  `Subject: ${Option.getOrElse(Option.fromNullishOr(fields.subject), () => "")}`,
  ...Option.getOrElse(Option.fromNullishOr(fields.attachments), () => []).flatMap(({ fileName }) =>
    Option.toArray(Option.map(Option.fromNullishOr(fileName), (name) => `Attachment: ${name}`)),
  ),
];

const documentOf = (fields: FieldsData): Document => {
  const headers = headersOf(fields).filter((line) => !line.endsWith(": "));
  return Option.match(Option.fromNullishOr(fields.bodyHtml), {
    onSome: (html) => ({
      text: [...headers.map((line) => `<p>${escaped(line)}</p>`), html].join("\n"),
      format: "html",
    }),
    onNone: () => ({
      text: [headers.join("\n"), Option.getOrElse(Option.fromNullishOr(fields.body), () => "")]
        .join("\n\n")
        .trim(),
      format: "plain",
    }),
  });
};

const looksLikeOutlook = (bytes: Uint8Array): boolean => {
  const text = latin1.decode(bytes);
  return text.startsWith(COMPOUND_FILE) && text.includes(PROPERTY_STREAM);
};

const outlookReader: Reader = {
  format: "msg",
  extensions: [".msg"],
  accepts: looksLikeOutlook,
  read: (bytes) =>
    Effect.try({
      try: () =>
        new MsgReader(new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)).getFileData(),
      catch: (cause) => new ReadError({ reason: String(cause) }),
    }).pipe(
      Effect.flatMap((fields) =>
        Option.match(Option.fromNullishOr(fields.error), {
          onNone: () => Effect.succeed(documentOf(fields)),
          onSome: (reason) => Effect.fail(new ReadError({ reason })),
        }),
      ),
    ),
};

export { outlookReader };
