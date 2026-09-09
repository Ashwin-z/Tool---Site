/**
 * PDF redaction analysis engine.
 *
 * Ported unchanged in logic from the Batch 4 prototype, which was validated
 * against 15 fixtures and 9 real-world public PDFs (169 pages, ~26,700 text
 * runs) with zero false positives, and cross-checked against Free Law Project's
 * `x-ray` — a completely independent implementation built on PyMuPDF rather
 * than pdf.js. Both agree on every case within x-ray's documented scope.
 *
 * WHAT IT DETECTS
 *   A  text painted BEFORE an opaque rectangle or image that covers it
 *   B  text in an invisible render mode (Tr 3 / Tr 7)
 *   C  text drawn in the same colour as whatever sits immediately behind it
 *   D  metadata / XMP / attachments that still carry content (reported for
 *      review, never as a leak — almost every PDF has a Producer field)
 *
 * WHAT IT CANNOT DETECT — the UI must state all of this:
 *   - non-text content under a box: a signature, photo or chart is invisible
 *     to text analysis
 *   - whether the visible content is sensitive in the first place
 *   - content still present in an earlier incremental revision of the file
 *   - anything inside an encrypted PDF it cannot open
 *   - vertical writing modes, which the advance calculation does not model
 *
 * WHY DRAW ORDER IS THE WHOLE GAME
 * A filled box only hides text painted BEFORE it. An earlier revision ignored
 * ordering and flagged 16 cells of an ordinary shaded table plus a cover
 * page's own title. For a tool that makes a security claim, a false alarm on a
 * normal document is far more damaging than a missed edge case, so every
 * geometric check is ordered.
 *
 * Everything here runs in the browser. No file, no extracted text and no
 * metadata ever leaves the device.
 */

import { getPdfjs, pdfDocumentOptions } from "@/lib/pdfjs-loader";

/* ------------------------------------------------------------------ types */

export type RiskChannel = "under-shape" | "invisible-text" | "same-colour";

export type Finding = {
  channel: RiskChannel;
  page: number;
  /** Recovered text. Stays in the browser — never logged, never transmitted. */
  text: string;
};

export type PageReport = {
  page: number;
  textRuns: number;
  /** Invisible runs explained by an OCR layer over a scan. Not a risk. */
  ocrLayerRuns: number;
  findings: Finding[];
};

export type MetadataField = { key: string; value: string };

export type RedactionReport = {
  pages: PageReport[];
  /** Only fields a person authored. Producer/Creator are generator strings. */
  metadata: MetadataField[];
  attachments: string[];
  hasXmp: boolean;
  verdict: "leaks-found" | "no-leaks-detected" | "no-text-layer";
  /** True when author-supplied metadata exists and is worth a human look. */
  metadataReview: boolean;
  channelsHit: RiskChannel[];
  totalFindings: number;
};

export class EncryptedPdfError extends Error {
  constructor() {
    super("This PDF is password protected, so its contents cannot be analysed.");
    this.name = "EncryptedPdfError";
  }
}

/* ------------------------------------------------------- pdf.js structural */

type Matrix = [number, number, number, number, number, number];
type Glyph = { unicode?: string; width?: number; isSpace?: boolean };
type OpList = { fnArray: number[]; argsArray: unknown[][] };
type Ops = Record<string, number>;

type Page = {
  getOperatorList: () => Promise<OpList>;
  getViewport: (o: { scale: number }) => { width: number; height: number };
};

type Doc = {
  numPages: number;
  getPage: (n: number) => Promise<Page>;
  getMetadata: () => Promise<{
    info?: Record<string, unknown>;
    metadata?: { getRaw?: () => string } | null;
  }>;
  getAttachments: () => Promise<Record<string, unknown> | null>;
  destroy?: () => Promise<void>;
};

/* -------------------------------------------------------------- constants */

/** Fraction of a text run that must be covered before it counts as hidden. */
const COVERAGE = 0.6;
/** RGB distance below which text is indistinguishable from its background. */
const CONTRAST_FLOOR = 24;
/**
 * Minimum characters before a same-colour run counts as concealed content.
 * Lone glyphs painted in the background colour are a normal artefact of form
 * and chart generators (a stray "!" in IRS form W-4) and hide nothing.
 */
const MIN_CONCEALED_CHARS = 4;
/** Smallest side, in points, for a shape to be a plausible redaction box. */
const MIN_OCCLUDER_SIDE = 4;
/** Tr 3 = invisible, Tr 7 = clip-only. Both paint nothing but stay extractable. */
const INVISIBLE_MODES = new Set([3, 7]);
/** Author-supplied metadata. Producer/Creator name the software, not a person. */
const AUTHORED_METADATA = ["Title", "Author", "Subject", "Keywords"];

