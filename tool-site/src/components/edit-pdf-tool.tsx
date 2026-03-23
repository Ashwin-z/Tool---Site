"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { PDFDocument, PDFImage, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { downloadBlob, formatBytes, sanitizeBaseName } from "@/lib/client-pdf-utils";

type PageBox = { width: number; height: number };
type ShapeKind = "rect" | "ellipse" | "line";
type ShapePaintMode = "fill" | "stroke" | "both";

type LoadedPdf = {
  file: File;
  bytes: ArrayBuffer;
  pageCount: number;
  pageBoxes: PageBox[];
};

type Point = { x: number; y: number };
type ToolMode = "select" | "text" | "draw" | "highlight" | "image";

type TextOverlay = {
  id: string;
  type: "text";
  pageNumber: number;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  bold: boolean;
  backgroundFill: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
};

type DrawOverlay = {
  id: string;
  type: "draw";
  pageNumber: number;
  points: Point[];
  color: string;
  strokeWidth: number;
};

type HighlightOverlay = {
  id: string;
  type: "highlight";
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shapeKind: ShapeKind;
  paintMode: ShapePaintMode;
  color: string;
  opacity: number;
  strokeWidth: number;
  lineStart?: Point;
  lineEnd?: Point;
};

type ImageOverlay = {
  id: string;
  type: "image";
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
  mimeType: "image/png" | "image/jpeg";
  imageWidth: number;
  imageHeight: number;
  name: string;
  cropLeft: number;
  cropTop: number;
  cropRight: number;
  cropBottom: number;
};

type OverlayItem = TextOverlay | DrawOverlay | HighlightOverlay | ImageOverlay;

type StampAsset = {
  dataUrl: string;
  mimeType: "image/png" | "image/jpeg";
  width: number;
  height: number;
  name: string;
};

type PreviewMap = Record<number, string>;
type LoadingMap = Record<number, boolean>;

type ZoomAnchor = {
  viewportOffsetX: number;
  viewportOffsetY: number;
  ratioX: number;
  ratioY: number;
};

type DrawDraft = {
  type: "draw";
  pageNumber: number;
  points: Point[];
  color: string;
  strokeWidth: number;
};

type HighlightDraft = {
  type: "highlight";
  pageNumber: number;
  start: Point;
  current: Point;
  shapeKind: ShapeKind;
  paintMode: ShapePaintMode;
  color: string;
  opacity: number;
  strokeWidth: number;
};

type MoveDraft = {
  type: "move";
  overlayId: string;
  pageNumber: number;
  start: Point;
  originX: number;
  originY: number;
};

type CornerHandle = "nw" | "ne" | "sw" | "se";
type CropEdgeHandle = "left" | "right" | "top" | "bottom";

type ResizeImageDraft = {
  type: "resize-image";
  overlayId: string;
  pageNumber: number;
  handle: CornerHandle;
  start: Point;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

type ResizeShapeDraft = {
  type: "resize-shape";
  overlayId: string;
  pageNumber: number;
  handle: CornerHandle;
  start: Point;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

type ResizeLineDraft = {
  type: "resize-line";
  overlayId: string;
  pageNumber: number;
  endpoint: "start" | "end";
  start: Point;
  startLineStart: Point;
  startLineEnd: Point;
};

type CropImageDraft = {
  type: "crop-image";
  overlayId: string;
  pageNumber: number;
  handle: CropEdgeHandle;
  start: Point;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startCropLeft: number;
  startCropTop: number;
  startCropRight: number;
  startCropBottom: number;
  startVisibleWidth: number;
  startVisibleHeight: number;
};

type ReadjustImageDraft = {
  type: "readjust-image";
  overlayId: string;
  pageNumber: number;
  start: Point;
  startWidth: number;
  startHeight: number;
  startCropLeft: number;
  startCropTop: number;
  startCropRight: number;
  startCropBottom: number;
  startVisibleWidth: number;
  startVisibleHeight: number;
};

type PanDraft = {
  type: "pan";
  pageNumber: number;
  startClientX: number;
  startClientY: number;
  startScrollLeft: number;
  startScrollTop: number;
};

type InteractionDraft = DrawDraft | HighlightDraft | MoveDraft | ResizeImageDraft | ResizeShapeDraft | ResizeLineDraft | CropImageDraft | ReadjustImageDraft | PanDraft | null;
type ImageEditMode = "move" | "resize" | "crop" | "readjust";

type PendingLine = {
  pageNumber: number;
  start: Point;
  current: Point;
};

type PdfJsViewport = { width: number; height: number };
type PdfJsPage = {
  getViewport: (options: { scale: number }) => PdfJsViewport;
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: PdfJsViewport }) => { promise: Promise<void> };
};
type PdfJsDocument = {
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
};
type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { data: ArrayBuffer }) => { promise: Promise<PdfJsDocument> };
};

const TOOL_OPTIONS: Array<{ id: ToolMode; label: string; icon: string }> = [
  { id: "select", label: "Select", icon: "↖" },
  { id: "text", label: "Text", icon: "T" },
  { id: "draw", label: "Draw", icon: "✎" },
  { id: "highlight", label: "Shapes", icon: "⬠" },
  { id: "image", label: "Image", icon: "🖼" },
];

const MIN_BOX_SIZE = 0.04;
const MIN_IMAGE_SIZE = 0.06;
const MIN_ZOOM = 0.65;
const MAX_ZOOM = 5;
const BASE_EDITOR_WIDTH = 780;

let pdfjsPromise: Promise<PdfJsModule> | null = null;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function hexToRgb(hex: string) {
  const cleaned = hex.replace("#", "");
  const normalized = cleaned.length === 3 ? cleaned.split("").map((part) => part + part).join("") : cleaned;
  const intValue = Number.parseInt(normalized, 16);

  return rgb(((intValue >> 16) & 255) / 255, ((intValue >> 8) & 255) / 255, (intValue & 255) / 255);
}

function hexToRgbaString(hex: string, opacity: number) {
  const cleaned = hex.replace("#", "");
  const normalized = cleaned.length === 3 ? cleaned.split("").map((part) => part + part).join("") : cleaned;
  const intValue = Number.parseInt(normalized, 16);
  const red = (intValue >> 16) & 255;
  const green = (intValue >> 8) & 255;
  const blue = intValue & 255;

  return `rgba(${red}, ${green}, ${blue}, ${clamp(opacity, 0, 1)})`;
}

function describeOverlay(item: OverlayItem): string {
  switch (item.type) {
    case "text":
      return item.text.trim() ? item.text.trim().slice(0, 28) : "Text";
    case "draw":
      return `Freehand stroke (${item.points.length} pts)`;
    case "highlight":
      return item.shapeKind === "ellipse"
        ? "Ellipse shape"
        : item.shapeKind === "line"
          ? "Line shape"
          : "Rectangle shape";
    case "image":
      return item.name || "Image stamp";
    default:
      return "Layer";
  }
}

