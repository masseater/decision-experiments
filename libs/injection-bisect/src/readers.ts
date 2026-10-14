import { emailReader } from "./email.ts";
import { epubReader } from "./epub.ts";
import { notebookReader } from "./notebook.ts";
import { imageReaderOf } from "./ocr.ts";
import type { OcrOptions } from "./ocr.ts";
import { OFFICE_READERS } from "./office.ts";
import type { Reader } from "./parser.ts";
import { pdfReaderOf } from "./pdf.ts";

const readersWith = (ocr: OcrOptions): readonly Reader[] => [
  pdfReaderOf(ocr),
  imageReaderOf(ocr),
  ...OFFICE_READERS,
  epubReader,
  notebookReader,
  emailReader,
];

const DEFAULT_READERS = readersWith({});

export { DEFAULT_READERS, readersWith };