/* ---------------------------------------------------------------- helpers */

/**
 * Matrix concatenation. NOTE THE ORDER: mul(a, b) applies b FIRST, then a.
 * A point therefore goes through the text matrix and then the CTM as
 * mul(ctm, tm), and `cm` concatenates as mul(ctm, args). Reversing this is
 * harmless while the CTM is identity and silently wrong the moment a page
 * contains an image, a chart or an annotation appearance stream.
 */
const mul = (a: Matrix, b: Matrix): Matrix => [
  a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
];

const apply = (m: Matrix, x: number, y: number): [number, number] => [
  m[0] * x + m[2] * y + m[4],
  m[1] * x + m[3] * y + m[5],
];

/**
 * Normalise a matrix argument to six plain numbers.
 *
 * pdf.js is inconsistent here: `transform` passes the six numbers as the
 * argument list itself, while `setTextMatrix` passes a single Float32Array as
 * args[0]. Slicing the argument list blindly yields a one-element array, which
 * collapses every text box to zero size and silently disables every geometric
 * check while the colour-based ones keep working.
 */
function asMatrix(args: unknown): Matrix {
  const a = args as ArrayLike<number>;
  const m = (a && a.length === 1 && (a as unknown as ArrayLike<number>[])[0]?.length === 6
    ? (a as unknown as ArrayLike<number>[])[0]
    : a) as ArrayLike<number>;
  return [m[0], m[1], m[2], m[3], m[4], m[5]];
}

