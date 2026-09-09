/**
 * Browser-side PDF to Excel.
 *
 * The user's file NEVER leaves the device. This is a direct port of the
 * server engine that previously lived in
 * src/app/api/tools/pdf-to-excel/route.ts — the last PDF tool that uploaded
 * a document to ToolMint.
 *
 * The port was viable because that engine was already pure JavaScript
 * (pdfjs-dist + exceljs); only two lines used Node's canvas. It is NOT a
 * naive text dump: it renders each page, detects ruling lines, clusters
 * glyphs into a row/column grid, infers merged cells, samples fill colours,
 * and extracts embedded images.
 *
 * WHAT IT DOES WELL
 * - Ruled tables, and unruled tables whose columns align consistently.
 * - Numbers, dates and currency are written as text exactly as they appear,
 *   so nothing is silently reinterpreted.
 *
 * WHAT IT CANNOT DO — stated plainly on the tool page as well
 * - A scanned PDF has no text layer. There is nothing to extract; the page
 *   is exported as an image, not as cells. Use PDF to Text (OCR) first.
 * - A PDF has no concept of a formula. Every cell is a value. We never
 *   invent formulas, and we do not claim to preserve them.
 * - Free-flowing prose and multi-column layouts are not tables, and the grid
 *   inferred from them will be approximate.
 */

import {
  getPdfjs,
  pdfDocumentOptions,
} from "@/lib/pdfjs-loader";

import {
  ExcelError,
  type ExcelOptions,
  type ExcelResult,
} from "@/lib/pdf-to-excel-types";

export * from "@/lib/pdf-to-excel-types";

/** Browser canvas. The server engine used @napi-rs/canvas here. */
function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  return canvas;
}

/**
 * Synchronous PNG bytes from a canvas. The server engine used napi-rs's
 * canvas.toBuffer("image/png"); the browser equivalent is a data URL, which
 * we decode back to bytes. Kept synchronous so the surrounding engine code
 * (ported unchanged) does not have to become async.
 */
function canvasToPngBytes(canvas: HTMLCanvasElement): Uint8Array {
  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

/** exceljs wants base64 for images in the browser build. */
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

type PdfPageProxy = any;
type PdfDocumentProxy = any;
type TextItem = {
  str?: string;
  transform?: number[];
  width?: number;
  height?: number;
  fontName?: string;
};
type TextStyle = {
  fontFamily?: string;
  ascent?: number;
  descent?: number;
  vertical?: boolean;
};

type Glyph = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  color: string; // hex like 'FF000000' (ARGB)
  underline: boolean;
};

type RenderedPage = {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  png: Uint8Array;
};

type ImageRegion = {
  png: Uint8Array;
  x: number;
  y: number;
  width: number;
  height: number;
};

type GridLine = {
  pos: number;
  score: number;
};

type CellData = {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  fontFamily: string;
  fontColor: string; // ARGB hex
  fillArgb?: string;
  hAlign?: "left" | "center" | "right";
  vAlign?: "top" | "middle" | "bottom";
};

type MergeRange = {
  top: number;
  left: number;
  bottom: number;
  right: number;
};

type GridModel = {
  rows: number[];
  cols: number[];
  cells: CellData[][];
  merges: MergeRange[];
  images: ImageRegion[];
};

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildOutputFileName(fileName: string): string {
  return `${fileName.replace(/\.[^.]+$/, "") || "document"}.xlsx`;
}





function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeMultilineValue(value: string): string {
  const lines = value
    .split("\n")
    .map((line) => normalizeText(line))
    .filter(Boolean);

  const deduped: string[] = [];
  for (const line of lines) {
    if (!deduped.includes(line)) deduped.push(line);
  }

  return deduped.join("\n");
}

function isBoldFont(fontFamily: string): boolean {
  return /bold|black|heavy|semibold|demi/i.test(fontFamily);
}

function isItalicFont(fontFamily: string): boolean {
  return /italic|oblique/i.test(fontFamily);
}

function isMostlyUppercase(text: string): boolean {
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (!letters.length) return false;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length >= 0.75;
}

function isWeekday(text: string): boolean {
  return /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i.test(text.trim());
}

function looksLikeDate(text: string): boolean {
  return /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(text.trim());
}

function looksLikeTiming(text: string): boolean {
  return /\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}/.test(text.trim());
}

function looksLikeSectionHeader(text: string): boolean {
  const value = text.trim();
  return !!value && value.length <= 24 && /^[A-Z0-9][A-Z0-9\s\-\/.&]*$/.test(value);
}

function clusterNumbers(values: number[], threshold: number): number[] {
  const clean = [...new Set(values.filter((v) => Number.isFinite(v)).map((v) => Number(v.toFixed(2))))].sort((a, b) => a - b);
  if (!clean.length) return [];

  const clusters: number[][] = [[clean[0]]];

  for (let i = 1; i < clean.length; i++) {
    const value = clean[i];
    const cluster = clusters[clusters.length - 1];
    const last = cluster[cluster.length - 1];

    if (Math.abs(value - last) <= threshold) {
      cluster.push(value);
    } else {
      clusters.push([value]);
    }
  }

  return clusters.map((group) => group.reduce((sum, v) => sum + v, 0) / group.length);
}

