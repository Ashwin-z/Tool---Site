"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { degrees, PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  downloadBlob,
  formatBytes,
  sanitizeBaseName,
} from "@/lib/client-pdf-utils";

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

type LoadedPdf = {
  file: File;
  bytes: ArrayBuffer;
  pageCount: number;
};

type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { data: ArrayBuffer }) => {
    promise: Promise<{
      getPage: (pageNumber: number) => Promise<{
        getViewport: (options: { scale: number }) => { width: number; height: number };
        render: (options: unknown) => { promise: Promise<void> };
      }>;
      destroy?: () => void;
    }>;
  };
};

let pdfjsPromise: Promise<PdfJsModule> | null = null;

type WatermarkMode = "text" | "image";
type TransparencyPreset = "none" | "25" | "50" | "75";
type RotationPreset = 0 | 90 | 180 | 270;
type LayerPreset = "over" | "under";
type MarginPreset = "small" | "recommended" | "big";
type PositionKey =
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "middleLeft"
  | "middleCenter"
  | "middleRight"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight";

type GridIndex = { row: number; col: number };

const POSITION_LABELS: Record<PositionKey, string> = {
  topLeft: "Top left",
  topCenter: "Top center",
  topRight: "Top right",
  middleLeft: "Middle left",
  middleCenter: "Middle center",
  middleRight: "Middle right",
  bottomLeft: "Bottom left",
  bottomCenter: "Bottom center",
  bottomRight: "Bottom right",
};

const POSITION_ORDER: PositionKey[] = [
  "topLeft",
  "topCenter",
  "topRight",
  "middleLeft",
  "middleCenter",
  "middleRight",
  "bottomLeft",
  "bottomCenter",
  "bottomRight",
];

const POSITION_GRID_INDEX: Record<PositionKey, GridIndex> = {
  topLeft: { row: 0, col: 0 },
  topCenter: { row: 0, col: 1 },
  topRight: { row: 0, col: 2 },
  middleLeft: { row: 1, col: 0 },
  middleCenter: { row: 1, col: 1 },
  middleRight: { row: 1, col: 2 },
  bottomLeft: { row: 2, col: 0 },
  bottomCenter: { row: 2, col: 1 },
  bottomRight: { row: 2, col: 2 },
};

const MARGIN_VALUES: Record<MarginPreset, number> = {
  small: 20,
  recommended: 36,
  big: 52,
};

const TRANSPARENCY_VALUES: Record<TransparencyPreset, number> = {
  none: 1,
  "25": 0.25,
  "50": 0.5,
  "75": 0.75,
};

const FONT_OPTIONS = ["Arial", "Times New Roman", "Courier New"] as const;
type FontOption = (typeof FONT_OPTIONS)[number];

