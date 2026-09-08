/**
 * Types and errors for Protect PDF / Unlock PDF.
 *
 * Split from pdf-security.ts (which pulls in pdf-lib) so the tool page can
 * render without downloading the engine.
 */

export type SecurityOperation = "protect" | "unlock";

export type SecurityErrorCode =
  | "wrong-password"
  | "password-required"
  | "password-mismatch"
  | "password-empty"
  | "already-encrypted"
  | "not-encrypted"
  | "unsupported-encryption"
  | "corrupt"
  | "empty"
  | "too-large"
  | "cancelled"
  | "unknown";

export class SecurityError extends Error {
  code: SecurityErrorCode;
  constructor(code: SecurityErrorCode, message: string) {
    super(message);
    this.name = "SecurityError";
    this.code = code;
  }
}

/** What the standard security handler in the file actually is. */
export type EncryptionScheme = {
  /** e.g. "AES-256", "AES-128", "RC4 128-bit", "RC4 40-bit" */
  label: string;
  V: number;
  R: number;
  /** "AESV3" | "AESV2" | "V2" (RC4) */
  cfm: string;
  bits: number;
  /** True when the file opens with no password but restricts permissions. */
  ownerOnly: boolean;
};

export type ProtectResult = {
  bytes: Uint8Array;
  originalSize: number;
  outputSize: number;
  pageCount: number;
  scheme: "AES-256";
  durationMs: number;
};

export type UnlockResult = {
  bytes: Uint8Array;
  originalSize: number;
  outputSize: number;
  pageCount: number;
  removed: EncryptionScheme;
  streamsDecrypted: number;
  durationMs: number;
};

export type SecurityOptions = {
  password: string;
  signal?: AbortSignal;
  onProgress?: (fraction: number, note: string) => void;
};

/** Minimum password length we will accept when protecting a file. */
export const MIN_PASSWORD_LENGTH = 4;

/**
 * What we tell users about strength, in plain language.
 * Kept here so the UI and the docs cannot drift apart.
 */
export const PROTECT_SCHEME_LABEL = "AES-256";
export const PROTECT_SCHEME_BLURB =
  "Your PDF is encrypted with AES-256, the strongest encryption the PDF format defines. Anyone opening it must type the password.";
