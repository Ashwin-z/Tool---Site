"use client";

import { useCallback, useRef, useState } from "react";
import {
  downloadBlob,
  formatBytes,
  sanitizeBaseName,
} from "@/lib/client-pdf-utils";

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

/* ── Types ─────────────────────────────────────────────── */

type EditableTextBlock = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFace: string;
  color: string;
  bold: boolean;
  italic: boolean;
};

type BackgroundRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

type ExtractedTextFragment = EditableTextBlock & {
  right: number;
  bottom: number;
};

type ConvertedPage = {
  pageNumber: number;
  widthPoints: number;
  heightPoints: number;
  textBlocks: EditableTextBlock[];
  backgroundRects: BackgroundRect[];
  baseImageDataUrl: string;
  fallbackImageDataUrl: string | null;
};

type PdfJsModule = {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (source: { data: Uint8Array }) => {
    promise: Promise<PdfJsDocument>;
  };
};

type PdfJsDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getViewport: (options: { scale: number }) => { width: number; height: number };
    render: (options: unknown) => { promise: Promise<void> };
    getTextContent: () => Promise<PdfJsTextContent>;
  }>;
  destroy?: () => Promise<void>;
};

type PdfJsTextStyle = {
  fontFamily?: string;
};

type PdfJsTextItem = {
  str: string;
  transform: number[];
  width: number;
  height?: number;
  fontName?: string;
};

type PdfJsTextContent = {
  items: Array<PdfJsTextItem | { str?: string }>;
  styles?: Record<string, PdfJsTextStyle>;
};

type PptxSlideInstance = {
  addImage: (options: { data: string; x: number; y: number; w: number; h: number }) => void;
  addShape: (
    shapeName: "rect",
    options: {
      x: number;
      y: number;
      w: number;
      h: number;
      line?: { color?: string; transparency?: number; pt?: number };
      fill?: { color?: string; transparency?: number };
    },
  ) => void;
  addText: (
    text: string,
    options: {
      x: number;
      y: number;
      w: number;
      h: number;
      fontFace?: string;
      fontSize?: number;
      color?: string;
      bold?: boolean;
      italic?: boolean;
      margin?: number;
      valign?: "top" | "mid" | "bottom";
      fit?: "shrink" | "resize" | "none";
      breakLine?: boolean;
      align?: "left" | "center" | "right";
    },
  ) => void;
};

type PptxGenJsInstance = {
  defineLayout: (layout: { name: string; width: number; height: number }) => void;
  layout: string;
  addSlide: () => PptxSlideInstance;
  write: (options: { outputType: "blob" }) => Promise<Blob>;
};

type PptxGenJsConstructor = new () => PptxGenJsInstance;

declare global {
  interface Window {
    PptxGenJS?: PptxGenJsConstructor;
  }
}

let pdfjsPromise: Promise<PdfJsModule> | null = null;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function quantizeChannel(value: number) {
  return Math.min(255, Math.max(0, Math.round(value / 16) * 16));
}

