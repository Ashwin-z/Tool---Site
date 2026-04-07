"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useCallback, useRef, useState } from "react";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import {
  MAX_CONVERSION_FILES,
  createHiddenRenderContainer,
  downloadBlob,
  ensureImagesLoaded,
  formatBytes,
  sanitizeBaseName,
} from "@/lib/client-pdf-utils";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

type QueuedSpreadsheet = {
  id: string;
  file: File;
};

type ConvertedPdf = {
  fileName: string;
  blob: Blob;
};

type ConversionResult = {
  files: ConvertedPdf[];
  zipBlob: Blob | null;
};

let idCounter = 0;
function uid(): string {
  return `sheet_${++idCounter}_${Date.now()}`;
}

function isSpreadsheetFile(file: File): boolean {
  return /\.(xlsx|xls|csv)$/i.test(file.name);
}

async function zipConvertedFiles(files: ConvertedPdf[]): Promise<Blob | null> {
  if (files.length <= 1) return files[0]?.blob ?? null;

  const zip = new JSZip();
  files.forEach((file) => zip.file(file.fileName, file.blob));
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

async function convertSpreadsheetToPdfViaApi(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/tools/excel-to-pdf", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Failed to convert spreadsheet to PDF.";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload?.error) message = payload.error;
    } catch {
      // ignore JSON parse issues
    }
    throw new Error(message);
  }

  return response.blob();
}

/* ------------------------------------------------------------------ */
/*  XLSX style extraction (parse raw XML from the zip for full color   */
/*  fidelity — the community xlsx lib doesn't export cell styles)      */
/* ------------------------------------------------------------------ */

type CellStyle = { bg: string; fg: string; bold: boolean; italic: boolean };
type StyleLookup = (idx: number) => CellStyle;
type SheetStyleMap = Map<string, number>; // cellRef → style index
type BuiltSheetTable = { markup: string; tableWidthPx: number };

/** Find all descendant elements matching a localName (namespace-safe). */
function xmlAll(parent: Element | Document, localName: string): Element[] {
  return Array.from(parent.getElementsByTagName("*")).filter(
    (el) => el.localName === localName,
  );
}

/** Find first descendant element matching a localName. */
function xmlOne(parent: Element, localName: string): Element | undefined {
  return Array.from(parent.getElementsByTagName("*")).find(
    (el) => el.localName === localName,
  );
}

function parseArgbHex(raw: string | null): string {
  if (!raw || raw.length < 6) return "";
  const hex = raw.length === 8 ? raw.slice(2) : raw;
  return `#${hex}`;
}