function countPageLayers(overlays: OverlayItem[], pageNumber: number): number {
  return overlays.filter((item) => item.pageNumber === pageNumber).length;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const [, base64 = ""] = dataUrl.split(",");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function normalizeBox(x: number, y: number, width: number, height: number) {
  const nextWidth = clamp(width, MIN_BOX_SIZE, 1);
  const nextHeight = clamp(height, MIN_BOX_SIZE, 1);

  return {
    x: clamp(x, 0, 1 - nextWidth),
    y: clamp(y, 0, 1 - nextHeight),
    width: nextWidth,
    height: nextHeight,
  };
}

function resizeOverlayBox(
  startX: number,
  startY: number,
  startWidth: number,
  startHeight: number,
  handle: CornerHandle,
  deltaX: number,
  deltaY: number,
) {
  let nextX = startX;
  let nextY = startY;
  let nextWidth = startWidth;
  let nextHeight = startHeight;

  if (handle === "nw" || handle === "sw") {
    nextX = clamp(startX + deltaX, 0, startX + startWidth - MIN_BOX_SIZE);
    nextWidth = startWidth + (startX - nextX);
  }

  if (handle === "ne" || handle === "se") {
    nextWidth = clamp(startWidth + deltaX, MIN_BOX_SIZE, 1 - startX);
  }

  if (handle === "nw" || handle === "ne") {
    nextY = clamp(startY + deltaY, 0, startY + startHeight - MIN_BOX_SIZE);
    nextHeight = startHeight + (startY - nextY);
  }

  if (handle === "sw" || handle === "se") {
    nextHeight = clamp(startHeight + deltaY, MIN_BOX_SIZE, 1 - startY);
  }

  return {
    x: nextX,
    y: nextY,
    width: nextWidth,
    height: nextHeight,
  };
}

function getShapeFillColor(layer: HighlightOverlay) {
  return layer.paintMode === "fill" || layer.paintMode === "both" ? layer.color : "transparent";
}

function getShapeBorderColor(layer: HighlightOverlay) {
  return layer.paintMode === "stroke" || layer.paintMode === "both" ? layer.color : "transparent";
}

function boxFromPoints(start: Point, end: Point) {
  const left = clamp(Math.min(start.x, end.x), 0, 1);
  const top = clamp(Math.min(start.y, end.y), 0, 1);
  const right = clamp(Math.max(start.x, end.x), 0, 1);
  const bottom = clamp(Math.max(start.y, end.y), 0, 1);

  return normalizeBox(left, top, right - left, bottom - top);
}

function squareBoxFromPoints(start: Point, end: Point, canvasWidth: number, canvasHeight: number) {
  const deltaXPx = (end.x - start.x) * canvasWidth;
  const deltaYPx = (end.y - start.y) * canvasHeight;
  const directionX = deltaXPx < 0 ? -1 : 1;
  const directionY = deltaYPx < 0 ? -1 : 1;
  const maxSideXPx = (directionX > 0 ? 1 - start.x : start.x) * canvasWidth;
  const maxSideYPx = (directionY > 0 ? 1 - start.y : start.y) * canvasHeight;
  const minSidePx = MIN_BOX_SIZE * Math.min(canvasWidth, canvasHeight);
  const sidePx = clamp(
    Math.max(Math.abs(deltaXPx), Math.abs(deltaYPx), minSidePx),
    minSidePx,
    Math.max(minSidePx, Math.min(maxSideXPx, maxSideYPx)),
  );
  const corner = {
    x: clamp(start.x + (directionX * sidePx) / canvasWidth, 0, 1),
    y: clamp(start.y + (directionY * sidePx) / canvasHeight, 0, 1),
  };

  return normalizeBox(
    Math.min(start.x, corner.x),
    Math.min(start.y, corner.y),
    Math.abs(corner.x - start.x),
    Math.abs(corner.y - start.y),
  );
}

function normalizeCircleBox(
  box: Pick<HighlightOverlay, "x" | "y" | "width" | "height">,
  canvasWidth: number,
  canvasHeight: number,
) {
  const minSidePx = MIN_BOX_SIZE * Math.min(canvasWidth, canvasHeight);
  const sidePx = Math.max(Math.min(box.width * canvasWidth, box.height * canvasHeight), minSidePx);
  const width = sidePx / canvasWidth;
  const height = sidePx / canvasHeight;
  const centeredX = box.x + (box.width - width) / 2;
  const centeredY = box.y + (box.height - height) / 2;

  return normalizeBox(centeredX, centeredY, width, height);
}

function buildLineGeometry(start: Point, end: Point) {
  const lineStart = { x: clamp(start.x, 0, 1), y: clamp(start.y, 0, 1) };
  const lineEnd = { x: clamp(end.x, 0, 1), y: clamp(end.y, 0, 1) };
  const rawLeft = Math.min(lineStart.x, lineEnd.x);
  const rawTop = Math.min(lineStart.y, lineEnd.y);
  const rawWidth = Math.abs(lineEnd.x - lineStart.x);
  const rawHeight = Math.abs(lineEnd.y - lineStart.y);
  const width = Math.max(rawWidth, MIN_BOX_SIZE);
  const height = Math.max(rawHeight, MIN_BOX_SIZE);
  const x = clamp(rawLeft - (width - rawWidth) / 2, 0, 1 - width);
  const y = clamp(rawTop - (height - rawHeight) / 2, 0, 1 - height);

  return {
    x,
    y,
    width,
    height,
    lineStart,
    lineEnd,
  };
}

function getLineEndpoints(layer: HighlightOverlay) {
  return {
    start: layer.lineStart ?? { x: layer.x, y: layer.y },
    end: layer.lineEnd ?? { x: layer.x + layer.width, y: layer.y + layer.height },
  };
}

function getLocalLineEndpoints(layer: HighlightOverlay) {
  const { start, end } = getLineEndpoints(layer);
  return {
    start: { x: start.x - layer.x, y: start.y - layer.y },
    end: { x: end.x - layer.x, y: end.y - layer.y },
  };
}

function resizeCircleOverlay(
  startX: number,
  startY: number,
  startWidth: number,
  startHeight: number,
  handle: CornerHandle,
  deltaX: number,
  deltaY: number,
  canvasWidth: number,
  canvasHeight: number,
) {
  const anchor = handle === "nw"
    ? { x: startX + startWidth, y: startY + startHeight }
    : handle === "ne"
      ? { x: startX, y: startY + startHeight }
      : handle === "sw"
        ? { x: startX + startWidth, y: startY }
        : { x: startX, y: startY };
  const movedCorner = handle === "nw"
    ? { x: startX + deltaX, y: startY + deltaY }
    : handle === "ne"
      ? { x: startX + startWidth + deltaX, y: startY + deltaY }
      : handle === "sw"
        ? { x: startX + deltaX, y: startY + startHeight + deltaY }
        : { x: startX + startWidth + deltaX, y: startY + startHeight + deltaY };

  return squareBoxFromPoints(anchor, movedCorner, canvasWidth, canvasHeight);
}

function buildPixelPath(points: Point[], width: number, height: number): string {
  if (points.length === 0) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${Math.round(point.x * width)} ${Math.round(point.y * height)}`)
    .join(" ");
}

function getStrokePx(strokeWidth: number, width: number, height: number): number {
  return Math.max(strokeWidth * Math.min(width, height), 2.2);
}

function normalizeImageCrop(crop: Pick<ImageOverlay, "cropLeft" | "cropTop" | "cropRight" | "cropBottom">) {
  const left = clamp(crop.cropLeft, 0, 0.88);
  const top = clamp(crop.cropTop, 0, 0.88);
  const maxRight = Math.max(0, 0.94 - left);
  const right = clamp(crop.cropRight, 0, maxRight);
  const maxBottom = Math.max(0, 0.94 - top);
  const bottom = clamp(crop.cropBottom, 0, maxBottom);

  return {
    cropLeft: left,
    cropTop: top,
    cropRight: right,
    cropBottom: bottom,
  };
}

function getVisibleImageRatios(layer: ImageOverlay) {
  const visibleWidth = Math.max(0.06, 1 - layer.cropLeft - layer.cropRight);
  const visibleHeight = Math.max(0.06, 1 - layer.cropTop - layer.cropBottom);
  return { visibleWidth, visibleHeight };
}

function cropImageFrame(layer: ImageOverlay, draft: CropImageDraft, point: Point): ImageOverlay {
  const maxVisibleCropX = Math.max(0, 0.94 - draft.startCropLeft - draft.startCropRight);
  const maxVisibleCropY = Math.max(0, 0.94 - draft.startCropTop - draft.startCropBottom);
  const scaleX = draft.startWidth / Math.max(draft.startVisibleWidth, 0.06);
  const scaleY = draft.startHeight / Math.max(draft.startVisibleHeight, 0.06);

  if (draft.handle === "left") {
    const rawDelta = point.x - draft.start.x;
    const minDelta = -Math.min(draft.startCropLeft * scaleX, draft.startX);
    const maxDelta = Math.min(draft.startWidth - MIN_IMAGE_SIZE, maxVisibleCropX * scaleX);
    const delta = clamp(rawDelta, minDelta, maxDelta);

    return {
      ...layer,
      x: draft.startX + delta,
      width: draft.startWidth - delta,
      cropLeft: draft.startCropLeft + delta / scaleX,
      cropTop: draft.startCropTop,
      cropRight: draft.startCropRight,
      cropBottom: draft.startCropBottom,
    };
  }

  if (draft.handle === "right") {
    const rawDelta = point.x - draft.start.x;
    const minDelta = -Math.min(draft.startWidth - MIN_IMAGE_SIZE, maxVisibleCropX * scaleX);
    const maxDelta = Math.min(draft.startCropRight * scaleX, 1 - (draft.startX + draft.startWidth));
    const delta = clamp(rawDelta, minDelta, maxDelta);

    return {
      ...layer,
      x: draft.startX,
      width: draft.startWidth + delta,
      cropLeft: draft.startCropLeft,
      cropTop: draft.startCropTop,
      cropRight: draft.startCropRight - delta / scaleX,
      cropBottom: draft.startCropBottom,
    };
  }

  if (draft.handle === "top") {
    const rawDelta = point.y - draft.start.y;
    const minDelta = -Math.min(draft.startCropTop * scaleY, draft.startY);
    const maxDelta = Math.min(draft.startHeight - MIN_IMAGE_SIZE, maxVisibleCropY * scaleY);
    const delta = clamp(rawDelta, minDelta, maxDelta);

    return {
      ...layer,
      x: draft.startX,
      y: draft.startY + delta,
      width: draft.startWidth,
      height: draft.startHeight - delta,
      cropLeft: draft.startCropLeft,
      cropTop: draft.startCropTop + delta / scaleY,
      cropRight: draft.startCropRight,
      cropBottom: draft.startCropBottom,
    };
  }

  const rawDelta = point.y - draft.start.y;
  const minDelta = -Math.min(draft.startHeight - MIN_IMAGE_SIZE, maxVisibleCropY * scaleY);
  const maxDelta = Math.min(draft.startCropBottom * scaleY, 1 - (draft.startY + draft.startHeight));
  const delta = clamp(rawDelta, minDelta, maxDelta);

  return {
    ...layer,
    x: draft.startX,
    y: draft.startY,
    width: draft.startWidth,
    height: draft.startHeight + delta,
    cropLeft: draft.startCropLeft,
    cropTop: draft.startCropTop,
    cropRight: draft.startCropRight,
    cropBottom: draft.startCropBottom - delta / scaleY,
  };
}

function readjustImageWithinFrame(layer: ImageOverlay, draft: ReadjustImageDraft, point: Point): ImageOverlay {
  const scaleX = draft.startWidth / Math.max(draft.startVisibleWidth, 0.06);
  const scaleY = draft.startHeight / Math.max(draft.startVisibleHeight, 0.06);
  const rawShiftX = -(point.x - draft.start.x) / scaleX;
  const rawShiftY = -(point.y - draft.start.y) / scaleY;
  const shiftX = clamp(rawShiftX, -draft.startCropLeft, draft.startCropRight);
  const shiftY = clamp(rawShiftY, -draft.startCropTop, draft.startCropBottom);

  return {
    ...layer,
    cropLeft: draft.startCropLeft + shiftX,
    cropTop: draft.startCropTop + shiftY,
    cropRight: draft.startCropRight - shiftX,
    cropBottom: draft.startCropBottom - shiftY,
  };
}

function cloneOverlays(items: OverlayItem[]): OverlayItem[] {
  return items.map((item) => {
    if (item.type === "draw") {
      return { ...item, points: item.points.map((point) => ({ ...point })) };
    }

    return { ...item };
  });
}

function overlaysEqual(left: OverlayItem[], right: OverlayItem[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function loadImageElement(source: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load the selected image."));
    image.src = source;
  });
}

async function readStampAsset(file: File): Promise<StampAsset> {
  const mimeType = file.type.toLowerCase();
  if (mimeType !== "image/png" && mimeType !== "image/jpeg" && mimeType !== "image/jpg") {
    throw new Error("Use a PNG or JPG image for the stamp.");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}.`));
    reader.readAsDataURL(file);
  });

  const image = await loadImageElement(dataUrl);
  return {
    dataUrl,
    mimeType: mimeType === "image/png" ? "image/png" : "image/jpeg",
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
    name: file.name,
  };
}

async function buildCroppedImageAsset(layer: ImageOverlay): Promise<{ bytes: Uint8Array; mimeType: "image/png" | "image/jpeg" }> {
  const image = await loadImageElement(layer.dataUrl);
  const crop = normalizeImageCrop(layer);
  const sourceX = Math.round(image.width * crop.cropLeft);
  const sourceY = Math.round(image.height * crop.cropTop);
  const sourceWidth = Math.max(1, Math.round(image.width * (1 - crop.cropLeft - crop.cropRight)));
  const sourceHeight = Math.max(1, Math.round(image.height * (1 - crop.cropTop - crop.cropBottom)));
  const canvas = document.createElement("canvas");
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to prepare the cropped image.");
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
  const mimeType = layer.mimeType === "image/jpeg" ? "image/jpeg" : "image/png";
  const outputUrl = canvas.toDataURL(mimeType, 0.95);
  return { bytes: dataUrlToUint8Array(outputUrl), mimeType };
}

async function loadPdf(file: File): Promise<LoadedPdf> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);

  return {
    file,
    bytes,
    pageCount: pdf.getPageCount(),
    pageBoxes: pdf.getPages().map((page) => ({ width: page.getWidth(), height: page.getHeight() })),
  };
}

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

async function renderPagePreview(bytes: ArrayBuffer, pageNumber: number, scale = 1.15): Promise<string> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create a preview canvas.");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/png", 0.92);
}

function getNormalizedPoint(event: ReactPointerEvent<HTMLElement>, boundsElement?: HTMLElement | null): Point {
  const bounds = (boundsElement ?? event.currentTarget).getBoundingClientRect();
  return {
    x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
    y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
  };
}

function formatZoom(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatLayerType(item: OverlayItem): string {
  switch (item.type) {
    case "text":
      return "Text";
    case "draw":
      return "Drawing";
    case "highlight":
      return item.shapeKind === "ellipse" ? "Ellipse" : item.shapeKind === "line" ? "Line" : "Rectangle";
    case "image":
      return "Image";
    default:
      return "Layer";
  }
}

function getLayerSwatchColor(layer: OverlayItem): string {
  if (layer.type === "image") {
    return "#d9dae6";
  }

  return layer.color;
}

function getPageAspect(box: PageBox | undefined): number {
  if (!box || !box.width || !box.height) return 1 / 1.414;
  return box.width / box.height;
}

function coerceMultilineText(value: string): string {
  return value.trim().length ? value : "Add text";
}

function wrapTextToWidth(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const rawLines = coerceMultilineText(text).split(/\r?\n/);
  const lines: string[] = [];

  for (const rawLine of rawLines) {
    const words = rawLine.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }

    let currentLine = "";

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        currentLine = candidate;
        continue;
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
        currentLine = word;
        continue;
      }

      let fragment = "";
      for (const char of word) {
        const fragmentCandidate = `${fragment}${char}`;
        if (fragment && font.widthOfTextAtSize(fragmentCandidate, fontSize) > maxWidth) {
          lines.push(fragment);
          fragment = char;
        } else {
          fragment = fragmentCandidate;
        }
      }
      currentLine = fragment;
    }

    lines.push(currentLine);
  }

  return lines.length ? lines : [""];
}