function toHexColor(red: number, green: number, blue: number) {
  return [red, green, blue]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function fromHexColor(hex: string): [number, number, number] {
  const normalized = hex.replace(/#/g, "").padStart(6, "0").slice(0, 6);
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function colorDistance(left: string, right: string) {
  const [lr, lg, lb] = fromHexColor(left);
  const [rr, rg, rb] = fromHexColor(right);
  return Math.sqrt((lr - rr) ** 2 + (lg - rg) ** 2 + (lb - rb) ** 2);
}

function darknessOfHex(hex: string) {
  const [red, green, blue] = fromHexColor(hex);
  return 255 - (0.299 * red + 0.587 * green + 0.114 * blue);
}

function isNearWhite(hex: string, tolerance = 18) {
  return colorDistance(hex, "FFFFFF") <= tolerance;
}

function isNearGray(hex: string, tolerance = 14) {
  const [red, green, blue] = fromHexColor(hex);
  return Math.max(Math.abs(red - green), Math.abs(green - blue), Math.abs(red - blue)) <= tolerance;
}

function stripFontVariant(value: string) {
  return value
    .replace(/^[A-Z]{6}\+/, "")
    .replace(/[-_](Bold|Italic|Oblique|Regular|Medium|Roman|PSMT|MT)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFontFace(fontFamily?: string, fontName?: string) {
  const raw = stripFontVariant((fontFamily ?? fontName ?? "Arial").split(",")[0] ?? "Arial");
  if (!raw) return "Arial";
  if (/monospace|courier/i.test(raw)) return "Courier New";
  if (/times/i.test(raw)) return "Times New Roman";
  if (/calibri/i.test(raw)) return "Calibri";
  if (/cambria/i.test(raw)) return "Cambria";
  if (/arial|helvetica|sans/i.test(raw)) return "Arial";
  return raw;
}

function inferFontTraits(fontFamily?: string, fontName?: string) {
  const source = `${fontFamily ?? ""} ${fontName ?? ""}`;
  return {
    bold: /bold|black|semibold|demibold/i.test(source),
    italic: /italic|oblique/i.test(source),
  };
}

function sampleTextColor(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const sampleX = Math.max(0, Math.floor(x));
  const sampleY = Math.max(0, Math.floor(y));
  const sampleWidth = Math.max(1, Math.ceil(width));
  const sampleHeight = Math.max(1, Math.ceil(height));

  const { data } = context.getImageData(sampleX, sampleY, sampleWidth, sampleHeight);
  const buckets = new Map<string, number>();

  for (let index = 0; index < data.length; index += 16) {
    const alpha = data[index + 3];
    if (alpha < 80) continue;

    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    if (red > 245 && green > 245 && blue > 245) continue;

    const bucket = toHexColor(
      quantizeChannel(red),
      quantizeChannel(green),
      quantizeChannel(blue),
    );
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  }

  if (buckets.size === 0) {
    return "000000";
  }

  let selected = "000000";
  let maxCount = -1;
  let darkestCandidate = "000000";
  let darkestCount = 0;
  let darkestScore = -1;

  for (const [bucket, count] of buckets.entries()) {
    if (count > maxCount) {
      selected = bucket;
      maxCount = count;
    }

    const score = darknessOfHex(bucket);
    if (score > darkestScore) {
      darkestCandidate = bucket;
      darkestScore = score;
      darkestCount = count;
    }
  }

  if (darkestCount >= Math.max(2, Math.floor(maxCount * 0.18))) {
    return darkestCandidate;
  }

  return selected;
}

function sampleRectFillColor(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) {
  const x1 = clamp(Math.floor(left), 0, width - 1);
  const y1 = clamp(Math.floor(top), 0, height - 1);
  const x2 = clamp(Math.ceil(right), 0, width - 1);
  const y2 = clamp(Math.ceil(bottom), 0, height - 1);

  const buckets = new Map<string, number>();
  const stepX = Math.max(1, Math.floor((x2 - x1) / 12));
  const stepY = Math.max(1, Math.floor((y2 - y1) / 12));

  for (let sampleY = y1; sampleY <= y2; sampleY += stepY) {
    for (let sampleX = x1; sampleX <= x2; sampleX += stepX) {
      const index = (sampleY * width + sampleX) * 4;
      const alpha = pixels[index + 3];
      if (alpha < 10) continue;

      const bucket = toHexColor(
        quantizeChannel(pixels[index]),
        quantizeChannel(pixels[index + 1]),
        quantizeChannel(pixels[index + 2]),
      );
      buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
    }
  }

  if (buckets.size === 0) {
    return "FFFFFF";
  }

  let selected = "FFFFFF";
  let maxCount = -1;
  for (const [bucket, count] of buckets.entries()) {
    if (count > maxCount) {
      selected = bucket;
      maxCount = count;
    }
  }

  return selected;
}

function sampleOuterFillColor(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) {
  const x1 = clamp(Math.floor(left), 0, width - 1);
  const y1 = clamp(Math.floor(top), 0, height - 1);
  const x2 = clamp(Math.ceil(right), 0, width - 1);
  const y2 = clamp(Math.ceil(bottom), 0, height - 1);
  const expandX = Math.max(2, Math.round((x2 - x1) * 0.16));
  const expandY = Math.max(2, Math.round((y2 - y1) * 0.25));

  const outerLeft = clamp(x1 - expandX, 0, width - 1);
  const outerTop = clamp(y1 - expandY, 0, height - 1);
  const outerRight = clamp(x2 + expandX, 0, width - 1);
  const outerBottom = clamp(y2 + expandY, 0, height - 1);

  const buckets = new Map<string, number>();

  for (let sampleY = outerTop; sampleY <= outerBottom; sampleY += Math.max(1, Math.floor((outerBottom - outerTop) / 10))) {
    for (let sampleX = outerLeft; sampleX <= outerRight; sampleX += Math.max(1, Math.floor((outerRight - outerLeft) / 10))) {
      const insideOriginal = sampleX >= x1 && sampleX <= x2 && sampleY >= y1 && sampleY <= y2;
      if (insideOriginal) {
        continue;
      }

      const index = (sampleY * width + sampleX) * 4;
      const alpha = pixels[index + 3];
      if (alpha < 10) continue;

      const bucket = toHexColor(
        quantizeChannel(pixels[index]),
        quantizeChannel(pixels[index + 1]),
        quantizeChannel(pixels[index + 2]),
      );
      buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
    }
  }

  if (buckets.size === 0) {
    return sampleRectFillColor(pixels, width, height, left, top, right, bottom);
  }

  let selected = "FFFFFF";
  let maxCount = -1;
  let brightest = "FFFFFF";
  let brightestScore = Number.POSITIVE_INFINITY;

  for (const [bucket, count] of buckets.entries()) {
    if (count > maxCount) {
      selected = bucket;
      maxCount = count;
    }

    const darkness = darknessOfHex(bucket);
    if (darkness < brightestScore) {
      brightest = bucket;
      brightestScore = darkness;
    }
  }

  return isNearWhite(selected, 28) ? selected : (maxCount <= 2 ? brightest : selected);
}

function eraseEditableTextFromCanvas(
  context: CanvasRenderingContext2D,
  blocks: EditableTextBlock[],
  pageWidth: number,
  pageHeight: number,
) {
  const { width, height } = context.canvas;
  const pixels = context.getImageData(0, 0, width, height).data;

  for (const block of blocks) {
    const left = Math.max(0, (block.x / pageWidth) * width - 2);
    const top = Math.max(0, (block.y / pageHeight) * height - 1);
    const right = Math.min(width, ((block.x + block.width) / pageWidth) * width + 2);
    const bottom = Math.min(height, ((block.y + block.height) / pageHeight) * height + 1);
    const fill = sampleOuterFillColor(pixels, width, height, left, top, right, bottom);

    context.fillStyle = `#${fill}`;
    context.fillRect(left, top, Math.max(1, right - left), Math.max(1, bottom - top));
  }
}

function estimateGapSpaces(gap: number, fontSize: number, fontFace: string) {
  if (gap <= 0.012) {
    return "";
  }

  const averageCharacterWidth = Math.max(
    0.04,
    (fontSize * (/courier/i.test(fontFace) ? 0.58 : 0.46)) / 72,
  );
  const count = clamp(Math.round(gap / averageCharacterWidth), 1, 8);
  return " ".repeat(count);
}

function canMergeFragments(left: ExtractedTextFragment, right: ExtractedTextFragment) {
  const similarFontSize = Math.abs(left.fontSize - right.fontSize) <= 0.8;
  const similarColor = colorDistance(left.color, right.color) <= 24;
  return left.fontFace === right.fontFace
    && left.bold === right.bold
    && left.italic === right.italic
    && similarFontSize
    && similarColor;
}

function mergeBackgroundRects(rects: BackgroundRect[]) {
  const sorted = [...rects].sort((left, right) => {
    const yDiff = left.y - right.y;
    return Math.abs(yDiff) > 0.03 ? yDiff : left.x - right.x;
  });

  const merged: BackgroundRect[] = [];
  for (const rect of sorted) {
    const last = merged.at(-1);
    if (
      last
      && colorDistance(last.color, rect.color) <= 14
      && Math.abs(last.x - rect.x) <= 0.14
      && Math.abs(last.width - rect.width) <= 0.18
      && rect.y <= last.y + last.height + 0.045
    ) {
      last.x = Math.min(last.x, rect.x);
      last.y = Math.min(last.y, rect.y);
      last.width = Math.max(last.x + last.width, rect.x + rect.width) - last.x;
      last.height = Math.max(last.y + last.height, rect.y + rect.height) - last.y;
      continue;
    }

    merged.push({ ...rect });
  }

  return merged;
}

function buildEditableRuns(
  fragments: ExtractedTextFragment[],
  pixels: Uint8ClampedArray,
  pixelWidth: number,
  pixelHeight: number,
  pageWidth: number,
  pageHeight: number,
) {
  if (fragments.length === 0) {
    return { textBlocks: [] as EditableTextBlock[], backgroundRects: [] as BackgroundRect[] };
  }

  const sorted = [...fragments].sort((left, right) => {
    const yDiff = left.y - right.y;
    return Math.abs(yDiff) > 0.02 ? yDiff : left.x - right.x;
  });

  const lines: ExtractedTextFragment[][] = [];
  for (const fragment of sorted) {
    const fragmentCenterY = fragment.y + fragment.height / 2;
    const existing = lines.find((line) => {
      const ref = line[0];
      const refCenterY = ref.y + ref.height / 2;
      return Math.abs(refCenterY - fragmentCenterY) <= Math.max(ref.height, fragment.height) * 0.6;
    });

    if (existing) {
      existing.push(fragment);
    } else {
      lines.push([fragment]);
    }
  }

  const contentLeft = Math.max(0, Math.min(...fragments.map((fragment) => fragment.x)) - 0.08);
  const contentRight = Math.min(pageWidth, Math.max(...fragments.map((fragment) => fragment.right)) + 0.08);

  const textBlocks: EditableTextBlock[] = [];
  const backgroundRects: BackgroundRect[] = [];

  for (const line of lines) {
    const ordered = [...line].sort((left, right) => left.x - right.x);
    const lineLeft = Math.min(...ordered.map((fragment) => fragment.x));
    const lineTop = Math.min(...ordered.map((fragment) => fragment.y));
    const lineRight = Math.max(...ordered.map((fragment) => fragment.right));
    const lineBottom = Math.max(...ordered.map((fragment) => fragment.bottom));
    const lineWidth = lineRight - lineLeft;
    const lineHeight = lineBottom - lineTop;

    const candidateLeft = lineWidth >= pageWidth * 0.22 ? contentLeft : Math.max(0, lineLeft - 0.04);
    const candidateRight = lineWidth >= pageWidth * 0.22 ? contentRight : Math.min(pageWidth, lineRight + 0.05);
    const candidateTop = Math.max(0, lineTop - 0.015);
    const candidateBottom = Math.min(pageHeight, lineBottom + 0.018);
    const candidateColor = sampleRectFillColor(
      pixels,
      pixelWidth,
      pixelHeight,
      (candidateLeft / pageWidth) * pixelWidth,
      (candidateTop / pageHeight) * pixelHeight,
      (candidateRight / pageWidth) * pixelWidth,
      (candidateBottom / pageHeight) * pixelHeight,
    );

    if (!isNearWhite(candidateColor, 20) && (isNearGray(candidateColor) || darknessOfHex(candidateColor) > 8)) {
      backgroundRects.push({
        x: candidateLeft,
        y: candidateTop,
        width: candidateRight - candidateLeft,
        height: candidateBottom - candidateTop,
        color: candidateColor,
      });
    }

    let current = { ...ordered[0] };
    for (const fragment of ordered.slice(1)) {
      const gap = fragment.x - current.right;
      const maxGap = Math.max(
        (Math.min(current.fontSize, fragment.fontSize) / 72) * (/courier/i.test(current.fontFace) ? 7 : 3.6),
        0.09,
      );

      if (canMergeFragments(current, fragment) && gap <= maxGap) {
        current.text = `${current.text}${estimateGapSpaces(gap, current.fontSize, current.fontFace)}${fragment.text.trimStart()}`;
        current.width = Math.max(current.right, fragment.right) - current.x;
        current.height = Math.max(current.bottom, fragment.bottom) - Math.min(current.y, fragment.y);
        current.y = Math.min(current.y, fragment.y);
        current.right = Math.max(current.right, fragment.right);
        current.bottom = Math.max(current.bottom, fragment.bottom);
        continue;
      }

      textBlocks.push({
        text: current.text,
        x: current.x,
        y: current.y,
        width: current.width,
        height: current.height,
        fontSize: current.fontSize,
        fontFace: current.fontFace,
        color: current.color,
        bold: current.bold,
        italic: current.italic,
      });
      current = { ...fragment };
    }

    textBlocks.push({
      text: current.text,
      x: current.x,
      y: current.y,
      width: current.width,
      height: current.height,
      fontSize: current.fontSize,
      fontFace: current.fontFace,
      color: current.color,
      bold: current.bold,
      italic: current.italic,
    });
  }

  return {
    textBlocks,
    backgroundRects: mergeBackgroundRects(backgroundRects),
  };
}

function resolvePptxGenJsGlobal(): PptxGenJsConstructor | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const browserGlobal = window as Window & typeof globalThis;
  return browserGlobal.PptxGenJS ?? (globalThis as Window & typeof globalThis).PptxGenJS;
}

/* ── Helpers ───────────────────────────────────────────── */

async function getPdfjs() {
  if (!pdfjsPromise) {
    const importPdfjs = new Function("moduleUrl", "return import(moduleUrl);") as (moduleUrl: string) => Promise<PdfJsModule>;
    pdfjsPromise = importPdfjs("/vendor/pdfjs/pdf.mjs").then((pdfjs) => {
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
      }
      return pdfjs;
    });
  }

  return pdfjsPromise;
}

async function loadPdfDocument(bytes: ArrayBuffer): Promise<PdfJsDocument> {
  const pdfjs = await getPdfjs();
  return pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)) }).promise;
}