function tintColor(hex: string, tint: number): string {
  if (!hex || !tint) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const apply = (c: number) => {
    const v = tint > 0 ? c + tint * (255 - c) : c * (1 + tint);
    return Math.max(0, Math.min(255, Math.round(v)));
  };
  return `#${[r, g, b].map(apply).map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function resolveColor(el: Element | undefined, themeColors: string[]): string {
  if (!el) return "";
  const rgb = el.getAttribute("rgb");
  if (rgb) return parseArgbHex(rgb);
  const theme = el.getAttribute("theme");
  if (theme !== null) {
    const base = themeColors[parseInt(theme, 10)] ?? "";
    if (!base) return "";
    const tint = parseFloat(el.getAttribute("tint") ?? "0");
    return tint ? tintColor(base, tint) : base;
  }
  return "";
}

async function parseWorkbookStyles(
  buffer: ArrayBuffer,
  sheetCount: number,
): Promise<{ lookup: StyleLookup; maps: SheetStyleMap[] } | null> {
  try {
    const zip = await JSZip.loadAsync(buffer);

    /* ---- Theme colours ---- */
    const themeColors: string[] = [];
    const themeFile = zip.file("xl/theme/theme1.xml");
    if (themeFile) {
      const doc = new DOMParser().parseFromString(
        await themeFile.async("text"),
        "application/xml",
      );
      const scheme = xmlAll(doc, "clrScheme")[0];
      if (scheme) {
        const tags = [
          "dk1", "lt1", "dk2", "lt2",
          "accent1", "accent2", "accent3", "accent4",
          "accent5", "accent6", "hlink", "folHlink",
        ];
        for (const tag of tags) {
          const el = Array.from(scheme.children).find((c) => c.localName === tag);
          if (el) {
            const srgb = xmlOne(el, "srgbClr");
            const sys = xmlOne(el, "sysClr");
            themeColors.push(
              srgb
                ? `#${srgb.getAttribute("val")}`
                : sys
                  ? `#${sys.getAttribute("lastClr") ?? sys.getAttribute("val") ?? "000000"}`
                  : "",
            );
          } else {
            themeColors.push("");
          }
        }
      }
    }

    /* ---- styles.xml ---- */
    const stylesFile = zip.file("xl/styles.xml");
    if (!stylesFile) return null;
    const doc = new DOMParser().parseFromString(
      await stylesFile.async("text"),
      "application/xml",
    );

    // Fills
    const fills: string[] = [];
    for (const fill of xmlAll(doc, "fill")) {
      const pf = xmlOne(fill, "patternFill");
      if (pf?.getAttribute("patternType") === "solid") {
        fills.push(resolveColor(xmlOne(pf, "fgColor"), themeColors));
      } else {
        fills.push("");
      }
    }

    // Fonts
    const fonts: { color: string; bold: boolean; italic: boolean }[] = [];
    const fontsEl = xmlAll(doc, "fonts")[0];
    if (fontsEl) {
      for (const font of Array.from(fontsEl.children).filter(
        (c) => c.localName === "font",
      )) {
        fonts.push({
          color: resolveColor(xmlOne(font, "color"), themeColors),
          bold: !!xmlOne(font, "b"),
          italic: !!xmlOne(font, "i"),
        });
      }
    }

    // cellXfs
    const xfs: { fillId: number; fontId: number }[] = [];
    const cellXfsEl = xmlAll(doc, "cellXfs")[0];
    if (cellXfsEl) {
      for (const xf of Array.from(cellXfsEl.children).filter(
        (c) => c.localName === "xf",
      )) {
        xfs.push({
          fillId: parseInt(xf.getAttribute("fillId") ?? "0", 10),
          fontId: parseInt(xf.getAttribute("fontId") ?? "0", 10),
        });
      }
    }

    const lookup: StyleLookup = (idx) => {
      const xf = xfs[idx];
      if (!xf) return { bg: "", fg: "", bold: false, italic: false };
      const bg = fills[xf.fillId] ?? "";
      const font = fonts[xf.fontId];
      return {
        bg,
        fg: font?.color ?? "",
        bold: font?.bold ?? false,
        italic: font?.italic ?? false,
      };
    };

    /* ---- Per-sheet cell → style-index maps (from worksheet XML) ---- */
    const maps: SheetStyleMap[] = [];
    for (let i = 0; i < sheetCount; i++) {
      const map = new Map<string, number>();
      const sf = zip.file(`xl/worksheets/sheet${i + 1}.xml`);
      if (sf) {
        const sDoc = new DOMParser().parseFromString(
          await sf.async("text"),
          "application/xml",
        );
        for (const c of xmlAll(sDoc, "c")) {
          const ref = c.getAttribute("r");
          const s = c.getAttribute("s");
          if (ref && s) map.set(ref, parseInt(s, 10));
        }
      }
      maps.push(map);
    }

    return { lookup, maps };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Build compact styled HTML table from sheet data                    */
/* ------------------------------------------------------------------ */

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getColumnWidthPx(col?: XLSX.ColInfo): number {
  if (!col) return 72;
  if (typeof col.wpx === "number" && Number.isFinite(col.wpx) && col.wpx > 0) {
    return Math.max(28, Math.round(col.wpx));
  }
  if (typeof col.wch === "number" && Number.isFinite(col.wch) && col.wch > 0) {
    return Math.max(28, Math.round(col.wch * 7 + 8));
  }
  if (typeof col.width === "number" && Number.isFinite(col.width) && col.width > 0) {
    return Math.max(28, Math.round(col.width * 7 + 8));
  }
  return 72;
}

function getRowHeightPx(row?: XLSX.RowInfo): number | undefined {
  if (!row) return undefined;
  if (typeof row.hpx === "number" && Number.isFinite(row.hpx) && row.hpx > 0) {
    return Math.max(16, Math.round(row.hpx));
  }
  if (typeof row.hpt === "number" && Number.isFinite(row.hpt) && row.hpt > 0) {
    return Math.max(16, Math.round((row.hpt * 96) / 72));
  }
  return undefined;
}