function nearestIndex(points: number[], value: number): number {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  points.forEach((point, index) => {
    const distance = Math.abs(point - value);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function inferFontSize(item: TextItem, style?: TextStyle): number {
  const transform = item.transform ?? [];
  const a = Math.abs(Number(transform[0] ?? 0));
  const d = Math.abs(Number(transform[3] ?? 0));
  const transformSize = Math.max(a, d, Math.abs(Number(item.height ?? 0)));
  const ascent = typeof style?.ascent === "number" ? Math.abs(style.ascent) : 0.9;
  const inferred = transformSize / Math.max(ascent, 0.6);
  return clamp(Number.isFinite(inferred) ? inferred : transformSize || 11, 8, 28);
}

function rgbToArgb(r: number, g: number, b: number): string {
  const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0").toUpperCase();
  return `FF${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
    (a[1] - b[1]) ** 2 +
    (a[2] - b[2]) ** 2,
  );
}

function isNearWhite(rgb: [number, number, number], tolerance = 16): boolean {
  return colorDistance(rgb, [255, 255, 255]) <= tolerance;
}

function isNearGray(rgb: [number, number, number]): boolean {
  const [r, g, b] = rgb;
  return Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b)) < 12;
}

function getPixel(pixels: Uint8ClampedArray, width: number, height: number, x: number, y: number): [number, number, number, number] {
  const safeX = clamp(Math.round(x), 0, width - 1);
  const safeY = clamp(Math.round(y), 0, height - 1);
  const idx = (safeY * width + safeX) * 4;
  return [pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]];
}

function sampleRectColor(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
): [number, number, number] {
  const x1 = clamp(Math.floor(left), 0, width - 1);
  const y1 = clamp(Math.floor(top), 0, height - 1);
  const x2 = clamp(Math.ceil(right), 0, width - 1);
  const y2 = clamp(Math.ceil(bottom), 0, height - 1);

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  const stepX = Math.max(1, Math.floor((x2 - x1) / 10));
  const stepY = Math.max(1, Math.floor((y2 - y1) / 10));

  for (let y = y1; y <= y2; y += stepY) {
    for (let x = x1; x <= x2; x += stepX) {
      const [pr, pg, pb, pa] = getPixel(pixels, width, height, x, y);
      if (pa < 10) continue;
      r += pr;
      g += pg;
      b += pb;
      count += 1;
    }
  }

  if (!count) return [255, 255, 255];
  return [r / count, g / count, b / count];
}

function darknessOf(rgb: [number, number, number]): number {
  const [r, g, b] = rgb;
  return 255 - (0.299 * r + 0.587 * g + 0.114 * b);
}

async function renderPage(page: PdfPageProxy, scale = 2): Promise<RenderedPage> {
  const viewport = page.getViewport({ scale });
  const w = Math.ceil(viewport.width);
  const h = Math.ceil(viewport.height);
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d");

  await page.render({
    canvasContext: ctx as any,
    viewport,
    background: "rgb(255,255,255)",
  }).promise;

  if (!ctx) throw new ExcelError("unknown", "Could not create a drawing surface.");
  const imageData = ctx.getImageData(0, 0, w, h);
  const png = canvasToPngBytes(canvas);

  return {
    width: w,
    height: h,
    pixels: imageData.data,
    png,
  };
}

/**
 * Extract embedded image regions from a PDF page by analysing the operator list.
 * We look for paintImageXObject ops and capture the transform to know position/size.
 * Then we crop that region from the rendered page PNG for pixel-perfect embedding.
 */
async function extractPageImages(page: PdfPageProxy, rendered: RenderedPage, OPS: Record<string, number>): Promise<ImageRegion[]> {
  let operatorList: { fnArray: number[]; argsArray: any[][] };
  try {
    operatorList = await page.getOperatorList();
  } catch {
    return [];
  }

  const viewport = page.getViewport({ scale: 2 });
  const { fnArray, argsArray } = operatorList;
  const regions: ImageRegion[] = [];
  const ctmStack: number[][] = [[1, 0, 0, 1, 0, 0]];
  let currentCtm = [1, 0, 0, 1, 0, 0];

  function multiplyCtm(a: number[], b: number[]): number[] {
    return [
      a[0] * b[0] + a[2] * b[1],
      a[1] * b[0] + a[3] * b[1],
      a[0] * b[2] + a[2] * b[3],
      a[1] * b[2] + a[3] * b[3],
      a[0] * b[4] + a[2] * b[5] + a[4],
      a[1] * b[4] + a[3] * b[5] + a[5],
    ];
  }

  for (let i = 0; i < fnArray.length; i++) {
    const fn = fnArray[i];
    const args = argsArray[i];

    if (fn === OPS.save) {
      ctmStack.push([...currentCtm]);
    } else if (fn === OPS.restore) {
      currentCtm = ctmStack.pop() ?? [1, 0, 0, 1, 0, 0];
    } else if (fn === OPS.transform) {
      currentCtm = multiplyCtm(currentCtm, args as number[]);
    } else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) {
      // CTM: [scaleX, skewY, skewX, scaleY, translateX, translateY]
      const imgW = Math.abs(currentCtm[0]);
      const imgH = Math.abs(currentCtm[3]);
      const imgX = currentCtm[4];
      // PDF y = bottom-left origin; ctm[5] is the baseline
      const imgY = currentCtm[5];

      // Convert from PDF user-space to rendered pixel coords
      const pageH = viewport.height / viewport.scale; // page height in PDF units
      const pxX = imgX * viewport.scale;
      const pxY = (pageH - imgY) * viewport.scale; // flip y
      const pxW = imgW * viewport.scale;
      const pxH = imgH * viewport.scale;

      // Skip tiny decorations (<30px) and full-width backgrounds
      const isFullWidth = pxW > rendered.width * 0.85;
      const isTiny = pxW < 30 || pxH < 30;
      if (!isTiny && !isFullWidth) {
        // Crop region from the rendered page
        const cx = clamp(Math.round(pxX), 0, rendered.width - 1);
        const cy = clamp(Math.round(pxY), 0, rendered.height - 1);
        const cw = clamp(Math.round(pxW), 1, rendered.width - cx);
        const ch = clamp(Math.round(pxH), 1, rendered.height - cy);

        try {
          const cropCanvas = makeCanvas(cw, ch);
          const cropCtx = cropCanvas.getContext("2d");
          if (!cropCtx) continue;
          // Copy pixels from the rendered image data
          const src = rendered.pixels;
          const imgData = cropCtx.createImageData(cw, ch);
          for (let row = 0; row < ch; row++) {
            for (let col = 0; col < cw; col++) {
              const srcIdx = ((cy + row) * rendered.width + (cx + col)) * 4;
              const dstIdx = (row * cw + col) * 4;
              imgData.data[dstIdx] = src[srcIdx];
              imgData.data[dstIdx + 1] = src[srcIdx + 1];
              imgData.data[dstIdx + 2] = src[srcIdx + 2];
              imgData.data[dstIdx + 3] = src[srcIdx + 3];
            }
          }
          cropCtx.putImageData(imgData, 0, 0);
          const cropPng = canvasToPngBytes(cropCanvas);

          regions.push({
            png: cropPng,
            x: imgX,
            y: imgY,
            width: imgW,
            height: imgH,
          });
        } catch {
          // Skip if cropping fails
        }
      }
    }
  }

  return regions;
}

/**
 * Extract per-glyph fill colours from the PDF operator list.
 * Returns a map of approximate y→x→ARGB colour so we can assign to glyphs.
 */
function extractTextColors(
  opList: { fnArray: number[]; argsArray: any[][] },
  OPS: Record<string, number>,
): { colors: Array<{ y: number; color: string }>; underlines: Array<{ x: number; y: number; w: number }> } {
  const { fnArray, argsArray } = opList;
  const colors: Array<{ y: number; color: string }> = [];
  const underlines: Array<{ x: number; y: number; w: number }> = [];
  let currentColor = "FF000000"; // default black
  const ctmStack: number[][] = [];
  let ctm = [1, 0, 0, 1, 0, 0];

  function safeNum(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function multiplyCtm(a: number[], b: number[]): number[] {
    return [
      a[0] * b[0] + a[2] * b[1],
      a[1] * b[0] + a[3] * b[1],
      a[0] * b[2] + a[2] * b[3],
      a[1] * b[2] + a[3] * b[3],
      a[0] * b[4] + a[2] * b[5] + a[4],
      a[1] * b[4] + a[3] * b[5] + a[5],
    ];
  }

  for (let i = 0; i < fnArray.length; i++) {
    const fn = fnArray[i];
    const args = argsArray[i];

    if (fn === OPS.save) {
      ctmStack.push([...ctm]);
    } else if (fn === OPS.restore) {
      ctm = ctmStack.pop() ?? [1, 0, 0, 1, 0, 0];
    } else if (fn === OPS.transform) {
      if (Array.isArray(args) && args.length >= 6) {
        const vals = args.map(safeNum);
        if (vals.every(Number.isFinite)) {
          ctm = multiplyCtm(ctm, vals);
        }
      }
    } else if (fn === OPS.setFillRGBColor) {
      const r = safeNum(args?.[0]) * 255;
      const g = safeNum(args?.[1]) * 255;
      const b = safeNum(args?.[2]) * 255;
      currentColor = rgbToArgb(r, g, b);
    } else if (fn === OPS.setFillGray) {
      const v = safeNum(args?.[0]) * 255;
      currentColor = rgbToArgb(v, v, v);
    } else if (fn === OPS.setFillCMYKColor) {
      const c = safeNum(args?.[0]);
      const m = safeNum(args?.[1]);
      const y = safeNum(args?.[2]);
      const k = safeNum(args?.[3]);
      const r = 255 * (1 - c) * (1 - k);
      const g = 255 * (1 - m) * (1 - k);
      const b = 255 * (1 - y) * (1 - k);
      currentColor = rgbToArgb(r, g, b);
    } else if (fn === OPS.setFillColor || fn === OPS.setFillColorN) {
      if (Array.isArray(args) && args.length >= 3) {
        const vals = args.map(safeNum);
        if (vals[0] <= 1 && vals[1] <= 1 && vals[2] <= 1) {
          currentColor = rgbToArgb(vals[0] * 255, vals[1] * 255, vals[2] * 255);
        }
      }
    } else if (fn === OPS.showText || fn === OPS.showSpacedText) {
      // Associate current color with the current text position
      colors.push({ y: ctm[5], color: currentColor });
    } else if (fn === OPS.constructPath) {
      // Detect underlines: thin horizontal rectangles
      try {
        const ops = args?.[0];
        const coords = args?.[1];
        if (ops && coords && Array.isArray(coords)) {
          // Look for rectangle ops (op code 4 = rect)
          const opsArr = Array.isArray(ops) ? ops : Array.from(ops as Iterable<number>);
          let ci = 0;
          for (const op of opsArr) {
            if (op === 4 && ci + 3 < coords.length) {
              const rx = safeNum(coords[ci]);
              const ry = safeNum(coords[ci + 1]);
              const rw = safeNum(coords[ci + 2]);
              const rh = safeNum(coords[ci + 3]);
              // Thin horizontal line = underline
              if (Math.abs(rh) <= 3 && Math.abs(rw) > 10) {
                underlines.push({ x: rx, y: ry, w: rw });
              }
              ci += 4;
            } else if (op === 1) {
              ci += 2; // moveTo
            } else if (op === 2) {
              ci += 2; // lineTo
            } else if (op === 3) {
              ci += 6; // bezierCurveTo
            } else {
              ci += 0;
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }

  return { colors, underlines };
}

/**
 * Assign extracted colours to glyphs by matching Y positions proportionally.
 */
function assignColorsToGlyphs(
  glyphs: Glyph[],
  colorEntries: Array<{ y: number; color: string }>,
  underlineEntries: Array<{ x: number; y: number; w: number }>,
): void {
  if (!colorEntries.length && !underlineEntries.length) return;

  // Sort colors by y position descending (same as glyph order)
  const sorted = [...colorEntries].sort((a, b) => b.y - a.y);

  for (const glyph of glyphs) {
    // Find closest color entry by Y
    let bestDist = Infinity;
    let bestColor = "FF000000";
    for (const entry of sorted) {
      const dist = Math.abs(entry.y - glyph.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestColor = entry.color;
      }
      // Early exit once we're too far past
      if (entry.y < glyph.y - 50) break;
    }
    if (bestDist < 20) {
      glyph.color = bestColor;
    }

    // Check for underlines near this glyph
    for (const ul of underlineEntries) {
      const yDist = Math.abs(ul.y - (glyph.y - glyph.height * 0.15));
      const xOverlap = glyph.x < ul.x + ul.w && glyph.x + glyph.width > ul.x;
      if (yDist < 8 && xOverlap) {
        glyph.underline = true;
        break;
      }
    }
  }
}

async function extractGlyphs(page: PdfPageProxy, OPS?: Record<string, number>): Promise<Glyph[]> {
  const textContent = await page.getTextContent();
  const styles: Record<string, TextStyle> = textContent.styles ?? {};

  const glyphs: Glyph[] = (textContent.items as TextItem[])
    .map((item) => {
      const text = normalizeText(item.str ?? "");
      const transform = item.transform ?? [];
      const x = Number(transform[4] ?? 0);
      const y = Number(transform[5] ?? 0);
      const width = Math.abs(Number(item.width ?? 0));
      const height = Math.abs(Number(item.height ?? transform[3] ?? 0)) || 10;
      const style = styles[item.fontName ?? ""] ?? {};
      const fontFamily = String(style.fontFamily || item.fontName || "Calibri");
      const fontSize = inferFontSize(item, style);

      return {
        text,
        x,
        y,
        width,
        height,
        fontSize,
        fontFamily,
        bold: isBoldFont(fontFamily),
        italic: isItalicFont(fontFamily),
        color: "FF000000",
        underline: false,
      };
    })
    .filter((item) => item.text.length > 0 && Number.isFinite(item.x) && Number.isFinite(item.y));

  // Extract colours and underlines from operator list
  if (OPS && OPS.save != null) {
    try {
      const opList = await page.getOperatorList();
      const { colors, underlines } = extractTextColors(opList, OPS);
      assignColorsToGlyphs(glyphs, colors, underlines);
    } catch {
      // Colour extraction is best-effort
    }
  }

  return glyphs.sort((a, b) => b.y - a.y || a.x - b.x);
}

function detectVerticalLines(rendered: RenderedPage): GridLine[] {
  const { width, height, pixels } = rendered;
  const scores: GridLine[] = [];
  const xStep = Math.max(1, Math.floor(width / 600));
  const yStep = Math.max(4, Math.floor(height / 200));

  for (let x = 0; x < width; x += xStep) {
    let darkHits = 0;
    let samples = 0;
    for (let y = 0; y < height; y += yStep) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      if (brightness < 170) darkHits++;
      samples++;
    }

    const score = darkHits / Math.max(samples, 1);
    if (score > 0.40) scores.push({ pos: x / 2, score });
  }

  return clusterNumbers(scores.map((s) => s.pos), 3).map((pos) => ({
    pos,
    score: 1,
  }));
}

function detectHorizontalLines(rendered: RenderedPage): GridLine[] {
  const { width, height, pixels } = rendered;
  const scores: GridLine[] = [];
  const yStep = Math.max(1, Math.floor(height / 600));
  const xStep = Math.max(4, Math.floor(width / 200));

  for (let y = 0; y < height; y += yStep) {
    let darkHits = 0;
    let samples = 0;
    for (let x = 0; x < width; x += xStep) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      if (brightness < 170) darkHits++;
      samples++;
    }

    const score = darkHits / Math.max(samples, 1);
    if (score > 0.30) scores.push({ pos: y / 2, score });
  }

  return clusterNumbers(scores.map((s) => s.pos), 3).map((pos) => ({
    pos,
    score: 1,
  }));
}

function inferColumnBoundaries(glyphs: Glyph[], verticalLines: GridLine[], pageWidth: number): number[] {
  const textColumns = clusterNumbers(glyphs.map((g) => g.x), 18);
  const lineColumns = verticalLines
    .map((line) => line.pos)
    .filter((pos) => pos >= 0 && pos <= pageWidth);

  const all = [...textColumns, ...lineColumns, 0, pageWidth];
  const clustered = clusterNumbers(all, 10).sort((a, b) => a - b);

  if (clustered.length < 3) {
    const minX = Math.min(...glyphs.map((g) => g.x), 0);
    const maxX = Math.max(...glyphs.map((g) => g.x + Math.max(g.width, 20)), pageWidth);
    return [minX, maxX];
  }

  return clustered;
}

function inferRowBoundaries(glyphs: Glyph[], horizontalLines: GridLine[], pageHeight: number): number[] {
  const textRows = clusterNumbers(glyphs.map((g) => g.y), Math.max(median(glyphs.map((g) => g.height)) * 0.8, 8));
  const lineRows = horizontalLines
    .map((line) => line.pos)
    .filter((pos) => pos >= 0 && pos <= pageHeight);

  const all = [...textRows, ...lineRows, 0, pageHeight];
  const clustered = clusterNumbers(all, 6).sort((a, b) => b - a);

  if (clustered.length < 3) {
    const minY = Math.min(...glyphs.map((g) => g.y), 0);
    const maxY = Math.max(...glyphs.map((g) => g.y + Math.max(g.height, 12)), pageHeight);
    return [maxY, minY];
  }

  return clustered;
}

function findIntervalIndex(boundsAsc: number[], value: number): number {
  for (let i = 0; i < boundsAsc.length - 1; i++) {
    if (value >= boundsAsc[i] && value < boundsAsc[i + 1]) return i;
  }
  return Math.max(0, boundsAsc.length - 2);
}

/** Parse an ARGB hex string like 'FF1F497D' into RGB tuple. */
function parseArgb(argb: string): [number, number, number] {
  if (!argb || argb.length < 8) return [255, 255, 255];
  return [
    parseInt(argb.slice(2, 4), 16),
    parseInt(argb.slice(4, 6), 16),
    parseInt(argb.slice(6, 8), 16),
  ];
}

function buildGridModel(glyphs: Glyph[], rendered: RenderedPage): GridModel {
  const verticalLines = detectVerticalLines(rendered);
  const horizontalLines = detectHorizontalLines(rendered);

  const cols = inferColumnBoundaries(glyphs, verticalLines, rendered.width / 2);
  const rowsDesc = inferRowBoundaries(glyphs, horizontalLines, rendered.height / 2);
  const rows = [...rowsDesc].sort((a, b) => b - a);
  const colsAsc = [...cols].sort((a, b) => a - b);
  const rowsAsc = [...rows].sort((a, b) => a - b);

  const rowCount = Math.max(rows.length - 1, 1);
  const colCount = Math.max(colsAsc.length - 1, 1);

  const cells: CellData[][] = Array.from({ length: rowCount }, () =>
    Array.from({ length: colCount }, () => ({
      text: "",
      bold: false,
      italic: false,
      underline: false,
      fontSize: 11,
      fontFamily: "Calibri",
      fontColor: "FF000000",
      hAlign: "left" as const,
      vAlign: "middle" as const,
    })),
  );

  const buckets: Glyph[][][] = Array.from({ length: rowCount }, () =>
    Array.from({ length: colCount }, () => [] as Glyph[]),
  );

  for (const glyph of glyphs) {
    const centerX = glyph.x + Math.max(glyph.width / 2, 1);
    const centerY = glyph.y;
    const colIndex = findIntervalIndex(colsAsc, centerX);
    const rowIndexFromBottom = findIntervalIndex(rowsAsc, centerY);
    const rowIndex = rowCount - 1 - rowIndexFromBottom;

    if (rowIndex >= 0 && rowIndex < rowCount && colIndex >= 0 && colIndex < colCount) {
      buckets[rowIndex][colIndex].push(glyph);
    }
  }

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const glyphBucket = buckets[r][c].sort((a, b) => b.y - a.y || a.x - b.x);
      if (!glyphBucket.length) continue;

      const groupedLines = clusterNumbers(glyphBucket.map((g) => g.y), Math.max(median(glyphBucket.map((g) => g.height)) * 0.65, 4)).sort((a, b) => b - a);
      const lines = groupedLines.map(() => [] as Glyph[]);

      for (const glyph of glyphBucket) {
        const lineIndex = nearestIndex(groupedLines, glyph.y);
        lines[lineIndex].push(glyph);
      }

      const lineTexts = lines
        .map((line) => line.sort((a, b) => a.x - b.x).map((g) => g.text).join(" "))
        .map(normalizeText)
        .filter(Boolean);

      const fontSize = median(glyphBucket.map((g) => g.fontSize)) || 11;
      const fontFamily = glyphBucket[0]?.fontFamily || "Calibri";
      const bold = glyphBucket.some((g) => g.bold) || lineTexts.some((t) => looksLikeSectionHeader(t));
      const italic = glyphBucket.some((g) => g.italic);
      const underline = glyphBucket.some((g) => g.underline);

      // Determine dominant font color (most common non-black, or most common overall)
      const colorCounts = new Map<string, number>();
      for (const g of glyphBucket) {
        colorCounts.set(g.color, (colorCounts.get(g.color) ?? 0) + 1);
      }
      let dominantColor = "FF000000";
      let maxCount = 0;
      for (const [color, count] of colorCounts) {
        if (count > maxCount) {
          maxCount = count;
          dominantColor = color;
        }
      }

      // Detect horizontal alignment based on actual text position in cell
      const cellText = normalizeMultilineValue(lineTexts.join("\n"));
      const colLeft = colsAsc[c];
      const colRight = colsAsc[c + 1] ?? colLeft + 60;
      const colWidth = colRight - colLeft;

      // Calculate actual text bounds within the cell
      const textMinX = Math.min(...glyphBucket.map((g) => g.x));
      const textMaxX = Math.max(...glyphBucket.map((g) => g.x + g.width));
      const textWidth = textMaxX - textMinX;

      // Determine alignment from actual position
      let hAlign: "left" | "center" | "right" = "left";
      if (colWidth > 10 && textWidth > 0) {
        const leftGap = textMinX - colLeft;
        const rightGap = colRight - textMaxX;
        const gapRatio = colWidth > 0 ? Math.min(leftGap, rightGap) / colWidth : 0;

        if (Math.abs(leftGap - rightGap) < colWidth * 0.15 && gapRatio > 0.05) {
          // Text is roughly centered — both gaps similar
          hAlign = "center";
        } else if (rightGap < leftGap * 0.5 && leftGap > colWidth * 0.2) {
          // Much more gap on left → right-aligned
          hAlign = "right";
        } else {
          // Default = left
          hAlign = "left";
        }
      }
      // Override for specific content types
      if (isWeekday(cellText) || looksLikeDate(cellText) || looksLikeTiming(cellText)) {
        hAlign = "center";
      }

      cells[r][c] = {
        text: cellText,
        bold,
        italic,
        underline,
        fontSize: clamp(fontSize, 8, 18),
        fontFamily,
        fontColor: dominantColor,
        hAlign,
        vAlign: "middle",
      };
    }
  }

  applyDetectedFills(cells, colsAsc, rows, rendered);

  // ── Collapse empty columns ───────────────────────────────────────────────
  // Remove leading/trailing columns that have no text AND no fill
  const hasContent = (ci: number) =>
    cells.some((row) => {
      const c = row[ci];
      return (c?.text?.trim().length ?? 0) > 0 || (c?.fillArgb && !isNearWhite(parseArgb(c.fillArgb), 20));
    });

  let firstCol = 0;
  while (firstCol < colCount - 1 && !hasContent(firstCol)) firstCol++;
  let lastCol = colCount - 1;
  while (lastCol > firstCol && !hasContent(lastCol)) lastCol--;

  if (firstCol > 0 || lastCol < colCount - 1) {
    const trimmedCols = colsAsc.slice(firstCol, lastCol + 2); // +2 because boundaries
    const trimmedCells = cells.map((row) => row.slice(firstCol, lastCol + 1));
    const merges = inferMerges(trimmedCells, trimmedCols, rows);
    return { rows, cols: trimmedCols, cells: trimmedCells, merges, images: [] };
  }

  const merges = inferMerges(cells, colsAsc, rows);
  return { rows, cols: colsAsc, cells, merges, images: [] };
}

function applyDetectedFills(cells: CellData[][], colsAsc: number[], rowsDesc: number[], rendered: RenderedPage) {
  const rowCount = cells.length;
  const colCount = cells[0]?.length ?? 0;
  const pH = rendered.height; // pixel height of the rendered image

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      // PDF x → pixel x (same direction)
      const left = colsAsc[c] * 2;
      const right = (colsAsc[c + 1] ?? colsAsc[c] + 30) * 2;

      // PDF y → pixel y (FLIP: pixel_y = renderedHeight - pdfY * scale)
      // rowsDesc is sorted descending, so rowsDesc[r] > rowsDesc[r+1]
      const pixTop = pH - rowsDesc[r] * 2;                     // large pdfY → small pixelY
      const pixBot = pH - (rowsDesc[r + 1] ?? 0) * 2;          // small pdfY → large pixelY

      const padX = Math.max(2, (right - left) * 0.12);
      const padY = Math.max(2, (pixBot - pixTop) * 0.12);

      const rgb = sampleRectColor(
        rendered.pixels,
        rendered.width,
        rendered.height,
        left + padX,
        pixTop + padY,
        right - padX,
        pixBot - padY,
      );

      if (!isNearWhite(rgb, 16)) {
        cells[r][c].fillArgb = rgbToArgb(rgb[0], rgb[1], rgb[2]);

        // Bold hint for prominently coloured cells that have text
        if (cells[r][c].text && darknessOf(rgb) > 70 && !isNearGray(rgb)) {
          cells[r][c].bold = true;
        }
      }
    }
  }

  // Detect header row and apply bold for cells that the pixel detector missed
  const headerRowIndex = detectSectionHeaderRow(cells);
  if (headerRowIndex >= 0) {
    for (let c = 0; c < colCount; c++) {
      if (cells[headerRowIndex][c].text) {
        cells[headerRowIndex][c].bold = true;
      }
    }
  }
}

function detectSectionHeaderRow(cells: CellData[][]): number {
  for (let r = 0; r < Math.min(cells.length, 6); r++) {
    const values = cells[r].map((c) => c.text).filter(Boolean);
    if (!values.length) continue;

    const score = values.filter((v) => looksLikeSectionHeader(v) || isMostlyUppercase(v)).length;
    if (values.length >= 4 && score >= Math.ceil(values.length * 0.5)) {
      return r;
    }
  }
  return -1;
}

function inferMerges(cells: CellData[][], colsAsc: number[], rowsDesc: number[]): MergeRange[] {
  const merges: MergeRange[] = [];
  const rowCount = cells.length;
  const colCount = cells[0]?.length ?? 0;

  // Title row merge: merge across columns that contain title text
  if (rowCount > 0) {
    const filled = cells[0].map((c, i) => ({ text: c.text, i })).filter((c) => c.text);
    const titleText = filled.map((c) => c.text).join(" ");
    if (filled.length >= 2 && titleText.length > 20) {
      const leftIdx = filled[0].i;
      const rightIdx = filled[filled.length - 1].i;
      const mergeLeft = leftIdx + 1;
      const mergeRight = Math.min(rightIdx + 1, colCount);
      if (mergeRight > mergeLeft) {
        merges.push({ top: 1, left: mergeLeft, bottom: 1, right: mergeRight });
        cells[0][leftIdx].text = normalizeText(titleText);
        for (const f of filled.slice(1)) cells[0][f.i].text = "";
        cells[0][leftIdx].bold = true;
        cells[0][leftIdx].fontSize = 13;
        cells[0][leftIdx].hAlign = "center";
      }
    }
  }

  // Merge weekday/date in first column
  for (let r = 0; r < rowCount - 1; r++) {
    const first = cells[r][0]?.text ?? "";
    const next = cells[r + 1][0]?.text ?? "";
    if (isWeekday(first) && looksLikeDate(next)) {
      merges.push({ top: r + 1, left: 1, bottom: r + 2, right: 1 });
      cells[r][0].text = `${first}\n${next}`;
      cells[r + 1][0].text = "";
      cells[r][0].bold = true;
    }
  }

  // Merge repeated empty-looking title/logo region on left top if header row starts after col 2
  if (rowCount > 1 && colCount > 2) {
    const headerRow = detectSectionHeaderRow(cells);
    if (headerRow >= 1 && !cells[1][0].text && !cells[1][1].text) {
      merges.push({ top: 2, left: 1, bottom: 2, right: 2 });
    }
  }

  // Horizontal merges for single centered long cell
  for (let r = 1; r < rowCount; r++) {
    const nonEmpty = cells[r].map((cell, idx) => ({ idx, text: cell.text })).filter((x) => x.text);
    if (nonEmpty.length === 1 && nonEmpty[0].text.length > 20) {
      const idx = nonEmpty[0].idx + 1;
      const left = Math.max(1, idx - 1);
      const right = Math.min(colCount, idx + 1);
      if (right > left) {
        merges.push({ top: r + 1, left, bottom: r + 1, right });
      }
    }
  }

  // Deduplicate invalid/overlapping exact duplicates
  const seen = new Set<string>();
  return merges.filter((merge) => {
    const key = `${merge.top}:${merge.left}:${merge.bottom}:${merge.right}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return merge.bottom >= merge.top && merge.right >= merge.left;
  });
}

// Logo extraction removed – embedding full-page images caused broken-link errors
// and made the spreadsheet non-editable.

/** Check if a fill colour is dark enough to need white text on top. */
function needsLightFont(argb: string | undefined): boolean {
  if (!argb || argb.length < 8) return false;
  const r = parseInt(argb.slice(2, 4), 16);
  const g = parseInt(argb.slice(4, 6), 16);
  const b = parseInt(argb.slice(6, 8), 16);
  // Perceived brightness – 128 is roughly the midpoint.
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

function applyWorksheetStyles(
  worksheet: import("exceljs").Worksheet,
  grid: GridModel,
  workbook: import("exceljs").Workbook,
) {
  const rowCount = grid.cells.length;
  const colCount = grid.cells[0]?.length ?? 0;

  // ── Rows & Cells ──────────────────────────────────────────────────────────
  for (let r = 0; r < rowCount; r++) {
    const excelRow = worksheet.getRow(r + 1);
    const pdfTop = grid.rows[r];
    const pdfBottom = grid.rows[r + 1] ?? 0;
    const rowHeightPx = Math.max(pdfTop - pdfBottom, 12);

    // Count line-breaks in this row to determine if we need taller rows
    const maxLines = grid.cells[r].reduce((mx, cd) => {
      const nl = (cd.text.match(/\n/g) || []).length + 1;
      return Math.max(mx, nl);
    }, 1);
    const baseHeight = rowHeightPx * 0.55;
    excelRow.height = clamp(Math.max(baseHeight, maxLines * 13), 15, 48);

    for (let c = 0; c < colCount; c++) {
      const cd = grid.cells[r][c];
      if (!cd) continue;
      const cell = excelRow.getCell(c + 1);

      try {
        cell.value = cd.text || "";

        // Validate ARGB: must be exactly 8 hex chars
        const validArgb = (v: string | undefined): string | undefined =>
          v && /^[0-9A-Fa-f]{8}$/.test(v) ? v : undefined;

        // Use extracted font colour; override with white if background is very dark
        const rawFontArgb = needsLightFont(cd.fillArgb) ? "FFFFFFFF" : cd.fontColor;
        const fontArgb = validArgb(rawFontArgb) ?? "FF111111";

        const fontName = /times/i.test(cd.fontFamily) ? "Times New Roman"
            : /arial/i.test(cd.fontFamily) ? "Arial"
            : /georgia/i.test(cd.fontFamily) ? "Georgia"
            : /courier|mono/i.test(cd.fontFamily) ? "Courier New"
            : /verdana/i.test(cd.fontFamily) ? "Verdana"
            : /tahoma/i.test(cd.fontFamily) ? "Tahoma"
            : /helvetica/i.test(cd.fontFamily) ? "Arial"
            : "Calibri";

        const fontObj: Record<string, unknown> = {
          name: fontName,
          size: clamp(Math.round(cd.fontSize), 8, 18),
          bold: cd.bold || undefined,
          italic: cd.italic || undefined,
          color: { argb: fontArgb },
        };
        if (cd.underline) fontObj.underline = true;
        cell.font = fontObj as any;

        cell.alignment = {
          horizontal: cd.hAlign ?? "left",
          vertical: "middle",
          wrapText: true,
        };

        // Use darker borders for coloured cells, lighter for plain
        const borderArgb = cd.fillArgb ? "FF909090" : "FFDCDCDC";
        cell.border = {
          top: { style: "thin", color: { argb: borderArgb } },
          left: { style: "thin", color: { argb: borderArgb } },
          bottom: { style: "thin", color: { argb: borderArgb } },
          right: { style: "thin", color: { argb: borderArgb } },
        };

        const safeFill = validArgb(cd.fillArgb);
        if (safeFill) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: safeFill },
          };
        }
      } catch {
        // Skip styling for problematic cells — content is still set
      }
    }
  }

  // ── Column widths ─────────────────────────────────────────────────────────
  const totalPdfWidth = (grid.cols[grid.cols.length - 1] ?? 600) - (grid.cols[0] ?? 0);
  const targetSheetChars = Math.max(colCount * 18, 180); // adapt to column count

  for (let c = 0; c < colCount; c++) {
    const left = grid.cols[c];
    const right = grid.cols[c + 1] ?? grid.cols[c] + 60;
    const pdfWidth = Math.max(right - left, 12);
    const proportional = (pdfWidth / Math.max(totalPdfWidth, 1)) * targetSheetChars;

    // Measure the longest single line of text in this column
    let maxTextLen = 0;
    let hasMultiline = false;
    for (let r = 0; r < rowCount; r++) {
      const txt = grid.cells[r][c]?.text ?? "";
      const lines = txt.split("\n");
      if (lines.length > 1) hasMultiline = true;
      for (const line of lines) {
        maxTextLen = Math.max(maxTextLen, line.length);
      }
    }
    // For multiline cells, favour proportional width. For single-line, ensure text fits.
    const textWidth = maxTextLen * 1.05 + 2;
    const chosen = hasMultiline
      ? Math.max(proportional, Math.min(textWidth, proportional * 1.3))
      : Math.max(proportional, textWidth);

    worksheet.getColumn(c + 1).width = clamp(chosen, 7, 50);
  }

  // ── Merges ────────────────────────────────────────────────────────────────
  for (const merge of grid.merges) {
    try {
      worksheet.mergeCells(merge.top, merge.left, merge.bottom, merge.right);
    } catch {
      // ignore conflicting merges
    }
  }

  // ── Images ────────────────────────────────────────────────────────────────
  for (const img of grid.images) {
    try {
      const imgId = workbook.addImage({ base64: uint8ToBase64(img.png), extension: "png" });

      // Find which grid cell the image centre falls into (PDF coordinates)
      const imgCenterX = img.x + img.width / 2;
      const imgCenterY = img.y; // bottom-left y in PDF space
      const ci = findIntervalIndex(grid.cols, imgCenterX);

      // rows are sorted descending. Find the visual row where imgCenterY fits.
      let ri = 0;
      for (let i = 0; i < grid.rows.length - 1; i++) {
        const rowTop = grid.rows[i];
        const rowBot = grid.rows[i + 1] ?? 0;
        if (imgCenterY <= rowTop && imgCenterY >= rowBot) {
          ri = i;
          break;
        }
      }

      // Scale image span based on how many columns / rows it covers
      const avgColW = totalPdfWidth / Math.max(colCount, 1);
      const avgRowH = (grid.rows[0] - (grid.rows[grid.rows.length - 1] ?? 0)) / Math.max(rowCount, 1);
      const spanCols = clamp(Math.round(img.width / Math.max(avgColW, 20)), 1, 3);
      const spanRows = clamp(Math.round(img.height / Math.max(avgRowH, 15)), 1, 4);

      worksheet.addImage(imgId, {
        tl: { col: ci + 0.1, row: ri + 0.1 } as any,
        br: { col: Math.min(ci + spanCols, colCount) - 0.1, row: Math.min(ri + spanRows, rowCount) - 0.1 } as any,
        editAs: "oneCell",
      });
    } catch {
      // Skip if image insertion fails
    }
  }

  // ── Freeze panes ──────────────────────────────────────────────────────────
  const headerRow = detectSectionHeaderRow(grid.cells);
  if (headerRow >= 0) {
    worksheet.views = [{
      state: "frozen",
      xSplit: 1,
      ySplit: Math.min(headerRow + 1, 3),
      showGridLines: true,
    }];
  } else {
    worksheet.views = [{ showGridLines: true }];
  }

  worksheet.properties.defaultRowHeight = 18;
}