async function getPptxGenJs(): Promise<PptxGenJsConstructor> {
  if (typeof window === "undefined") {
    throw new Error("PowerPoint export is only available in the browser.");
  }

  const existingGlobal = resolvePptxGenJsGlobal();
  if (existingGlobal) {
    return existingGlobal;
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-pptxgenjs="true"]');
    if (existingScript) {
      const loadedGlobal = resolvePptxGenJsGlobal();
      if (loadedGlobal) {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load PowerPoint generator.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "/vendor/pptxgenjs/pptxgen.bundle.js";
    script.async = true;
    script.dataset.pptxgenjs = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load PowerPoint generator."));
    document.head.appendChild(script);
  });

  const initializedGlobal = resolvePptxGenJsGlobal();
  if (!initializedGlobal) {
    throw new Error("PowerPoint generator did not initialize correctly.");
  }

  return initializedGlobal;
}

async function extractEditablePage(
  pdfDoc: PdfJsDocument,
  pageNumber: number,
): Promise<ConvertedPage> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const samplingScale = 2;
  const samplingViewport = page.getViewport({ scale: samplingScale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(samplingViewport.width);
  canvas.height = Math.ceil(samplingViewport.height);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: samplingViewport, canvas } as never).promise;

  const textContent = await page.getTextContent();
  const extractedFragments: ExtractedTextFragment[] = [];

  for (const rawItem of textContent.items) {
    if (!("str" in rawItem) || !rawItem.str || !rawItem.str.trim()) {
      continue;
    }

    const item = rawItem as PdfJsTextItem;
    const rawFontHeight = Math.max(
      Math.abs(item.transform[3] ?? 0),
      item.height ?? 0,
      6,
    );
    const textWidth = Math.max(item.width, rawFontHeight * 0.35);
    const textHeight = Math.max(rawFontHeight * 1.15, 8);
    const top = Math.max(0, viewport.height - item.transform[5] - rawFontHeight);
    const style = item.fontName ? textContent.styles?.[item.fontName] : undefined;
    const traits = inferFontTraits(style?.fontFamily, item.fontName);
    const x = item.transform[4] / 72;
    const y = top / 72;
    const width = textWidth / 72;
    const height = textHeight / 72;

    extractedFragments.push({
      text: item.str.replace(/\s+/g, " ").trim(),
      x,
      y,
      width,
      height,
      fontSize: clamp(rawFontHeight * 0.84, 6, 36),
      fontFace: normalizeFontFace(style?.fontFamily, item.fontName),
      color: sampleTextColor(
        ctx,
        item.transform[4] * samplingScale,
        top * samplingScale,
        textWidth * samplingScale,
        textHeight * samplingScale,
      ),
      bold: traits.bold,
      italic: traits.italic,
      right: x + width,
      bottom: y + height,
    });
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { textBlocks, backgroundRects } = buildEditableRuns(
    extractedFragments,
    imageData.data,
    canvas.width,
    canvas.height,
    viewport.width / 72,
    viewport.height / 72,
  );

  const pageWidthInches = viewport.width / 72;
  const pageHeightInches = viewport.height / 72;
  eraseEditableTextFromCanvas(ctx, textBlocks, pageWidthInches, pageHeightInches);
  const cleanedBaseImageDataUrl = canvas.toDataURL("image/png", 1);

  return {
    pageNumber,
    widthPoints: viewport.width,
    heightPoints: viewport.height,
    textBlocks,
    backgroundRects,
    baseImageDataUrl: cleanedBaseImageDataUrl,
    fallbackImageDataUrl: textBlocks.length === 0 ? canvas.toDataURL("image/png", 1) : null,
  };
}

