/**
 * Browser-side PDF password protection and removal.
 *
 * The file and the password NEVER leave the device. Everything below runs on
 * WebCrypto (`crypto.subtle`) plus two small primitives WebCrypto does not
 * provide — RC4 and MD5 — which the PDF specification still requires for
 * older documents.
 *
 * WHY THIS EXISTS
 * pdf-lib cannot encrypt (it exports only `EncryptedPDFError`) and jsPDF 4.x
 * dropped its RC4 support, so neither dependency could do this. The previous
 * implementation shelled out to the `pdfcpu` binary on the server, which is
 * not installed in production — both tools returned HTTP 503 to every user.
 *
 * WHAT IT SUPPORTS — verified against files produced by MuPDF, and every
 * output re-opened and checked with an independent reader:
 *
 *   Protect  →  writes AES-256, revision 6 (PDF 2.0). This is the strongest
 *               scheme the format defines and is what Acrobat produces today.
 *               We deliberately do NOT offer RC4: it is broken, and offering
 *               it would be selling false security.
 *
 *   Unlock   →  removes RC4 40-bit (R2), RC4 128-bit (R3), AES-128 (R4)
 *               and AES-256 (R5/R6), plus owner-password-only files that
 *               open with no password at all.
 *
 * WHAT IT CANNOT DO
 * - It cannot guess or break a password. You must know it. Files where the
 *   password is unknown are rejected honestly rather than "attempted".
 * - Public-key (certificate) security handlers are not supported.
 * - Custom/third-party security handlers are not supported.
 */

import {
  PDFArray,
  PDFDict,
  type PDFRef,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFString,
} from "pdf-lib";

import {
  type EncryptionScheme,
  MIN_PASSWORD_LENGTH,
  type ProtectResult,
  SecurityError,
  type SecurityOptions,
  type UnlockResult,
} from "@/lib/pdf-security-types";

export * from "@/lib/pdf-security-types";

const te = new TextEncoder();
const subtle = () => globalThis.crypto.subtle;

/**
 * WebCrypto accepts any Uint8Array at runtime, but TypeScript models
 * BufferSource as ArrayBuffer-backed only. This cast is type-level noise,
 * not a behaviour change.
 */
const bs = (u: Uint8Array): BufferSource => u as unknown as BufferSource;

// ---------------------------------------------------------------------------
// Primitives WebCrypto does not provide
// ---------------------------------------------------------------------------

/** RC4. Needed only to READ legacy files; never used to write one. */
function rc4(key: Uint8Array, data: Uint8Array): Uint8Array {
  const S = new Uint8Array(256);
  for (let i = 0; i < 256; i++) S[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 255;
    [S[i], S[j]] = [S[j], S[i]];
  }
  const out = new Uint8Array(data.length);
  let i = 0;
  j = 0;
  for (let k = 0; k < data.length; k++) {
    i = (i + 1) & 255;
    j = (j + S[i]) & 255;
    [S[i], S[j]] = [S[j], S[i]];
    out[k] = data[k] ^ S[(S[i] + S[j]) & 255];
  }
  return out;
}

/** MD5. Required by the PDF spec for revisions 2-4 key derivation. */
function md5(bytes: Uint8Array): Uint8Array {
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
             4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const K = new Int32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0;

  const ml = bytes.length;
  const buf = new Uint8Array(((ml + 8) >> 6) * 64 + 64);
  buf.set(bytes);
  buf[ml] = 0x80;
  const head = new DataView(buf.buffer);
  head.setUint32(buf.length - 8, (ml * 8) >>> 0, true);
  head.setUint32(buf.length - 4, Math.floor((ml * 8) / 4294967296), true);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const M = new Int32Array(16);
  const dv = new DataView(buf.buffer);

  for (let off = 0; off < buf.length; off += 64) {
    for (let i = 0; i < 16; i++) M[i] = dv.getInt32(off + i * 4, true);
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + K[i] + M[g]) | 0;
      A = D; D = C; C = B;
      B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) | 0;
    }
    a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
  }

  const out = new Uint8Array(16);
  const o = new DataView(out.buffer);
  o.setInt32(0, a0, true); o.setInt32(4, b0, true); o.setInt32(8, c0, true); o.setInt32(12, d0, true);
  return out;
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const n = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