const FONT_MAP: Record<FontOption, { regular: string; bold: string; italic: string; boldItalic: string }> = {
  Arial: {
    regular: StandardFonts.Helvetica,
    bold: StandardFonts.HelveticaBold,
    italic: StandardFonts.HelveticaOblique,
    boldItalic: StandardFonts.HelveticaBoldOblique,
  },
  "Times New Roman": {
    regular: StandardFonts.TimesRoman,
    bold: StandardFonts.TimesRomanBold,
    italic: StandardFonts.TimesRomanItalic,
    boldItalic: StandardFonts.TimesRomanBoldItalic,
  },
  "Courier New": {
    regular: StandardFonts.Courier,
    bold: StandardFonts.CourierBold,
    italic: StandardFonts.CourierOblique,
    boldItalic: StandardFonts.CourierBoldOblique,
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function safeInt(value: number, min: number, max: number): number {
  return clamp(Number.isFinite(value) ? Math.floor(value) : min, min, max);
}

function normalizeRotation(value: number): number {
  return ((value % 360) + 360) % 360;
}

function getFacingPosition(position: PositionKey, pageIndex: number): PositionKey {
  if (pageIndex % 2 !== 0) return position;

  switch (position) {
    case "topLeft": return "topRight";
    case "topRight": return "topLeft";
    case "middleLeft": return "middleRight";
    case "middleRight": return "middleLeft";
    case "bottomLeft": return "bottomRight";
    case "bottomRight": return "bottomLeft";
    default: return position;
  }
}

function getPosition(pageWidth: number, pageHeight: number, position: PositionKey, margin: number, boxWidth: number, boxHeight: number) {
  const centerX = pageWidth / 2;
  const middleY = pageHeight / 2 - boxHeight / 2;

  switch (position) {
    case "topLeft": return { x: margin, y: pageHeight - margin - boxHeight, align: "left" as const };
    case "topCenter": return { x: centerX, y: pageHeight - margin - boxHeight, align: "center" as const };
    case "topRight": return { x: pageWidth - margin, y: pageHeight - margin - boxHeight, align: "right" as const };
    case "middleLeft": return { x: margin, y: middleY, align: "left" as const };
    case "middleCenter": return { x: centerX, y: middleY, align: "center" as const };
    case "middleRight": return { x: pageWidth - margin, y: middleY, align: "right" as const };
    case "bottomLeft": return { x: margin, y: margin, align: "left" as const };
    case "bottomCenter": return { x: centerX, y: margin, align: "center" as const };
    case "bottomRight":
    default:
      return { x: pageWidth - margin, y: margin, align: "right" as const };
  }
}

function calculateTextSize(text: string, fontSize: number, isBold: boolean, isMosaic: boolean) {
  const baseWidth = Math.max(text.length, 1) * fontSize * (isBold ? 0.62 : 0.55);
  const width = isMosaic ? baseWidth + 40 : baseWidth + 24;
  const height = fontSize * (isMosaic ? 1.8 : 1.4);
  return { width, height };
}

function makeTextStyleKey(font: FontOption, bold: boolean, italic: boolean): keyof typeof FONT_MAP[FontOption] {
  if (bold && italic) return "boldItalic";
  if (bold) return "bold";
  if (italic) return "italic";
  return "regular";
}

async function loadPdf(file: File): Promise<LoadedPdf> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  return { file, bytes, pageCount: pdf.getPageCount() };
}

async function getPdfjs(): Promise<PdfJsModule> {
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

async function renderPreview(bytes: ArrayBuffer, pageNumber: number): Promise<string> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 0.72 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Could not create a preview canvas.");

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport, canvas } as never).promise;
  pdf.destroy?.();
  return canvas.toDataURL("image/png", 0.92);
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

async function loadImageElement(source: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const image = document.createElement("img");
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unsupported image format."));
    image.src = source;
  });
}

async function embedImage(pdf: PDFDocument, file: File) {
  const mimeType = file.type.toLowerCase();
  const bytes = await file.arrayBuffer();

  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return await pdf.embedJpg(bytes);
  }

  if (mimeType === "image/png") {
    return await pdf.embedPng(bytes);
  }

  const dataUrl = await fileToDataUrl(file);
  const imageElement = await loadImageElement(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = imageElement.naturalWidth || imageElement.width;
  canvas.height = imageElement.naturalHeight || imageElement.height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Failed to prepare the image watermark.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

  const pngData = canvas.toDataURL("image/png");
  const response = await fetch(pngData);
  const pngBytes = await response.arrayBuffer();
  return await pdf.embedPng(pngBytes);
}