function buildSheetTable(
  sheet: XLSX.WorkSheet,
  sheetName: string,
  styleLookup: StyleLookup | null,
  styleMap: SheetStyleMap | null,
): BuiltSheetTable | null {
  const ref = sheet["!ref"];
  if (!ref) return null;

  const fullRange = XLSX.utils.decode_range(ref);
  const merges = sheet["!merges"] ?? [];
  const colsMeta = sheet["!cols"] ?? [];
  const rowsMeta = sheet["!rows"] ?? [];

  /* ---- Compute the real content range ----
     Excel's !ref includes rows that merely have formatting (e.g. yellow
     fill on empty rows). We scan for cells that actually hold a value
     and tighten the range to only include those rows/cols. Cells with
     *styling but no value* inside that range are still rendered. */
  let minR = Infinity, maxR = -1, minC = Infinity, maxC = -1;
  for (let r = fullRange.s.r; r <= fullRange.e.r; r++) {
    if (rowsMeta[r]?.hidden) continue;
    for (let c = fullRange.s.c; c <= fullRange.e.c; c++) {
      if (colsMeta[c]?.hidden) continue;
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (cell && cell.v != null && cell.v !== "") {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }

  /* Also expand the range to cover any merge that overlaps content */
  for (const m of merges) {
    if (m.s.r <= maxR && m.e.r >= minR && m.s.c <= maxC && m.e.c >= minC) {
      if (m.s.r < minR) minR = m.s.r;
      if (m.e.r > maxR) maxR = m.e.r;
      if (m.s.c < minC) minC = m.s.c;
      if (m.e.c > maxC) maxC = m.e.c;
    }
  }

  if (maxR < 0) return null; // no data at all

  const range = { s: { r: minR, c: minC }, e: { r: maxR, c: maxC } };
  const visibleRows = Array.from({ length: range.e.r - range.s.r + 1 }, (_, index) => range.s.r + index)
    .filter((rowIndex) => !rowsMeta[rowIndex]?.hidden);
  const visibleCols = Array.from({ length: range.e.c - range.s.c + 1 }, (_, index) => range.s.c + index)
    .filter((colIndex) => !colsMeta[colIndex]?.hidden);

  if (!visibleRows.length || !visibleCols.length) return null;

  // Merge map: "r,c" → skip or span info
  const mm = new Map<string, { skip: true } | { cs: number; rs: number }>();
  for (const m of merges) {
    // Clip merges to the content range
    if (m.e.r < range.s.r || m.s.r > range.e.r) continue;
    if (m.e.c < range.s.c || m.s.c > range.e.c) continue;
    for (let r = m.s.r; r <= m.e.r; r++) {
      for (let c = m.s.c; c <= m.e.c; c++) {
        if (r < range.s.r || r > range.e.r) continue;
        if (c < range.s.c || c > range.e.c) continue;
        const key = `${r},${c}`;
        if (r === m.s.r && c === m.s.c) {
          mm.set(key, {
            cs: Math.min(m.e.c, range.e.c) - m.s.c + 1,
            rs: Math.min(m.e.r, range.e.r) - m.s.r + 1,
          });
        } else {
          mm.set(key, { skip: true });
        }
      }
    }
  }

  const columnWidths = visibleCols.map((colIndex) => getColumnWidthPx(colsMeta[colIndex]));
  const tableWidthPx = columnWidths.reduce((sum, width) => sum + width, 0);

  let html = `<section class="tc-sheet" style="width:${tableWidthPx}px">`;
  html += `<p class="tc-label">${esc(sheetName)}</p><table style="width:${tableWidthPx}px"><colgroup>`;
  columnWidths.forEach((width) => {
    html += `<col style="width:${width}px" />`;
  });
  html += "</colgroup>";

  for (const r of visibleRows) {
    const rowHeight = getRowHeightPx(rowsMeta[r]);
    html += rowHeight ? `<tr style="height:${rowHeight}px">` : "<tr>";

    for (const c of visibleCols) {
      const mk = `${r},${c}`;
      const mi = mm.get(mk);
      if (mi && "skip" in mi) continue;

      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[cellRef];

      // Resolve style
      let style = "";
      if (styleLookup) {
        const idx = styleMap?.get(cellRef) ?? 0;
        if (idx > 0) {
          const cs = styleLookup(idx);
          if (cs.bg) style += `background:${cs.bg};`;
          if (cs.fg) style += `color:${cs.fg};`;
          if (cs.bold) style += `font-weight:700;`;
          if (cs.italic) style += `font-style:italic;`;
        }
      }

      // Cell value (prefer formatted string)
      const val = cell?.w ?? (cell?.v != null ? String(cell.v) : "");
      const htmlValue = esc(val).replace(/\r?\n/g, "<br />") || "&nbsp;";

      let attrs = style ? ` style="${style}"` : "";
      if (mi && "cs" in mi) {
        if (mi.cs > 1) attrs += ` colspan="${mi.cs}"`;
        if (mi.rs > 1) attrs += ` rowspan="${mi.rs}"`;
      }

      html += `<td${attrs}>${htmlValue}</td>`;
    }
    html += "</tr>";
  }

  html += "</table></section>";
  return { markup: html, tableWidthPx };
}

function addCanvasSegment(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
): void {
  try {
    pdf.addImage(canvas, "PNG", offsetX, offsetY, width, height, undefined, "FAST");
  } catch {
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.98), "JPEG", offsetX, offsetY, width, height, undefined, "FAST");
  }
}