/** Build a PPTX file from extracted editable text and fallback page images. */
async function buildPptx(pages: ConvertedPage[]): Promise<Blob> {
  const PptxGenJS = await getPptxGenJs();
  const pptx = new PptxGenJS();

  const firstPage = pages[0];
  const layoutName = "PdfPage";
  const layoutWidth = firstPage.widthPoints / 72;
  const layoutHeight = firstPage.heightPoints / 72;

  pptx.defineLayout({ name: layoutName, width: layoutWidth, height: layoutHeight });
  pptx.layout = layoutName;

  for (const page of pages) {
    const pptxSlide = pptx.addSlide();
    const pageWidth = page.widthPoints / 72;
    const pageHeight = page.heightPoints / 72;
    const fitScale = Math.min(layoutWidth / pageWidth, layoutHeight / pageHeight);
    const offsetX = (layoutWidth - pageWidth * fitScale) / 2;
    const offsetY = (layoutHeight - pageHeight * fitScale) / 2;

    pptxSlide.addImage({
      data: page.baseImageDataUrl,
      x: offsetX,
      y: offsetY,
      w: pageWidth * fitScale,
      h: pageHeight * fitScale,
    });

    if (page.fallbackImageDataUrl) {
      continue;
    }

    for (const block of page.textBlocks) {
      pptxSlide.addText(block.text, {
        x: offsetX + block.x * fitScale,
        y: offsetY + block.y * fitScale,
        w: Math.max(0.05, block.width * fitScale),
        h: Math.max(0.05, block.height * fitScale * 1.04),
        fontFace: block.fontFace,
        fontSize: block.fontSize * fitScale,
        color: block.color,
        bold: block.bold,
        italic: block.italic,
        margin: 0,
        valign: "top",
        fit: "shrink",
      });
    }
  }

  const output = await pptx.write({ outputType: "blob" });
  return output as Blob;
}