async function applyWatermark(bytes: ArrayBuffer, options: {
  mode: WatermarkMode;
  text: string;
  textFont: FontOption;
  textBold: boolean;
  textItalic: boolean;
  textColor: string;
  imageFile: File | null;
  position: PositionKey;
  mosaic: boolean;
  transparency: TransparencyPreset;
  rotation: RotationPreset;
  pageMode: "single" | "facing";
  layer: LayerPreset;
  fromPage: number;
  toPage: number;
  fontSize: number;
}): Promise<Uint8Array> {
  const source = await PDFDocument.load(bytes.slice(0));
  const output = await PDFDocument.create();
  const pages = source.getPages();
  const pageCount = pages.length;
  const firstPage = safeInt(options.fromPage, 1, pageCount);
  const lastPage = safeInt(options.toPage, firstPage, pageCount);
  const start = Math.min(firstPage, lastPage);
  const end = Math.max(firstPage, lastPage);
  const alpha = TRANSPARENCY_VALUES[options.transparency];
  const margin = MARGIN_VALUES.recommended;
  const watermarkText = options.text.trim() || "iLovePDF";
  const selectedImage = options.imageFile;
  const imageEmbed = options.mode === "image" && selectedImage ? await embedImage(output, selectedImage) : null;
  const fontKey = makeTextStyleKey(options.textFont, options.textBold, options.textItalic);
  const font = await output.embedFont(FONT_MAP[options.textFont][fontKey]);
  const color = hexToRgb(options.textColor);

  for (let index = 0; index < pages.length; index += 1) {
    const sourcePage = pages[index];
    const pageNumber = index + 1;
    const withinRange = pageNumber >= start && pageNumber <= end;
    const width = sourcePage.getWidth();
    const height = sourcePage.getHeight();

    if (options.layer === "under") {
      const outputPage = output.addPage([width, height]);

      if (withinRange) {
        drawWatermark(outputPage, {
          mode: options.mode,
          text: watermarkText,
          font,
          color,
          imageEmbed,
          width,
          height,
          position: options.pageMode === "facing" ? getFacingPosition(options.position, pageNumber) : options.position,
          mosaic: options.mosaic,
          alpha,
          rotation: options.rotation,
          fontSize: options.fontSize,
          margin,
        });
      }

      const embeddedPage = await output.embedPage(sourcePage);
      outputPage.drawPage(embeddedPage, { x: 0, y: 0, width, height });
      continue;
    }

    const [copiedPage] = await output.copyPages(source, [index]);
    output.addPage(copiedPage);

    if (withinRange) {
      drawWatermark(copiedPage, {
        mode: options.mode,
        text: watermarkText,
        font,
        color,
        imageEmbed,
        width,
        height,
        position: options.pageMode === "facing" ? getFacingPosition(options.position, pageNumber) : options.position,
        mosaic: options.mosaic,
        alpha,
        rotation: options.rotation,
        fontSize: options.fontSize,
        margin,
      });
    }
  }

  return await output.save();
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "").trim();
  const normalized = value.length === 3 ? value.split("").map((char) => char + char).join("") : value.padStart(6, "0");
  const red = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const green = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(normalized.slice(4, 6), 16) / 255;
  return rgb(clamp(red, 0, 1), clamp(green, 0, 1), clamp(blue, 0, 1));
}

