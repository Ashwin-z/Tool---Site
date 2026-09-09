/**
 * Types and errors for PDF to Excel.
 *
 * Split from pdf-to-excel.ts, which pulls in pdfjs and exceljs (~860KB
 * browser build), so the tool page can render its controls without
 * downloading the engine.
 */

export type ExcelErrorCode =
  | "encrypted"
  | "corrupt"
  | "empty"
  | "no-text-layer"
  | "too-large"
  | "cancelled"
  | "unknown";

export class ExcelError extends Error {
  code: ExcelErrorCode;
  constructor(code: ExcelErrorCode, message: string) {
    super(message);
    this.name = "ExcelError";
    this.code = code;
  }
}

export type ExcelResult = {
  bytes: Uint8Array;
  originalSize: number;
  outputSize: number;
  /** One worksheet is produced per PDF page. */
  pageCount: number;
  durationMs: number;
};

export type ExcelOptions = {
  signal?: AbortSignal;
  /** Real progress, driven by pages processed. Never simulated. */
  onProgress?: (fraction: number, note: string) => void;
};

/** Browser memory limit, not a policy one. */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * What we promise on the tool page. Kept here so the UI copy and the docs
 * cannot drift from what the engine actually does.
 */
export const EXCEL_CAPABILITIES = {
  does: [
    "Detects table rows and columns from ruling lines and glyph alignment",
    "Writes one worksheet per PDF page",
    "Keeps merged-cell structure where it can be inferred",
    "Carries over fill colours, bold and italic where detected",
  ],
  doesNot: [
    "Formulas — a PDF stores values, not formulas, so none can be recovered",
    "Scanned pages — there is no text layer to read; run PDF to Text (OCR) first",
    "Charts, which are drawings in a PDF rather than data",
  ],
} as const;
