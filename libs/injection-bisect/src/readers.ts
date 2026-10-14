import { COMPOUND_READERS } from "./compound.ts";
import { epubReader } from "./epub.ts";
import { MAIL_READERS } from "./mbox.ts";
import { notebookReader } from "./notebook.ts";
import { imageReaderOf } from "./ocr.ts";
import type { OcrOptions } from "./ocr.ts";
import { OFFICE_READERS } from "./office.ts";
import type { Reader } from "./parser.ts";
import { pdfReaderOf } from "./pdf.ts";
import { rtfReader } from "./rtf.ts";

const readersWith = (ocr: OcrOptions): readonly Reader[] => [
  pdfReaderOf(ocr),
  imageReaderOf(ocr),
  ...OFFICE_READERS,
  epubReader,
  notebookReader,
  ...COMPOUND_READERS,
  ...MAIL_READERS,
  rtfReader,
];

const DEFAULT_READERS = readersWith({});

export { DEFAULT_READERS, readersWith };