/* ── Component ─────────────────────────────────────────── */

export default function PdfToPowerpointTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [slideCount, setSlideCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── File handling ── */

  const loadFile = useCallback(async (incoming: File) => {
    setErrorMessage(null);
    if (incoming.size > MAX_FILE_SIZE) {
      setErrorMessage(`File exceeds the 1GB size limit.`);
      return;
    }
    setResultBlob(null);
    setSlideCount(0);

    if (!incoming.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please upload a valid PDF file.");
      return;
    }

    try {
      const bytes = await incoming.arrayBuffer();
      const pdfDoc = await loadPdfDocument(bytes);
      const count = pdfDoc.numPages;
      await pdfDoc.destroy?.();
      setFile(incoming);
      setPdfBytes(bytes);
      setPageCount(count);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not read the PDF file.");
    }
  }, []);

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      loadFile(fileList[0]);
    },
    [loadFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      addFiles(event.dataTransfer.files);
    },
    [addFiles],
  );

  /* ── Conversion ── */

  const handleConvert = useCallback(async () => {
    if (!pdfBytes || !file) return;

    setProcessing(true);
    setResultBlob(null);
    setErrorMessage(null);
    setProgress({ done: 0, total: pageCount });

    try {
      const pages: ConvertedPage[] = [];
      const pdfDoc = await loadPdfDocument(pdfBytes);

      for (let i = 1; i <= pageCount; i++) {
        const page = await extractEditablePage(pdfDoc, i);
        pages.push(page);
        setProgress({ done: i, total: pageCount });
      }

      await pdfDoc.destroy?.();

      const blob = await buildPptx(pages);
      setResultBlob(blob);
      setSlideCount(pages.length);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to convert the PDF to PowerPoint.",
      );
    } finally {
      setProcessing(false);
    }
  }, [pdfBytes, file, pageCount]);

  /* ── Download ── */

  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const baseName = sanitizeBaseName(file.name);
    downloadBlob(resultBlob, `${baseName}.pptx`);
  }, [resultBlob, file]);

  /* ── Reset ── */

  const handleReset = useCallback(() => {
    setFile(null);
    setPdfBytes(null);
    setPageCount(0);
    setResultBlob(null);
    setSlideCount(0);
    setErrorMessage(null);
    setProgress({ done: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  /* ── UI ── */

  return (
    <div className="space-y-4">
      {/* ── Upload area ── */}
      {!resultBlob && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ffb347] to-[#38d9a9]" />

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
                  : file
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border hover:border-border-strong"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(event) => {
                  addFiles(event.target.files);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">
                📊
              </div>

              {file ? (
                <>
                  <p className="mt-3 text-sm font-semibold text-white">{file.name}</p>
                  <p className="mt-1 text-xs text-muted-2">
                    {formatBytes(file.size)} · {pageCount} page{pageCount !== 1 ? "s" : ""}
                  </p>
                  <p className="mt-2 text-xs text-[#6c63ff]">Click or drop to change file</p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm font-semibold text-white">
                    Drop your PDF file here or <span className="text-[#6c63ff]">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-2">
                    Convert PDF text into editable PowerPoint objects directly in your browser. Pages without extractable text are kept as images.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Error message ── */}
      {errorMessage && !processing && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {/* ── Convert button ── */}
      {file && !resultBlob && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-t border-border px-5 py-4 text-center">
            <button
              onClick={handleConvert}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
            >
              📊 Convert to PowerPoint
            </button>
          </div>
        </div>
      )}

      {/* ── Processing ── */}
      {processing && (
        <div className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface px-5 py-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-[#6c63ff]" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-4 border-border border-b-[#ffb347]"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>
          <p className="text-sm font-semibold text-white">
            Extracting and rebuilding page {progress.done} of {progress.total}…
          </p>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-[#6c63ff] transition-all duration-300"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {resultBlob && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">
                ✓
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">
                Your editable PowerPoint is ready!
              </h3>
              <button
                onClick={handleDownload}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ Download PPTX
              </button>
              <p className="mt-4 text-sm text-muted">
                {slideCount} slide{slideCount !== 1 ? "s" : ""} created · {formatBytes(resultBlob.size)}
              </p>
            </div>
          </div>

          {/* Reset */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface px-5 py-4 text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[.03]"
            >
              Convert Another PDF
            </button>
          </div>
        </>
      )}

      <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-3 text-center">
        <p className="text-[11px] leading-relaxed text-amber-200/70">
          ⚠️ This tool is under active development. Some complex layouts, custom fonts, layered graphics, or advanced formatting may not convert perfectly.
        </p>
      </div>
    </div>
  );
}