export default function EditPdfTool() {
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [thumbnailUrls, setThumbnailUrls] = useState<PreviewMap>({});
  const [thumbnailLoadingPages, setThumbnailLoadingPages] = useState<LoadingMap>({});
  const [editorPreviewUrl, setEditorPreviewUrl] = useState<string | null>(null);
  const [editorPreviewLoading, setEditorPreviewLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [toolColor, setToolColor] = useState("#ff4d6d");
  const [brushSize, setBrushSize] = useState(0.0065);
  const [textSize, setTextSize] = useState(0.04);
  const [highlightOpacity, setHighlightOpacity] = useState(0.24);
  const [shapeKind, setShapeKind] = useState<ShapeKind>("rect");
  const [shapePaintMode, setShapePaintMode] = useState<ShapePaintMode>("both");
  const [zoom, setZoom] = useState(1);
  const [undoStack, setUndoStack] = useState<OverlayItem[][]>([]);
  const [redoStack, setRedoStack] = useState<OverlayItem[][]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stampAsset, setStampAsset] = useState<StampAsset | null>(null);
  const [draftInteraction, setDraftInteraction] = useState<InteractionDraft>(null);
  const [imageEditMode, setImageEditMode] = useState<ImageEditMode>("move");
  const [pendingLine, setPendingLine] = useState<PendingLine | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  const editorCanvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const isViewportHoveredRef = useRef(false);
  const pendingZoomAnchorRef = useRef<ZoomAnchor | null>(null);
  const overlaysRef = useRef<OverlayItem[]>([]);
  const interactionStartOverlaysRef = useRef<OverlayItem[] | null>(null);
  const previewTokenRef = useRef(0);
  const editorPreviewTokenRef = useRef(0);

  const getCanvasPoint = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    return getNormalizedPoint(event, editorCanvasRef.current);
  }, []);

  const pageNumbers = useMemo(() => {
    if (!pdf) return [] as number[];
    return Array.from({ length: pdf.pageCount }, (_, index) => index + 1);
  }, [pdf]);

  const currentBox = useMemo(() => pdf?.pageBoxes[currentPage - 1], [currentPage, pdf]);
  const currentAspect = getPageAspect(currentBox);
  const editorWidth = Math.round(BASE_EDITOR_WIDTH * zoom);
  const editorHeight = Math.round(editorWidth / currentAspect);
  const currentLayers = useMemo(
    () => overlays.filter((item) => item.pageNumber === currentPage),
    [currentPage, overlays],
  );
  const selectedOverlay = useMemo(
    () => overlays.find((item) => item.id === selectedOverlayId) ?? null,
    [overlays, selectedOverlayId],
  );

  useEffect(() => {
    setImageEditMode("move");
  }, [selectedOverlay?.type, selectedOverlayId]);

  useEffect(() => {
    if (toolMode !== "highlight" || shapeKind !== "line") {
      setPendingLine(null);
    }
  }, [shapeKind, toolMode]);

  useEffect(() => {
    overlaysRef.current = cloneOverlays(overlays);
  }, [overlays]);

  const applyZoom = useCallback((nextZoom: number, anchor?: ZoomAnchor | null) => {
    pendingZoomAnchorRef.current = anchor ?? null;
    setZoom(clamp(Number(nextZoom.toFixed(2)), MIN_ZOOM, MAX_ZOOM));
  }, []);

  const commitOverlayState = useCallback((nextOverlays: OverlayItem[], nextSelectedId: string | null, recordHistory = true) => {
    if (recordHistory && !overlaysEqual(overlaysRef.current, nextOverlays)) {
      setUndoStack((current) => [...current.slice(-39), cloneOverlays(overlaysRef.current)]);
      setRedoStack([]);
    }

    setOverlays(nextOverlays);
    setSelectedOverlayId(nextSelectedId);
  }, []);

  const captureZoomAnchor = useCallback((clientX?: number, clientY?: number): ZoomAnchor | null => {
    const viewport = viewportRef.current;
    if (!viewport) return null;

    const rect = viewport.getBoundingClientRect();
    const offsetX = clientX == null ? rect.width / 2 : clientX - rect.left;
    const offsetY = clientY == null ? rect.height / 2 : clientY - rect.top;
    const safeWidth = Math.max(editorWidth, 1);
    const safeHeight = Math.max(editorHeight, 1);

    return {
      viewportOffsetX: clamp(offsetX, 0, rect.width),
      viewportOffsetY: clamp(offsetY, 0, rect.height),
      ratioX: (viewport.scrollLeft + clamp(offsetX, 0, rect.width)) / safeWidth,
      ratioY: (viewport.scrollTop + clamp(offsetY, 0, rect.height)) / safeHeight,
    };
  }, [editorHeight, editorWidth]);

  const adjustZoom = useCallback((delta: number, anchor?: ZoomAnchor | null) => {
    applyZoom(zoom + delta, anchor ?? null);
  }, [applyZoom, zoom]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const anchor = pendingZoomAnchorRef.current;
    if (!viewport || !anchor) return;

    pendingZoomAnchorRef.current = null;
    viewport.scrollLeft = Math.max(0, anchor.ratioX * editorWidth - anchor.viewportOffsetX);
    viewport.scrollTop = Math.max(0, anchor.ratioY * editorHeight - anchor.viewportOffsetY);
  }, [editorHeight, editorWidth]);

  const resetEditor = useCallback(() => {
    commitOverlayState([], null, overlaysRef.current.length > 0);
    setCurrentPage(1);
    setToolMode("select");
    setZoom(1);
    setErrorMessage(null);
    setDraftInteraction(null);
    interactionStartOverlaysRef.current = null;
  }, [commitOverlayState]);

  const updateOverlay = useCallback((overlayId: string, updater: (current: OverlayItem) => OverlayItem) => {
    commitOverlayState(
      overlaysRef.current.map((item) => (item.id === overlayId ? updater(item) : item)),
      selectedOverlayId,
      true,
    );
  }, [commitOverlayState, selectedOverlayId]);

  const removeOverlay = useCallback((overlayId: string) => {
    commitOverlayState(
      overlaysRef.current.filter((item) => item.id !== overlayId),
      selectedOverlayId === overlayId ? null : selectedOverlayId,
      true,
    );
  }, [commitOverlayState, selectedOverlayId]);

  const moveOverlayLayer = useCallback((overlayId: string, direction: "front" | "back") => {
    const current = overlaysRef.current;
    const index = current.findIndex((item) => item.id === overlayId);
    if (index === -1) return;

    const target = current[index];
    const pageIndexes = current
      .map((item, itemIndex) => ({ item, itemIndex }))
      .filter(({ item }) => item.pageNumber === target.pageNumber)
      .map(({ itemIndex }) => itemIndex);

    if (pageIndexes.length < 2) return;

    const next = [...current];
    next.splice(index, 1);

    const targetPageIndexes = next
      .map((item, itemIndex) => ({ item, itemIndex }))
      .filter(({ item }) => item.pageNumber === target.pageNumber)
      .map(({ itemIndex }) => itemIndex);

    const insertAt = direction === "front"
      ? (targetPageIndexes[targetPageIndexes.length - 1] ?? next.length - 1) + 1
      : targetPageIndexes[0] ?? 0;

    next.splice(insertAt, 0, target);
    commitOverlayState(next, selectedOverlayId, true);
  }, [commitOverlayState, selectedOverlayId]);

  const loadFile = useCallback(async (incoming: File) => {
    setErrorMessage(null);
    setSelectedOverlayId(null);
    setOverlays([]);
    setThumbnailUrls({});
    setThumbnailLoadingPages({});
    setEditorPreviewUrl(null);
    setEditorPreviewLoading(false);
    setCurrentPage(1);
    setDraftInteraction(null);
    setZoom(1);

    if (!incoming.name.toLowerCase().endsWith(".pdf")) {
      setPdf(null);
      setErrorMessage("Please upload a PDF file.");
      return;
    }

    try {
      const loaded = await loadPdf(incoming);
      setPdf(loaded);
      setUndoStack([]);
      setRedoStack([]);
    } catch {
      setPdf(null);
      setErrorMessage("The PDF could not be opened. Try another file.");
    }
  }, []);

  const undoLastChange = useCallback(() => {
    if (!undoStack.length) return;

    const previous = undoStack[undoStack.length - 1];
    setUndoStack((current) => current.slice(0, -1));
    setRedoStack((current) => [...current, cloneOverlays(overlaysRef.current)]);
    setOverlays(cloneOverlays(previous));
    setSelectedOverlayId(null);
    setDraftInteraction(null);
  }, [undoStack]);

  const redoLastChange = useCallback(() => {
    if (!redoStack.length) return;

    const next = redoStack[redoStack.length - 1];
    setRedoStack((current) => current.slice(0, -1));
    setUndoStack((current) => [...current, cloneOverlays(overlaysRef.current)]);
    setOverlays(cloneOverlays(next));
    setSelectedOverlayId(null);
    setDraftInteraction(null);
  }, [redoStack]);

  const onFileInput = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await loadFile(file);
  }, [loadFile]);

  const onDrop = useCallback(async (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await loadFile(file);
  }, [loadFile]);

  const onStampInput = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const asset = await readStampAsset(file);
      setStampAsset(asset);
      setToolMode("image");
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Image upload failed.");
    }
  }, []);

  useEffect(() => {
    if (!pdf) return;

    const token = ++previewTokenRef.current;
    let cancelled = false;
    setThumbnailLoadingPages(Object.fromEntries(pageNumbers.map((pageNumber) => [pageNumber, true])) as LoadingMap);

    void (async () => {
      for (const pageNumber of pageNumbers) {
        try {
          const previewUrl = await renderPagePreview(pdf.bytes, pageNumber, 0.42);
          if (cancelled || token !== previewTokenRef.current) return;
          setThumbnailUrls((current) => ({ ...current, [pageNumber]: previewUrl }));
        } catch (error) {
          if (cancelled || token !== previewTokenRef.current) return;
          setErrorMessage(error instanceof Error ? error.message : "Preview rendering failed.");
        } finally {
          if (!cancelled && token === previewTokenRef.current) {
            setThumbnailLoadingPages((current) => ({ ...current, [pageNumber]: false }));
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pageNumbers, pdf]);

  useEffect(() => {
    if (!pdf) return;

    const token = ++editorPreviewTokenRef.current;
    let cancelled = false;
    const deviceScale = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
    const renderScale = clamp(Number((1.35 * zoom * Math.min(deviceScale, 2)).toFixed(2)), 1.15, 6.8);
    setEditorPreviewLoading(true);

    void (async () => {
      try {
        const previewUrl = await renderPagePreview(pdf.bytes, currentPage, renderScale);
        if (cancelled || token !== editorPreviewTokenRef.current) return;
        setEditorPreviewUrl(previewUrl);
      } catch (error) {
        if (cancelled || token !== editorPreviewTokenRef.current) return;
        setErrorMessage(error instanceof Error ? error.message : "Page preview rendering failed.");
      } finally {
        if (!cancelled && token === editorPreviewTokenRef.current) {
          setEditorPreviewLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPage, pdf, zoom]);

  useEffect(() => {
    if (!selectedOverlayId) return;
    const selected = overlays.find((item) => item.id === selectedOverlayId);
    if (!selected) {
      setSelectedOverlayId(null);
      return;
    }

    if (selected.pageNumber !== currentPage) {
      setCurrentPage(selected.pageNumber);
    }
  }, [currentPage, overlays, selectedOverlayId]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if ((!event.ctrlKey && !event.metaKey) || !isViewportHoveredRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      adjustZoom(event.deltaY > 0 ? -0.08 : 0.08, captureZoomAnchor(event.clientX, event.clientY));
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
    };
  }, [adjustZoom, captureZoomAnchor]);

  const addTextOverlay = useCallback((point: Point) => {
    const overlay: TextOverlay = {
      id: createId(),
      type: "text",
      pageNumber: currentPage,
      x: clamp(point.x, 0.02, 0.9),
      y: clamp(point.y, 0.02, 0.9),
      text: "Add text",
      color: toolColor,
      fontSize: textSize,
      bold: false,
      backgroundFill: false,
      backgroundColor: "#ffffff",
      backgroundOpacity: 0.88,
    };

    commitOverlayState([...overlaysRef.current, overlay], overlay.id, true);
  }, [commitOverlayState, currentPage, textSize, toolColor]);

  const addImageOverlay = useCallback((point: Point) => {
    if (!stampAsset || !currentBox) return;

    const pageAspect = currentBox.width / currentBox.height;
    const imageAspect = stampAsset.width / stampAsset.height;
    const width = 0.24;
    const height = clamp((width * pageAspect) / imageAspect, MIN_IMAGE_SIZE, 0.55);
    const overlay: ImageOverlay = {
      id: createId(),
      type: "image",
      pageNumber: currentPage,
      x: clamp(point.x - width / 2, 0, 1 - width),
      y: clamp(point.y - height / 2, 0, 1 - height),
      width,
      height,
      dataUrl: stampAsset.dataUrl,
      mimeType: stampAsset.mimeType,
      imageWidth: stampAsset.width,
      imageHeight: stampAsset.height,
      name: stampAsset.name,
      cropLeft: 0,
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
    };

    commitOverlayState([...overlaysRef.current, overlay], overlay.id, true);
  }, [commitOverlayState, currentBox, currentPage, stampAsset]);

  const beginOverlayMove = useCallback((event: ReactPointerEvent<HTMLDivElement>, overlayId: string) => {
    if (toolMode !== "select") {
      return;
    }

    const overlay = overlays.find((item) => item.id === overlayId);
    if (!overlay || overlay.pageNumber !== currentPage) return;
    if (overlay.type === "draw") {
      setSelectedOverlayId(overlay.id);
      return;
    }

    event.stopPropagation();
    (editorCanvasRef.current ?? event.currentTarget).setPointerCapture(event.pointerId);
    interactionStartOverlaysRef.current = cloneOverlays(overlaysRef.current);
    const point = getCanvasPoint(event);
    setSelectedOverlayId(overlay.id);
    setDraftInteraction({
      type: "move",
      overlayId,
      pageNumber: currentPage,
      start: point,
      originX: overlay.x,
      originY: overlay.y,
    });
  }, [currentPage, getCanvasPoint, overlays, toolMode]);

  const beginImageResize = useCallback((event: ReactPointerEvent<HTMLElement>, overlayId: string, handle: CornerHandle) => {
    if (toolMode !== "select") return;

    const overlay = overlays.find((item) => item.id === overlayId);
    if (!overlay || overlay.type !== "image" || overlay.pageNumber !== currentPage) return;

    event.stopPropagation();
    (editorCanvasRef.current ?? event.currentTarget).setPointerCapture(event.pointerId);
    interactionStartOverlaysRef.current = cloneOverlays(overlaysRef.current);
    const point = getCanvasPoint(event);
    setSelectedOverlayId(overlay.id);
    setDraftInteraction({
      type: "resize-image",
      overlayId,
      pageNumber: currentPage,
      handle,
      start: point,
      startX: overlay.x,
      startY: overlay.y,
      startWidth: overlay.width,
      startHeight: overlay.height,
    });
  }, [currentPage, getCanvasPoint, overlays, toolMode]);

  const beginShapeResize = useCallback((event: ReactPointerEvent<HTMLElement>, overlayId: string, handle: CornerHandle) => {
    if (toolMode !== "select") return;

    const overlay = overlays.find((item) => item.id === overlayId);
    if (!overlay || overlay.type !== "highlight" || overlay.pageNumber !== currentPage || overlay.shapeKind === "line") return;

    event.stopPropagation();
    (editorCanvasRef.current ?? event.currentTarget).setPointerCapture(event.pointerId);
    interactionStartOverlaysRef.current = cloneOverlays(overlaysRef.current);
    const point = getCanvasPoint(event);
    setSelectedOverlayId(overlay.id);
    setDraftInteraction({
      type: "resize-shape",
      overlayId,
      pageNumber: currentPage,
      handle,
      start: point,
      startX: overlay.x,
      startY: overlay.y,
      startWidth: overlay.width,
      startHeight: overlay.height,
    });
  }, [currentPage, getCanvasPoint, overlays, toolMode]);

  const beginLineResize = useCallback((
    event: ReactPointerEvent<HTMLElement>,
    overlayId: string,
    endpoint: "start" | "end",
  ) => {
    if (toolMode !== "select") return;

    const overlay = overlays.find((item) => item.id === overlayId);
    if (!overlay || overlay.type !== "highlight" || overlay.pageNumber !== currentPage || overlay.shapeKind !== "line") return;

    event.stopPropagation();
    (editorCanvasRef.current ?? event.currentTarget).setPointerCapture(event.pointerId);
    interactionStartOverlaysRef.current = cloneOverlays(overlaysRef.current);
    const point = getCanvasPoint(event);
    const { start, end } = getLineEndpoints(overlay);
    setSelectedOverlayId(overlay.id);
    setDraftInteraction({
      type: "resize-line",
      overlayId,
      pageNumber: currentPage,
      endpoint,
      start: point,
      startLineStart: start,
      startLineEnd: end,
    });
  }, [currentPage, getCanvasPoint, overlays, toolMode]);

  const beginImageCrop = useCallback((event: ReactPointerEvent<HTMLElement>, overlayId: string, handle: CropEdgeHandle) => {
    if (toolMode !== "select") return;

    const overlay = overlays.find((item) => item.id === overlayId);
    if (!overlay || overlay.type !== "image" || overlay.pageNumber !== currentPage) return;

    event.preventDefault();
    event.stopPropagation();
    (editorCanvasRef.current ?? event.currentTarget).setPointerCapture(event.pointerId);
    interactionStartOverlaysRef.current = cloneOverlays(overlaysRef.current);
    const point = getCanvasPoint(event);
    const visible = getVisibleImageRatios(overlay);
    setSelectedOverlayId(overlay.id);
    setDraftInteraction({
      type: "crop-image",
      overlayId,
      pageNumber: currentPage,
      handle,
      start: point,
      startX: overlay.x,
      startY: overlay.y,
      startWidth: overlay.width,
      startHeight: overlay.height,
      startCropLeft: overlay.cropLeft,
      startCropTop: overlay.cropTop,
      startCropRight: overlay.cropRight,
      startCropBottom: overlay.cropBottom,
      startVisibleWidth: visible.visibleWidth,
      startVisibleHeight: visible.visibleHeight,
    });
  }, [currentPage, getCanvasPoint, overlays, toolMode]);

  const beginImageReadjust = useCallback((event: ReactPointerEvent<HTMLDivElement>, overlayId: string) => {
    if (toolMode !== "select") return;

    const overlay = overlays.find((item) => item.id === overlayId);
    if (!overlay || overlay.type !== "image" || overlay.pageNumber !== currentPage) return;

    event.stopPropagation();
    (editorCanvasRef.current ?? event.currentTarget).setPointerCapture(event.pointerId);
    interactionStartOverlaysRef.current = cloneOverlays(overlaysRef.current);
    const point = getCanvasPoint(event);
    const visible = getVisibleImageRatios(overlay);
    setSelectedOverlayId(overlay.id);
    setDraftInteraction({
      type: "readjust-image",
      overlayId,
      pageNumber: currentPage,
      start: point,
      startWidth: overlay.width,
      startHeight: overlay.height,
      startCropLeft: overlay.cropLeft,
      startCropTop: overlay.cropTop,
      startCropRight: overlay.cropRight,
      startCropBottom: overlay.cropBottom,
      startVisibleWidth: visible.visibleWidth,
      startVisibleHeight: visible.visibleHeight,
    });
  }, [currentPage, getCanvasPoint, overlays, toolMode]);

  const onCanvasPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pdf) return;

    event.preventDefault();
    const point = getCanvasPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (toolMode === "text") {
      addTextOverlay(point);
      return;
    }

    if (toolMode === "image") {
      if (!stampAsset) {
        stampInputRef.current?.click();
        return;
      }
      addImageOverlay(point);
      return;
    }

    if (toolMode === "draw") {
      setSelectedOverlayId(null);
      setDraftInteraction({
        type: "draw",
        pageNumber: currentPage,
        points: [point],
        color: toolColor,
        strokeWidth: brushSize,
      });
      return;
    }

    if (toolMode === "highlight") {
      if (shapeKind === "line") {
        setSelectedOverlayId(null);
        if (pendingLine && pendingLine.pageNumber === currentPage) {
          const geometry = buildLineGeometry(pendingLine.start, point);
          const overlay: HighlightOverlay = {
            id: createId(),
            type: "highlight",
            pageNumber: currentPage,
            x: geometry.x,
            y: geometry.y,
            width: geometry.width,
            height: geometry.height,
            shapeKind: "line",
            paintMode: "stroke",
            color: toolColor,
            opacity: highlightOpacity,
            strokeWidth: brushSize,
            lineStart: geometry.lineStart,
            lineEnd: geometry.lineEnd,
          };
          commitOverlayState([...overlaysRef.current, overlay], overlay.id, true);
          setPendingLine(null);
          setToolMode("select");
        } else {
          setPendingLine({
            pageNumber: currentPage,
            start: point,
            current: point,
          });
        }
        return;
      }

      setSelectedOverlayId(null);
      setDraftInteraction({
        type: "highlight",
        pageNumber: currentPage,
        start: point,
        current: point,
        shapeKind,
        paintMode: shapePaintMode,
        color: toolColor,
        opacity: highlightOpacity,
        strokeWidth: brushSize,
      });
      return;
    }

    if (toolMode === "select" && zoom > 1) {
      const viewport = viewportRef.current;
      if (!viewport) return;
      interactionStartOverlaysRef.current = null;
      setDraftInteraction({
        type: "pan",
        pageNumber: currentPage,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startScrollLeft: viewport.scrollLeft,
        startScrollTop: viewport.scrollTop,
      });
      return;
    }

    setSelectedOverlayId(null);
  }, [addImageOverlay, addTextOverlay, brushSize, commitOverlayState, currentPage, getCanvasPoint, highlightOpacity, pdf, pendingLine, shapeKind, shapePaintMode, stampAsset, toolColor, toolMode, zoom]);

  const onCanvasPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const point = getCanvasPoint(event);

    if (pendingLine && pendingLine.pageNumber === currentPage) {
      setPendingLine({ ...pendingLine, current: point });
    }

    if (!draftInteraction || draftInteraction.pageNumber !== currentPage) return;

    if (draftInteraction.type === "draw") {
      setDraftInteraction({ ...draftInteraction, points: [...draftInteraction.points, point] });
      return;
    }

    if (draftInteraction.type === "highlight") {
      setDraftInteraction({ ...draftInteraction, current: point });
      return;
    }

    if (draftInteraction.type === "move") {
      const deltaX = point.x - draftInteraction.start.x;
      const deltaY = point.y - draftInteraction.start.y;

      setOverlays((current) => current.map((item) => {
        if (item.id !== draftInteraction.overlayId || item.type === "draw") return item;

        if (item.type === "text") {
          return {
            ...item,
            x: clamp(draftInteraction.originX + deltaX, 0, 0.98),
            y: clamp(draftInteraction.originY + deltaY, 0, 0.98),
          };
        }

        if (item.type === "highlight" && item.shapeKind === "line") {
          const nextX = clamp(draftInteraction.originX + deltaX, 0, 1 - item.width);
          const nextY = clamp(draftInteraction.originY + deltaY, 0, 1 - item.height);
          const appliedDeltaX = nextX - draftInteraction.originX;
          const appliedDeltaY = nextY - draftInteraction.originY;
          const { start, end } = getLineEndpoints(item);

          return {
            ...item,
            x: nextX,
            y: nextY,
            lineStart: {
              x: clamp(start.x + appliedDeltaX, 0, 1),
              y: clamp(start.y + appliedDeltaY, 0, 1),
            },
            lineEnd: {
              x: clamp(end.x + appliedDeltaX, 0, 1),
              y: clamp(end.y + appliedDeltaY, 0, 1),
            },
          };
        }

        return {
          ...item,
          x: clamp(draftInteraction.originX + deltaX, 0, 1 - item.width),
          y: clamp(draftInteraction.originY + deltaY, 0, 1 - item.height),
        };
      }));
      return;
    }

    if (draftInteraction.type === "resize-image") {
      const deltaX = point.x - draftInteraction.start.x;
      const deltaY = point.y - draftInteraction.start.y;

      setOverlays((current) => current.map((item) => {
        if (item.id !== draftInteraction.overlayId || item.type !== "image") {
          return item;
        }

        let nextX = draftInteraction.startX;
        let nextY = draftInteraction.startY;
        let nextWidth = draftInteraction.startWidth;
        let nextHeight = draftInteraction.startHeight;

        if (draftInteraction.handle === "nw" || draftInteraction.handle === "sw") {
          nextX = clamp(draftInteraction.startX + deltaX, 0, draftInteraction.startX + draftInteraction.startWidth - MIN_IMAGE_SIZE);
          nextWidth = draftInteraction.startWidth + (draftInteraction.startX - nextX);
        }

        if (draftInteraction.handle === "ne" || draftInteraction.handle === "se") {
          nextWidth = clamp(draftInteraction.startWidth + deltaX, MIN_IMAGE_SIZE, 1 - draftInteraction.startX);
        }

        if (draftInteraction.handle === "nw" || draftInteraction.handle === "ne") {
          nextY = clamp(draftInteraction.startY + deltaY, 0, draftInteraction.startY + draftInteraction.startHeight - MIN_IMAGE_SIZE);
          nextHeight = draftInteraction.startHeight + (draftInteraction.startY - nextY);
        }

        if (draftInteraction.handle === "sw" || draftInteraction.handle === "se") {
          nextHeight = clamp(draftInteraction.startHeight + deltaY, MIN_IMAGE_SIZE, 1 - draftInteraction.startY);
        }

        return {
          ...item,
          x: nextX,
          y: nextY,
          width: nextWidth,
          height: nextHeight,
        };
      }));
      return;
    }

    if (draftInteraction.type === "resize-shape") {
      const deltaX = point.x - draftInteraction.start.x;
      const deltaY = point.y - draftInteraction.start.y;

      setOverlays((current) => current.map((item) => {
        if (item.id !== draftInteraction.overlayId || item.type !== "highlight") {
          return item;
        }

        return item.shapeKind === "ellipse"
          ? {
              ...item,
              ...resizeCircleOverlay(
                draftInteraction.startX,
                draftInteraction.startY,
                draftInteraction.startWidth,
                draftInteraction.startHeight,
                draftInteraction.handle,
                deltaX,
                deltaY,
                editorWidth,
                editorHeight,
              ),
            }
          : {
              ...item,
              ...resizeOverlayBox(
                draftInteraction.startX,
                draftInteraction.startY,
                draftInteraction.startWidth,
                draftInteraction.startHeight,
                draftInteraction.handle,
                deltaX,
                deltaY,
              ),
            };
      }));
      return;
    }

    if (draftInteraction.type === "resize-line") {
      setOverlays((current) => current.map((item) => {
        if (item.id !== draftInteraction.overlayId || item.type !== "highlight" || item.shapeKind !== "line") {
          return item;
        }

        const geometry = draftInteraction.endpoint === "start"
          ? buildLineGeometry(point, draftInteraction.startLineEnd)
          : buildLineGeometry(draftInteraction.startLineStart, point);

        return {
          ...item,
          x: geometry.x,
          y: geometry.y,
          width: geometry.width,
          height: geometry.height,
          lineStart: geometry.lineStart,
          lineEnd: geometry.lineEnd,
        };
      }));
      return;
    }

    if (draftInteraction.type === "crop-image") {
      setOverlays((current) => current.map((item) => {
        if (item.id !== draftInteraction.overlayId || item.type !== "image") {
          return item;
        }

        return cropImageFrame(item, draftInteraction, point);
      }));
      return;
    }

    if (draftInteraction.type === "readjust-image") {
      setOverlays((current) => current.map((item) => {
        if (item.id !== draftInteraction.overlayId || item.type !== "image") {
          return item;
        }

        return readjustImageWithinFrame(item, draftInteraction, point);
      }));
      return;
    }

    if (draftInteraction.type === "pan") {
      const viewport = viewportRef.current;
      if (!viewport) return;
      viewport.scrollLeft = Math.max(0, draftInteraction.startScrollLeft - (event.clientX - draftInteraction.startClientX));
      viewport.scrollTop = Math.max(0, draftInteraction.startScrollTop - (event.clientY - draftInteraction.startClientY));
    }
  }, [currentPage, draftInteraction, editorHeight, editorWidth, getCanvasPoint, pendingLine]);

  const onCanvasPointerUp = useCallback(() => {
    if (!draftInteraction) return;

    if (draftInteraction.type === "draw") {
      if (draftInteraction.points.length > 1) {
        const overlay: DrawOverlay = {
          id: createId(),
          type: "draw",
          pageNumber: draftInteraction.pageNumber,
          points: draftInteraction.points,
          color: draftInteraction.color,
          strokeWidth: draftInteraction.strokeWidth,
        };
        commitOverlayState([...overlaysRef.current, overlay], overlay.id, true);
      }
    }

    if (draftInteraction.type === "highlight") {
      const box = draftInteraction.shapeKind === "ellipse"
        ? squareBoxFromPoints(draftInteraction.start, draftInteraction.current, editorWidth, editorHeight)
        : boxFromPoints(draftInteraction.start, draftInteraction.current);
      if (box.width >= MIN_BOX_SIZE && box.height >= MIN_BOX_SIZE) {
        const overlay: HighlightOverlay = {
          id: createId(),
          type: "highlight",
          pageNumber: draftInteraction.pageNumber,
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          shapeKind: draftInteraction.shapeKind,
          paintMode: draftInteraction.paintMode,
          color: draftInteraction.color,
          opacity: draftInteraction.opacity,
          strokeWidth: draftInteraction.strokeWidth,
        };
        commitOverlayState([...overlaysRef.current, overlay], overlay.id, true);
        setToolMode("select");
      }
    }

    if (draftInteraction.type === "move" || draftInteraction.type === "resize-image" || draftInteraction.type === "resize-shape" || draftInteraction.type === "resize-line" || draftInteraction.type === "crop-image" || draftInteraction.type === "readjust-image") {
      const starting = interactionStartOverlaysRef.current;
      const current = overlaysRef.current;
      if (starting && !overlaysEqual(starting, current)) {
        setUndoStack((stack) => [...stack.slice(-39), cloneOverlays(starting)]);
        setRedoStack([]);
      }
      interactionStartOverlaysRef.current = null;
    }

    setDraftInteraction(null);
  }, [commitOverlayState, draftInteraction, editorHeight, editorWidth]);

  const saveEditedPdf = useCallback(async () => {
    if (!pdf) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      const document = await PDFDocument.load(pdf.bytes.slice(0));
      const regularFont = await document.embedFont(StandardFonts.Helvetica);
      const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
      const imageCache = new Map<string, PDFImage>();

      for (const [index, page] of document.getPages().entries()) {
        const pageNumber = index + 1;
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        const pageLayers = overlays.filter((item) => item.pageNumber === pageNumber);

        for (const layer of pageLayers) {
          if (layer.type === "text") {
            const fontSize = Math.max(pageHeight * layer.fontSize, 10);
            const font = layer.bold ? boldFont : regularFont;
            const lineHeight = fontSize * 1.15;
            const maxWidth = pageWidth * Math.max(0.2, 0.96 - layer.x);
            const lines = wrapTextToWidth(layer.text, font, fontSize, maxWidth);
            const textWidth = Math.min(
              maxWidth,
              Math.max(...lines.map((line) => font.widthOfTextAtSize(line || " ", fontSize))),
            );
            const textHeight = font.heightAtSize(fontSize) + Math.max(0, lines.length - 1) * lineHeight;
            const textX = pageWidth * layer.x;
            const textTop = pageHeight - pageHeight * layer.y;
            const paddingX = Math.max(fontSize * 0.35, 6);
            const paddingY = Math.max(fontSize * 0.22, 4);

            if (layer.backgroundFill) {
              page.drawRectangle({
                x: Math.max(0, textX - paddingX),
                y: Math.max(0, textTop - textHeight - paddingY),
                width: Math.min(pageWidth - Math.max(0, textX - paddingX), textWidth + paddingX * 2),
                height: Math.min(pageHeight, textHeight + paddingY * 2),
                color: hexToRgb(layer.backgroundColor ?? "#ffffff"),
                opacity: layer.backgroundOpacity ?? 0.88,
              });
            }

            lines.forEach((line, index) => {
              page.drawText(line, {
                x: textX,
                y: textTop - font.heightAtSize(fontSize) - index * lineHeight,
                size: fontSize,
                font,
                color: hexToRgb(layer.color),
              });
            });
            continue;
          }

          if (layer.type === "draw") {
            for (let pointIndex = 1; pointIndex < layer.points.length; pointIndex += 1) {
              const start = layer.points[pointIndex - 1];
              const end = layer.points[pointIndex];
              page.drawLine({
                start: { x: start.x * pageWidth, y: pageHeight - start.y * pageHeight },
                end: { x: end.x * pageWidth, y: pageHeight - end.y * pageHeight },
                thickness: Math.max(layer.strokeWidth * pageWidth, 1.5),
                color: hexToRgb(layer.color),
                opacity: 0.96,
              });
            }
            continue;
          }

          if (layer.type === "highlight") {
            if (layer.shapeKind === "line") {
              const { start, end } = getLineEndpoints(layer);
              page.drawLine({
                start: { x: pageWidth * start.x, y: pageHeight - pageHeight * start.y },
                end: { x: pageWidth * end.x, y: pageHeight - pageHeight * end.y },
                thickness: Math.max(layer.strokeWidth * pageWidth, 1.5),
                color: hexToRgb(layer.color),
                opacity: layer.opacity,
              });
              continue;
            }

            if (layer.shapeKind === "ellipse") {
              page.drawEllipse({
                x: pageWidth * (layer.x + layer.width / 2),
                y: pageHeight - pageHeight * (layer.y + layer.height / 2),
                xScale: (pageWidth * layer.width) / 2,
                yScale: (pageHeight * layer.height) / 2,
                color: layer.paintMode === "fill" || layer.paintMode === "both" ? hexToRgb(layer.color) : undefined,
                opacity: layer.opacity,
                borderColor: layer.paintMode === "stroke" || layer.paintMode === "both" ? hexToRgb(layer.color) : undefined,
                borderWidth: layer.paintMode === "stroke" || layer.paintMode === "both" ? Math.max(layer.strokeWidth * pageWidth, 1) : undefined,
                borderOpacity: layer.opacity,
              });
              continue;
            }

            page.drawRectangle({
              x: pageWidth * layer.x,
              y: pageHeight - pageHeight * (layer.y + layer.height),
              width: pageWidth * layer.width,
              height: pageHeight * layer.height,
              color: layer.paintMode === "fill" || layer.paintMode === "both" ? hexToRgb(layer.color) : undefined,
              opacity: layer.opacity,
              borderColor: layer.paintMode === "stroke" || layer.paintMode === "both" ? hexToRgb(layer.color) : undefined,
              borderWidth: layer.paintMode === "stroke" || layer.paintMode === "both" ? Math.max(layer.strokeWidth * pageWidth, 1) : undefined,
              borderOpacity: layer.opacity,
            });
            continue;
          }

          const cropKey = `${layer.dataUrl}:${layer.cropLeft}:${layer.cropTop}:${layer.cropRight}:${layer.cropBottom}`;
          let embeddedImage = imageCache.get(cropKey);
          if (!embeddedImage) {
            const croppedAsset = await buildCroppedImageAsset(layer);
            embeddedImage = croppedAsset.mimeType === "image/png"
              ? await document.embedPng(croppedAsset.bytes)
              : await document.embedJpg(croppedAsset.bytes);
            imageCache.set(cropKey, embeddedImage);
          }

          page.drawImage(embeddedImage, {
            x: pageWidth * layer.x,
            y: pageHeight - pageHeight * (layer.y + layer.height),
            width: pageWidth * layer.width,
            height: pageHeight * layer.height,
          });
        }
      }

      const saved = await document.save();
      const pdfBytes = new Uint8Array(saved.byteLength);
      pdfBytes.set(saved);
      downloadBlob(new Blob([pdfBytes as BlobPart], { type: "application/pdf" }), `${sanitizeBaseName(pdf.file.name)}-edited.pdf`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setProcessing(false);
    }
  }, [overlays, pdf]);

  const activePreviewUrl = editorPreviewUrl;
  const activePreviewLoading = editorPreviewLoading;
  const draftHighlightBox = draftInteraction?.type === "highlight" && draftInteraction.pageNumber === currentPage
    ? draftInteraction.shapeKind === "ellipse"
      ? squareBoxFromPoints(draftInteraction.start, draftInteraction.current, editorWidth, editorHeight)
      : boxFromPoints(draftInteraction.start, draftInteraction.current)
    : null;
  const draftShapeKind = draftInteraction?.type === "highlight" ? draftInteraction.shapeKind : shapeKind;
  const activeLineDraft = pendingLine && pendingLine.pageNumber === currentPage
    ? buildLineGeometry(pendingLine.start, pendingLine.current)
    : null;
  const draftPath = draftInteraction?.type === "draw" && draftInteraction.pageNumber === currentPage
    ? buildPixelPath(draftInteraction.points, editorWidth, editorHeight)
    : "";
  const overlayPointerClass = toolMode === "select" ? "pointer-events-auto" : "pointer-events-none";
  const canvasTouchAction = toolMode === "draw" || toolMode === "highlight"
    ? "none"
    : zoom > 1
      ? "pan-x pan-y"
      : "auto";

  const renderLayerOverlay = (layer: OverlayItem) => {
    if (layer.type === "text") {
      return (
        <div
          key={layer.id}
          onPointerDown={(event) => beginOverlayMove(event, layer.id)}
          onClick={(event) => {
            event.stopPropagation();
            setSelectedOverlayId(layer.id);
          }}
          className={`absolute cursor-move rounded border px-2 py-1 shadow-sm ${overlayPointerClass} ${selectedOverlayId === layer.id ? "border-[#ff4d6d]" : "border-black/10"}`}
          style={{
            left: `${layer.x * 100}%`,
            top: `${layer.y * 100}%`,
            color: layer.color,
            fontWeight: layer.bold ? 700 : 500,
            fontSize: `${Math.max(layer.fontSize * editorHeight, 12)}px`,
            lineHeight: 1.15,
            maxWidth: `${Math.max(editorWidth * 0.48, 220)}px`,
            whiteSpace: "pre-wrap",
            backgroundColor: layer.backgroundFill
              ? hexToRgbaString(layer.backgroundColor ?? "#ffffff", layer.backgroundOpacity ?? 0.88)
              : selectedOverlayId === layer.id
                ? "rgba(255,255,255,0.95)"
                : "rgba(255,255,255,0.9)",
          }}
        >
          {coerceMultilineText(layer.text)}
        </div>
      );
    }

    if (layer.type === "draw") {
      return (
        <svg
          key={layer.id}
          className={`${overlayPointerClass} absolute inset-0 ${selectedOverlayId === layer.id ? "drop-shadow-[0_0_10px_rgba(255,77,109,0.4)]" : ""}`}
          viewBox={`0 0 ${editorWidth} ${editorHeight}`}
          preserveAspectRatio="none"
          onClick={(event) => {
            event.stopPropagation();
            setSelectedOverlayId(layer.id);
          }}
        >
          <path
            d={buildPixelPath(layer.points, editorWidth, editorHeight)}
            fill="none"
            stroke={layer.color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={getStrokePx(layer.strokeWidth, editorWidth, editorHeight)}
          />
        </svg>
      );
    }

    if (layer.type === "highlight") {
      const showShapeHandles = toolMode === "select" && selectedOverlayId === layer.id;
      const localLine = layer.shapeKind === "line" ? getLocalLineEndpoints(layer) : null;
      return (
        <div
          key={layer.id}
          onPointerDown={(event) => beginOverlayMove(event, layer.id)}
          onClick={(event) => {
            event.stopPropagation();
            setSelectedOverlayId(layer.id);
          }}
          className={`absolute cursor-move rounded ${overlayPointerClass} ${selectedOverlayId === layer.id ? "" : ""}`}
          style={{
            left: `${layer.x * 100}%`,
            top: `${layer.y * 100}%`,
            width: `${layer.width * 100}%`,
            height: `${layer.height * 100}%`,
            backgroundColor: layer.shapeKind !== "line" ? getShapeFillColor(layer) : "transparent",
            opacity: layer.opacity,
            borderRadius: layer.shapeKind === "ellipse" ? "9999px" : undefined,
            border: layer.shapeKind === "line"
              ? "none"
              : `${layer.paintMode === "stroke" || layer.paintMode === "both" ? Math.max(layer.strokeWidth * editorWidth, 1.5) : 0}px solid ${getShapeBorderColor(layer)}`,
            boxShadow: selectedOverlayId === layer.id && layer.shapeKind !== "line" ? "0 0 0 2px rgba(255,77,109,0.35)" : undefined,
          }}
        >
          {layer.shapeKind === "line" ? (
            <svg className="pointer-events-none absolute inset-0 overflow-visible" viewBox={`0 0 ${Math.max(layer.width * editorWidth, 1)} ${Math.max(layer.height * editorHeight, 1)}`} preserveAspectRatio="none">
              <line
                x1={(localLine?.start.x ?? 0) * editorWidth}
                y1={(localLine?.start.y ?? 0) * editorHeight}
                x2={(localLine?.end.x ?? layer.width) * editorWidth}
                y2={(localLine?.end.y ?? layer.height) * editorHeight}
                stroke={layer.color}
                strokeWidth={Math.max(layer.strokeWidth * Math.min(editorWidth, editorHeight), 2)}
                strokeLinecap="round"
              />
            </svg>
          ) : null}
          {showShapeHandles ? (
            <>
              {layer.shapeKind === "line" ? (
                <>
                  <button
                    type="button"
                    onPointerDown={(event) => beginLineResize(event, layer.id, "start")}
                    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff4d6d] shadow"
                    style={{
                      left: `${(localLine?.start.x ?? 0) * 100}%`,
                      top: `${(localLine?.start.y ?? 0) * 100}%`,
                    }}
                    aria-label="Resize line start"
                  />
                  <button
                    type="button"
                    onPointerDown={(event) => beginLineResize(event, layer.id, "end")}
                    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff4d6d] shadow"
                    style={{
                      left: `${(localLine?.end.x ?? layer.width) * 100}%`,
                      top: `${(localLine?.end.y ?? layer.height) * 100}%`,
                    }}
                    aria-label="Resize line end"
                  />
                </>
              ) : (
                <>
                  <div className="pointer-events-none absolute inset-0 rounded inherit border-2 border-[#ff4d6d] shadow-[0_0_0_1px_rgba(255,77,109,0.35)]" style={{ borderRadius: layer.shapeKind === "ellipse" ? "9999px" : undefined }} />
                  {([
                    ["nw", "-left-2 -top-2 cursor-nwse-resize"],
                    ["ne", "-right-2 -top-2 cursor-nesw-resize"],
                    ["sw", "-left-2 -bottom-2 cursor-nesw-resize"],
                    ["se", "-right-2 -bottom-2 cursor-nwse-resize"],
                  ] as const).map(([handle, positionClass]) => (
                    <button
                      key={handle}
                      type="button"
                      onPointerDown={(event) => beginShapeResize(event, layer.id, handle)}
                      className={`absolute h-4 w-4 rounded-full border-2 border-white bg-[#ff4d6d] shadow ${positionClass}`}
                      aria-label={`Resize shape ${handle}`}
                    />
                  ))}
                </>
              )}
            </>
          ) : null}
        </div>
      );
    }

    const visible = getVisibleImageRatios(layer);
    const isSelectedImage = selectedOverlayId === layer.id;
    const showResizeHandles = toolMode === "select" && isSelectedImage && imageEditMode === "resize";
    const showCropHandles = toolMode === "select" && isSelectedImage && imageEditMode === "crop";
    const isReadjustMode = toolMode === "select" && isSelectedImage && imageEditMode === "readjust";
    const canMoveImage = toolMode === "select" && (!isSelectedImage || imageEditMode === "move");
    const imagePointerDown = isReadjustMode
      ? (event: ReactPointerEvent<HTMLDivElement>) => beginImageReadjust(event, layer.id)
      : canMoveImage
        ? (event: ReactPointerEvent<HTMLDivElement>) => beginOverlayMove(event, layer.id)
        : undefined;

    return (
      <div
        key={layer.id}
        onPointerDown={imagePointerDown}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedOverlayId(layer.id);
        }}
        className={`absolute overflow-visible rounded-lg ${overlayPointerClass} ${canMoveImage ? "cursor-move" : isReadjustMode ? "cursor-grab active:cursor-grabbing" : "cursor-default"} ${selectedOverlayId === layer.id ? "shadow-[0_0_0_2px_rgba(255,77,109,0.28)]" : ""}`}
        style={{
          left: `${layer.x * 100}%`,
          top: `${layer.y * 100}%`,
          width: `${layer.width * 100}%`,
          height: `${layer.height * 100}%`,
        }}
      >
        <div className={`absolute inset-0 overflow-hidden rounded-lg border bg-white/80 ${selectedOverlayId === layer.id ? "border-[#ff4d6d]" : "border-black/10"}`}>
          <img
            src={layer.dataUrl}
            alt={layer.name}
            className="pointer-events-none absolute max-w-none select-none"
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
            style={{
              width: `${100 / visible.visibleWidth}%`,
              height: `${100 / visible.visibleHeight}%`,
              left: `${-(layer.cropLeft / visible.visibleWidth) * 100}%`,
              top: `${-(layer.cropTop / visible.visibleHeight) * 100}%`,
            }}
          />
        </div>
        {toolMode === "select" && selectedOverlayId === layer.id ? (
          <>
            <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-[#ff4d6d] shadow-[0_0_0_1px_rgba(255,77,109,0.35)]" />
            <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-surface/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              {imageEditMode}
            </div>
            {showResizeHandles ? ([
              ["nw", "-left-2 -top-2 cursor-nwse-resize"],
              ["ne", "-right-2 -top-2 cursor-nesw-resize"],
              ["sw", "-left-2 -bottom-2 cursor-nesw-resize"],
              ["se", "-right-2 -bottom-2 cursor-nwse-resize"],
            ] as const).map(([handle, positionClass]) => (
              <button
                key={handle}
                type="button"
                onPointerDown={(event) => beginImageResize(event, layer.id, handle)}
                className={`absolute h-4 w-4 rounded-full border-2 border-white bg-[#ff4d6d] shadow ${positionClass}`}
                aria-label={`Resize image ${handle}`}
              />
            )) : null}
            {showCropHandles ? ([
              ["left", "-left-2 top-1/2 -translate-y-1/2 cursor-ew-resize"],
              ["right", "-right-2 top-1/2 -translate-y-1/2 cursor-ew-resize"],
              ["top", "left-1/2 -top-2 -translate-x-1/2 cursor-ns-resize"],
              ["bottom", "left-1/2 -bottom-2 -translate-x-1/2 cursor-ns-resize"],
            ] as const).map(([handle, positionClass]) => (
              <button
                key={handle}
                type="button"
                onPointerDown={(event) => beginImageCrop(event, layer.id, handle)}
                className={`absolute h-3.5 w-3.5 rounded-full border-2 border-white bg-[#f6b93b] shadow ${positionClass}`}
                aria-label={`Crop image ${handle}`}
              />
            )) : null}
          </>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept="application/pdf" onChange={onFileInput} className="hidden" />
      <input ref={stampInputRef} type="file" accept="image/png,image/jpeg" onChange={onStampInput} className="hidden" />

      {!pdf ? (
        <section
          onDrop={onDrop}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`rounded-[28px] border border-dashed p-8 transition md:p-12 ${dragOver ? "border-[#ff4d6d]/80 bg-[#201018]" : "border-border-strong bg-surface"}`}
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="rounded-full border border-border bg-surface-3/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb8c6]">
              Edit PDF workspace
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-white md:text-5xl">Upload a PDF to open the editor</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
              This editor is designed like a lightweight iLovePDF-style workspace: thumbnail rail on the left, a large page canvas in the center, and a live layer panel on the right.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-[#ff4d6d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ff365a]"
              >
                Choose PDF
              </button>
              <span className="text-sm text-[#7f8096]">or drag and drop it here</span>
            </div>
            <div className="mt-8 grid w-full gap-3 text-left text-sm text-[#bfc1d4] md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-surface/50 p-4">Left rail for all pages</div>
              <div className="rounded-2xl border border-border bg-surface/50 p-4">Center canvas for page editing</div>
              <div className="rounded-2xl border border-border bg-surface/50 p-4">Right panel for layers and styling</div>
            </div>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[30px] border border-border bg-background shadow-[0_30px_80px_rgba(0,0,0,0.32)]">
          <div className="border-b border-border bg-surface px-4 py-4 md:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c8ea6]">Edit PDF</div>
                <h2 className="mt-1 text-2xl font-semibold text-white">Canvas editor with page thumbnails and layers</h2>
                <p className="mt-2 text-sm text-muted">
                  {pdf.file.name} · {pdf.pageCount} pages · {formatBytes(pdf.file.size)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={undoLastChange}
                  disabled={!undoStack.length}
                  className="rounded-full border border-border bg-surface-3/50 px-4 py-2 text-sm font-medium text-white transition hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={redoLastChange}
                  disabled={!redoStack.length}
                  className="rounded-full border border-border bg-surface-3/50 px-4 py-2 text-sm font-medium text-white transition hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Redo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border border-border bg-surface-3/50 px-4 py-2 text-sm font-medium text-white transition hover:bg-surface-3"
                >
                  Replace PDF
                </button>
                <button
                  type="button"
                  onClick={resetEditor}
                  className="rounded-full border border-border bg-transparent px-4 py-2 text-sm font-medium text-[#c5c6d6] transition hover:border-border-strong hover:text-foreground"
                >
                  Reset changes
                </button>
                <button
                  type="button"
                  onClick={saveEditedPdf}
                  disabled={processing}
                  className="rounded-full bg-[#ff4d6d] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#ff365a] disabled:cursor-not-allowed disabled:bg-[#8f4151]"
                >
                  {processing ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-border bg-surface px-4 py-3 md:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-border bg-surface-3/50 p-1">
                  <button type="button" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#111118]">
                    Annotate
                  </button>
                  <button type="button" className="rounded-full px-4 py-2 text-sm font-medium text-[#8d8ea5]" disabled>
                    Edit
                  </button>
                </div>
                {TOOL_OPTIONS.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      setToolMode(tool.id);
                      if (tool.id === "image" && !stampAsset) {
                        stampInputRef.current?.click();
                      }
                    }}
                    className={`rounded-2xl border px-3 py-2 text-sm transition ${toolMode === tool.id ? "border-[#ff4d6d]/70 bg-[#ff4d6d]/10 text-white" : "border-border bg-surface/50 text-foreground/75 hover:bg-surface/70"}`}
                  >
                    <span className="mr-2 inline-block w-4 text-center">{tool.icon}</span>
                    {tool.label}
                  </button>
                ))}
                {toolMode === "highlight" ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface/50 px-2 py-2">
                    {([
                      ["rect", "Rectangle", "▭"],
                      ["ellipse", "Circle", "◯"],
                      ["line", "Line", "／"],
                    ] as const).map(([value, label, icon]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setShapeKind(value)}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${shapeKind === value ? "bg-[#ff4d6d] text-white" : "text-foreground/75 hover:bg-surface/70"}`}
                      >
                        <span className="mr-2 inline-block w-4 text-center">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-foreground/75">
                <label className="flex items-center gap-2 rounded-2xl border border-border bg-surface/50 px-3 py-2">
                  <span>Accent</span>
                  <input type="color" value={toolColor} onChange={(event) => setToolColor(event.target.value)} className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent" />
                </label>
                <button
                  type="button"
                  onClick={() => adjustZoom(-0.1, captureZoomAnchor())}
                  className="rounded-2xl border border-border bg-surface/50 px-3 py-2 transition hover:bg-surface/70"
                >
                  −
                </button>
                <div className="rounded-2xl border border-border bg-surface/50 px-3 py-2">{formatZoom(zoom)}</div>
                <button
                  type="button"
                  onClick={() => adjustZoom(0.1, captureZoomAnchor())}
                  className="rounded-2xl border border-border bg-surface/50 px-3 py-2 transition hover:bg-surface/70"
                >
                  +
                </button>
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.05}
                  value={zoom}
                  onChange={(event) => applyZoom(Number(event.target.value), captureZoomAnchor())}
                  className="ml-1 w-32 accent-[#ff4d6d]"
                  aria-label="Zoom PDF"
                />
              </div>
            </div>
          </div>

          <div className="grid min-h-[820px] xl:grid-cols-[192px_minmax(0,1fr)_320px]">
            <aside className="border-r border-border bg-surface px-3 py-4">
              <div className="mb-3 flex items-center justify-between px-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8d8ea5]">Pages</div>
                  <div className="mt-1 text-sm text-white">{pdf.pageCount} thumbnails</div>
                </div>
                <div className="rounded-full border border-border bg-surface/60 px-2 py-1 text-xs text-foreground/75">
                  {overlays.length} edits
                </div>
              </div>
              <div className="space-y-3 overflow-y-auto pr-1 xl:max-h-[740px]">
                {pageNumbers.map((pageNumber) => {
                  const isActive = pageNumber === currentPage;
                  const previewUrl = thumbnailUrls[pageNumber] ?? null;
                  const isLoading = thumbnailLoadingPages[pageNumber] ?? false;
                  const layerCount = countPageLayers(overlays, pageNumber);
                  const pageBox = pdf.pageBoxes[pageNumber - 1];
                  const aspect = getPageAspect(pageBox);

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-full rounded-2xl border p-2 text-left transition ${isActive ? "border-[#ff4d6d]/70 bg-[#1b1015] shadow-[0_0_0_1px_rgba(255,77,109,0.25)]" : "border-border bg-white/[0.02] hover:bg-surface/70"}`}
                    >
                      <div className="flex items-center justify-between px-1 pb-2 text-xs text-[#c6c7d7]">
                        <span>Page {pageNumber}</span>
                        <span>{layerCount} layers</span>
                      </div>
                      <div className="overflow-hidden rounded-xl border border-black/10 bg-[#e9e7ef]" style={{ aspectRatio: `${aspect}` }}>
                        {previewUrl ? (
                          <img src={previewUrl} alt={`Page ${pageNumber}`} className="h-full w-full object-contain" draggable={false} />
                        ) : (
                          <div className="flex h-full min-h-[160px] items-center justify-center text-xs text-[#696b82]">
                            {isLoading ? "Rendering…" : "Preview unavailable"}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <main className="flex min-w-0 flex-col bg-surface">
              <div className="border-b border-border px-4 py-3 text-sm text-muted md:px-6">
                Page {currentPage} of {pdf.pageCount} · {currentLayers.length} layer{currentLayers.length === 1 ? "" : "s"} on this page
              </div>

              <div
                ref={viewportRef}
                className="flex-1 overflow-auto bg-[#d8d6de] px-4 py-6 md:px-8"
                onPointerEnter={() => {
                  isViewportHoveredRef.current = true;
                }}
                onPointerLeave={() => {
                  isViewportHoveredRef.current = false;
                }}
              >
                <div className="mx-auto flex min-h-full items-start justify-center" style={{ minWidth: `${editorWidth + 64}px` }}>
                  <div
                    ref={editorCanvasRef}
                    className={`relative overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.2)] ${toolMode === "draw" ? "cursor-crosshair" : toolMode === "highlight" ? "cursor-crosshair" : toolMode === "text" ? "cursor-text" : toolMode === "image" ? "cursor-copy" : "cursor-default"}`}
                    style={{ width: `${editorWidth}px`, height: `${editorHeight}px`, touchAction: canvasTouchAction }}
                    onDragStart={(event) => event.preventDefault()}
                    onDoubleClick={(event) => event.preventDefault()}
                    onPointerDown={onCanvasPointerDown}
                    onPointerMove={onCanvasPointerMove}
                    onPointerUp={onCanvasPointerUp}
                    onPointerLeave={onCanvasPointerUp}
                  >
                    {activePreviewUrl ? (
                      <img src={activePreviewUrl} alt={`Page ${currentPage}`} className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none" draggable={false} onDragStart={(event) => event.preventDefault()} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-white text-sm text-[#66697c]">
                        {activePreviewLoading ? "Rendering page preview…" : "Preview unavailable"}
                      </div>
                    )}

                    <div className="absolute inset-0">
                      {currentLayers.map(renderLayerOverlay)}

                      {draftPath ? (
                        <svg className="pointer-events-none absolute inset-0" viewBox={`0 0 ${editorWidth} ${editorHeight}`} preserveAspectRatio="none">
                          <path
                            d={draftPath}
                            fill="none"
                            stroke={draftInteraction && draftInteraction.type === "draw" ? draftInteraction.color : toolColor}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={getStrokePx(draftInteraction && draftInteraction.type === "draw" ? draftInteraction.strokeWidth : brushSize, editorWidth, editorHeight)}
                          />
                        </svg>
                      ) : null}

                      {draftHighlightBox ? (
                        <div
                          className="pointer-events-none absolute"
                          style={{
                            left: `${draftHighlightBox.x * 100}%`,
                            top: `${draftHighlightBox.y * 100}%`,
                            width: `${draftHighlightBox.width * 100}%`,
                            height: `${draftHighlightBox.height * 100}%`,
                            backgroundColor: shapePaintMode === "fill" || shapePaintMode === "both" ? toolColor : "transparent",
                            opacity: highlightOpacity,
                            borderWidth: `${shapePaintMode === "stroke" || shapePaintMode === "both" ? Math.max(brushSize * editorWidth, 1.5) : 1}px`,
                            borderStyle: shapePaintMode === "stroke" || shapePaintMode === "both" ? "solid" : "dashed",
                            borderColor: shapePaintMode === "stroke" || shapePaintMode === "both" ? toolColor : "#ff4d6d",
                            borderRadius: draftShapeKind === "ellipse" ? "9999px" : undefined,
                          }}
                        />
                      ) : null}

                      {activeLineDraft ? (
                        <svg className="pointer-events-none absolute inset-0" viewBox={`0 0 ${editorWidth} ${editorHeight}`} preserveAspectRatio="none">
                          <line
                            x1={activeLineDraft.lineStart.x * editorWidth}
                            y1={activeLineDraft.lineStart.y * editorHeight}
                            x2={activeLineDraft.lineEnd.x * editorWidth}
                            y2={activeLineDraft.lineEnd.y * editorHeight}
                            stroke={toolColor}
                            strokeOpacity={highlightOpacity}
                            strokeWidth={getStrokePx(brushSize, editorWidth, editorHeight)}
                            strokeLinecap="round"
                          />
                          <circle
                            cx={activeLineDraft.lineStart.x * editorWidth}
                            cy={activeLineDraft.lineStart.y * editorHeight}
                            r={Math.max(getStrokePx(brushSize, editorWidth, editorHeight), 5)}
                            fill="#ff4d6d"
                          />
                          <circle
                            cx={activeLineDraft.lineEnd.x * editorWidth}
                            cy={activeLineDraft.lineEnd.y * editorHeight}
                            r={Math.max(getStrokePx(brushSize, editorWidth, editorHeight), 5)}
                            fill="#ff4d6d"
                          />
                        </svg>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </main>

            <aside className="border-l border-border bg-surface p-4 md:p-5">
              <div className="flex h-full flex-col">
                <div>
                  <h3 className="text-2xl font-semibold text-white">Edit PDF</h3>
                  <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sm text-[#cae7ff]">
                    Reorder layers, tweak styles, and place text, drawings, blocks, or image stamps on each page.
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-border bg-surface/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c8ea6]">Current tool</div>
                      <div className="mt-1 text-base font-medium text-white">{TOOL_OPTIONS.find((tool) => tool.id === toolMode)?.label}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => stampInputRef.current?.click()}
                      className="rounded-full border border-border bg-surface/60 px-3 py-2 text-xs font-semibold text-[#d9dae6] transition hover:bg-white/[0.08]"
                    >
                      Upload image
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-[#c3c4d6]">
                    <label className="grid gap-2">
                      <span>Brush / line thickness</span>
                      <input type="range" min={0.0025} max={0.018} step={0.0005} value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} />
                    </label>
                    <label className="grid gap-2">
                      <span>Text size</span>
                      <input type="range" min={0.024} max={0.09} step={0.002} value={textSize} onChange={(event) => setTextSize(Number(event.target.value))} />
                    </label>
                    <label className="grid gap-2">
                      <span>{toolMode === "highlight" ? "Shape opacity" : "Highlight opacity"}</span>
                      <input type="range" min={0.12} max={0.65} step={0.01} value={highlightOpacity} onChange={(event) => setHighlightOpacity(Number(event.target.value))} />
                    </label>
                    {toolMode === "highlight" ? (
                      <div className="grid gap-2 rounded-xl border border-border bg-surface/30 p-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c8ea6]">Shape style</span>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            ["fill", "Fill only"],
                            ["stroke", "Border only"],
                            ["both", "Both"],
                          ] as const).map(([mode, label]) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setShapePaintMode(mode)}
                              className={`rounded-xl px-2 py-2 text-[11px] font-semibold transition ${shapePaintMode === mode ? "bg-[#ff4d6d] text-white" : "border border-border bg-surface/50 text-[#d6d7e4] hover:bg-white/[0.08]"}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {stampAsset ? (
                      <div className="rounded-xl border border-border bg-surface/30 px-3 py-2 text-xs text-[#9ea0b5]">
                        Image ready: {stampAsset.name}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border bg-surface/30 px-3 py-2 text-xs text-[#80839a]">
                        Upload a PNG or JPG to place image stamps.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 min-h-0 flex-1 rounded-2xl border border-border bg-surface/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c8ea6]">Layers</div>
                      <div className="mt-1 text-base font-medium text-white">Page {currentPage}</div>
                    </div>
                    <div className="rounded-full border border-border bg-surface/60 px-2 py-1 text-xs text-foreground/75">
                      {currentLayers.length}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 overflow-y-auto xl:max-h-[280px]">
                    {currentLayers.length ? (
                      [...currentLayers].reverse().map((layer) => (
                        <div
                          key={layer.id}
                          className={`rounded-2xl border p-3 transition ${selectedOverlayId === layer.id ? "border-[#ff4d6d]/70 bg-[#1b1015]" : "border-border bg-surface/30 hover:border-border-strong"}`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedOverlayId(layer.id)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-white">{formatLayerType(layer)}</div>
                                <div className="mt-1 text-xs text-[#9b9db2]">{describeOverlay(layer)}</div>
                              </div>
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getLayerSwatchColor(layer) }} />
                            </div>
                          </button>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => moveOverlayLayer(layer.id, "back")}
                              className="rounded-full border border-border px-3 py-1 text-xs text-[#c9cada] transition hover:bg-white/[0.06]"
                            >
                              Send back
                            </button>
                            <button
                              type="button"
                              onClick={() => moveOverlayLayer(layer.id, "front")}
                              className="rounded-full border border-border px-3 py-1 text-xs text-[#c9cada] transition hover:bg-white/[0.06]"
                            >
                              Bring front
                            </button>
                            <button
                              type="button"
                              onClick={() => removeOverlay(layer.id)}
                              className="rounded-full border border-rose-400/30 px-3 py-1 text-xs text-[#ffb9c5] transition hover:bg-rose-400/10"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm leading-6 text-muted">
                        No layers yet. Choose a tool, then click or drag on the large page canvas.
                      </div>
                    )}
                  </div>

                  <div className="mt-5 border-t border-border pt-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c8ea6]">Selected item</div>
                    {selectedOverlay ? (
                      <div className="mt-4 space-y-4 text-sm text-[#c5c6d8]">
                        {selectedOverlay.type === "text" ? (
                          <>
                            <label className="grid gap-2">
                              <span>Text content</span>
                              <textarea
                                value={selectedOverlay.text}
                                onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, text: event.target.value } : item)}
                                rows={4}
                                className="rounded-2xl border border-border bg-surface/30 px-3 py-2 text-white outline-none transition focus:border-[#ff4d6d]/60"
                              />
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <label className="grid gap-2">
                                <span>Color</span>
                                <input type="color" value={selectedOverlay.color} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, color: event.target.value } : item)} className="h-11 w-full rounded-xl border border-border bg-surface/30" />
                              </label>
                              <label className="grid gap-2">
                                <span>Size</span>
                                <input type="range" min={0.024} max={0.09} step={0.002} value={selectedOverlay.fontSize} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, fontSize: Number(event.target.value) } : item)} />
                              </label>
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={selectedOverlay.backgroundFill ?? false} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? {
                                ...item,
                                backgroundFill: event.target.checked,
                                backgroundColor: item.backgroundColor ?? "#ffffff",
                                backgroundOpacity: item.backgroundOpacity ?? 0.88,
                              } : item)} />
                              Fill text box background
                            </label>
                            {selectedOverlay.backgroundFill ? (
                              <div className="grid grid-cols-2 gap-3">
                                <label className="grid gap-2">
                                  <span>Fill color</span>
                                  <input type="color" value={selectedOverlay.backgroundColor ?? "#ffffff"} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, backgroundColor: event.target.value } : item)} className="h-11 w-full rounded-xl border border-border bg-surface/30" />
                                </label>
                                <label className="grid gap-2">
                                  <span>Fill opacity</span>
                                  <input type="range" min={0.1} max={1} step={0.02} value={selectedOverlay.backgroundOpacity ?? 0.88} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, backgroundOpacity: Number(event.target.value) } : item)} />
                                </label>
                              </div>
                            ) : null}
                            <label className="inline-flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={selectedOverlay.bold} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, bold: event.target.checked } : item)} />
                              Bold text
                            </label>
                          </>
                        ) : null}

                        {selectedOverlay.type === "draw" ? (
                          <div className="grid gap-3">
                            <label className="grid gap-2">
                              <span>Stroke color</span>
                              <input type="color" value={selectedOverlay.color} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "draw" ? { ...item, color: event.target.value } : item)} className="h-11 w-full rounded-xl border border-border bg-surface/30" />
                            </label>
                            <label className="grid gap-2">
                              <span>Stroke thickness</span>
                              <input type="range" min={0.0025} max={0.018} step={0.0005} value={selectedOverlay.strokeWidth} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "draw" ? { ...item, strokeWidth: Number(event.target.value) } : item)} />
                            </label>
                          </div>
                        ) : null}

                        {selectedOverlay.type === "highlight" ? (
                          <div className="grid gap-3">
                            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-surface/30 p-2">
                              {([
                                ["rect", "Rectangle"],
                                ["ellipse", "Circle"],
                                ["line", "Line"],
                              ] as const).map(([kind, label]) => (
                                <button
                                  key={kind}
                                  type="button"
                                  onClick={() => updateOverlay(selectedOverlay.id, (item) => {
                                    if (item.type !== "highlight") {
                                      return item;
                                    }

                                    if (kind === "ellipse") {
                                      return {
                                        ...item,
                                        shapeKind: kind,
                                        ...normalizeCircleBox(item, editorWidth, editorHeight),
                                      };
                                    }

                                    return {
                                      ...item,
                                      shapeKind: kind,
                                      paintMode: kind === "line" ? "stroke" : item.paintMode,
                                    };
                                  })}
                                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${selectedOverlay.shapeKind === kind ? "bg-[#ff4d6d] text-white" : "border border-border bg-surface/50 text-[#d6d7e4] hover:bg-white/[0.08]"}`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            {selectedOverlay.shapeKind === "ellipse" && Math.abs(selectedOverlay.width - selectedOverlay.height) > 0.0005 ? (
                              <button
                                type="button"
                                onClick={() => updateOverlay(selectedOverlay.id, (item) => item.type === "highlight" && item.shapeKind === "ellipse"
                                  ? { ...item, ...normalizeCircleBox(item, editorWidth, editorHeight) }
                                  : item)}
                                className="rounded-xl border border-[#ff4d6d]/40 bg-[#ff4d6d]/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#ff4d6d]/20"
                              >
                                Make this a perfect circle
                              </button>
                            ) : null}
                            <label className="grid gap-2">
                              <span>Shape color</span>
                              <input type="color" value={selectedOverlay.color} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "highlight" ? { ...item, color: event.target.value } : item)} className="h-11 w-full rounded-xl border border-border bg-surface/30" />
                            </label>
                            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-surface/30 p-2">
                              {([
                                ["fill", "Fill only"],
                                ["stroke", "Border only"],
                                ["both", "Both"],
                              ] as const).map(([mode, label]) => (
                                <button
                                  key={mode}
                                  type="button"
                                  onClick={() => updateOverlay(selectedOverlay.id, (item) => item.type === "highlight" ? { ...item, paintMode: mode } : item)}
                                  className={`rounded-xl px-2 py-2 text-[11px] font-semibold transition ${selectedOverlay.paintMode === mode ? "bg-[#ff4d6d] text-white" : "border border-border bg-surface/50 text-[#d6d7e4] hover:bg-white/[0.08]"}`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            <label className="grid gap-2">
                              <span>Border / line thickness</span>
                              <input type="range" min={0.0025} max={0.018} step={0.0005} value={selectedOverlay.strokeWidth} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "highlight" ? { ...item, strokeWidth: Number(event.target.value) } : item)} />
                            </label>
                            <label className="grid gap-2">
                              <span>Opacity</span>
                              <input type="range" min={0.1} max={0.7} step={0.01} value={selectedOverlay.opacity} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "highlight" ? { ...item, opacity: Number(event.target.value) } : item)} />
                            </label>
                          </div>
                        ) : null}

                        {selectedOverlay.type === "image" ? (
                          <div className="grid gap-3">
                            <div className="rounded-2xl border border-border bg-surface/30 p-3 text-xs text-[#9fa1b7]">
                              {selectedOverlay.name}
                            </div>
                            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface/30 p-2">
                              {([
                                ["move", "Move"],
                                ["resize", "Resize"],
                                ["crop", "Crop"],
                                ["readjust", "Readjust"],
                              ] as const).map(([mode, label]) => (
                                <button
                                  key={mode}
                                  type="button"
                                  onClick={() => setImageEditMode(mode)}
                                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${imageEditMode === mode ? "bg-[#ff4d6d] text-white" : "border border-border bg-surface/50 text-[#d6d7e4] hover:bg-white/[0.08]"}`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            <div className="rounded-2xl border border-border bg-surface/30 p-4 text-sm leading-6 text-[#bfc1d5]">
                              {imageEditMode === "move"
                                ? "Move mode: drag the image box anywhere on the page."
                                : imageEditMode === "resize"
                                  ? "Resize mode: drag the pink corner handles to scale the image box."
                                  : imageEditMode === "crop"
                                    ? "Crop mode: drag the yellow side handles to trim the image frame without stretching the visible content."
                                    : "Readjust mode: drag inside the image box to reposition the image within the cropped frame."}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => updateOverlay(selectedOverlay.id, (item) => item.type === "image" ? { ...item, cropLeft: 0, cropTop: 0, cropRight: 0, cropBottom: 0 } : item)}
                                className="rounded-full border border-border px-3 py-2 text-xs font-medium text-[#d6d7e4] transition hover:bg-white/[0.06]"
                              >
                                Reset crop
                              </button>
                              <button
                                type="button"
                                onClick={() => removeOverlay(selectedOverlay.id)}
                                className="rounded-full border border-rose-400/25 px-3 py-2 text-xs font-medium text-[#ffb9c5] transition hover:bg-rose-400/10"
                              >
                                Remove image
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-border px-4 py-5 text-sm leading-6 text-muted">
                        Select a layer from the page or the list to edit its properties.
                      </div>
                    )}
                  </div>
                </div>

                {errorMessage ? (
                  <div className="mt-5 rounded-2xl border border-rose-400/25 bg-rose-400/10 p-3 text-sm text-[#ffc1cb]">
                    {errorMessage}
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}