async function sha(bits: 256 | 384 | 512, ...parts: Uint8Array[]): Promise<Uint8Array> {
  return new Uint8Array(await subtle().digest(`SHA-${bits}`, bs(concat(...parts))));
}

function randomBytes(n: number): Uint8Array {
  const a = new Uint8Array(n);
  globalThis.crypto.getRandomValues(a);
  return a;
}

/**
 * AES-CBC with NO padding. WebCrypto always applies PKCS#7, so we encrypt and
 * discard the extra block it appends.
 */
async function aesCbcNoPadEncrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await subtle().importKey("raw", bs(key), "AES-CBC", false, ["encrypt"]);
  const ct = new Uint8Array(await subtle().encrypt({ name: "AES-CBC", iv: bs(iv) }, k, bs(data)));
  return ct.slice(0, data.length);
}

/**
 * Decrypt an unpadded AES-CBC blob (used for the UE/OE key blobs). We append a
 * block that decrypts to valid PKCS#7 padding so WebCrypto will accept it.
 */
async function aesCbcNoPadDecrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await subtle().importKey("raw", bs(key), "AES-CBC", false, ["decrypt", "encrypt"]);
  const prev = data.subarray(data.length - 16);
  const padBlock = new Uint8Array(
    await subtle().encrypt({ name: "AES-CBC", iv: bs(prev) }, k, new Uint8Array(0)),
  ).subarray(0, 16);
  const plain = new Uint8Array(
    await subtle().decrypt({ name: "AES-CBC", iv: bs(iv) }, k, bs(concat(data, padBlock))),
  );
  return plain.subarray(0, data.length);
}

/** Decrypt a PDF content stream: leading 16-byte IV, then PKCS#7 body. */
async function aesDecryptStream(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  if (data.length <= 16) return new Uint8Array(0);
  const iv = data.subarray(0, 16);
  let body = data.subarray(16);
  if (body.length % 16 !== 0) body = body.subarray(0, body.length - (body.length % 16));
  if (!body.length) return new Uint8Array(0);

  const k = await subtle().importKey("raw", bs(key), "AES-CBC", false, ["decrypt"]);
  return new Uint8Array(
    await subtle().decrypt({ name: "AES-CBC", iv: bs(iv) }, k, bs(body)),
  );
}

async function aesEncryptStream(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const iv = randomBytes(16);
  const k = await subtle().importKey("raw", bs(key), "AES-CBC", false, ["encrypt"]);
  const ct = new Uint8Array(
    await subtle().encrypt({ name: "AES-CBC", iv: bs(iv) }, k, bs(data)),
  );
  return concat(iv, ct);
}

// ---------------------------------------------------------------------------
// PDF key derivation (ISO 32000)
// ---------------------------------------------------------------------------

const PAD = new Uint8Array([
  0x28,0xbf,0x4e,0x5e,0x4e,0x75,0x8a,0x41,0x64,0x00,0x4e,0x56,0xff,0xfa,0x01,0x08,
  0x2e,0x2e,0x00,0xb6,0xd0,0x68,0x3e,0x80,0x2f,0x0c,0xa9,0xfe,0x64,0x53,0x69,0x7a,
]);

function padPassword(pw: string): Uint8Array {
  const b = te.encode(pw);
  const out = new Uint8Array(32);
  const n = Math.min(32, b.length);
  out.set(b.subarray(0, n));
  out.set(PAD.subarray(0, 32 - n), n);
  return out;
}

/** Algorithm 2.B — the revision 6 hash. */
async function hash2B(password: Uint8Array, salt: Uint8Array, udata: Uint8Array): Promise<Uint8Array> {
  let K = await sha(256, password, salt, udata);
  for (let round = 0; ; round++) {
    const one = concat(password, K, udata);
    const k1 = new Uint8Array(one.length * 64);
    for (let i = 0; i < 64; i++) k1.set(one, i * one.length);

    const E = await aesCbcNoPadEncrypt(K.subarray(0, 16), K.subarray(16, 32), k1);
    let sum = 0;
    for (let i = 0; i < 16; i++) sum += E[i];
    const mod = sum % 3;
    K = await sha(mod === 0 ? 256 : mod === 1 ? 384 : 512, E);
    if (round >= 63 && E[E.length - 1] <= round - 32) break;
  }
  return K.subarray(0, 32);
}