function drawWatermark(page: any, options: {
  mode: WatermarkMode;
  text: string;
  font: any;
  color: ReturnType<typeof rgb>;
  imageEmbed: any;
  width: number;
  height: number;
  position: PositionKey;
  mosaic: boolean;
  alpha: number;
  rotation: RotationPreset;
  fontSize: number;
  margin: number;
}) {
  if (options.mode === "text") {
    const { width: boxWidth, height: boxHeight } = calculateTextSize(options.text, options.fontSize, options.font.name?.includes("Bold") ?? false, options.mosaic);
    const positions = options.mosaic ? getMosaicPositions(options.width, options.height, boxWidth, boxHeight, options.margin) : [getPosition(options.width, options.height, options.position, options.margin, boxWidth, boxHeight)];

    positions.forEach((entry) => {
      const rotatedY = entry.y;
      const textWidth = options.font.widthOfTextAtSize(options.text, options.fontSize);
      const x = entry.align === "center" ? entry.x - textWidth / 2 : entry.align === "right" ? entry.x - textWidth : entry.x;

      page.drawText(options.text, {
        x,
        y: rotatedY,
        size: options.fontSize,
        font: options.font,
        color: options.color,
        opacity: options.alpha,
        rotate: degrees(options.rotation),
      });
    });
    return;
  }

  if (!options.imageEmbed) return;

  const maxWidth = options.mosaic ? 140 : 180;
  const scale = Math.min(maxWidth / options.imageEmbed.width, 1);
  const imageWidth = options.imageEmbed.width * scale;
  const imageHeight = options.imageEmbed.height * scale;
  const positions = options.mosaic ? getMosaicPositions(options.width, options.height, imageWidth, imageHeight, options.margin) : [getPosition(options.width, options.height, options.position, options.margin, imageWidth, imageHeight)];

  positions.forEach((entry) => {
    const x = entry.align === "center" ? entry.x - imageWidth / 2 : entry.align === "right" ? entry.x - imageWidth : entry.x;
    page.drawImage(options.imageEmbed, {
      x,
      y: entry.y,
      width: imageWidth,
      height: imageHeight,
      opacity: options.alpha,
      rotate: degrees(options.rotation),
    });
  });
}

function getMosaicPositions(pageWidth: number, pageHeight: number, itemWidth: number, itemHeight: number, margin: number) {
  const positions: Array<{ x: number; y: number; align: "left" | "center" | "right" }> = [];
  const gapX = Math.max(itemWidth + margin, 110);
  const gapY = Math.max(itemHeight + margin, 90);
  for (let y = pageHeight - margin - itemHeight; y >= margin - itemHeight * 0.5; y -= gapY) {
    for (let x = margin; x <= pageWidth - margin; x += gapX) {
      positions.push({ x, y, align: "left" });
    }
  }
  return positions.length ? positions : [{ x: margin, y: margin, align: "left" }];
}

function getPreviewPages(startPage: number, endPage: number, pageCount: number) {
  const first = safeInt(startPage, 1, pageCount);
  const last = safeInt(endPage, first, pageCount);
  const start = Math.min(first, last);
  const end = Math.max(first, last);
  if (start === end || pageCount === 1) return [start];
  return [start, Math.min(start + 1, end)];
}

