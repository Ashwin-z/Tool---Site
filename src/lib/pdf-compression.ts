/**
 * Browser-side PDF compression.
 *
 * The user's file NEVER leaves the device. Everything here runs on bytes the
 * page already holds in memory: no fetch, no upload, no worker fetched from a
 * third-party CDN. This module deliberately does not import pdfjs-dist — it
 * needs only pdf-lib, so Compress PDF ships with zero external runtime assets.
 *
 * HOW IT WORKS
 * A PDF is mostly a container. Text and vector art are described
 * mathematically and are already compact; the size almost always comes from
 * embedded raster images. So we walk the document's indirect objects, find
 * image XObjects, re-encode each one as a JPEG at a lower quality (and a
 * smaller pixel size when it is larger than it needs to be), and write the
 * stream back in place. Page structure, text and vectors are untouched, so
 * text stays selectable and searchable.
 *
 * WHAT IT WILL NOT DO
 * - It cannot shrink a text-only PDF much. There is nothing lossy to give up;
 *   expect single-digit to ~20% from re-writing the file structure alone.
 * - It skips image formats it cannot safely re-encode (JPEG 2000, CCITT fax,
 *   JBIG2, CMYK, Separation/DeviceN) rather than risk corrupting them.
 * - It never touches an /SMask or /Mask, because those carry transparency and
 *   JPEG has no alpha channel.
 * - It keeps the original image whenever re-encoding would not be smaller.
 *
 * Verified against a 10-file corpus; see docs/COMPRESS-PDF.md for results.
 */

import {
  CompressError,
  type CompressOptions,
  type CompressResult,
  type ModeSpec,
  getMode,
} from "@/lib/pdf-compression-types";

import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  decodePDFRawStream,
} from "pdf-lib";

// Re-exported so callers can import everything from one place if they wish.
export * from "@/lib/pdf-compression-types";

// --------------------------------------------------------------------------
// PDF object helpers
// --------------------------------------------------------------------------

const REF_RE = /^\d+ \d+ R$/;

function nameOf(value: unknown): string | null {
  const s = (value as { toString?: () => string } | null)?.toString?.() ?? "";
  return s.startsWith("/") ? s.slice(1) : null;
}