async function renderSheetElementsToPdfBlob(sheetElements: HTMLElement[]): Promise<Blob> {
  const pdf = new jsPDF({ orientation: "l", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  let firstOutputPage = true;

  for (const sheetElement of sheetElements) {
    await ensureImagesLoaded(sheetElement);

    const canvas = await html2canvas(sheetElement, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: Math.max(sheetElement.scrollWidth, sheetElement.clientWidth, 1),
      windowHeight: Math.max(sheetElement.scrollHeight, sheetElement.clientHeight, 1),
    });

    const cssWidth = canvas.width / 2;
    const naturalPdfWidth = cssWidth * 0.75;
    const imageWidth = Math.min(usableWidth, naturalPdfWidth);
    const imageHeight = (canvas.height * imageWidth) / canvas.width;
    const offsetX = margin + (usableWidth - imageWidth) / 2;

    if (!firstOutputPage) {
      pdf.addPage([pageWidth, pageHeight], "landscape");
    }
    firstOutputPage = false;

    let remainingHeight = imageHeight;
    let offsetY = margin;

    addCanvasSegment(pdf, canvas, offsetX, offsetY, imageWidth, imageHeight);
    remainingHeight -= usableHeight;

    while (remainingHeight > 0) {
      pdf.addPage([pageWidth, pageHeight], "landscape");
      offsetY = margin - (imageHeight - remainingHeight);
      addCanvasSegment(pdf, canvas, offsetX, offsetY, imageWidth, imageHeight);
      remainingHeight -= usableHeight;
    }
  }

  return pdf.output("blob");
}

/* ------------------------------------------------------------------ */
/*  Convert spreadsheet → PDF                                          */
/* ------------------------------------------------------------------ */

async function convertLegacySpreadsheetToPdf(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const isCsv = /\.csv$/i.test(file.name);

  const styles = isCsv
    ? null
    : await parseWorkbookStyles(buffer, workbook.SheetNames.length);

  const builtSheets = workbook.SheetNames.map((name, index) => {
    const sheet = workbook.Sheets[name];
    const styleMap = styles?.maps[index] ?? null;
    return buildSheetTable(sheet, name, styles?.lookup ?? null, styleMap);
  })
    .filter((sheet): sheet is BuiltSheetTable => Boolean(sheet));

  if (!builtSheets.length) throw new Error("The spreadsheet appears to be empty.");

  const container = createHiddenRenderContainer(
    "toolmint-excel-render",
    `<style>
      .tc-page {
        padding: 16px;
        background: #fff;
        font-family: Calibri, Arial, Helvetica, sans-serif;
        font-size: 8px;
        color: #000;
      }
      .tc-sheet {
        margin: 0 0 12px;
        break-after: page;
      }
      .tc-sheet:last-child { margin-bottom: 0; }
      .tc-label {
        margin: 0 0 4px;
        font-size: 9px;
        font-weight: 700;
        color: #333;
      }
      table {
        border-collapse: collapse;
        table-layout: fixed;
        white-space: normal;
      }
      td {
        border: 0.5px solid #a0a0a0;
        padding: 2px 4px;
        vertical-align: middle;
        line-height: 1.18;
        overflow-wrap: anywhere;
        word-break: break-word;
      }
    </style>
    <div class="tc-page">${builtSheets.map((sheet) => sheet.markup).join("")}</div>`,
  );

  try {
    const sheetElements = Array.from(container.querySelectorAll(".tc-sheet")).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );

    if (!sheetElements.length) {
      throw new Error("Failed to prepare the spreadsheet for PDF conversion.");
    }

    return await renderSheetElementsToPdfBlob(sheetElements);
  } finally {
    document.body.removeChild(container);
  }
}

function parseExcelArgbColor(argb?: string): string {
  if (!argb) return "";
  const normalized = argb.trim();
  if (normalized.length === 8) return `#${normalized.slice(2)}`;
  if (normalized.length === 6) return `#${normalized}`;
  return "";
}

function getExcelJsColor(color?: { argb?: string } | null): string {
  return parseExcelArgbColor(color?.argb);
}