async function runConversion(
  pdfBytes: Uint8Array,
  signal?: AbortSignal,
  onProgress?: (fraction: number, note: string) => void,
): Promise<Uint8Array> {
  const [pdfjs, ExcelJSImport] = await Promise.all([getPdfjs(), import("exceljs")]);

  const ExcelJS =
    (ExcelJSImport as { default?: typeof import("exceljs") }).default ?? ExcelJSImport;

  const loadingTask = pdfjs.getDocument(pdfDocumentOptions(pdfBytes));

  const pdfDocument: PdfDocumentProxy = await loadingTask.promise;

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ToolMint";
    workbook.created = new Date();
    workbook.modified = new Date();

    const OPS = (pdfjs as any).OPS ?? (pdfjs as any).default?.OPS ?? {} as Record<string, number>;

    const totalPages = pdfDocument.numPages;
    // A scanned page is a photograph of paper: it has no text layer, so there
    // is nothing to put in a cell. Rather than hand back an empty workbook,
    // we count glyphs and refuse with an explanation. See the no-text-layer
    // branch after the loop.
    let totalGlyphs = 0;
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      if (signal?.aborted) throw new ExcelError("cancelled", "Conversion cancelled.");
      onProgress?.((pageNumber - 1) / totalPages, `Reading page ${pageNumber} of ${totalPages}`);
      // Yield so the progress paints and cancel is observable.
      await new Promise((r) => setTimeout(r, 0));
      const page = await pdfDocument.getPage(pageNumber);
      const rendered = await renderPage(page, 2);
      const glyphs = await extractGlyphs(page, OPS);
      totalGlyphs += glyphs.length;
      const grid = buildGridModel(glyphs, rendered);

      // Extract embedded images (logos, graphics) from the PDF page
      try {
        const images = await extractPageImages(page, rendered, OPS);
        grid.images = images;
      } catch {
        // Image extraction is best-effort
      }

      const worksheet = workbook.addWorksheet(`Page ${pageNumber}`);
      applyWorksheetStyles(worksheet, grid, workbook);
    }

    if (totalGlyphs === 0) {
      throw new ExcelError(
        "no-text-layer",
        "This PDF has no text in it — it looks like a scan or a set of images. There is nothing to put into spreadsheet cells. Run it through PDF to Text (OCR) first, then convert the result.",
      );
    }

    onProgress?.(0.95, "Building spreadsheet");
    const output = await workbook.xlsx.writeBuffer();
    return new Uint8Array(output as ArrayBuffer);
  } finally {
    await pdfDocument.destroy().catch(() => undefined);
  }
}



