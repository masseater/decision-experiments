import { docReader } from "./doc.ts";
import { outlookReader } from "./outlook.ts";
import type { Reader } from "./parser.ts";
import { pptReader } from "./ppt.ts";
import { xlsReader } from "./xls.ts";

const COMPOUND_READERS: readonly Reader[] = [outlookReader, docReader, xlsReader, pptReader];

export { COMPOUND_READERS };