function getExcelJsCellText(cell: {
  text?: string;
  value?: unknown;
}): string {
  if (typeof cell.text === "string" && cell.text.trim()) {
    return cell.text;
  }

  const value = cell.value as
    | string
    | number
    | boolean
    | Date
    | { text?: string; hyperlink?: string; result?: unknown; formula?: string; richText?: Array<{ text?: string }> }
    | null
    | undefined;

  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  if (typeof value === "object") {
    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text ?? "").join("");
    }
    if (typeof value.text === "string") {
      return value.text;
    }
    if (value.result != null) {
      return String(value.result);
    }
    if (typeof value.hyperlink === "string") {
      return value.hyperlink;
    }
  }

  return "";
}

function hasVisibleCellValue(cell: { text?: string; value?: unknown }): boolean {
  return getExcelJsCellText(cell).replace(/\u00a0/g, " ").trim().length > 0;
}

function getAlignmentCss(alignment?: {
  horizontal?: string;
  vertical?: string;
  wrapText?: boolean;
  indent?: number;
} | null): string {
  if (!alignment) return "";

  let style = "";
  const horizontalMap: Record<string, string> = {
    center: "center",
    centerContinuous: "center",
    distributed: "justify",
    fill: "left",
    general: "left",
    justify: "justify",
    left: "left",
    right: "right",
  };
  const verticalMap: Record<string, string> = {
    top: "top",
    middle: "middle",
    center: "middle",
    bottom: "bottom",
    justify: "middle",
    distributed: "middle",
  };

  if (alignment.horizontal && horizontalMap[alignment.horizontal]) {
    style += `text-align:${horizontalMap[alignment.horizontal]};`;
  }
  if (alignment.vertical && verticalMap[alignment.vertical]) {
    style += `vertical-align:${verticalMap[alignment.vertical]};`;
  }
  if (alignment.wrapText) {
    style += "white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;";
  } else {
    style += "white-space:nowrap;";
  }
  if (typeof alignment.indent === "number" && alignment.indent > 0) {
    style += `padding-left:${4 + alignment.indent * 6}px;`;
  }

  return style;
}

function getBorderCss(border?: {
  top?: { style?: string; color?: { argb?: string } };
  right?: { style?: string; color?: { argb?: string } };
  bottom?: { style?: string; color?: { argb?: string } };
  left?: { style?: string; color?: { argb?: string } };
} | null): string {
  if (!border) return "";

  const borderWidth: Record<string, string> = {
    hair: "0.5px",
    thin: "0.75px",
    dotted: "1px",
    dashDot: "1px",
    dashDotDot: "1px",
    dashed: "1px",
    mediumDashed: "1.5px",
    mediumDashDot: "1.5px",
    mediumDashDotDot: "1.5px",
    slantDashDot: "1.5px",
    medium: "1.5px",
    thick: "2px",
    double: "2px",
  };

  const buildSide = (sideName: "top" | "right" | "bottom" | "left") => {
    const side = border[sideName];
    if (!side?.style) return "";
    const width = borderWidth[side.style] ?? "1px";
    const color = getExcelJsColor(side.color) || "#8c8c8c";
    return `border-${sideName}:${width} solid ${color};`;
  };

  return `${buildSide("top")}${buildSide("right")}${buildSide("bottom")}${buildSide("left")}`;
}

function buildExcelJsCellStyle(cell: {
  fill?: { type?: string; pattern?: string; fgColor?: { argb?: string }; bgColor?: { argb?: string } } | null;
  font?: { color?: { argb?: string }; bold?: boolean; italic?: boolean; size?: number; name?: string } | null;
  alignment?: { horizontal?: string; vertical?: string; wrapText?: boolean; indent?: number } | null;
  border?: {
    top?: { style?: string; color?: { argb?: string } };
    right?: { style?: string; color?: { argb?: string } };
    bottom?: { style?: string; color?: { argb?: string } };
    left?: { style?: string; color?: { argb?: string } };
  } | null;
}): string {
  let style = "";

  if (cell.fill?.type === "pattern" && cell.fill.pattern === "solid") {
    const fillColor = getExcelJsColor(cell.fill.fgColor) || getExcelJsColor(cell.fill.bgColor);
    if (fillColor) style += `background:${fillColor};`;
  }

  if (cell.font) {
    const fontColor = getExcelJsColor(cell.font.color);
    if (fontColor) style += `color:${fontColor};`;
    if (cell.font.bold) style += "font-weight:700;";
    if (cell.font.italic) style += "font-style:italic;";
    if (typeof cell.font.size === "number" && Number.isFinite(cell.font.size)) {
      style += `font-size:${Math.max(7, Math.min(13, cell.font.size))}pt;`;
    }
    if (cell.font.name) {
      style += `font-family:${JSON.stringify(cell.font.name)}, Calibri, Arial, sans-serif;`;
    }
  }

  style += getAlignmentCss(cell.alignment);
  style += getBorderCss(cell.border);
  return style;
}