export default function AddWatermarkTool() {
  const [mode, setMode] = useState<WatermarkMode>("text");
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [text, setText] = useState("iLovePDF");
  const [textFont, setTextFont] = useState<FontOption>("Arial");
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textColor, setTextColor] = useState("#e93b34");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [position, setPosition] = useState<PositionKey>("topLeft");
  const [mosaic, setMosaic] = useState(false);
  const [transparency, setTransparency] = useState<TransparencyPreset>("none");
  const [rotation, setRotation] = useState<RotationPreset>(0);
  const [pageMode, setPageMode] = useState<"single" | "facing">("single");
  const [layer, setLayer] = useState<LayerPreset>("over");
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [fontSize, setFontSize] = useState(36);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const previewTokenRef = useRef(0);

  const previewPages = useMemo(() => (pdf ? getPreviewPages(fromPage, toPage, pdf.pageCount) : []), [fromPage, pdf, toPage]);

  const resetForm = useCallback((keepPdf = false) => {
    setMode("text");
    setText("iLovePDF");
    setTextFont("Arial");
    setTextBold(false);
    setTextItalic(false);
    setTextColor("#e93b34");
    setImageFile(null);
    setImagePreview(null);
    setPosition("topLeft");
    setMosaic(false);
    setTransparency("none");
    setRotation(0);
    setPageMode("single");
    setLayer("over");
    setFromPage(1);
    setToPage(1);
    setFontSize(36);
    setPreviewUrls([]);
    setPreviewLoading(false);
    setProcessing(false);
    setErrorMessage(null);
    if (!keepPdf) setPdf(null);
    if (inputRef.current) inputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  }, []);

  const loadFile = useCallback(async (incoming: File) => {
    setErrorMessage(null);
    if (incoming.size > MAX_FILE_SIZE) {
      setErrorMessage(`File exceeds the 1GB size limit.`);
      return;
    }
    setPreviewUrls([]);
    try {
      const loaded = await loadPdf(incoming);
      setPdf(loaded);
      setFromPage(1);
      setToPage(loaded.pageCount);
    } catch {
      setPdf(null);
      setErrorMessage("Could not read the PDF file. It may be corrupted or password-protected.");
    }
  }, []);

  const addPdfFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    loadFile(fileList[0]);
  }, [loadFile]);

  const addImageFile = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload an image file for the watermark.");
      return;
    }

    setErrorMessage(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result));
    reader.onerror = () => setErrorMessage(`Failed to read ${file.name}.`);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    addPdfFiles(event.dataTransfer.files);
  }, [addPdfFiles]);

  useEffect(() => {
    if (!pdf) {
      setPreviewUrls([]);
      setPreviewLoading(false);
      return;
    }

    const token = ++previewTokenRef.current;
    setPreviewLoading(true);
    setErrorMessage(null);

    (async () => {
      try {
        const previewBytes = await applyWatermark(pdf.bytes, {
          mode,
          text,
          textFont,
          textBold,
          textItalic,
          textColor,
          imageFile,
          position,
          mosaic,
          transparency,
          rotation,
          pageMode,
          layer,
          fromPage,
          toPage,
          fontSize,
        });

        const urls: string[] = [];
        for (const pageNumber of previewPages) {
          urls.push(await renderPreview(previewBytes.buffer.slice(previewBytes.byteOffset, previewBytes.byteOffset + previewBytes.byteLength) as ArrayBuffer, pageNumber));
        }

        if (previewTokenRef.current === token) {
          setPreviewUrls(urls);
        }
      } catch (error) {
        if (previewTokenRef.current === token) {
          setPreviewUrls([]);
          setErrorMessage(error instanceof Error ? error.message : "Preview rendering failed for this PDF.");
        }
      } finally {
        if (previewTokenRef.current === token) setPreviewLoading(false);
      }
    })();
  }, [pdf, mode, text, textFont, textBold, textItalic, textColor, imageFile, position, mosaic, transparency, rotation, pageMode, layer, fromPage, toPage, fontSize, previewPages]);

  const handleDownload = useCallback(async () => {
    if (!pdf) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      const bytes = await applyWatermark(pdf.bytes, {
        mode,
        text,
        textFont,
        textBold,
        textItalic,
        textColor,
        imageFile,
        position,
        mosaic,
        transparency,
        rotation,
        pageMode,
        layer,
        fromPage,
        toPage,
        fontSize,
      });

      downloadBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), `${sanitizeBaseName(pdf.file.name)}_watermarked.pdf`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to add watermark.");
    } finally {
      setProcessing(false);
    }
  }, [pdf, mode, text, textFont, textBold, textItalic, textColor, imageFile, position, mosaic, transparency, rotation, pageMode, layer, fromPage, toPage, fontSize]);

  const selectedRangeLabel = pdf ? `${Math.min(fromPage, toPage)}–${Math.max(fromPage, toPage)}` : "1–1";

  return (
    <div className="space-y-4">
      {!pdf && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#38d9a9] to-[#ffb347]" />
          <div className="px-5 py-5">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 transition ${dragOver ? "border-[#6c63ff] bg-[#6c63ff]/5" : "border-border hover:border-border-strong"}`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(event) => {
                  addPdfFiles(event.target.files);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">🖋️</div>
              <p className="mt-3 text-sm font-semibold text-white">Drop your PDF here or <span className="text-[#6c63ff]">browse</span></p>
              <p className="mt-1 text-xs text-muted-2">Add text or image watermarks, choose position, transparency, rotation, and preview instantly.</p>
            </div>
          </div>
        </div>
      )}

      {pdf && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#38d9a9] to-[#ffb347]" />
          <div className="grid gap-6 px-5 py-5 lg:grid-cols-[420px_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-surface-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Selected file</p>
                <h2 className="mt-2 break-all text-sm font-semibold text-white">{pdf.file.name}</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted">
                  <div className="rounded-lg bg-surface-3/50 px-3 py-2"><span className="block text-[#6c63ff]">Pages</span><span className="font-semibold text-white">{pdf.pageCount}</span></div>
                  <div className="rounded-lg bg-surface-3/50 px-3 py-2"><span className="block text-[#6c63ff]">Size</span><span className="font-semibold text-white">{formatBytes(pdf.file.size)}</span></div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-2 p-4">
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/20 p-1 text-sm font-semibold text-white">
                  <button type="button" onClick={() => setMode("text")} className={`rounded-lg px-3 py-2 transition ${mode === "text" ? "bg-white text-[#111118]" : "text-muted hover:text-foreground"}`}>Place text</button>
                  <button type="button" onClick={() => setMode("image")} className={`rounded-lg px-3 py-2 transition ${mode === "image" ? "bg-white text-[#111118]" : "text-muted hover:text-foreground"}`}>Place image</button>
                </div>

                {mode === "text" ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Text</label>
                      <input value={text} onChange={(event) => setText(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none transition focus:border-[#38d9a9]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Text format</label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <select value={textFont} onChange={(event) => setTextFont(event.target.value as FontOption)} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none transition focus:border-[#38d9a9]">
                          {FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}
                        </select>
                        <button type="button" onClick={() => setTextBold((value) => !value)} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${textBold ? "border-[#38d9a9] bg-[#38d9a9]/10 text-white" : "border-border bg-surface-3/50 text-muted"}`}>B</button>
                        <button type="button" onClick={() => setTextItalic((value) => !value)} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${textItalic ? "border-[#38d9a9] bg-[#38d9a9]/10 text-white" : "border-border bg-surface-3/50 text-muted"}`}>I</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Color</label>
                      <input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-border bg-surface p-1" />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <button type="button" onClick={() => imageInputRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-3/50 px-4 py-3 text-sm font-semibold text-white transition hover:border-border-strong hover:bg-surface-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e93b34] text-white">🖼️</span>
                      {imageFile ? `Selected: ${imageFile.name}` : "Add image"}
                    </button>
                    <input ref={imageInputRef} type="file" accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.bmp,.svg" className="hidden" onChange={(event) => void addImageFile(event.target.files)} />
                    {imagePreview && (
                      <div className="rounded-xl border border-border bg-surface-3/50 p-3">
                        <div className="mx-auto flex max-w-[180px] items-center justify-center overflow-hidden rounded-lg bg-white p-2">
                          <Image src={imagePreview} alt="Watermark preview" width={240} height={120} unoptimized className="h-auto w-auto max-w-full max-h-24 object-contain" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Position</p>
                  <div className="mt-3 grid max-w-[170px] grid-cols-3 gap-2">
                    {POSITION_ORDER.map((key) => (
                      <button key={key} type="button" onClick={() => setPosition(key)} className={`flex aspect-square items-center justify-center rounded-lg border transition ${position === key ? "border-[#38d9a9] bg-[#38d9a9]/10" : "border-border bg-surface-3/50 hover:border-border-strong"}`} title={POSITION_LABELS[key]} aria-label={POSITION_LABELS[key]}>
                        <span className="grid h-7 w-7 grid-cols-3 grid-rows-3 gap-0.5 rounded-sm border border-border-strong p-1">
                          {Array.from({ length: 9 }).map((_, index) => {
                            const row = Math.floor(index / 3);
                            const col = index % 3;
                            const active = POSITION_GRID_INDEX[key].row === row && POSITION_GRID_INDEX[key].col === col;
                            return <span key={`${key}-${index}`} className={`rounded-full ${active ? "bg-red-500" : "bg-white/15"}`} />;
                          })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Transparency</label>
                    <select value={transparency} onChange={(event) => setTransparency(event.target.value as TransparencyPreset)} className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none transition focus:border-[#38d9a9]">
                      <option value="none">No transparency</option>
                      <option value="75">25%</option>
                      <option value="50">50%</option>
                      <option value="25">75%</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Rotation</label>
                    <select value={rotation} onChange={(event) => setRotation(Number(event.target.value) as RotationPreset)} className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none transition focus:border-[#38d9a9]">
                      <option value={0}>Do not rotate</option>
                      <option value={90}>90°</option>
                      <option value={180}>180°</option>
                      <option value={270}>270°</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Pages</label>
                    <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white">
                      <span className="text-muted">from page</span>
                      <input type="number" min={1} max={pdf.pageCount} value={fromPage} onChange={(event) => setFromPage(safeInt(Number(event.target.value), 1, pdf.pageCount))} className="w-14 bg-transparent text-center outline-none" />
                      <span className="justify-self-end text-muted">to <input type="number" min={1} max={pdf.pageCount} value={toPage} onChange={(event) => setToPage(safeInt(Number(event.target.value), 1, pdf.pageCount))} className="ml-2 w-14 bg-transparent text-center outline-none" /></span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Layer</label>
                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-black/20 p-1">
                      <button type="button" onClick={() => setLayer("over")} className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${layer === "over" ? "bg-[#e93b34] text-white" : "text-muted hover:text-foreground"}`}>Over the PDF content</button>
                      <button type="button" onClick={() => setLayer("under")} className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${layer === "under" ? "bg-[#e93b34] text-white" : "text-muted hover:text-foreground"}`}>Below the PDF content</button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={handleDownload} disabled={processing} className="flex-1 rounded-xl bg-[#e93b34] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(233,59,52,.35)] transition hover:bg-[#d9322b] disabled:cursor-not-allowed disabled:opacity-60">{processing ? "Processing…" : "Add watermark"}</button>
                  <button type="button" onClick={() => resetForm(true)} className="rounded-xl border border-border bg-surface-3/50 px-4 py-3 text-sm font-semibold text-white transition hover:border-border-strong hover:bg-surface-3">Reset</button>
                </div>
              </div>

              {errorMessage && <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{errorMessage}</div>}
            </div>

            <div className="rounded-2xl border border-border bg-surface-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Live preview</p>
                  <p className="mt-1 text-sm text-muted">Preview updates as you change settings. Showing pages {selectedRangeLabel}.</p>
                </div>
                <span className="rounded-full bg-surface-3/50 px-3 py-1 text-xs font-semibold text-foreground/75">{previewLoading ? "Refreshing…" : "Ready"}</span>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {previewUrls.map((url, index) => (
                  <div key={url} className="rounded-[22px] border border-[#d1d5db] bg-[#f8fafc] p-4 shadow-[0_12px_40px_rgba(15,23,42,.08)]">
                    <div className="mx-auto aspect-[210/297] w-full max-w-[190px] overflow-hidden rounded-sm bg-white shadow-[0_10px_28px_rgba(15,23,42,.14)]">
                      <Image src={url} alt={`Preview of watermarked page ${index + 1}`} width={420} height={594} unoptimized className="h-full w-full object-contain object-top" />
                    </div>
                    <p className="mt-4 text-center text-sm font-medium text-[#111827]">Page {previewPages[index] ?? index + 1}</p>
                  </div>
                ))}

                {!previewUrls.length && (
                  <div className="rounded-[22px] border border-[#d1d5db] bg-[#f8fafc] p-4 shadow-[0_12px_40px_rgba(15,23,42,.08)] md:col-span-2">
                    <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">{previewLoading ? "Rendering preview…" : "Preview unavailable"}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}