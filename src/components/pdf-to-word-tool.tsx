"use client";

import { useCallback, useRef, useState } from "react";
import JSZip from "jszip";
import {
  downloadBlob,
  formatBytes,
  sanitizeBaseName,
} from "@/lib/client-pdf-utils";

/* ── Constants ─────────────────────────────────────────── */

const MAX_FILES = 25;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const CANVAS_SCALE = 2; // render scale for image extraction (144 DPI)

/* ── pdfjs types ───────────────────────────────────────── */

type PdfJsOPS = Record<string, number>;
type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (opts: { data: Uint8Array }) => { promise: Promise<PdfJsDocument> };
  OPS: PdfJsOPS;
};
type PdfJsDocument = {
  numPages: number;
  getPage: (n: number) => Promise<PdfJsPage>;
};
type PdfJsViewport = { width: number; height: number };
type PdfJsOperatorList = { fnArray: number[]; argsArray: unknown[][] };
type PdfJsPage = {
  getTextContent: () => Promise<PdfJsTextContent>;
  getViewport: (p: { scale: number }) => PdfJsViewport;
  getOperatorList: () => Promise<PdfJsOperatorList>;
  getAnnotations: () => Promise<PdfJsAnnotation[]>;
  render: (p: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfJsViewport;
  }) => { promise: Promise<void> };
};
type PdfJsAnnotation = {
  subtype?: string;
  url?: string;
  rect?: number[];
};
type PdfJsTextItem = {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName?: string;
  hasEOL?: boolean;
};
type PdfJsTextContent = {
  items: Array<PdfJsTextItem | { str?: string }>;
  styles?: Record<string, { fontFamily: string; ascent?: number; descent?: number }>;
};

/* ── App types ─────────────────────────────────────────── */

type QueuedPdf = { id: string; file: File };
type ConvertedDoc = { fileName: string; blob: Blob };
type ConversionResult = { files: ConvertedDoc[]; zipBlob: Blob | null };

type ExtractedItem = {
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  color: string; // hex e.g. "#000000"
  underline?: boolean;
};

type ExtractedImage = {
  data: ArrayBuffer;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "png" | "jpg";
};

type TableCell = { runs: RunData[] };
type TableData = { rows: TableCell[][]; colWidths: number[] };

type TextLine = { y: number; fontSize: number; items: ExtractedItem[] };
type RunData = {
  text: string;
  bold: boolean;
  italic: boolean;
  fontSize: number;
  fontFamily: string;
  color: string;
  underline?: boolean;
};
type ParagraphData = {
  runs: RunData[];
  alignment: "left" | "center" | "right";
  fontSize: number;
  isHeading: boolean;
  spacingAfter: number;
  indent?: number;
  isBullet?: boolean;
  bulletLevel?: number;
};
type PageData = {
  width: number;
  height: number;
  paragraphs: ParagraphData[];
  tables: TableData[];
  images: ExtractedImage[];
  /** JPEG bytes for pages with no extractable text */
  imageBytes?: ArrayBuffer;
};

/* ── pdfjs loader (vendor) ─────────────────────────────── */

let pdfjsPromise: Promise<PdfJsModule> | null = null;
async function getPdfjs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    const importPdfjs = new Function("moduleUrl", "return import(moduleUrl);") as (
      url: string,
    ) => Promise<PdfJsModule>;
    pdfjsPromise = importPdfjs("/vendor/pdfjs/pdf.mjs").then((mod: PdfJsModule) => {
      if (!mod.GlobalWorkerOptions.workerSrc) {
        mod.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
      }
      return mod;
    });
  }
  return pdfjsPromise;
}

/* ── Helpers ───────────────────────────────────────────── */

let idCounter = 0;
function uid(): string {
  return `pdf_${++idCounter}_${Date.now()}`;
}

function isBoldFont(name: string): boolean {
  return /bold|heavy|black|demi(?!light)|semibold|extrabold|ultrabold/i.test(name);
}
function isItalicFont(name: string): boolean {
  return /italic|oblique|slanted/i.test(name);
}
function cleanFontFamily(raw: string): string {
  if (/^g_d\d+_f\d+/i.test(raw) || !raw) return "Calibri";
  return (
    raw
      .replace(/^[A-Z]{6}\+/, "")
      .replace(/[,-]?(Bold|Italic|Regular|Medium|Light|Oblique|BoldItalic)/gi, "")
      .trim() || "Calibri"
  );
}
function avg(nums: number[]): number {
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}
function medianGap(lines: TextLine[]): number {
  if (lines.length < 2) return 14;
  const gaps: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    const g = lines[i].y - lines[i - 1].y;
    if (g > 0) gaps.push(g);
  }
  if (!gaps.length) return 14;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
}
function mode(nums: number[]): number {
  const counts = new Map<number, number>();
  for (const n of nums) counts.set(n, (counts.get(n) ?? 0) + 1);
  let best = nums[0] ?? 0;
  let max = 0;
  for (const [v, c] of counts) {
    if (c > max) { max = c; best = v; }
  }
  return best;
}

/* ── Color helpers ─────────────────────────────────────── */

const VALID_HEX_RE = /^#[0-9a-fA-F]{6}$/;

function safeNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function rgbToHex(r: unknown, g: unknown, b: unknown): string {
  const h = (v: unknown) => {
    const n = safeNum(v);
    return Math.round(Math.min(1, Math.max(0, n)) * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${h(r)}${h(g)}${h(b)}`;
}
function grayToHex(g: unknown): string {
  return rgbToHex(g, g, g);
}
function cmykToHex(c: unknown, m: unknown, y: unknown, k: unknown): string {
  const cn = safeNum(c), mn = safeNum(m), yn = safeNum(y), kn = safeNum(k);
  return rgbToHex((1 - cn) * (1 - kn), (1 - mn) * (1 - kn), (1 - yn) * (1 - kn));
}

function sanitizeHex(hex: string): string | undefined {
  if (!hex || hex === "#000000") return undefined;
  if (VALID_HEX_RE.test(hex)) return hex.replace("#", "");
  return undefined;
}

/* ── Color extraction from operator list ───────────────── */

function extractColorMap(opList: PdfJsOperatorList, OPS: PdfJsOPS): string[] {
  const colors: string[] = [];
  let curFill = "#000000";
  const stack: string[] = [];

  for (let i = 0; i < opList.fnArray.length; i++) {
    const fn = opList.fnArray[i];
    const a = opList.argsArray[i];
    switch (fn) {
      case OPS.save:
        stack.push(curFill);
        break;
      case OPS.restore:
        if (stack.length) curFill = stack.pop()!;
        break;
      case OPS.setFillRGBColor:
        curFill = rgbToHex(a[0], a[1], a[2]);
        break;
      case OPS.setFillGray:
        curFill = grayToHex(a[0]);
        break;
      case OPS.setFillCMYKColor:
        curFill = cmykToHex(a[0], a[1], a[2], a[3]);
        break;
      case OPS.setFillColor:
      case OPS.setFillColorN:
        // Generic color set — try to read as RGB if 3+ args
        if (a.length >= 3) curFill = rgbToHex(a[0], a[1], a[2]);
        else if (a.length >= 1) curFill = grayToHex(a[0]);
        break;
      case OPS.showText:
      case OPS.showSpacedText:
      case OPS.nextLineShowText:
      case OPS.nextLineSetSpacingShowText:
        colors.push(curFill);
        break;
    }
  }
  return colors;
}

function applyColorsToItems(items: ExtractedItem[], colorMap: string[]): void {
  if (!colorMap.length) return;
  // Sequential distribution: assign colors to items in order.
  // Each color corresponds to roughly one text operation which
  // may map to one or more text items.  Use a heuristic: walk
  // both lists, advancing the color index more slowly.
  let ci = 0;
  for (let i = 0; i < items.length; i++) {
    items[i].color = colorMap[Math.min(ci, colorMap.length - 1)];
    // Advance color index roughly proportionally
    ci = Math.min(
      colorMap.length - 1,
      Math.round(((i + 1) / items.length) * colorMap.length),
    );
  }
}

/* ── Image extraction from operator list + canvas ──────── */

type Matrix6 = [number, number, number, number, number, number];
const IDENTITY: Matrix6 = [1, 0, 0, 1, 0, 0];

function mulMat(a: Matrix6, b: Matrix6): Matrix6 {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

type ImgRegion = { x: number; y: number; width: number; height: number };

function findImageRegions(
  opList: PdfJsOperatorList,
  OPS: PdfJsOPS,
  pageHeight: number,
): ImgRegion[] {
  const regions: ImgRegion[] = [];
  let ctm: Matrix6 = [...IDENTITY];
  const stack: Matrix6[] = [];

  for (let i = 0; i < opList.fnArray.length; i++) {
    const fn = opList.fnArray[i];
    const a = opList.argsArray[i];
    switch (fn) {
      case OPS.save:
        stack.push([...ctm] as Matrix6);
        break;
      case OPS.restore:
        if (stack.length) ctm = stack.pop()!;
        break;
      case OPS.transform: {
        if (Array.isArray(a) && a.length >= 6 && a.every((v) => typeof v === "number" && Number.isFinite(v))) {
          ctm = mulMat(ctm, a as unknown as Matrix6);
        }
        break;
      }
      case OPS.paintImageXObject:
      case OPS.paintImageMaskXObject:
      case OPS.paintInlineImageXObject: {
        const w = Math.abs(ctm[0]);
        const h = Math.abs(ctm[3]);
        const x = ctm[4];
        const y = ctm[5];
        // Skip tiny decorative images (< 15pt)
        if (w > 15 && h > 15) {
          regions.push({
            x,
            y: pageHeight - y, // convert PDF bottom-origin to top-origin
            width: w,
            height: h,
          });
        }
        break;
      }
    }
  }
  return regions;
}

async function cropImagesFromCanvas(
  canvas: HTMLCanvasElement,
  regions: ImgRegion[],
  viewport: PdfJsViewport,
): Promise<ExtractedImage[]> {
  const images: ExtractedImage[] = [];
  for (const r of regions) {
    const sx = (r.x / viewport.width) * canvas.width;
    const sy = (r.y / viewport.height) * canvas.height;
    const sw = (r.width / viewport.width) * canvas.width;
    const sh = (r.height / viewport.height) * canvas.height;
    if (!Number.isFinite(sw) || !Number.isFinite(sh) || sw < 5 || sh < 5) continue;
    if (!Number.isFinite(sx) || !Number.isFinite(sy)) continue;

    const crop = document.createElement("canvas");
    crop.width = Math.round(sw);
    crop.height = Math.round(sh);
    const cctx = crop.getContext("2d")!;
    cctx.drawImage(canvas, Math.round(sx), Math.round(sy), Math.round(sw), Math.round(sh), 0, 0, crop.width, crop.height);

    const blob: Blob = await new Promise((res) => crop.toBlob((b) => res(b!), "image/png"));
    images.push({
      data: await blob.arrayBuffer(),
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      type: "png",
    });
  }
  return images;
}

/* ── Underline detection from operator list ────────────── */

type DrawnLine = { x: number; y: number; w: number; h: number };

function findUnderlines(
  opList: PdfJsOperatorList,
  OPS: PdfJsOPS,
  pageHeight: number,
): DrawnLine[] {
  const lines: DrawnLine[] = [];
  let ctm: Matrix6 = [...IDENTITY];
  const stack: Matrix6[] = [];

  for (let i = 0; i < opList.fnArray.length; i++) {
    const fn = opList.fnArray[i];
    const a = opList.argsArray[i];
    switch (fn) {
      case OPS.save:
        stack.push([...ctm] as Matrix6);
        break;
      case OPS.restore:
        if (stack.length) ctm = stack.pop()!;
        break;
      case OPS.transform: {
        if (Array.isArray(a) && a.length >= 6 && a.every((v) => typeof v === "number" && Number.isFinite(v))) {
          ctm = mulMat(ctm, a as unknown as Matrix6);
        }
        break;
      }
      case OPS.constructPath: {
        // constructPath args: [ops[], [numbers...], minMax]
        const ops = a[0];
        const coords = a[1];
        if (!Array.isArray(ops) && !(ops && typeof ops === "object" && Symbol.iterator in (ops as object))) break;
        if (!Array.isArray(coords)) break;
        // Look for rectangle operations (op 19 = OPS.rectangle)
        let ci = 0;
        for (const op of ops as Iterable<number>) {
          if (op === 19 && ci + 3 < coords.length) {
            // rectangle(x, y, w, h)
            const rx = coords[ci];
            const ry = coords[ci + 1];
            const rw = coords[ci + 2];
            const rh = coords[ci + 3];
            // Thin horizontal rect → likely underline / strikethrough / border
            if (Math.abs(rh) < 3 && Math.abs(rw) > 10) {
              // Transform to page coords
              const px = ctm[0] * rx + ctm[2] * ry + ctm[4];
              const py = ctm[1] * rx + ctm[3] * ry + ctm[5];
              const pw = Math.abs(ctm[0] * rw);
              lines.push({ x: px, y: pageHeight - py, w: pw, h: Math.abs(rh) });
            }
            ci += 4;
          } else if (op === 13) {
            ci += 2; // moveTo
          } else if (op === 14) {
            ci += 2; // lineTo
          } else if (op === 15) {
            ci += 6; // curveTo
          } else if (op === 16 || op === 17) {
            ci += 4; // curveTo2/3
          } else if (op === 18) {
            // closePath – no coords
          } else {
            ci += 2; // fallback
          }
        }
        break;
      }
    }
  }
  return lines;
}

function markUnderlinedItems(items: ExtractedItem[], underlines: DrawnLine[]): void {
  // For each underline, find text items directly above it
  for (const ul of underlines) {
    for (const item of items) {
      // Check horizontal overlap and vertical proximity
      const itemBottom = item.y + item.fontSize * 0.2; // approximate baseline offset
      const yClose = Math.abs(itemBottom - ul.y) < item.fontSize * 0.5;
      const xOverlap = item.x < ul.x + ul.w && item.x + item.width > ul.x;
      if (yClose && xOverlap) {
        (item as ExtractedItem & { underline?: boolean }).underline = true;
      }
    }
  }
}

/* ── Text extraction ───────────────────────────────────── */

function extractItems(tc: PdfJsTextContent, pageHeight: number): ExtractedItem[] {
  const items: ExtractedItem[] = [];
  const styles = tc.styles ?? {};
  for (const raw of tc.items) {
    if (!("str" in raw) || !raw.str) continue;
    const it = raw as PdfJsTextItem;
    if (!it.str.trim() && !it.str.includes(" ")) continue;
    const fontSize = Math.abs(it.transform[3]) || 12;
    const fontName = it.fontName ?? "";
    items.push({
      text: it.str,
      x: it.transform[4],
      y: pageHeight - it.transform[5],
      width: it.width || 0,
      fontSize,
      fontFamily: cleanFontFamily(styles[fontName]?.fontFamily ?? ""),
      bold: isBoldFont(fontName),
      italic: isItalicFont(fontName),
      color: "#000000",
    });
  }
  return items;
}

/* ── Table detection ───────────────────────────────────── */

function detectTables(
  items: ExtractedItem[],
  pageWidth: number,
): { tables: TableData[]; remainingItems: ExtractedItem[] } {
  if (items.length < 6) return { tables: [], remainingItems: items };

  // Group into Y-rows
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  type RowBucket = { y: number; items: ExtractedItem[] };
  const rows: RowBucket[] = [];
  let curRow: ExtractedItem[] = [sorted[0]];
  let curY = sorted[0].y;
  for (let i = 1; i < sorted.length; i++) {
    const it = sorted[i];
    if (Math.abs(it.y - curY) <= Math.max(it.fontSize * 0.5, 3)) {
      curRow.push(it);
    } else {
      rows.push({ y: curY, items: curRow.sort((a, b) => a.x - b.x) });
      curRow = [it];
      curY = it.y;
    }
  }
  rows.push({ y: curY, items: curRow.sort((a, b) => a.x - b.x) });

  // Find column breaks per row (gap > threshold)
  const GAP = 20;
  type ColInfo = { starts: number[]; count: number };
  function colInfo(row: RowBucket): ColInfo {
    if (row.items.length < 2) return { starts: [row.items[0]?.x ?? 0], count: 1 };
    const starts: number[] = [row.items[0].x];
    for (let j = 1; j < row.items.length; j++) {
      const prev = row.items[j - 1];
      if (row.items[j].x - (prev.x + prev.width) > GAP) {
        starts.push(row.items[j].x);
      }
    }
    return { starts, count: starts.length };
  }
  const rowCols = rows.map((r) => colInfo(r));

  // Find runs of ≥3 consecutive rows with same column count ≥2
  const allTableItems = new Set<ExtractedItem>();
  const tables: TableData[] = [];
  let rs = 0;
  while (rs < rows.length) {
    const cc = rowCols[rs].count;
    if (cc < 2) { rs++; continue; }
    let re = rs + 1;
    while (re < rows.length && rowCols[re].count === cc) re++;
    if (re - rs >= 3) {
      // Compute average column starts
      const colStarts: number[] = [];
      for (let c = 0; c < cc; c++) {
        let sum = 0;
        for (let r = rs; r < re; r++) sum += rowCols[r].starts[c];
        colStarts.push(sum / (re - rs));
      }
      const colBounds: [number, number][] = [];
      for (let c = 0; c < cc; c++) {
        colBounds.push([
          c === 0 ? 0 : (colStarts[c - 1] + colStarts[c]) / 2,
          c === cc - 1 ? pageWidth : (colStarts[c] + colStarts[c + 1]) / 2,
        ]);
      }
      const tRows: TableCell[][] = [];
      for (let r = rs; r < re; r++) {
        const cells: TableCell[] = [];
        for (let c = 0; c < cc; c++) {
          const [l, ri] = colBounds[c];
          const ci = rows[r].items.filter((it) => {
            const mid = it.x + it.width / 2;
            return mid >= l && mid < ri;
          });
          ci.forEach((it) => allTableItems.add(it));
          const runs: RunData[] = [];
          for (const it of ci) {
            const last = runs.length ? runs[runs.length - 1] : null;
            if (
              last &&
              last.bold === it.bold &&
              last.italic === it.italic &&
              Math.abs(last.fontSize - it.fontSize) < 0.5 &&
              last.color === it.color
            ) {
              last.text += " " + it.text;
            } else {
              runs.push({
                text: it.text,
                bold: it.bold,
                italic: it.italic,
                fontSize: it.fontSize,
                fontFamily: it.fontFamily,
                color: it.color,
              });
            }
          }
          if (!runs.length)
            runs.push({ text: "", bold: false, italic: false, fontSize: 10, fontFamily: "Calibri", color: "#000000" });
          cells.push({ runs });
        }
        tRows.push(cells);
      }
      tables.push({ rows: tRows, colWidths: colBounds.map(([l, r]) => r - l) });
      rs = re;
    } else {
      rs++;
    }
  }

  return { tables, remainingItems: items.filter((it) => !allTableItems.has(it)) };
}

/* ── Line grouping ─────────────────────────────────────── */

function groupIntoLines(items: ExtractedItem[]): TextLine[] {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: TextLine[] = [];
  let buf: ExtractedItem[] = [sorted[0]];
  let curY = sorted[0].y;

  for (let i = 1; i < sorted.length; i++) {
    const it = sorted[i];
    if (Math.abs(it.y - curY) <= Math.max(it.fontSize * 0.5, 3)) {
      buf.push(it);
    } else {
      buf.sort((a, b) => a.x - b.x);
      lines.push({ y: curY, fontSize: avg(buf.map((b) => b.fontSize)), items: buf });
      buf = [it];
      curY = it.y;
    }
  }
  buf.sort((a, b) => a.x - b.x);
  lines.push({ y: curY, fontSize: avg(buf.map((b) => b.fontSize)), items: buf });
  return lines;
}

/* ── Bullet / list detection ───────────────────────────── */

const BULLET_RE = /^[\u2022\u2023\u25CF\u25CB\u25A0\u25AA\u25B6\u25B8\u2013\u2014\u2043\u27A2•●○■▪►▸–—‣➢]\s*/;

function detectBullet(runs: RunData[]): { isBullet: boolean; cleaned: RunData[] } {
  if (!runs.length) return { isBullet: false, cleaned: runs };
  const firstText = runs[0].text;
  const bulletMatch = firstText.match(BULLET_RE);
  if (bulletMatch) {
    const cleaned = [...runs];
    cleaned[0] = { ...cleaned[0], text: firstText.slice(bulletMatch[0].length) };
    if (!cleaned[0].text && cleaned.length > 1) cleaned.shift();
    return { isBullet: true, cleaned };
  }
  return { isBullet: false, cleaned: runs };
}

/* ── Alignment detection ───────────────────────────────── */

function detectAlignment(line: TextLine, pageWidth: number): "left" | "center" | "right" {
  if (!line.items.length) return "left";
  const firstX = line.items[0].x;
  const lastIt = line.items[line.items.length - 1];
  const lastEnd = lastIt.x + lastIt.width;
  const lm = firstX;
  const rm = pageWidth - lastEnd;
  const tw = lastEnd - firstX;
  if (tw < pageWidth * 0.75 && Math.abs(lm - rm) < pageWidth * 0.08) return "center";
  if (lm > pageWidth * 0.45 && rm < pageWidth * 0.12) return "right";
  return "left";
}

/* ── Build runs from a single line ─────────────────────── */

function buildLineRuns(line: TextLine): RunData[] {
  const runs: RunData[] = [];
  for (let i = 0; i < line.items.length; i++) {
    const it = line.items[i];
    if (i > 0) {
      const prev = line.items[i - 1];
      const gap = it.x - (prev.x + prev.width);
      const avgCharW = prev.text.length > 0 ? prev.width / prev.text.length : it.fontSize * 0.5;
      const expectedSpace = Math.max(avgCharW * 0.6, it.fontSize * 0.15);
      const tabThreshold = Math.max(it.fontSize * 1.5, avgCharW * 4);
      if (gap > tabThreshold) {
        runs.push({ text: "\t", bold: false, italic: false, fontSize: it.fontSize, fontFamily: "Calibri", color: "#000000" });
      } else if (gap > expectedSpace) {
        runs.push({ text: " ", bold: false, italic: false, fontSize: it.fontSize, fontFamily: it.fontFamily, color: it.color });
      }
    }
    const last = runs.length ? runs[runs.length - 1] : null;
    if (
      last &&
      last.text !== "\t" &&
      last.bold === it.bold &&
      last.italic === it.italic &&
      Math.abs(last.fontSize - it.fontSize) < 0.5 &&
      last.fontFamily === it.fontFamily &&
      last.color === it.color &&
      (last.underline ?? false) === (it.underline ?? false)
    ) {
      last.text += it.text;
    } else {
      runs.push({
        text: it.text,
        bold: it.bold,
        italic: it.italic,
        fontSize: it.fontSize,
        fontFamily: it.fontFamily,
        color: it.color,
        underline: it.underline,
      });
    }
  }
  return runs;
}

/* ── Body font size (most-used) ────────────────────────── */

function bodyFontSize(lines: TextLine[]): number {
  const counts = new Map<number, number>();
  for (const l of lines) {
    const key = Math.round(l.fontSize * 2) / 2;
    counts.set(key, (counts.get(key) ?? 0) + l.items.reduce((n, it) => n + it.text.length, 0));
  }
  let best = 12;
  let max = 0;
  for (const [sz, c] of counts) {
    if (c > max) { max = c; best = sz; }
  }
  return best;
}

/* ── Paragraph grouping ────────────────────────────────── */

function groupIntoParagraphs(lines: TextLine[], pageWidth: number): ParagraphData[] {
  if (!lines.length) return [];
  const body = bodyFontSize(lines);
  const medGap = medianGap(lines);

  const leftXs = lines.filter((l) => l.items.length).map((l) => Math.round(l.items[0].x));
  const commonLeft = mode(leftXs);

  const paras: ParagraphData[] = [];
  let curRuns: RunData[] = [];
  let curFs = lines[0].fontSize;
  let curAlign: "left" | "center" | "right" = "left";
  let curIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const align = detectAlignment(line, pageWidth);
    const lineRuns = buildLineRuns(line);

    const lineLeftX = line.items.length ? line.items[0].x : 0;
    const indent = Math.max(0, Math.round(lineLeftX - commonLeft));

    if (i === 0) {
      curRuns = lineRuns;
      curFs = line.fontSize;
      curAlign = align;
      curIndent = indent;
      continue;
    }

    const prev = lines[i - 1];
    const gap = line.y - prev.y;
    const avgH = (prev.fontSize + line.fontSize) / 2;
    const ratio = gap / avgH;

    const normalizedGap = medGap > 0 ? gap / medGap : ratio;
    const fsChanged = Math.abs(line.fontSize - curFs) > 1.5;
    const bigGap = normalizedGap > 1.4 || ratio > 1.8;
    const alignChanged = align !== curAlign;
    const indentChanged = Math.abs(indent - curIndent) > 10;

    if (fsChanged || bigGap || alignChanged || indentChanged) {
      const { isBullet, cleaned } = detectBullet(curRuns);
      const isHead =
        curFs >= body * 1.2 ||
        (curFs >= body * 1.08 && cleaned.length > 0 && cleaned.every((r) => r.bold));
      paras.push({
        runs: cleaned,
        alignment: curAlign,
        fontSize: curFs,
        isHeading: isHead,
        spacingAfter: bigGap ? Math.min(Math.round(gap * 10), 300) : 60,
        indent: curIndent > 5 ? curIndent : undefined,
        isBullet,
        bulletLevel: isBullet && curIndent > 20 ? 1 : 0,
      });
      curRuns = lineRuns;
      curFs = line.fontSize;
      curAlign = align;
      curIndent = indent;
    } else {
      curRuns.push({ text: " ", bold: false, italic: false, fontSize: line.fontSize, fontFamily: "Calibri", color: curRuns[0]?.color ?? "#000000" });
      curRuns.push(...lineRuns);
    }
  }

  if (curRuns.length) {
    const { isBullet, cleaned } = detectBullet(curRuns);
    const isHead =
      curFs >= body * 1.2 ||
      (curFs >= body * 1.08 && cleaned.length > 0 && cleaned.every((r) => r.bold));
    paras.push({
      runs: cleaned,
      alignment: curAlign,
      fontSize: curFs,
      isHeading: isHead,
      spacingAfter: 60,
      indent: curIndent > 5 ? curIndent : undefined,
      isBullet,
      bulletLevel: isBullet && curIndent > 20 ? 1 : 0,
    });
  }
  return paras;
}

/* ── Render page as JPEG fallback (scanned / image PDFs) ─ */

async function renderPageAsImage(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.88),
  );
  return blob.arrayBuffer();
}

/* ── DOCX generation ───────────────────────────────────── */

async function buildDocx(pages: PageData[]): Promise<Blob> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    AlignmentType,
    HeadingLevel,
    SectionType,
    LevelFormat,
    Table,
    TableRow,
    TableCell: DocxTableCell,
    WidthType,
    BorderStyle,
    convertInchesToTwip,
  } = await import("docx");

  const alignMap = {
    left: AlignmentType.LEFT,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
  } as const;

  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: "CCCCCC",
  };

  const sections = pages.map((pg, pi) => {
    const wTwips = Math.round((pg.width / 72) * 1440);
    const hTwips = Math.round((pg.height / 72) * 1440);
    const margin = convertInchesToTwip(0.75);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const children: any[] = [];

    if (pg.imageBytes) {
      // Page rendered as image (no extractable text)
      const contentW = pg.width - 108;
      const contentH = pg.height - 108;
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: pg.imageBytes,
              transformation: {
                width: Math.round(contentW * (96 / 72)),
                height: Math.round(contentH * (96 / 72)),
              },
              type: "jpg",
            }),
          ],
        }),
      );
    } else {
      // ── Insert extracted embedded images at top of section ──
      const sortedImages = [...(pg.images || [])].sort((a, b) => a.y - b.y);
      let imgIdx = 0;

      const insertPendingImages = (beforeY: number) => {
        while (imgIdx < sortedImages.length && sortedImages[imgIdx].y <= beforeY) {
          const img = sortedImages[imgIdx];
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: img.data,
                  transformation: {
                    width: Math.round(img.width * (96 / 72)),
                    height: Math.round(img.height * (96 / 72)),
                  },
                  type: img.type,
                }),
              ],
              spacing: { after: 120 },
            }),
          );
          imgIdx++;
        }
      };

      // ── Insert detected tables ──
      for (const tbl of pg.tables) {
        const tableRows = tbl.rows.map(
          (row) => {
            const cells = row.map((cell, ci) => {
              const runs = cell.runs.map(
                (r) => {
                  return new TextRun({
                    text: r.text,
                    bold: r.bold,
                    italics: r.italic,
                    size: Math.round(r.fontSize * 2),
                    font: r.fontFamily,
                    color: sanitizeHex(r.color),
                  });
                },
              );
              return new DocxTableCell({
                children: [new Paragraph({ children: runs })],
                width: { size: Math.round(tbl.colWidths[ci] * 20), type: WidthType.DXA },
                borders: {
                  top: thinBorder,
                  bottom: thinBorder,
                  left: thinBorder,
                  right: thinBorder,
                },
              });
            });
            return new TableRow({ children: cells });
          },
        );

        children.push(
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        );
        children.push(new Paragraph({ spacing: { after: 120 } }));
      }

      // ── Insert paragraphs with images interspersed ──
      let approxY = 0;
      for (const para of pg.paragraphs) {
        approxY += (para.spacingAfter || 60) / 10 + para.fontSize;
        insertPendingImages(approxY);

        const runs = para.runs.map((r) => {
          return new TextRun({
            text: r.text,
            bold: r.bold,
            italics: r.italic,
            size: Math.round(r.fontSize * 2),
            font: r.fontFamily,
            color: sanitizeHex(r.color),
            underline: r.underline ? {} : undefined,
          });
        });

        let heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
        if (para.isHeading) {
          if (para.fontSize >= 24) heading = HeadingLevel.HEADING_1;
          else if (para.fontSize >= 18) heading = HeadingLevel.HEADING_2;
          else heading = HeadingLevel.HEADING_3;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const paraOpts: Record<string, any> = {
          children: runs,
          alignment: alignMap[para.alignment],
          heading,
          spacing: { after: para.spacingAfter },
        };

        if (para.isBullet && !para.isHeading) {
          paraOpts.numbering = { reference: "pdf-bullets", level: para.bulletLevel ?? 0 };
        }

        if (para.indent && !para.isBullet) {
          paraOpts.indent = { left: Math.round(para.indent * 20) };
        }

        children.push(new Paragraph(paraOpts));
      }

      // Insert remaining images after all paragraphs
      insertPendingImages(Infinity);
    }

    return {
      properties: {
        type: pi > 0 ? SectionType.NEXT_PAGE : undefined,
        page: {
          size: { width: wTwips, height: hTwips },
          margin: { top: margin, bottom: margin, left: margin, right: margin },
        },
      },
      children,
    };
  });

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "pdf-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
                },
              },
            },
            {
              level: 1,
              format: LevelFormat.BULLET,
              text: "\u25CB",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(1), hanging: convertInchesToTwip(0.25) },
                },
              },
            },
          ],
        },
      ],
    },
    sections,
  });
  return Packer.toBlob(doc);
}

/* ── Conversion — entirely in the browser ──────────────── */

async function convertPdfToDocx(
  file: File,
  onStatus?: (msg: string) => void,
): Promise<Blob> {
  // Batch 1C: the previous "server-first" path called an endpoint backed by
  // Microsoft Word COM automation, which is not available in production and
  // returned 500 to every user. Every visitor was already falling through to
  // this browser converter, but only after a wasted failed upload. The upload
  // is gone; the file now stays on the device.
  onStatus?.("Reading document…");
  const pdfjs = await getPdfjs();
  const OPS = pdfjs.OPS;
  const buffer = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: PageData[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const vp = page.getViewport({ scale: 1 });

    // Step 1: Render page to canvas (needed for image cropping)
    const renderVp = page.getViewport({ scale: CANVAS_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = renderVp.width;
    canvas.height = renderVp.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport: renderVp }).promise;

    // Step 2: Get text content & operator list in parallel
    const [tc, opList] = await Promise.all([
      page.getTextContent(),
      page.getOperatorList(),
    ]);

    const rawItems = extractItems(tc, vp.height);

    if (rawItems.length < 3) {
      // Scanned / image-only page → full-page image fallback
      const imageBytes = await renderPageAsImage(canvas);
      pages.push({ width: vp.width, height: vp.height, paragraphs: [], tables: [], images: [], imageBytes });
      continue;
    }

    // Step 3: Extract colors from operator list and apply to text items
    const colorMap = extractColorMap(opList, OPS);
    applyColorsToItems(rawItems, colorMap);

    // Step 4: Detect underlines and mark affected items
    const underlines = findUnderlines(opList, OPS, vp.height);
    markUnderlinedItems(rawItems, underlines);

    // Step 5: Extract embedded image regions and crop from canvas
    const imageRegions = findImageRegions(opList, OPS, vp.height);
    const images = await cropImagesFromCanvas(canvas, imageRegions, vp);

    // Step 6: Detect tables and separate table items from text flow
    const { tables, remainingItems } = detectTables(rawItems, vp.width);

    // Step 7: Group remaining text into lines → paragraphs
    const lines = groupIntoLines(remainingItems);
    const paragraphs = groupIntoParagraphs(lines, vp.width);

    pages.push({ width: vp.width, height: vp.height, paragraphs, tables, images });
  }

  return buildDocx(pages);
}

/* ── Zip helper ────────────────────────────────────────── */

async function zipConvertedFiles(files: ConvertedDoc[]): Promise<Blob | null> {
  if (files.length <= 1) return files[0]?.blob ?? null;
  const zip = new JSZip();
  files.forEach((f) => zip.file(f.fileName, f.blob));
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

/* ── Component ─────────────────────────────────────────── */

export default function PdfToWordTool() {
  const [queue, setQueue] = useState<QueuedPdf[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [statusMsg, setStatusMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── File handling ── */

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const pdfs = Array.from(fileList).filter((f) => /\.pdf$/i.test(f.name));
      if (!pdfs.length) {
        setErrorMessage("Please upload PDF files.");
        return;
      }

      const oversized = pdfs.filter((f) => f.size > MAX_FILE_SIZE);
      const validPdfs = pdfs.filter((f) => f.size <= MAX_FILE_SIZE);

      if (oversized.length) {
        setErrorMessage(`${oversized.length} file${oversized.length > 1 ? "s" : ""} exceeded the ${MAX_FILE_SIZE / (1024 * 1024)}MB size limit and ${oversized.length > 1 ? "were" : "was"} skipped.`);
      }

      if (!validPdfs.length) return;

      const remainingSlots = MAX_FILES - queue.length;
      if (remainingSlots <= 0) {
        setErrorMessage(`You can convert a maximum of ${MAX_FILES} PDF files at a time.`);
        return;
      }

      const limited = validPdfs.slice(0, remainingSlots);
      setQueue((prev) => [...prev, ...limited.map((file) => ({ id: uid(), file }))]);
      setResult(null);
      setErrorMessage(
        validPdfs.length > remainingSlots
          ? `Only the first ${remainingSlots} file${remainingSlots > 1 ? "s were" : " was"} added.`
          : oversized.length ? null : null,
      );
    },
    [queue.length],
  );

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  /* ── Conversion ── */

  const handleConvert = useCallback(async () => {
    if (!queue.length) return;

    setProcessing(true);
    setErrorMessage(null);
    setResult(null);
    setStatusMsg("");
    setProgress({ current: 0, total: queue.length });

    try {
      const files: ConvertedDoc[] = [];

      for (let i = 0; i < queue.length; i++) {
        setProgress({ current: i + 1, total: queue.length });
        const file = queue[i].file;
        const blob = await convertPdfToDocx(file, (msg) => setStatusMsg(msg));
        files.push({
          fileName: `${sanitizeBaseName(file.name)}.docx`,
          blob,
        });
      }

      const zipBlob = await zipConvertedFiles(files);
      setResult({ files, zipBlob });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to convert one or more PDF files.",
      );
    } finally {
      setProcessing(false);
      setStatusMsg("");
    }
  }, [queue]);

  /* ── Downloads ── */

  const handleDownloadAll = useCallback(() => {
    if (!result?.zipBlob) return;
    const fileName = result.files.length > 1 ? "pdf-to-word.zip" : result.files[0].fileName;
    downloadBlob(result.zipBlob, fileName);
  }, [result]);

  const handleDownloadSingle = useCallback((file: ConvertedDoc) => {
    downloadBlob(file.blob, file.fileName);
  }, []);

  /* ── Reset ── */

  const handleReset = useCallback(() => {
    setQueue([]);
    setResult(null);
    setErrorMessage(null);
    setProgress({ current: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const totalSize = queue.reduce((sum, item) => sum + item.file.size, 0);

  /* ── UI ── */

  return (
    <div className="space-y-4">
      {/* ── Upload area ── */}
      {!result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#38d9a9] to-[#ff6584]" />

          <div className="px-5 py-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 transition ${
                dragOver
                  ? "border-[#6c63ff] bg-[#6c63ff]/5"
                  : queue.length
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border hover:border-border-strong"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                multiple
                aria-label="Choose PDF files to convert to Word"
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">
                📝
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                Drop your PDF files here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-2">
                Convert up to {MAX_FILES} PDF files into editable Word documents. Preserves layout, images, fonts &amp; colors.
              </p>
            </div>
          </div>

          {/* ── File list ── */}
          {queue.length > 0 && (
            <div className="border-t border-border">
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="font-display text-sm font-bold text-white">
                  {queue.length} PDF file{queue.length > 1 ? "s" : ""} selected
                  <span className="ml-2 text-xs font-normal text-muted-2">
                    ({formatBytes(totalSize)} total)
                  </span>
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="inline-flex min-h-11 items-center px-2 text-[10px] font-semibold text-[#ff6584] transition hover:text-[#ff8da6]"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-80 divide-y divide-white/5 overflow-y-auto px-5 pb-3">
                {queue.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <span className="text-base">📄</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{item.file.name}</p>
                      <p className="text-[10px] text-muted-2">{formatBytes(item.file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(item.id)}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Error ── */}
      {errorMessage && !processing && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {/* ── Convert button ── */}
      {queue.length > 0 && !result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-t border-border px-5 py-4 text-center">
            <button
              onClick={handleConvert}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
            >
              📝 Convert to Word
            </button>
          </div>
        </div>
      )}

      {/* ── Processing ── */}
      {processing && (
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface px-5 py-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-[#6c63ff]" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-4 border-border border-b-[#38d9a9]"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>
          <p className="text-sm font-semibold text-white">
            {queue.length > 1
              ? `Converting file ${progress.current} of ${progress.total}…`
              : "Converting PDF to Word…"}
          </p>
          {statusMsg && (
            <p className="text-xs text-muted-2">{statusMsg}</p>
          )}
          <p className="text-[10px] text-muted-2">This may take a moment for complex documents</p>
          {queue.length > 1 && (
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-[#6c63ff] transition-all duration-300"
                style={{
                  width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <>
          <div role="status" aria-live="polite" className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">
                ✓
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">
                {result.files.length === 1 ? "Your Word document is ready!" : "Your Word documents are ready!"}
              </h3>
              <button
                onClick={handleDownloadAll}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ Download {result.files.length > 1 ? "All (ZIP)" : "DOCX"}
              </button>
              <p className="mt-4 text-sm text-muted">
                {result.files.length} PDF file{result.files.length > 1 ? "s" : ""} converted to Word.
              </p>
            </div>

            {/* Individual files */}
            {result.files.length > 1 && (
              <div className="border-t border-border">
                <div className="max-h-60 divide-y divide-white/5 overflow-y-auto px-5 py-2">
                  {result.files.map((f) => (
                    <div key={f.fileName} className="flex items-center gap-3 py-2">
                      <span className="text-base">📝</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{f.fileName}</p>
                        <p className="text-[10px] text-muted-2">{formatBytes(f.blob.size)}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadSingle(f)}
                        className="rounded-lg bg-surface-3/50 px-3 py-1.5 text-[10px] font-semibold text-muted transition hover:bg-surface-3 hover:text-foreground"
                      >
                        ⬇ Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reset */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface px-5 py-4 text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[.03]"
            >
              Convert More PDFs
            </button>
          </div>
        </>
      )}

      {/* ── Disclaimer ── */}
      <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-3 text-center">
        <p className="text-[11px] leading-relaxed text-amber-200/70">
          Some complex layouts, custom fonts, or advanced formatting may not convert perfectly yet.
          This converter works best with standard text-based PDFs and simple table layouts.
        </p>
      </div>
    </div>
  );
}