function filtersOf(dict: PDFRawStream["dict"]): string[] {
  const f = dict.get(PDFName.of("Filter"));
  if (!f) return [];
  return f
    .toString()
    .replace(/[[\]]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((x) => x.replace(/^\//, ""));
}

type ColourSpace = { kind: string; comps: number };

/** A colourspace may be a name, an indirect reference, or an array. */
function resolveColourSpace(
  ctx: PDFDocument["context"],
  raw: unknown,
): ColourSpace {
  let v = raw as { toString?: () => string } | null;
  for (let i = 0; i < 4 && v?.toString && REF_RE.test(v.toString()); i++) {
    v = ctx.lookup(v as never) as typeof v;
  }

  const direct = nameOf(v);
  if (direct) {
    const comps = direct === "DeviceRGB" ? 3 : direct === "DeviceGray" ? 1 : 0;
    return { kind: direct, comps };
  }

  if (v instanceof PDFArray) {
    const head = nameOf(v.get(0));
    if (head === "ICCBased") {
      const strm = ctx.lookup(v.get(1)) as PDFRawStream | undefined;
      const n = strm?.dict?.get(PDFName.of("N")) as PDFNumber | undefined;
      return { kind: "ICCBased", comps: n?.asNumber?.() ?? 0 };
    }
    if (head === "CalRGB") return { kind: "CalRGB", comps: 3 };
    if (head === "CalGray") return { kind: "CalGray", comps: 1 };
    return { kind: head ?? "array", comps: 0 };
  }

  return { kind: "unknown", comps: 0 };
}

// --------------------------------------------------------------------------
// Browser image codec
// --------------------------------------------------------------------------

type Bitmap = ImageBitmap;

async function decodeJpeg(bytes: Uint8Array): Promise<Bitmap> {
  const copy = new Uint8Array(bytes);
  return createImageBitmap(new Blob([copy], { type: "image/jpeg" }));
}

async function decodeRawSamples(
  raw: Uint8Array,
  width: number,
  height: number,
  comps: number,
): Promise<Bitmap> {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let i = 0, p = 0; i < width * height; i++) {
    const o = i * comps;
    const r = raw[o];
    const g = comps === 3 ? raw[o + 1] : r;
    const b = comps === 3 ? raw[o + 2] : r;
    rgba[p++] = r;
    rgba[p++] = g;
    rgba[p++] = b;
    rgba[p++] = 255;
  }
  return createImageBitmap(new ImageData(rgba, width, height));
}

function makeCanvas(w: number, h: number) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

async function canvasToJpeg(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  quality: number,
): Promise<Uint8Array> {
  if ("convertToBlob" in canvas) {
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
    return new Uint8Array(await blob.arrayBuffer());
  }
  const blob = await new Promise<Blob | null>((resolve) =>
    (canvas as HTMLCanvasElement).toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) throw new CompressError("unknown", "Could not encode image.");
  return new Uint8Array(await blob.arrayBuffer());
}

async function reencode(
  source: Bitmap,
  width: number,
  height: number,
  spec: ModeSpec,
): Promise<Uint8Array> {
  const scale = Math.min(1, spec.maxDim / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d") as
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null;
  if (!ctx) throw new CompressError("unknown", "Could not create a drawing surface.");

  // White matte: JPEG has no alpha, so transparent areas would otherwise go black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h);

  return canvasToJpeg(canvas, spec.quality);
}

// --------------------------------------------------------------------------

/** Yield to the event loop so the UI stays responsive and cancel can be seen. */
const yieldToUi = () => new Promise<void>((r) => setTimeout(r, 0));

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new CompressError("cancelled", "Compression cancelled.");
}

/** Maps pdf-lib's parse failures onto codes the UI can explain. */
function classifyLoadError(err: unknown): CompressError {
  const msg = err instanceof Error ? err.message : String(err);
  if (/encrypted/i.test(msg)) {
    return new CompressError(
      "encrypted",
      "This PDF is password-protected. Remove the password first, then compress it.",
    );
  }
  if (/No PDF header|Failed to parse|Expected instance|invalid object/i.test(msg)) {
    return new CompressError(
      "corrupt",
      "This file could not be read as a PDF. It may be damaged or incomplete.",
    );
  }
  if (/Cannot read properties|Pages/i.test(msg)) {
    return new CompressError("empty", "This PDF has no readable pages.");
  }
  return new CompressError("unknown", "This PDF could not be opened.");
}

export async function compressPdf(
  input: ArrayBuffer,
  { mode, signal, onProgress }: CompressOptions,
): Promise<CompressResult> {
  const started = performance.now();
  const spec = getMode(mode);
  const originalSize = input.byteLength;

  onProgress?.(0, "Reading document");
  throwIfAborted(signal);

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(input, { updateMetadata: false });
  } catch (err) {
    throw classifyLoadError(err);
  }

  const ctx = doc.context;
  const pageCount = doc.getPageCount();
  if (pageCount === 0) throw new CompressError("empty", "This PDF has no pages.");

  // Any object used as a soft mask carries transparency — never re-encode it.
  const maskRefs = new Set<string>();
  for (const [, obj] of ctx.enumerateIndirectObjects()) {
    const dict = (obj as PDFRawStream)?.dict;
    if (!dict?.get) continue;
    for (const key of ["SMask", "Mask"]) {
      const m = dict.get(PDFName.of(key));
      if (m && REF_RE.test(m.toString())) maskRefs.add(m.toString());
    }
  }

  const images: [ReturnType<typeof ctx.enumerateIndirectObjects>[0][0], PDFRawStream][] = [];
  for (const [ref, obj] of ctx.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    if (nameOf(obj.dict.get(PDFName.of("Subtype"))) !== "Image") continue;
    images.push([ref, obj]);
  }

  const imagesFound = images.length;
  let imagesRecompressed = 0;

  for (let i = 0; i < images.length; i++) {
    throwIfAborted(signal);
    const [ref, stream] = images[i];
    onProgress?.(images.length ? i / images.length : 0, `Optimising image ${i + 1} of ${images.length}`);

    if (maskRefs.has(ref.toString())) continue;

    const dict = stream.dict;
    const width = (dict.get(PDFName.of("Width")) as PDFNumber | undefined)?.asNumber?.();
    const height = (dict.get(PDFName.of("Height")) as PDFNumber | undefined)?.asNumber?.();
    const bpc = (dict.get(PDFName.of("BitsPerComponent")) as PDFNumber | undefined)?.asNumber?.();
    if (!width || !height || width * height < 4096) continue; // not worth it

    const filters = filtersOf(dict);
    const cs = resolveColourSpace(ctx, dict.get(PDFName.of("ColorSpace")));

    let bitmap: Bitmap | null = null;
    try {
      if (filters.length === 1 && filters[0] === "DCTDecode") {
        bitmap = await decodeJpeg(stream.contents);
      } else if (
        filters.length > 0 &&
        filters.every((f) => f === "FlateDecode") &&
        bpc === 8 &&
        (cs.comps === 1 || cs.comps === 3)
      ) {
        const raw = decodePDFRawStream(stream).decode();
        if (raw.length < width * height * cs.comps) continue;
        bitmap = await decodeRawSamples(raw, width, height, cs.comps);
      } else {
        continue; // format we cannot safely re-encode
      }

      const encoded = await reencode(bitmap, width, height, spec);

      // Only accept a genuine improvement.
      if (encoded.length >= stream.contents.length) continue;

      const keptSMask = dict.get(PDFName.of("SMask"));
      dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
      dict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
      dict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
      dict.set(PDFName.of("Width"), PDFNumber.of(Math.round(width * Math.min(1, spec.maxDim / Math.max(width, height)))));
      dict.set(PDFName.of("Height"), PDFNumber.of(Math.round(height * Math.min(1, spec.maxDim / Math.max(width, height)))));
      dict.delete(PDFName.of("DecodeParms"));
      dict.delete(PDFName.of("Decode"));
      if (keptSMask) dict.set(PDFName.of("SMask"), keptSMask);

      ctx.assign(ref, PDFRawStream.of(dict, encoded));
      imagesRecompressed++;
    } catch (err) {
      if (err instanceof CompressError) throw err;
      if (err instanceof RangeError || /allocation|memory/i.test(String(err))) {
        throw new CompressError(
          "out-of-memory",
          "This PDF is too large for your browser to process. Try a smaller file, or split it first.",
        );
      }
      // A single unreadable image should not fail the whole document.
      continue;
    } finally {
      bitmap?.close?.();
    }

    if (i % 3 === 2) await yieldToUi();
  }

  throwIfAborted(signal);
  onProgress?.(0.95, "Rebuilding document");
  await yieldToUi();

  let bytes: Uint8Array;
  try {
    bytes = await doc.save({ useObjectStreams: true });
  } catch {
    throw new CompressError("unknown", "The compressed file could not be written.");
  }

  onProgress?.(1, "Done");

  // If we made it bigger (rare, but possible on already-optimal files),
  // hand back the original rather than a worse file.
  if (bytes.byteLength >= originalSize) {
    return {
      bytes: new Uint8Array(input.slice(0)),
      originalSize,
      compressedSize: originalSize,
      reductionPct: 0,
      pageCount,
      imagesFound,
      imagesRecompressed: 0,
      outcome: "already-optimised",
      durationMs: Math.round(performance.now() - started),
    };
  }

  return {
    bytes,
    originalSize,
    compressedSize: bytes.byteLength,
    reductionPct: Math.max(0, (1 - bytes.byteLength / originalSize) * 100),
    pageCount,
    imagesFound,
    imagesRecompressed,
    outcome: "compressed",
    durationMs: Math.round(performance.now() - started),
  };
}
