/**
 * Types, presets and the error class for Compress PDF.
 *
 * Deliberately split out of pdf-compression.ts, which imports pdf-lib (~400KB).
 * The tool page needs the mode list to render its controls; keeping that here
 * means pdf-lib is only fetched when the user actually compresses something,
 * rather than on every page view.
 */

export type CompressionMode = "recommended" | "strong" | "maximum";

export type ModeSpec = {
  id: CompressionMode;
  label: string;
  blurb: string;
  quality: number;
  maxDim: number;
};

/**
 * Tuned against a 10-file corpus in a real browser. `maxDim` is the longest
 * edge in pixels an image may keep — 2000px still prints acceptably on A4,
 * 1100px is comfortably screen-only.
 */
export const COMPRESSION_MODES: ModeSpec[] = [
  {
    id: "recommended",
    label: "Recommended",
    blurb: "Good balance. Images stay sharp on screen and in normal printing.",
    quality: 0.72,
    maxDim: 2000,
  },
  {
    id: "strong",
    label: "Strong",
    blurb: "Noticeably smaller. Slight softening in photos, fine for sharing and uploads.",
    quality: 0.55,
    maxDim: 1500,
  },
  {
    id: "maximum",
    label: "Maximum",
    blurb: "Smallest possible. Photos visibly soften — best when you just need it to fit.",
    quality: 0.4,
    maxDim: 1100,
  },
];

export function getMode(id: CompressionMode): ModeSpec {
  return COMPRESSION_MODES.find((m) => m.id === id) ?? COMPRESSION_MODES[0];
}

export type CompressionOutcome =
  /** Images were re-encoded and the file got smaller. */
  | "compressed"
  /** Nothing could be improved — the original is returned untouched. */
  | "already-optimised";

export type CompressResult = {
  bytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  /** 0-100. Zero when we could not improve on the original. */
  reductionPct: number;
  pageCount: number;
  imagesFound: number;
  imagesRecompressed: number;
  outcome: CompressionOutcome;
  durationMs: number;
};

/** Distinguishes user-fixable problems from genuine failures. */
export type CompressErrorCode =
  | "encrypted"
  | "corrupt"
  | "empty"
  | "not-a-pdf"
  | "too-large"
  | "out-of-memory"
  | "cancelled"
  | "unknown";

export class CompressError extends Error {
  code: CompressErrorCode;
  constructor(code: CompressErrorCode, message: string) {
    super(message);
    this.name = "CompressError";
    this.code = code;
  }
}

export type CompressOptions = {
  mode: CompressionMode;
  signal?: AbortSignal;
  /** Called with 0-1 as images are processed. Real progress, never simulated. */
  onProgress?: (fraction: number, note: string) => void;
};