const bytesOf = (o: unknown): Uint8Array | null =>
  o instanceof PDFHexString || o instanceof PDFString ? o.asBytes() : null;

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) throw new SecurityError("cancelled", "Cancelled.");
};

function classifyLoadError(err: unknown): SecurityError {
  const msg = err instanceof Error ? err.message : String(err);
  if (/No PDF header|Failed to parse|Expected instance|invalid object/i.test(msg)) {
    return new SecurityError("corrupt", "This file could not be read as a PDF. It may be damaged or incomplete.");
  }
  if (/Cannot read properties|Pages/i.test(msg)) {
    return new SecurityError("empty", "This PDF has no readable pages.");
  }
  return new SecurityError("unknown", "This PDF could not be opened.");
}

// ===========================================================================
// PROTECT — write AES-256 (revision 6)
// ===========================================================================

export async function protectPdf(
  input: ArrayBuffer,
  { password, signal, onProgress }: SecurityOptions,
): Promise<ProtectResult> {
  const started = performance.now();
  const originalSize = input.byteLength;

  if (!password) throw new SecurityError("password-empty", "Enter a password first.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new SecurityError(
      "password-empty",
      `Use at least ${MIN_PASSWORD_LENGTH} characters — a short password is not worth encrypting with.`,
    );
  }

  onProgress?.(0.05, "Reading document");
  throwIfAborted(signal);

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(input, { updateMetadata: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (/encrypted/i.test(msg)) {
      throw new SecurityError(
        "already-encrypted",
        "This PDF already has a password. Remove the existing one with Unlock PDF first.",
      );
    }
    throw classifyLoadError(err);
  }

  const ctx = doc.context;
  const pageCount = doc.getPageCount();
  if (pageCount === 0) throw new SecurityError("empty", "This PDF has no pages.");

  onProgress?.(0.2, "Generating encryption key");
  const fileKey = randomBytes(32);
  const pw = te.encode(password);
  const empty = new Uint8Array(0);

  // -- user password entry (Algorithm 8)
  const uValidation = randomBytes(8);
  const uKeySalt = randomBytes(8);
  const U = concat(await hash2B(pw, uValidation, empty), uValidation, uKeySalt);
  const UE = await aesCbcNoPadEncrypt(await hash2B(pw, uKeySalt, empty), new Uint8Array(16), fileKey);

  // -- owner password entry (Algorithm 9). Same password: one password opens
  //    the file and also owns it, which is what a "protect" tool should do.
  const oValidation = randomBytes(8);
  const oKeySalt = randomBytes(8);
  const O = concat(await hash2B(pw, oValidation, U), oValidation, oKeySalt);
  const OE = await aesCbcNoPadEncrypt(await hash2B(pw, oKeySalt, U), new Uint8Array(16), fileKey);

  // -- permissions (Algorithm 10). -3904 leaves printing and copying on;
  //    the point of this tool is confidentiality, not usage restriction.
  const permissions = -3904;
  const permsPlain = new Uint8Array(16);
  new DataView(permsPlain.buffer).setInt32(0, permissions, true);
  permsPlain.set([0xff, 0xff, 0xff, 0xff], 4);
  permsPlain.set(te.encode("Tadb"), 8); // 'T' = metadata encrypted
  permsPlain.set(randomBytes(4), 12);
  const permsKey = await subtle().importKey("raw", bs(fileKey), "AES-CBC", false, ["encrypt"]);
  const Perms = new Uint8Array(
    await subtle().encrypt({ name: "AES-CBC", iv: new Uint8Array(16) as BufferSource }, permsKey, bs(permsPlain)),
  ).slice(0, 16);

  // -- encrypt every stream
  const streams: [PDFRef, PDFRawStream][] = [];
  for (const [ref, obj] of ctx.enumerateIndirectObjects()) {
    if (obj instanceof PDFRawStream) streams.push([ref, obj]);
  }

  for (let i = 0; i < streams.length; i++) {
    throwIfAborted(signal);
    if (i % 12 === 0) {
      onProgress?.(0.25 + (0.65 * i) / Math.max(1, streams.length), `Encrypting ${i + 1} of ${streams.length}`);
      await new Promise((r) => setTimeout(r, 0));
    }
    const [ref, stream] = streams[i];
    ctx.assign(ref, PDFRawStream.of(stream.dict, await aesEncryptStream(fileKey, stream.contents)));
  }

  onProgress?.(0.94, "Writing encryption dictionary");

  const hex = (b: Uint8Array) => PDFHexString.of(Array.from(b, (x) => x.toString(16).padStart(2, "0")).join(""));

  const stdCf = ctx.obj({});
  stdCf.set(PDFName.of("CFM"), PDFName.of("AESV3"));
  stdCf.set(PDFName.of("AuthEvent"), PDFName.of("DocOpen"));
  stdCf.set(PDFName.of("Length"), PDFNumber.of(32));
  const cf = ctx.obj({});
  cf.set(PDFName.of("StdCF"), stdCf);

  const encDict = ctx.obj({});
  encDict.set(PDFName.of("Filter"), PDFName.of("Standard"));
  encDict.set(PDFName.of("V"), PDFNumber.of(5));
  encDict.set(PDFName.of("R"), PDFNumber.of(6));
  encDict.set(PDFName.of("Length"), PDFNumber.of(256));
  encDict.set(PDFName.of("P"), PDFNumber.of(permissions));
  encDict.set(PDFName.of("O"), hex(O));
  encDict.set(PDFName.of("U"), hex(U));
  encDict.set(PDFName.of("OE"), hex(OE));
  encDict.set(PDFName.of("UE"), hex(UE));
  encDict.set(PDFName.of("Perms"), hex(Perms));
  encDict.set(PDFName.of("EncryptMetadata"), ctx.obj(true));
  encDict.set(PDFName.of("CF"), cf);
  encDict.set(PDFName.of("StmF"), PDFName.of("StdCF"));
  encDict.set(PDFName.of("StrF"), PDFName.of("StdCF"));

  ctx.trailerInfo.Encrypt = ctx.register(encDict);
  const id = hex(randomBytes(16));
  ctx.trailerInfo.ID = ctx.obj([id, id]);

  // Object streams are disabled: their payload would itself need encrypting
  // as a unit, and writing them plain next to an /Encrypt dict corrupts the file.
  const bytes = await doc.save({ useObjectStreams: false });
  onProgress?.(1, "Done");

  return {
    bytes,
    originalSize,
    outputSize: bytes.byteLength,
    pageCount,
    scheme: "AES-256",
    durationMs: Math.round(performance.now() - started),
  };
}