/** Maps pdf-lib/pdf.js load failures onto codes the UI can explain. */
function classifyLoadError(err: unknown): ExcelError {
  const msg = err instanceof Error ? err.message : String(err);
  if (/password|encrypted/i.test(msg)) {
    return new ExcelError(
      "encrypted",
      "This PDF is password-protected. Remove the password with Unlock PDF first, then convert it.",
    );
  }
  if (/Invalid PDF|InvalidPDFException|structure/i.test(msg)) {
    return new ExcelError("corrupt", "This file could not be read as a PDF. It may be damaged or incomplete.");
  }
  return new ExcelError("unknown", "This PDF could not be opened.");
}

export async function convertPdfToExcel(
  input: ArrayBuffer,
  { signal, onProgress }: ExcelOptions = {},
): Promise<ExcelResult> {
  const started = performance.now();
  const originalSize = input.byteLength;

  onProgress?.(0.02, "Opening document");
  if (signal?.aborted) throw new ExcelError("cancelled", "Conversion cancelled.");

  let bytes: Uint8Array;
  let pageCount = 0;
  try {
    const result = await runConversionWithMeta(new Uint8Array(input), signal, onProgress);
    bytes = result.bytes;
    pageCount = result.pageCount;
  } catch (err) {
    if (err instanceof ExcelError) throw err;
    throw classifyLoadError(err);
  }

  onProgress?.(1, "Done");
  return {
    bytes,
    originalSize,
    outputSize: bytes.byteLength,
    pageCount,
    durationMs: Math.round(performance.now() - started),
  };
}

/** Thin wrapper so the caller also learns the page count. */
async function runConversionWithMeta(
  pdfBytes: Uint8Array,
  signal?: AbortSignal,
  onProgress?: (fraction: number, note: string) => void,
): Promise<{ bytes: Uint8Array; pageCount: number }> {
  const pdfjs = await getPdfjs();
  const probe = await (pdfjs as unknown as {
    getDocument: (o: unknown) => { promise: Promise<{ numPages: number; destroy: () => Promise<void> }> };
  }).getDocument(pdfDocumentOptions(pdfBytes.slice(0))).promise;
  const pageCount = probe.numPages;
  await probe.destroy().catch(() => undefined);

  const bytes = await runConversion(pdfBytes, signal, onProgress);
  return { bytes, pageCount };
}