/** pdf.js 5.x hands colours over as CSS hex strings, not float triples. */
function hexToRgb(v: unknown): [number, number, number] {
  const h = String(v).replace("#", "");
  return h.length === 6
    ? [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
    : [0, 0, 0];
}

const colourDistance = (a: number[], b: number[]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

type Box = { x0: number; y0: number; x1: number; y1: number };

function overlapFraction(t: Box, o: Box): number {
  const ox = Math.max(0, Math.min(t.x1, o.x1) - Math.max(t.x0, o.x0));
  const oy = Math.max(0, Math.min(t.y1, o.y1) - Math.max(t.y0, o.y0));
  const area = Math.max(1e-6, (t.x1 - t.x0) * (t.y1 - t.y0));
  return (ox * oy) / area;
}

/**
 * Is this subpath an axis-aligned rectangle?
 *
 * Adopted from x-ray, which only ever treats real rectangles as candidate
 * redactions. Nobody redacts with a bezier blob, and treating every filled
 * path as an occluder turns chart wedges, logos and icons into "redaction
 * boxes" — that was a measured false positive on a LaTeX paper.
 *
 * pdf.js 5.x encodes a subpath as a flat stream: 0 = moveTo(x, y),
 * 1 = lineTo(x, y), 4 = closePath. Anything else (a curve) disqualifies it.
 */
function subpathIsRectangle(sp: ArrayLike<number> | undefined): boolean {
  const a = Array.from(sp ?? []);
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < a.length; ) {
    const op = a[i];
    if (op === 0 || op === 1) { pts.push([a[i + 1], a[i + 2]]); i += 3; }
    else if (op === 4) { i += 1; }
    else return false;
  }
  if (pts.length < 4 || pts.length > 5) return false;
  const r = (n: number) => Math.round(n * 100) / 100;
  const xs = new Set(pts.slice(0, 4).map((q) => r(q[0])));
  const ys = new Set(pts.slice(0, 4).map((q) => r(q[1])));
  return xs.size === 2 && ys.size === 2;
}

/* ------------------------------------------------------------ page walker */

type Occluder = Box & { index: number; colour: [number, number, number] | null };
type Run = Box & { text: string; index: number; renderMode: number; colour: [number, number, number] };

async function analysePage(page: Page, pageNumber: number, OPS: Ops): Promise<PageReport> {
  const opList = await page.getOperatorList();
  const vp = page.getViewport({ scale: 1 });
  const pageArea = Math.max(1, vp.width * vp.height);

  // Path-painting operators that fill an interior. The *Stroke forms fill AND
  // outline; all of them conceal whatever was painted beneath them.
  const FILLING_OPS = new Set([
    OPS.fill, OPS.eoFill, OPS.fillStroke, OPS.eoFillStroke,
    OPS.closeFillStroke, OPS.closeEOFillStroke,
  ]);
  const IMAGE_OPS = new Set([
    OPS.paintImageXObject, OPS.paintJpegXObject,
    OPS.paintInlineImageXObject, OPS.paintImageMaskXObject,
  ]);

  const occluders: Occluder[] = [];
  const runs: Run[] = [];

  // graphics state
  let ctm: Matrix = [1, 0, 0, 1, 0, 0];
  let fillColour: [number, number, number] = [0, 0, 0];
  let fillAlpha = 1;
  const gsStack: Array<{ ctm: Matrix; fillColour: [number, number, number]; renderMode: number; fillAlpha: number }> = [];
  let pendingPaths: Box[] = [];

  // text state
  let tm: Matrix = [1, 0, 0, 1, 0, 0];
  let lm: Matrix = [1, 0, 0, 1, 0, 0];
  let fontSize = 0, charSpacing = 0, wordSpacing = 0, hScale = 1, leading = 0, rise = 0;
  let renderMode = 0;

  const pushState = () =>
    gsStack.push({ ctm: [...ctm] as Matrix, fillColour: [...fillColour] as [number, number, number], renderMode, fillAlpha });
  const popState = () => {
    const s = gsStack.pop();
    if (s) { ctm = s.ctm; fillColour = s.fillColour; renderMode = s.renderMode; fillAlpha = s.fillAlpha; }
  };
  const moveText = (tx: number, ty: number) => {
    lm = mul(lm, [1, 0, 0, 1, tx, ty]);
    tm = [...lm] as Matrix;
  };

  /** Lay out one glyph array, record the run, and advance the text matrix. */
  function showText(glyphs: unknown, index: number) {
    const list = (glyphs ?? []) as Array<Glyph | number>;
    if (!list.length) return;

    const start = [...tm] as Matrix;
    let text = "";
    let advance = 0;
    for (const g of list) {
      if (typeof g === "number") {
        // Kerning adjustment, in thousandths of an em.
        advance += (-g / 1000) * fontSize * hScale;
      } else if (g) {
        text += g.unicode ?? "";
        const w = (g.width ?? 0) / 1000;
        advance += (w * fontSize + charSpacing + (g.isSpace ? wordSpacing : 0)) * hScale;
      }
    }
    tm = mul(tm, [1, 0, 0, 1, advance, 0]);
    if (!text.trim()) return;

    // Build the box in TEXT space and transform all four corners, so rotated
    // text stays correct. Taking the baseline endpoints and padding in device
    // Y collapses a 90-degree-rotated chart axis label into a thin sliver that
    // any nearby marker then appears to cover.
    const m0 = mul(ctm, start);
    const fs = Math.abs(fontSize);
    const yb = rise - 0.22 * fs;
    const yt = rise + 0.78 * fs;
    const corners = ([[0, yb], [advance, yb], [0, yt], [advance, yt]] as Array<[number, number]>)
      .map(([x, y]) => apply(m0, x, y));
    const xs = corners.map((c) => c[0]);
    const ys = corners.map((c) => c[1]);

    runs.push({
      text, index, renderMode, colour: [...fillColour] as [number, number, number],
      x0: Math.min(...xs), x1: Math.max(...xs),
      y0: Math.min(...ys), y1: Math.max(...ys),
    });
  }

  for (let i = 0; i < opList.fnArray.length; i++) {
    const fn = opList.fnArray[i];
    const args = opList.argsArray[i];

    switch (fn) {
      case OPS.save: pushState(); break;
      case OPS.restore: popState(); break;
      case OPS.transform: ctm = mul(ctm, asMatrix(args)); break;

      case OPS.setFillRGBColor: fillColour = hexToRgb(args[0]); break;
      case OPS.setFillGray: {
        const g = Math.round((args[0] as number) * 255);
        fillColour = [g, g, g];
        break;
      }
      case OPS.setGState: {
        // Semi-transparent fills are highlights, not redactions.
        for (const [k, v] of (args[0] as Array<[string, unknown]>) ?? []) {
          if (k === "ca") fillAlpha = v as number;
        }
        break;
      }

      case OPS.paintFormXObjectBegin:
        // Form XObjects carry their own matrix, and pdf.js saves state here.
        // Charts, logos and annotation appearances all arrive this way — one
        // arXiv figure page is rotated 90 degrees by this matrix alone, so
        // ignoring it silently corrupts every coordinate on the page.
        pushState();
        ctm = mul(ctm, asMatrix([args[0]]));
        break;
      case OPS.paintFormXObjectEnd: popState(); break;

      case OPS.beginText: tm = [1, 0, 0, 1, 0, 0]; lm = [1, 0, 0, 1, 0, 0]; break;
      case OPS.setTextMatrix: tm = asMatrix(args); lm = [...tm] as Matrix; break;
      case OPS.setFont: fontSize = args[1] as number; break;
      case OPS.setCharSpacing: charSpacing = args[0] as number; break;
      case OPS.setWordSpacing: wordSpacing = args[0] as number; break;
      case OPS.setHScale: hScale = (args[0] as number) / 100; break;
      case OPS.setLeading: leading = args[0] as number; break;
      case OPS.setTextRise: rise = args[0] as number; break;
      case OPS.setTextRenderingMode: renderMode = args[0] as number; break;
      case OPS.moveText: moveText(args[0] as number, args[1] as number); break;
      case OPS.setLeadingMoveText:
        leading = -(args[1] as number);
        moveText(args[0] as number, args[1] as number);
        break;
      case OPS.nextLine: moveText(0, -leading); break;
      case OPS.showText: showText(args[0], i); break;
      case OPS.nextLineShowText: moveText(0, -leading); showText(args[0], i); break;
      case OPS.nextLineSetSpacingShowText:
        wordSpacing = args[0] as number;
        charSpacing = args[1] as number;
        moveText(0, -leading);
        showText(args[2], i);
        break;

      case OPS.constructPath: {
        // v5 shape: [paintOp, subpaths, bbox]. bbox is a Float32Array, so
        // Array.isArray() is false and must not be used to validate it.
        const paintOp = args[0] as number;
        const bbox = args[2] as ArrayLike<number> | undefined;
        const subpaths = (Array.isArray(args[1]) ? args[1] : [args[1]]) as ArrayLike<number>[];
        // One constructPath can hold many subpaths, and its bbox then spans all
        // of them — which would mark everything between two separate boxes as
        // covered. Only accept a path that is a single plain rectangle.
        const isRect = subpaths.length === 1 && subpathIsRectangle(subpaths[0]);
        if (isRect && bbox && bbox.length === 4) {
          const a = apply(ctm, bbox[0], bbox[1]);
          const b = apply(ctm, bbox[2], bbox[3]);
          const r: Box = {
            x0: Math.min(a[0], b[0]), y0: Math.min(a[1], b[1]),
            x1: Math.max(a[0], b[0]), y1: Math.max(a[1], b[1]),
          };
          // Hairlines are rules and borders, not redactions.
          if (r.x1 - r.x0 > MIN_OCCLUDER_SIDE && r.y1 - r.y0 > MIN_OCCLUDER_SIDE) {
            pendingPaths.push(r);
          }
        }
        if (FILLING_OPS.has(paintOp) && fillAlpha >= 1) {
          for (const r of pendingPaths) occluders.push({ ...r, index: i, colour: [...fillColour] as [number, number, number] });
        }
        pendingPaths = [];
        break;
      }

      default:
        if (FILLING_OPS.has(fn)) {
          if (fillAlpha >= 1) {
            for (const r of pendingPaths) occluders.push({ ...r, index: i, colour: [...fillColour] as [number, number, number] });
          }
          pendingPaths = [];
        } else if (IMAGE_OPS.has(fn)) {
          // Images paint into the unit square, positioned by the CTM. Their
          // colour is unknown, so an image can occlude but can never inform
          // the same-colour check.
          const c = [apply(ctm, 0, 0), apply(ctm, 1, 0), apply(ctm, 0, 1), apply(ctm, 1, 1)];
          const box: Box = {
            x0: Math.min(...c.map((p) => p[0])), x1: Math.max(...c.map((p) => p[0])),
            y0: Math.min(...c.map((p) => p[1])), y1: Math.max(...c.map((p) => p[1])),
          };
          if (box.x1 - box.x0 > MIN_OCCLUDER_SIDE && box.y1 - box.y0 > MIN_OCCLUDER_SIDE) {
            occluders.push({ ...box, index: i, colour: null });
          }
        }
    }
  }

  const findings: Finding[] = [];
  const invisible: Run[] = [];

  for (const r of runs) {
    const coveredBy = occluders.find((o) => o.index > r.index && overlapFraction(r, o) >= COVERAGE);
    if (coveredBy) {
      findings.push({ channel: "under-shape", page: pageNumber, text: r.text });
      continue;
    }
    if (INVISIBLE_MODES.has(r.renderMode)) { invisible.push(r); continue; }

    // Background = the last thing painted under this run before it was drawn.
    // Unpainted page is white; an image's colour is unknown, so skip then.
    let bg: number[] = [255, 255, 255];
    let known = true;
    for (const o of occluders) {
      if (o.index < r.index && overlapFraction(r, o) >= COVERAGE) {
        if (o.colour) { bg = o.colour; known = true; } else known = false;
      }
    }
    if (known && r.text.trim().length >= MIN_CONCEALED_CHARS && colourDistance(r.colour, bg) < CONTRAST_FLOOR) {
      findings.push({ channel: "same-colour", page: pageNumber, text: r.text });
    }
  }

  // A scanned page is an image with an invisible OCR text layer over it. That
  // is how every searchable scan works, so it must NOT be reported as hidden
  // content — one 4-page scanned government memo produced 878 invisible runs,
  // one per word. Treat a page as an OCR layer only when essentially all of
  // its text is invisible AND a large image covers the page; the invisible
  // text is then explained by scanning rather than by concealment.
  const bigImage = occluders.some(
    (o) => o.colour === null && ((o.x1 - o.x0) * (o.y1 - o.y0)) / pageArea > 0.5,
  );
  const isOcrLayer = bigImage && runs.length > 0 && invisible.length / runs.length >= 0.9;
  if (!isOcrLayer) {
    for (const r of invisible) findings.push({ channel: "invisible-text", page: pageNumber, text: r.text });
  }

  return {
    page: pageNumber,
    textRuns: runs.length,
    ocrLayerRuns: isOcrLayer ? invisible.length : 0,
    findings,
  };
}

/* -------------------------------------------------------------- public API */

export type CheckOptions = {
  /** Called after each page so the UI can show progress on long documents. */
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
};

export async function checkPdfRedaction(
  data: ArrayBuffer,
  options: CheckOptions = {},
): Promise<RedactionReport> {
  const pdfjs = (await getPdfjs()) as unknown as {
    getDocument: (o: unknown) => { promise: Promise<Doc> };
    OPS: Ops;
  };

  let doc: Doc;
  try {
    doc = await pdfjs.getDocument(pdfDocumentOptions(data)).promise;
  } catch (err) {
    if ((err as { name?: string })?.name === "PasswordException") throw new EncryptedPdfError();
    throw err;
  }

  const pages: PageReport[] = [];
  try {
    for (let n = 1; n <= doc.numPages; n++) {
      if (options.signal?.aborted) throw new DOMException("Aborted", "AbortError");
      pages.push(await analysePage(await doc.getPage(n), n, pdfjs.OPS));
      options.onProgress?.(n, doc.numPages);
      // Yield to the event loop so a long document cannot freeze the tab.
      await new Promise((r) => setTimeout(r, 0));
    }

    const md = await doc.getMetadata().catch(() => null);
    const info = (md?.info ?? {}) as Record<string, unknown>;
    const metadata: MetadataField[] = AUTHORED_METADATA
      .map((k) => ({ key: k, value: typeof info[k] === "string" ? (info[k] as string).trim() : "" }))
      .filter((f) => f.value.length > 0);
    const hasXmp = Boolean(md?.metadata?.getRaw?.());
    const attachments = Object.keys((await doc.getAttachments().catch(() => null)) ?? {});

    const totalFindings = pages.reduce((n, p) => n + p.findings.length, 0);
    const channelsHit = [...new Set(pages.flatMap((p) => p.findings.map((f) => f.channel)))];
    const hasText = pages.some((p) => p.textRuns > 0);

    return {
      pages,
      metadata,
      attachments,
      hasXmp,
      metadataReview: metadata.length > 0 || attachments.length > 0,
      verdict: totalFindings > 0 ? "leaks-found" : hasText ? "no-leaks-detected" : "no-text-layer",
      channelsHit,
      totalFindings,
    };
  } finally {
    await doc.destroy?.();
  }
}

/**
 * Map a report to the analytics `result_type`. Only this label is ever sent —
 * never the document, its text, or its metadata values.
 */
export function resultType(report: RedactionReport): string {
  if (report.channelsHit.length > 1) return "multiple_risks";
  if (report.channelsHit.includes("under-shape")) return "text_overlay_risk";
  if (report.channelsHit.includes("invisible-text")) return "invisible_text_risk";
  if (report.channelsHit.includes("same-colour")) return "invisible_text_risk";
  if (report.metadataReview) return "metadata_risk";
  return "no_detected_leaks";
}