// ===========================================================================
// UNLOCK — remove RC4 / AES-128 / AES-256
// ===========================================================================

function describeScheme(V: number, R: number, cfm: string, bits: number, ownerOnly: boolean): EncryptionScheme {
  const label =
    cfm === "AESV3" ? "AES-256" : cfm === "AESV2" ? "AES-128" : `RC4 ${bits}-bit`;
  return { label, V, R, cfm, bits, ownerOnly };
}

export async function unlockPdf(
  input: ArrayBuffer,
  { password, signal, onProgress }: SecurityOptions,
): Promise<UnlockResult> {
  const started = performance.now();
  const originalSize = input.byteLength;

  onProgress?.(0.05, "Reading document");
  throwIfAborted(signal);

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(input, { ignoreEncryption: true, updateMetadata: false });
  } catch (err) {
    throw classifyLoadError(err);
  }

  const ctx = doc.context;
  const encRef = ctx.trailerInfo.Encrypt as PDFRef | undefined;
  if (!encRef) {
    throw new SecurityError(
      "not-encrypted",
      "This PDF has no password on it — there is nothing to remove.",
    );
  }

  const enc = ctx.lookup(encRef) as PDFDict;
  const num = (k: string, d = 0) =>
    (enc.get(PDFName.of(k)) as PDFNumber | undefined)?.asNumber?.() ?? d;

  const filter = enc.get(PDFName.of("Filter"))?.toString?.() ?? "";
  if (filter !== "/Standard") {
    throw new SecurityError(
      "unsupported-encryption",
      "This PDF uses a certificate-based or custom security handler, which cannot be removed in the browser.",
    );
  }

  const V = num("V");
  const R = num("R");
  const P = num("P");
  const lengthBits = num("Length", 40);
  const O = bytesOf(enc.get(PDFName.of("O")));
  const U = bytesOf(enc.get(PDFName.of("U")));
  if (!O || !U) throw new SecurityError("corrupt", "This PDF's security information is incomplete.");

  const metaFlag = enc.get(PDFName.of("EncryptMetadata"));
  const encryptMetadata = metaFlag ? metaFlag.toString() !== "false" : true;

  let cfm = V >= 4 ? "AESV2" : "V2";
  if (V >= 4) {
    const cfDict = ctx.lookup(enc.get(PDFName.of("CF"))) as PDFDict | undefined;
    const stmf = enc.get(PDFName.of("StmF"))?.toString?.().replace("/", "") ?? "StdCF";
    const std = cfDict ? (ctx.lookup(cfDict.get(PDFName.of(stmf))) as PDFDict | undefined) : undefined;
    cfm = std?.get(PDFName.of("CFM"))?.toString?.().replace("/", "") ?? "AESV2";
  }
  if (cfm === "None") {
    throw new SecurityError("not-encrypted", "This PDF's contents are not actually encrypted.");
  }
  if (!["V2", "AESV2", "AESV3"].includes(cfm)) {
    throw new SecurityError(
      "unsupported-encryption",
      `This PDF uses an encryption method (${cfm}) that cannot be removed in the browser.`,
    );
  }

  const idArr = ctx.lookup(ctx.trailerInfo.ID as PDFRef | undefined);
  const id0 =
    idArr instanceof PDFArray ? bytesOf(ctx.lookup(idArr.get(0))) ?? new Uint8Array(0) : new Uint8Array(0);

  onProgress?.(0.15, "Checking password");
  let fileKey: Uint8Array;
  let ownerOnly = false;

  if (R >= 5) {
    // --- AES-256 (revision 5/6)
    const pw = te.encode(password);
    const uValidation = U.subarray(32, 40);
    const uKeySalt = U.subarray(40, 48);
    const userHash = await hash2B(pw, uValidation, new Uint8Array(0));

    if (userHash.every((b, i) => b === U[i])) {
      const UE = bytesOf(enc.get(PDFName.of("UE")));
      if (!UE) throw new SecurityError("corrupt", "This PDF's security information is incomplete.");
      fileKey = await aesCbcNoPadDecrypt(await hash2B(pw, uKeySalt, new Uint8Array(0)), new Uint8Array(16), UE);
      ownerOnly = password.length === 0;
    } else {
      const oValidation = O.subarray(32, 40);
      const oKeySalt = O.subarray(40, 48);
      const ownerHash = await hash2B(pw, oValidation, U);
      if (!ownerHash.every((b, i) => b === O[i])) {
        throw new SecurityError(
          password ? "wrong-password" : "password-required",
          password
            ? "That password is not correct for this PDF."
            : "This PDF needs a password. Enter the one used to open it.",
        );
      }
      const OE = bytesOf(enc.get(PDFName.of("OE")));
      if (!OE) throw new SecurityError("corrupt", "This PDF's security information is incomplete.");
      fileKey = await aesCbcNoPadDecrypt(await hash2B(pw, oKeySalt, U), new Uint8Array(16), OE);
    }
    cfm = "AESV3";
  } else {
    // --- RC4 / AES-128 (revisions 2-4), Algorithm 2
    const pBytes = new Uint8Array(4);
    new DataView(pBytes.buffer).setInt32(0, P | 0, true);
    const seed = concat(
      padPassword(password),
      O.subarray(0, 32),
      pBytes,
      id0,
      R >= 4 && !encryptMetadata ? new Uint8Array([0xff, 0xff, 0xff, 0xff]) : new Uint8Array(0),
    );

    let hash = md5(seed);
    const keyLen = R === 2 ? 5 : Math.max(5, Math.floor(lengthBits / 8));
    if (R >= 3) for (let i = 0; i < 50; i++) hash = md5(hash.subarray(0, keyLen));
    fileKey = hash.subarray(0, keyLen);

    // Verify against /U (Algorithms 4 and 5)
    let computed: Uint8Array;
    if (R === 2) {
      computed = rc4(fileKey, PAD);
    } else {
      let x = rc4(fileKey, md5(concat(PAD, id0)));
      for (let i = 1; i <= 19; i++) {
        const k = new Uint8Array(fileKey.length);
        for (let j = 0; j < fileKey.length; j++) k[j] = fileKey[j] ^ i;
        x = rc4(k, x);
      }
      computed = x;
    }
    const compareLen = R === 2 ? 32 : 16;
    if (!computed.subarray(0, compareLen).every((b, i) => b === U[i])) {
      throw new SecurityError(
        password ? "wrong-password" : "password-required",
        password
          ? "That password is not correct for this PDF."
          : "This PDF needs a password. Enter the one used to open it.",
      );
    }
    ownerOnly = password.length === 0;
  }

  // --- decrypt every stream
  const perObjectKey = (objNum: number, gen: number): Uint8Array => {
    if (cfm === "AESV3") return fileKey;
    const extra = cfm === "AESV2" ? 4 : 0;
    const ext = new Uint8Array(fileKey.length + 5 + extra);
    ext.set(fileKey);
    ext[fileKey.length] = objNum & 0xff;
    ext[fileKey.length + 1] = (objNum >> 8) & 0xff;
    ext[fileKey.length + 2] = (objNum >> 16) & 0xff;
    ext[fileKey.length + 3] = gen & 0xff;
    ext[fileKey.length + 4] = (gen >> 8) & 0xff;
    if (cfm === "AESV2") ext.set([0x73, 0x41, 0x6c, 0x54], fileKey.length + 5);
    return md5(ext).subarray(0, Math.min(16, fileKey.length + 5));
  };

  const streams: [PDFRef, PDFRawStream][] = [];
  for (const [ref, obj] of ctx.enumerateIndirectObjects()) {
    if (obj instanceof PDFRawStream && ref.objectNumber !== encRef.objectNumber) {
      streams.push([ref, obj]);
    }
  }

  let decrypted = 0;
  for (let i = 0; i < streams.length; i++) {
    throwIfAborted(signal);
    if (i % 12 === 0) {
      onProgress?.(0.2 + (0.7 * i) / Math.max(1, streams.length), `Decrypting ${i + 1} of ${streams.length}`);
      await new Promise((r) => setTimeout(r, 0));
    }
    const [ref, stream] = streams[i];
    const key = perObjectKey(ref.objectNumber, ref.generationNumber);
    try {
      const plain = cfm === "V2" ? rc4(key, stream.contents) : await aesDecryptStream(key, stream.contents);
      ctx.assign(ref, PDFRawStream.of(stream.dict, plain));
      decrypted++;
    } catch {
      // One unreadable stream should not abandon the whole document.
    }
  }

  if (decrypted === 0 && streams.length > 0) {
    throw new SecurityError(
      "unsupported-encryption",
      "The password was accepted but this PDF's contents could not be decrypted. It may use a non-standard security handler.",
    );
  }

  delete ctx.trailerInfo.Encrypt;
  onProgress?.(0.95, "Writing unlocked file");

  let bytes: Uint8Array;
  try {
    bytes = await doc.save({ useObjectStreams: false });
  } catch {
    throw new SecurityError("unknown", "The unlocked file could not be written.");
  }

  onProgress?.(1, "Done");

  return {
    bytes,
    originalSize,
    outputSize: bytes.byteLength,
    pageCount: doc.getPageCount(),
    removed: describeScheme(V, R, cfm, cfm === "AESV3" ? 256 : lengthBits, ownerOnly),
    streamsDecrypted: decrypted,
    durationMs: Math.round(performance.now() - started),
  };
}

/** Cheap pre-check so the UI can show the right form before doing any work. */
export async function inspectPdfSecurity(
  input: ArrayBuffer,
): Promise<{ encrypted: boolean; needsPassword: boolean }> {
  try {
    const doc = await PDFDocument.load(input, { ignoreEncryption: true, updateMetadata: false });
    return { encrypted: Boolean(doc.context.trailerInfo.Encrypt), needsPassword: false };
  } catch {
    return { encrypted: false, needsPassword: false };
  }
}