async function convertXlsxSpreadsheetToPdf(file: File): Promise<Blob> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  const builtSheets: BuiltSheetTable[] = [];

  for (const worksheet of workbook.worksheets) {
    const mergeRanges = (worksheet.model.merges ?? [])
      .filter((mergeRef): mergeRef is string => typeof mergeRef === "string" && mergeRef.trim().length > 0)
      .map((mergeRef) => XLSX.utils.decode_range(mergeRef));

    const contentRows = new Set<number>();
    const contentCols = new Set<number>();
    const mergeMasterKeys = new Set<string>();

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (row.hidden) return;
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        if (worksheet.getColumn(colNumber).hidden) return;
        if (!hasVisibleCellValue(cell)) return;
        contentRows.add(rowNumber);
        contentCols.add(colNumber);
      });
    });

    for (const merge of mergeRanges) {
      const mergeStartRow = merge.s.r + 1;
      const mergeEndRow = merge.e.r + 1;
      const mergeStartCol = merge.s.c + 1;
      const mergeEndCol = merge.e.c + 1;
      const masterCell = worksheet.getRow(mergeStartRow).getCell(mergeStartCol);

      if (!hasVisibleCellValue(masterCell)) {
        continue;
      }

      mergeMasterKeys.add(`${mergeStartRow},${mergeStartCol}`);

      for (let rowNumber = mergeStartRow; rowNumber <= mergeEndRow; rowNumber += 1) {
        if (worksheet.getRow(rowNumber).hidden) continue;
        contentRows.add(rowNumber);
      }
      for (let colNumber = mergeStartCol; colNumber <= mergeEndCol; colNumber += 1) {
        if (worksheet.getColumn(colNumber).hidden) continue;
        contentCols.add(colNumber);
      }
    }

    const visibleRows = Array.from(contentRows).sort((a, b) => a - b);
    const visibleCols = Array.from(contentCols).sort((a, b) => a - b);

    if (!visibleRows.length || !visibleCols.length) {
      continue;
    }

    const visibleRowSet = new Set(visibleRows);
    const visibleColSet = new Set(visibleCols);
    const rowIndexMap = new Map(visibleRows.map((rowNumber, index) => [rowNumber, index + 1]));
    const colIndexMap = new Map(visibleCols.map((colNumber, index) => [colNumber, index + 1]));

    const mergeMap = new Map<string, { skip: true } | { cs: number; rs: number }>();
    for (const merge of mergeRanges) {
      const mergeStartRow = merge.s.r + 1;
      const mergeEndRow = merge.e.r + 1;
      const mergeStartCol = merge.s.c + 1;
      const mergeEndCol = merge.e.c + 1;

      if (!mergeMasterKeys.has(`${mergeStartRow},${mergeStartCol}`)) {
        continue;
      }

      for (let rowNumber = mergeStartRow; rowNumber <= mergeEndRow; rowNumber += 1) {
        if (!visibleRowSet.has(rowNumber)) continue;
        for (let colNumber = mergeStartCol; colNumber <= mergeEndCol; colNumber += 1) {
          if (!visibleColSet.has(colNumber)) continue;

          const key = `${rowNumber},${colNumber}`;
          if (rowNumber === mergeStartRow && colNumber === mergeStartCol) {
            const visibleMergeRows = visibleRows.filter((visibleRow) => visibleRow >= mergeStartRow && visibleRow <= mergeEndRow).length;
            const visibleMergeCols = visibleCols.filter((visibleCol) => visibleCol >= mergeStartCol && visibleCol <= mergeEndCol).length;
            mergeMap.set(key, { cs: visibleMergeCols, rs: visibleMergeRows });
          } else {
            mergeMap.set(key, { skip: true });
          }
        }
      }
    }

    const columnWidths = visibleCols.map((colNumber) =>
      getColumnWidthPx({ width: worksheet.getColumn(colNumber).width ?? 10 }),
    );
    const rowHeights = visibleRows.map((rowNumber) => {
      const row = worksheet.getRow(rowNumber);
      if (typeof row.height === "number" && Number.isFinite(row.height)) {
        return Math.max(16, Math.round((row.height * 96) / 72));
      }
      return 22;
    });
    const tableWidthPx = columnWidths.reduce((sum, width) => sum + width, 0);
    const tableHeightPx = rowHeights.reduce((sum, height) => sum + height, 0);

    let markup = `<section class="tc-sheet" style="width:${tableWidthPx}px">`;
    markup += `<p class="tc-label">${esc(worksheet.name)}</p>`;
    markup += `<div class="tc-grid" style="width:${tableWidthPx}px;height:${tableHeightPx}px;grid-template-columns:${columnWidths.map((width) => `${width}px`).join(" ")};grid-template-rows:${rowHeights.map((height) => `${height}px`).join(" ")};">`;

    for (const rowNumber of visibleRows) {
      const row = worksheet.getRow(rowNumber);

      for (const colNumber of visibleCols) {
        const mergeInfo = mergeMap.get(`${rowNumber},${colNumber}`);
        if (mergeInfo && "skip" in mergeInfo) continue;

        const cell = row.getCell(colNumber);
        const cellText = getExcelJsCellText(cell);
        if (!cellText.trim() && !mergeMasterKeys.has(`${rowNumber},${colNumber}`)) {
          continue;
        }

        const cellStyle = buildExcelJsCellStyle(cell);
        const gridColumnStart = colIndexMap.get(colNumber);
        const gridRowStart = rowIndexMap.get(rowNumber);
        if (!gridColumnStart || !gridRowStart) continue;

        const colSpan = mergeInfo && "cs" in mergeInfo ? mergeInfo.cs : 1;
        const rowSpan = mergeInfo && "rs" in mergeInfo ? mergeInfo.rs : 1;
        const htmlValue = esc(cellText).replace(/\r?\n/g, "<br />") || "&nbsp;";

        markup += `<div class="tc-cell" style="grid-column:${gridColumnStart} / span ${colSpan};grid-row:${gridRowStart} / span ${rowSpan};${cellStyle}">${htmlValue}</div>`;
      }
    }

    markup += "</div></section>";
    builtSheets.push({ markup, tableWidthPx });
  }

  if (!builtSheets.length) {
    throw new Error("The spreadsheet appears to be empty.");
  }

  const container = createHiddenRenderContainer(
    "toolmint-excel-render",
    `<style>
      .tc-page {
        padding: 16px;
        background: #fff;
        font-family: Calibri, Arial, Helvetica, sans-serif;
        font-size: 8px;
        color: #000;
      }
      .tc-sheet {
        margin: 0 0 12px;
        break-after: page;
      }
      .tc-sheet:last-child { margin-bottom: 0; }
      .tc-label {
        margin: 0 0 4px;
        font-size: 9px;
        font-weight: 700;
        color: #333;
      }
      table {
        border-collapse: collapse;
        table-layout: fixed;
      }
      .tc-grid {
        display: grid;
        align-items: stretch;
      }
      .tc-cell {
        border: 0.75px solid #8c8c8c;
        padding: 2px 4px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        background: #fff;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        word-break: break-word;
      }
      td {
        border: 0.75px solid #8c8c8c;
        padding: 2px 4px;
        vertical-align: middle;
        line-height: 1.18;
      }
    </style>
    <div class="tc-page">${builtSheets.map((sheet) => sheet.markup).join("")}</div>`,
  );

  try {
    const sheetElements = Array.from(container.querySelectorAll(".tc-sheet")).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );

    if (!sheetElements.length) {
      throw new Error("Failed to prepare the spreadsheet for PDF conversion.");
    }

    return await renderSheetElementsToPdfBlob(sheetElements);
  } finally {
    document.body.removeChild(container);
  }
}

async function convertSpreadsheetToPdf(file: File): Promise<Blob> {
  try {
    return await convertSpreadsheetToPdfViaApi(file);
  } catch {
    if (/\.xlsx$/i.test(file.name)) {
      try {
        return await convertXlsxSpreadsheetToPdf(file);
      } catch {
        return convertLegacySpreadsheetToPdf(file);
      }
    }

    return convertLegacySpreadsheetToPdf(file);
  }
}

export default function ExcelToPdfTool() {
  const [queue, setQueue] = useState<QueuedSpreadsheet[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const spreadsheets = Array.from(fileList).filter(isSpreadsheetFile);
    if (!spreadsheets.length) {
      setErrorMessage("Please upload Excel files in .xlsx, .xls, or .csv format.");
      return;
    }

    const oversized = spreadsheets.filter((f) => f.size > MAX_FILE_SIZE);
    const validFiles = spreadsheets.filter((f) => f.size <= MAX_FILE_SIZE);

    if (oversized.length) {
      setErrorMessage(`${oversized.length} file${oversized.length > 1 ? "s" : ""} exceeded the ${MAX_FILE_SIZE / (1024 * 1024)}MB size limit and ${oversized.length > 1 ? "were" : "was"} skipped.`);
    }

    if (!validFiles.length) return;

    const remainingSlots = MAX_CONVERSION_FILES - queue.length;
    if (remainingSlots <= 0) {
      setErrorMessage(`You can convert a maximum of ${MAX_CONVERSION_FILES} spreadsheet files at a time.`);
      return;
    }

    const limitedFiles = validFiles.slice(0, remainingSlots);
    setQueue((prev) => [...prev, ...limitedFiles.map((file) => ({ id: uid(), file }))]);
    setResult(null);
    if (validFiles.length > remainingSlots) {
      setErrorMessage(`Only the first ${remainingSlots} spreadsheet file${remainingSlots > 1 ? "s were" : " was"} added.`);
    }
  }, [queue.length]);

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      addFiles(event.dataTransfer.files);
    },
    [addFiles],
  );

  const handleConvert = useCallback(async () => {
    if (!queue.length) return;

    setProcessing(true);
    setErrorMessage(null);
    setResult(null);
    setProgress({ current: 0, total: queue.length });

    try {
      const files: ConvertedPdf[] = [];

      for (let index = 0; index < queue.length; index += 1) {
        setProgress({ current: index + 1, total: queue.length });
        const sourceFile = queue[index].file;
        const blob = await convertSpreadsheetToPdf(sourceFile);
        files.push({
          fileName: `${sanitizeBaseName(sourceFile.name)}.pdf`,
          blob,
        });
      }

      const zipBlob = await zipConvertedFiles(files);
      setResult({ files, zipBlob });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to convert one or more spreadsheet files to PDF.",
      );
    } finally {
      setProcessing(false);
    }
  }, [queue]);

  const handleDownloadAll = useCallback(() => {
    if (!result?.zipBlob) return;
    downloadBlob(result.zipBlob, result.files.length > 1 ? "excel-to-pdf.zip" : result.files[0].fileName);
  }, [result]);

  const handleDownloadSingle = useCallback((file: ConvertedPdf) => {
    downloadBlob(file.blob, file.fileName);
  }, []);

  const handleReset = useCallback(() => {
    setQueue([]);
    setResult(null);
    setErrorMessage(null);
    setProgress({ current: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const totalSize = queue.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <div className="space-y-4">
      {!result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#38d9a9] to-[#60a5fa]" />

          <div className="px-5 py-5">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 transition ${
                dragOver
                  ? "border-[#6c63ff] bg-[#6c63ff]/5"
                  : queue.length
                    ? "border-sky-500/40 bg-sky-500/5"
                    : "border-border hover:border-border-strong"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                multiple
                className="hidden"
                onChange={(event) => {
                  addFiles(event.target.files);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">
                📊
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                Drop your spreadsheet files here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-2">
                Convert up to {MAX_CONVERSION_FILES} Excel or CSV files into PDF documents.
              </p>
            </div>
          </div>

          {queue.length > 0 && (
            <div className="border-t border-border">
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="font-display text-sm font-bold text-white">
                  {queue.length} spreadsheet file{queue.length > 1 ? "s" : ""} selected
                  <span className="ml-2 text-xs font-normal text-muted-2">({formatBytes(totalSize)} total)</span>
                </h3>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleReset();
                  }}
                  className="text-[10px] font-semibold text-[#ff6584] transition hover:text-[#ff8da6]"
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
                      className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
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

      {errorMessage && !processing && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {queue.length > 0 && !result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-t border-border px-5 py-4 text-center">
            <button
              onClick={handleConvert}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
            >
              📄 Convert to PDF
            </button>
          </div>
        </div>
      )}

      {processing && (
        <div className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface px-5 py-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-[#6c63ff]" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-4 border-border border-b-[#38d9a9]"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>
          <p className="text-sm font-semibold text-white">Converting your spreadsheets…</p>
          {progress.total > 0 && (
            <p className="text-xs text-muted">Converting file {progress.current} of {progress.total}</p>
          )}
        </div>
      )}

      {result && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">✓</div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">
                {result.files.length > 1 ? `${result.files.length} PDFs are ready!` : "Your PDF is ready!"}
              </h3>
              <button
                onClick={handleDownloadAll}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ Download {result.files.length > 1 ? "ZIP" : "PDF"}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Converted Files</h3>
            </div>
            <div className="divide-y divide-white/5">
              {result.files.map((file) => (
                <div key={file.fileName} className="flex items-center gap-3 px-5 py-4">
                  <span className="text-base">📄</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{file.fileName}</p>
                    <p className="mt-1 text-[10px] text-muted">{formatBytes(file.blob.size)}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadSingle(file)}
                    className="rounded-lg bg-surface-3/50 px-3 py-2 text-xs font-semibold text-white transition hover:bg-surface-3"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-border px-5 py-4 text-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[.03]"
              >
                Convert More Files
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
