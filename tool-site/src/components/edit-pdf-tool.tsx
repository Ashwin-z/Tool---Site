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
type ShapeKind = "rect" | "square" | "ellipse" | "circle" | "line" | "arrow" | "arc" | "polygon" | "cloud" | "polyline";
type ShapePaintMode = "fill" | "stroke" | "both";
type LineStyle = "solid" | "dashed" | "dotted";

type LoadedPdf = {
  file: File;
  bytes: ArrayBuffer;
  pageCount: number;
  pageBoxes: PageBox[];
};

type Point = { x: number; y: number };
type EditorMode = "annotate" | "edit";
type ToolMode = "select" | "text" | "draw" | "highlight" | "image" | "textAnnotate";
type TextAnnotationType = "highlight" | "underline" | "strikeout" | "squiggly";
type DrawStyle = "freehand" | "highlighter";
type EditTab = "annotate" | "shapes" | "insert" | "editText" | "forms";
type TextToolVariant = "text" | "callout";
type TextHorizontalAlign = "start" | "center" | "end";
type TextVerticalAlign = "top" | "middle" | "bottom";
type TextFontFamily = "Helvetica" | "Times Roman" | "Courier";

type TextOverlay = {
  id: string;
  type: "text";
  variant: TextToolVariant;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontFamily: TextFontFamily;
  color: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeout: boolean;
  textAlign: TextHorizontalAlign;
  verticalAlign: TextVerticalAlign;
  strokeColor: string;
  strokeWidth: number;
  textOpacity: number;
  backgroundFill: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  calloutTarget: Point | null;
  calloutBend: Point | null;
};

type DrawOverlay = {
  id: string;
  type: "draw";
  pageNumber: number;
  points: Point[];
  color: string;
  strokeWidth: number;
  opacity: number;
  drawStyle: DrawStyle;
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
  strokeColor: string;
  fillColor: string;
  opacity: number;
  strokeWidth: number;
  lineStyle: LineStyle;
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

type TextAnnotationOverlay = {
  id: string;
  type: "textAnnotation";
  pageNumber: number;
  rects: Array<{ x: number; y: number; width: number; height: number }>;
  annotationType: TextAnnotationType;
  color: string;
  opacity: number;
};

type OverlayItem = TextOverlay | DrawOverlay | HighlightOverlay | ImageOverlay | TextAnnotationOverlay;

type FormFieldType = "signature-field" | "text-field" | "checkbox" | "radio" | "dropdown" | "listbox";
type FormField = {
  id: string;
  type: FormFieldType;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  value: string;
  checked: boolean;
  group: string;
  required: boolean;
  options: string[];
  readOnly: boolean;
  multiline: boolean;
  includeIndicator: boolean;
  multiSelect: boolean;
};

const FORM_FIELD_DEFAULTS: Record<FormFieldType, { width: number; height: number; label: string }> = {
  "signature-field": { width: 0.22, height: 0.06, label: "Signature" },
  "text-field": { width: 0.22, height: 0.025, label: "Text Field" },
  "checkbox":   { width: 0.018, height: 0.018, label: "Checkbox" },
  "radio":      { width: 0.018, height: 0.018, label: "Radio" },
  "dropdown":   { width: 0.22, height: 0.025, label: "Dropdown" },
  "listbox":    { width: 0.22, height: 0.1, label: "List Box" },
};

type StampAsset = {
  dataUrl: string;
  mimeType: "image/png" | "image/jpeg";
  width: number;
  height: number;
  name: string;
};

type StampDraft = {
  text: string;
  fontFamily: TextFontFamily;
  textColor: string;
  backgroundColor: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  includeTimestamp: boolean;
  timestampText: string;
};

type StampPreset = {
  id: string;
  label: string;
  config: Omit<StampDraft, "timestampText">;
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
  opacity: number;
  drawStyle: DrawStyle;
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
  startPoints?: Point[];
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

type ResizeTextDraft = {
  type: "resize-text";
  overlayId: string;
  pageNumber: number;
  handle: CornerHandle;
  start: Point;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

type MoveCalloutPointerDraft = {
  type: "move-callout-pointer";
  overlayId: string;
  pageNumber: number;
  start: Point;
  startTarget: Point;
};

type MoveCalloutBendDraft = {
  type: "move-callout-bend";
  overlayId: string;
  pageNumber: number;
  start: Point;
  startBend: Point;
};

type ResizeDrawDraft = {
  type: "resize-draw";
  overlayId: string;
  pageNumber: number;
  handle: CornerHandle;
  start: Point;
  startPoints: Point[];
  startBoundX: number;
  startBoundY: number;
  startBoundW: number;
  startBoundH: number;
};

type PanDraft = {
  type: "pan";
  pageNumber: number;
  startClientX: number;
  startClientY: number;
  startScrollLeft: number;
  startScrollTop: number;
};

type TextAnnotateDraft = {
  type: "textAnnotate";
  pageNumber: number;
  start: Point;
  current: Point;
  annotationType: TextAnnotationType;
  color: string;
  opacity: number;
};

type InteractionDraft = DrawDraft | HighlightDraft | MoveDraft | ResizeImageDraft | ResizeShapeDraft | ResizeLineDraft | ResizeTextDraft | ResizeDrawDraft | CropImageDraft | ReadjustImageDraft | MoveCalloutPointerDraft | MoveCalloutBendDraft | PanDraft | TextAnnotateDraft | null;
type ImageEditMode = "move" | "resize" | "crop" | "readjust";

type PendingLine = {
  pageNumber: number;
  shapeKind: "line" | "arrow";
  start: Point;
  current: Point;
};

type LineSnapTarget = {
  overlayId: string;
  endpoint: "start" | "end";
  point: Point;
};

type CalloutPlacementDraft = {
  pageNumber: number;
  target: Point;
  bend: Point | null;
  boxCenter: Point;
  width: number;
  height: number;
  stage: "leader" | "bend" | "box";
};

type PdfJsViewport = { width: number; height: number };
type PdfJsTextItem = {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName?: string;
  hasEOL?: boolean;
};
type PdfJsTextStyles = Record<string, { fontFamily: string; ascent?: number; descent?: number }>;
type PdfJsPage = {
  getViewport: (options: { scale: number }) => PdfJsViewport;
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: PdfJsViewport }) => { promise: Promise<void> };
  getTextContent: () => Promise<{ items: PdfJsTextItem[]; styles?: PdfJsTextStyles }>;
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

const EDIT_TABS: Array<{ id: EditTab; label: string; icon: string }> = [
  { id: "annotate", label: "Annotate", icon: "✍" },
  { id: "shapes", label: "Shapes", icon: "⬡" },
  { id: "insert", label: "Insert", icon: "➕" },
  { id: "editText", label: "Edit Text", icon: "T̲" },
  { id: "forms", label: "Forms", icon: "☐" },
];

const EDIT_TAB_TOOLS: Record<EditTab, Array<{ id: string; label: string; icon: string; title: string }>> = {
  annotate: [
    { id: "highlight-text", label: "Highlight", icon: "🅰", title: "Highlight text" },
    { id: "underline", label: "Underline", icon: "A̲", title: "Underline text" },
    { id: "strikethrough", label: "Strikeout", icon: "A̶", title: "Strikethrough text" },
    { id: "squiggly", label: "Squiggly", icon: "〰", title: "Squiggly underline" },
    { id: "pencil", label: "Free hand", icon: "✏️", title: "Freehand pen" },
    { id: "freehand-highlighter", label: "Highlighter", icon: "🖍", title: "Free hand highlighter" },
    { id: "add-text", label: "Text", icon: "T", title: "Add text" },
    { id: "text-callout", label: "Callout", icon: "T↗", title: "Text callout" },
    { id: "stamp", label: "Stamp", icon: "⊛", title: "Add stamp" },
    { id: "eraser", label: "Eraser", icon: "🧽", title: "Eraser" },
  ],
  shapes: [
    { id: "rectangle", label: "Rectangle", icon: "▭", title: "Draw rectangle" },
    { id: "square", label: "Square", icon: "□", title: "Draw square" },
    { id: "ellipse", label: "Ellipse", icon: "◯", title: "Draw ellipse" },
    { id: "circle", label: "Circle", icon: "◌", title: "Draw circle" },
    { id: "arc", label: "Arc", icon: "◜", title: "Draw arc" },
    { id: "polygon", label: "Polygon", icon: "⬠", title: "Draw polygon" },
    { id: "cloud", label: "Cloud", icon: "☁", title: "Draw cloud" },
    { id: "line", label: "Line", icon: "／", title: "Draw line" },
    { id: "polyline", label: "Polyline", icon: "〽", title: "Draw polyline" },
    { id: "arrow", label: "Arrow", icon: "→", title: "Draw arrow" },
    { id: "eraser", label: "Eraser", icon: "🧽", title: "Erase shapes" },
  ],
  insert: [
    { id: "insert-stamp", label: "Stamp", icon: "⊛", title: "Insert stamp" },
    { id: "insert-signature", label: "Signature", icon: "✍", title: "Insert signature" },
    { id: "eraser", label: "Eraser", icon: "🧽", title: "Erase items" },
  ],
  editText: [
    { id: "edit-existing", label: "Edit Text", icon: "T", title: "Edit existing text" },
    { id: "find-replace", label: "Find & Replace", icon: "🔍", title: "Find and replace text" },
  ],
  forms: [
    { id: "signature-field", label: "Signature", icon: "✍", title: "Add signature field" },
    { id: "text-field", label: "Text Field", icon: "⎕", title: "Add text field" },
    { id: "checkbox", label: "Checkbox", icon: "☐", title: "Add checkbox" },
    { id: "radio", label: "Radio", icon: "○", title: "Add radio button" },
    { id: "dropdown", label: "Combo Box", icon: "▾", title: "Add combo box / dropdown" },
    { id: "listbox", label: "List Box", icon: "☰", title: "Add list box" },
  ],
};

const MIN_BOX_SIZE = 0.04;
const MIN_IMAGE_SIZE = 0.06;
const MIN_ZOOM = 0.65;
const MAX_ZOOM = 5;
const BASE_EDITOR_WIDTH = 780;

const COLOR_PRESETS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6",
  "#d946ef", "#f43f5e", "#78716c", "#1e293b", "#000000",
];

const STAMP_BACKGROUND_PRESETS = [
  "#fef3c7", "#dcfce7", "#dbeafe", "#fce7f3", "#fee2e2", "#e5e7eb", "#ffffff", "#111827",
];

const TEXT_FONT_OPTIONS: TextFontFamily[] = ["Helvetica", "Times Roman", "Courier"];

const DEFAULT_STAMP_DRAFT: StampDraft = {
  text: "Draft",
  fontFamily: "Helvetica",
  textColor: "#ffffff",
  backgroundColor: "#16a34a",
  bold: true,
  italic: false,
  underline: false,
  includeTimestamp: true,
  timestampText: "",
};

const STAMP_PRESETS: StampPreset[] = [
  {
    id: "approved",
    label: "APPROVED",
    config: {
      text: "APPROVED",
      fontFamily: "Helvetica",
      textColor: "#4d7c0f",
      backgroundColor: "#ecfccb",
      bold: true,
      italic: true,
      underline: false,
      includeTimestamp: false,
    },
  },
  {
    id: "as-is",
    label: "AS IS",
    config: {
      text: "AS IS",
      fontFamily: "Courier",
      textColor: "#1e3a8a",
      backgroundColor: "#eef2ff",
      bold: true,
      italic: true,
      underline: false,
      includeTimestamp: false,
    },
  },
  {
    id: "completed",
    label: "COMPLETED",
    config: {
      text: "COMPLETED",
      fontFamily: "Helvetica",
      textColor: "#3f6212",
      backgroundColor: "#dcfce7",
      bold: true,
      italic: true,
      underline: false,
      includeTimestamp: false,
    },
  },
  {
    id: "confidential",
    label: "CONFIDENTIAL",
    config: {
      text: "CONFIDENTIAL",
      fontFamily: "Courier",
      textColor: "#1e3a8a",
      backgroundColor: "#eef2ff",
      bold: true,
      italic: true,
      underline: false,
      includeTimestamp: false,
    },
  },
  {
    id: "draft",
    label: "DRAFT",
    config: {
      text: "Draft",
      fontFamily: "Helvetica",
      textColor: "#ffffff",
      backgroundColor: "#16a34a",
      bold: true,
      italic: false,
      underline: false,
      includeTimestamp: true,
    },
  },
  {
    id: "departmental",
    label: "DEPARTMENTAL",
    config: {
      text: "DEPARTMENTAL",
      fontFamily: "Helvetica",
      textColor: "#1e3a8a",
      backgroundColor: "#e0e7ff",
      bold: true,
      italic: true,
      underline: false,
      includeTimestamp: false,
    },
  },
  {
    id: "expired",
    label: "EXPIRED",
    config: {
      text: "EXPIRED",
      fontFamily: "Helvetica",
      textColor: "#b91c1c",
      backgroundColor: "#fee2e2",
      bold: true,
      italic: true,
      underline: false,
      includeTimestamp: false,
    },
  },
  {
    id: "final",
    label: "FINAL",
    config: {
      text: "FINAL",
      fontFamily: "Helvetica",
      textColor: "#4d7c0f",
      backgroundColor: "#dcfce7",
      bold: true,
      italic: true,
      underline: false,
      includeTimestamp: false,
    },
  },
];

const EDIT_TOOL_HAS_STROKE = new Set(["pencil", "freehand-highlighter", "rectangle", "square", "ellipse", "circle", "arc", "polygon", "cloud", "line", "polyline", "arrow"]);
const EDIT_TOOL_HAS_FILL = new Set(["rectangle", "square", "ellipse", "circle", "polygon", "cloud"]);
const EDIT_TOOL_HAS_STYLE = new Set(["underline", "strikethrough", "squiggly", "rectangle", "square", "ellipse", "circle", "arc", "polygon", "cloud", "line", "polyline", "arrow"]);
const EDIT_TOOLS_NO_PROPS = new Set(["eraser", "stamp", "insert-stamp", "insert-signature", "insert-image", "insert-link", "insert-page", "edit-existing", "find-replace", "text-field", "checkbox", "radio", "dropdown", "listbox", "signature"]);

/* Map each edit-tool id → the underlying canvas toolMode + shape config */
const EDIT_TOOL_CANVAS_MAP: Record<string, { toolMode: ToolMode; shapeKind?: ShapeKind; paintMode?: ShapePaintMode; textAnnotation?: TextAnnotationType; drawStyle?: DrawStyle; textVariant?: TextToolVariant }> = {
  "highlight-text": { toolMode: "textAnnotate", textAnnotation: "highlight" },
  "underline": { toolMode: "textAnnotate", textAnnotation: "underline" },
  "strikethrough": { toolMode: "textAnnotate", textAnnotation: "strikeout" },
  "squiggly": { toolMode: "textAnnotate", textAnnotation: "squiggly" },
  "pencil": { toolMode: "draw", drawStyle: "freehand" },
  "freehand-highlighter": { toolMode: "draw", drawStyle: "highlighter" },
  "eraser": { toolMode: "select" },
  "add-text": { toolMode: "text", textVariant: "text" },
  "text-callout": { toolMode: "text", textVariant: "callout" },
  "stamp": { toolMode: "image" },
    "rectangle": { toolMode: "highlight", shapeKind: "rect", paintMode: "stroke" },
    "square": { toolMode: "highlight", shapeKind: "square", paintMode: "stroke" },
    "ellipse": { toolMode: "highlight", shapeKind: "ellipse", paintMode: "stroke" },
    "circle": { toolMode: "highlight", shapeKind: "circle", paintMode: "stroke" },
  "arc": { toolMode: "highlight", shapeKind: "arc", paintMode: "stroke" },
    "polygon": { toolMode: "highlight", shapeKind: "polygon", paintMode: "stroke" },
    "cloud": { toolMode: "highlight", shapeKind: "cloud", paintMode: "stroke" },
  "line": { toolMode: "highlight", shapeKind: "line", paintMode: "stroke" },
  "polyline": { toolMode: "highlight", shapeKind: "polyline", paintMode: "stroke" },
  "arrow": { toolMode: "highlight", shapeKind: "arrow", paintMode: "stroke" },
  "insert-stamp": { toolMode: "image" },
  "insert-image": { toolMode: "image" },
  "insert-signature": { toolMode: "image" },
  "signature": { toolMode: "draw", drawStyle: "freehand" },
};

const SHAPE_WITH_FIXED_ASPECT = new Set<ShapeKind>(["square", "circle"]);
const SHAPE_WITH_FILL = new Set<ShapeKind>(["rect", "square", "ellipse", "circle", "polygon", "cloud"]);
const SHAPE_OPEN_PATH = new Set<ShapeKind>(["line", "arrow", "arc", "polyline"]);
const SHAPE_CONNECTOR = new Set<ShapeKind>(["line", "arrow"]);

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

function getCssFontFamily(fontFamily: TextFontFamily) {
  if (fontFamily === "Times Roman") {
    return '"Times New Roman", Times, serif';
  }

  if (fontFamily === "Courier") {
    return '"Courier New", Courier, monospace';
  }

  return 'Helvetica, Arial, sans-serif';
}

function formatStampTimestamp(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date).replace(",", "");
}

function createStampFileName(text: string) {
  const base = text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${base || "stamp"}.png`;
}

function drawRoundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const nextRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + nextRadius, y);
  context.lineTo(x + width - nextRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + nextRadius);
  context.lineTo(x + width, y + height - nextRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - nextRadius, y + height);
  context.lineTo(x + nextRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - nextRadius);
  context.lineTo(x, y + nextRadius);
  context.quadraticCurveTo(x, y, x + nextRadius, y);
  context.closePath();
}

function getTextPadding(fontSizePx: number) {
  return {
    x: Math.max(fontSizePx * 0.35, 6),
    y: Math.max(fontSizePx * 0.22, 4),
  };
}

function getTextAlignCss(align: TextHorizontalAlign): "left" | "center" | "right" {
  return align === "center" ? "center" : align === "end" ? "right" : "left";
}

function getVerticalAlignCss(align: TextVerticalAlign): "flex-start" | "center" | "flex-end" {
  return align === "middle" ? "center" : align === "bottom" ? "flex-end" : "flex-start";
}

function getTextDecorationCss(overlay: TextOverlay) {
  if (overlay.underline && overlay.strikeout) {
    return "underline line-through";
  }

  if (overlay.underline) {
    return "underline";
  }

  if (overlay.strikeout) {
    return "line-through";
  }

  return "none";
}

function getStandardFontName(fontFamily: TextFontFamily, bold: boolean, italic: boolean): StandardFonts {
  if (fontFamily === "Times Roman") {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold) return StandardFonts.TimesRomanBold;
    if (italic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }

  if (fontFamily === "Courier") {
    if (bold && italic) return StandardFonts.CourierBoldOblique;
    if (bold) return StandardFonts.CourierBold;
    if (italic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }

  if (bold && italic) return StandardFonts.HelveticaBoldOblique;
  if (bold) return StandardFonts.HelveticaBold;
  if (italic) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
}

function getCalloutAnchorPoint(layer: TextOverlay) {
  const referencePoint = layer.calloutBend ?? layer.calloutTarget;
  if (!referencePoint) {
    return {
      x: layer.x + layer.width,
      y: layer.y + layer.height,
    };
  }

  const centerX = layer.x + layer.width / 2;
  const centerY = layer.y + layer.height / 2;
  const deltaX = referencePoint.x - centerX;
  const deltaY = referencePoint.y - centerY;

  if (deltaX === 0 && deltaY === 0) {
    return { x: centerX, y: centerY };
  }

  const safeHalfWidth = Math.max(layer.width / 2, 0.0001);
  const safeHalfHeight = Math.max(layer.height / 2, 0.0001);
  const scaleX = Math.abs(deltaX) / safeHalfWidth;
  const scaleY = Math.abs(deltaY) / safeHalfHeight;
  const scale = Math.max(scaleX, scaleY, 1);

  return {
    x: clamp(centerX + deltaX / scale, layer.x, layer.x + layer.width),
    y: clamp(centerY + deltaY / scale, layer.y, layer.y + layer.height),
  };
}

function getCalloutBoxFromCenter(center: Point, width: number, height: number) {
  return {
    x: clamp(center.x - width / 2, 0.02, 0.98 - width),
    y: clamp(center.y - height / 2, 0.02, 0.98 - height),
    width,
    height,
  };
}

function getArrowHeadPoints(start: Point, end: Point, length: number, spread: number) {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const baseX = end.x - Math.cos(angle) * length;
  const baseY = end.y - Math.sin(angle) * length;
  const leftX = baseX + Math.sin(angle) * spread;
  const leftY = baseY - Math.cos(angle) * spread;
  const rightX = baseX - Math.sin(angle) * spread;
  const rightY = baseY + Math.cos(angle) * spread;

  return {
    left: { x: leftX, y: leftY },
    right: { x: rightX, y: rightY },
  };
}

function getShapeLabel(shapeKind: ShapeKind) {
  switch (shapeKind) {
    case "square":
      return "Square";
    case "ellipse":
      return "Ellipse";
    case "circle":
      return "Circle";
    case "line":
      return "Line";
    case "arrow":
      return "Arrow";
    case "arc":
      return "Arc";
    case "polygon":
      return "Polygon";
    case "cloud":
      return "Cloud";
    case "polyline":
      return "Polyline";
    default:
      return "Rectangle";
  }
}

function shapeSupportsFill(shapeKind: ShapeKind) {
  return SHAPE_WITH_FILL.has(shapeKind);
}

function shapeUsesFixedAspect(shapeKind: ShapeKind) {
  return SHAPE_WITH_FIXED_ASPECT.has(shapeKind);
}

function shapeIsConnector(shapeKind: ShapeKind) {
  return SHAPE_CONNECTOR.has(shapeKind);
}

function shapeUsesOpenPath(shapeKind: ShapeKind) {
  return SHAPE_OPEN_PATH.has(shapeKind);
}

function getShapeFillColor(layer: HighlightOverlay) {
  if (!shapeSupportsFill(layer.shapeKind)) return "transparent";
  return layer.paintMode === "fill" || layer.paintMode === "both" ? layer.fillColor : "transparent";
}

function getShapeBorderColor(layer: HighlightOverlay) {
  return layer.paintMode === "stroke" || layer.paintMode === "both" ? layer.strokeColor : "transparent";
}

function getLineStyleDashArray(lineStyle: LineStyle, strokePx: number) {
  if (lineStyle === "dashed") return `${Math.max(strokePx * 4, 8)} ${Math.max(strokePx * 2.8, 6)}`;
  if (lineStyle === "dotted") return `${Math.max(strokePx * 0.9, 2)} ${Math.max(strokePx * 2.2, 5)}`;
  return undefined;
}

function buildRegularPolygonPoints(width: number, height: number, sides: number) {
  const radius = Math.min(width, height) * 0.42;
  const centerX = width / 2;
  const centerY = height / 2;
  const points: Point[] = [];

  for (let index = 0; index < sides; index += 1) {
    const angle = (-Math.PI / 2) + (index * Math.PI * 2) / sides;
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }

  return points;
}

function buildShapePath(shapeKind: ShapeKind, width: number, height: number, flipY = false) {
  const y = (value: number) => flipY ? height - value : value;

  if (shapeKind === "polygon") {
    const points = buildRegularPolygonPoints(width, height, 5);
    return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${y(point.y).toFixed(2)}`).join(" ") + " Z";
  }

  if (shapeKind === "polyline") {
    const points = [
      { x: width * 0.08, y: height * 0.76 },
      { x: width * 0.34, y: height * 0.24 },
      { x: width * 0.56, y: height * 0.62 },
      { x: width * 0.92, y: height * 0.18 },
    ];
    return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${y(point.y).toFixed(2)}`).join(" ");
  }

  if (shapeKind === "arc") {
    return `M ${0} ${y(height * 0.92).toFixed(2)} Q ${(width * 0.32).toFixed(2)} ${y(height * 0.08).toFixed(2)} ${(width * 0.98).toFixed(2)} ${y(height * 0.36).toFixed(2)}`;
  }

  if (shapeKind === "cloud") {
    return [
      `M ${(width * 0.1).toFixed(2)} ${y(height * 0.75).toFixed(2)}`,
      `C ${(width * 0.02).toFixed(2)} ${y(height * 0.78).toFixed(2)} ${0} ${y(height * 0.58).toFixed(2)} ${(width * 0.12).toFixed(2)} ${y(height * 0.5).toFixed(2)}`,
      `C ${(width * 0.09).toFixed(2)} ${y(height * 0.28).toFixed(2)} ${(width * 0.28).toFixed(2)} ${y(height * 0.12).toFixed(2)} ${(width * 0.45).toFixed(2)} ${y(height * 0.22).toFixed(2)}`,
      `C ${(width * 0.52).toFixed(2)} ${y(height * 0.02).toFixed(2)} ${(width * 0.77).toFixed(2)} ${y(height * 0.03).toFixed(2)} ${(width * 0.84).toFixed(2)} ${y(height * 0.23).toFixed(2)}`,
      `C ${(width * 0.99).toFixed(2)} ${y(height * 0.22).toFixed(2)} ${width.toFixed(2)} ${y(height * 0.5).toFixed(2)} ${(width * 0.86).toFixed(2)} ${y(height * 0.57).toFixed(2)}`,
      `C ${(width * 0.89).toFixed(2)} ${y(height * 0.79).toFixed(2)} ${(width * 0.71).toFixed(2)} ${y(height * 0.92).toFixed(2)} ${(width * 0.52).toFixed(2)} ${y(height * 0.82).toFixed(2)}`,
      `C ${(width * 0.42).toFixed(2)} ${y(height * 0.92).toFixed(2)} ${(width * 0.2).toFixed(2)} ${y(height * 0.92).toFixed(2)} ${(width * 0.1).toFixed(2)} ${y(height * 0.75).toFixed(2)}`,
      "Z",
    ].join(" ");
  }

  return null;
}

function getConnectorSnapTarget(
  point: Point,
  overlays: OverlayItem[],
  pageNumber: number,
  editorWidth: number,
  editorHeight: number,
  excludeOverlayId?: string,
) {
  const snapThreshold = 14;
  let best: { candidate: LineSnapTarget; distance: number } | null = null;

  for (const overlay of overlays) {
    if (overlay.id === excludeOverlayId || overlay.type !== "highlight" || overlay.pageNumber !== pageNumber || !shapeIsConnector(overlay.shapeKind)) {
      continue;
    }

    const endpoints = getLineEndpoints(overlay);
    for (const endpoint of ["start", "end"] as const) {
      const targetPoint = endpoints[endpoint];
      const deltaX = (targetPoint.x - point.x) * editorWidth;
      const deltaY = (targetPoint.y - point.y) * editorHeight;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > snapThreshold) continue;
      if (!best || distance < best.distance) {
        best = {
          candidate: {
            overlayId: overlay.id,
            endpoint,
            point: targetPoint,
          },
          distance,
        };
      }
    }
  }

  return best?.candidate ?? null;
}

function describeOverlay(item: OverlayItem): string {
  switch (item.type) {
    case "text":
      return item.text.trim() ? item.text.trim().slice(0, 28) : item.variant === "callout" ? "Callout" : "Text";
    case "draw":
      return `Freehand stroke (${item.points.length} pts)`;
    case "highlight":
      return `${getShapeLabel(item.shapeKind)} shape`;
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

function boxFromPoints(start: Point, end: Point) {
  const left = clamp(Math.min(start.x, end.x), 0, 1);
  const top = clamp(Math.min(start.y, end.y), 0, 1);
  const right = clamp(Math.max(start.x, end.x), 0, 1);
  const bottom = clamp(Math.max(start.y, end.y), 0, 1);

  return normalizeBox(left, top, right - left, bottom - top);
}

function rawBoxFromPoints(start: Point, end: Point) {
  const left = clamp(Math.min(start.x, end.x), 0, 1);
  const top = clamp(Math.min(start.y, end.y), 0, 1);
  const right = clamp(Math.max(start.x, end.x), 0, 1);
  const bottom = clamp(Math.max(start.y, end.y), 0, 1);

  return {
    x: left,
    y: top,
    width: Math.max(right - left, 0),
    height: Math.max(bottom - top, 0),
  };
}

function getTextItemCenterY(item: NormTextItem): number {
  return item.y + item.height / 2;
}

function getTextAnnotationLineHeight(rectHeight: number): number {
  return Math.max(rectHeight * 0.08, 0.0024);
}

function getUnderlineTop(rect: { y: number; height: number }): number {
  const gap = Math.max(rect.height * 0.015, 0.0012);
  return rect.y + rect.height + gap;
}

function getStrikeoutTop(rect: { y: number; height: number }): number {
  const lineHeight = getTextAnnotationLineHeight(rect.height);
  return rect.y + rect.height * 0.5 - lineHeight / 2;
}

function getSquigglyTop(rect: { y: number; height: number }): number {
  return getUnderlineTop(rect) - Math.max(rect.height * 0.01, 0.0004);
}

function getSquigglyHeight(rect: { height: number }): number {
  return Math.max(rect.height * 0.18, getTextAnnotationLineHeight(rect.height) * 1.7);
}

function buildSquigglePoints(width: number, height: number) {
  const safeWidth = Math.max(width, 1);
  const safeHeight = Math.max(height, 1);
  const amplitude = safeHeight * 0.28;
  const centerY = safeHeight * 0.5;
  const halfWave = Math.max(safeHeight * 0.7, 4);
  const points: Array<{ x: number; y: number }> = [];
  let direction = -1;

  for (let x = 0; x <= safeWidth + halfWave; x += halfWave) {
    points.push({ x: Math.min(x, safeWidth), y: centerY + amplitude * direction });
    direction *= -1;
  }

  if (points[points.length - 1]?.x !== safeWidth) {
    points.push({ x: safeWidth, y: centerY + amplitude * direction * -1 });
  }

  return points;
}

function getTextAnnotationRects(items: NormTextItem[], box: { x: number; y: number; width: number; height: number }) {
  if (box.width <= 0 || box.height <= 0) return [];

  const sorted = [...items].sort((leftItem, rightItem) => {
    const deltaY = getTextItemCenterY(leftItem) - getTextItemCenterY(rightItem);
    if (Math.abs(deltaY) > 0.0005) return deltaY;
    return leftItem.x - rightItem.x;
  });

  const lines: Array<{
    items: NormTextItem[];
    top: number;
    bottom: number;
    centerY: number;
  }> = [];

  for (const item of sorted) {
    const centerY = getTextItemCenterY(item);
    const tolerance = Math.max(item.height * 0.65, 0.0025);
    let targetLine: (typeof lines)[number] | null = null;

    for (let index = lines.length - 1; index >= 0; index -= 1) {
      const line = lines[index];
      const lineHeight = line.bottom - line.top;
      const lineTolerance = Math.max(lineHeight * 0.55, tolerance);
      if (Math.abs(centerY - line.centerY) <= lineTolerance) {
        targetLine = line;
        break;
      }
    }

    if (!targetLine) {
      lines.push({
        items: [item],
        top: item.y,
        bottom: item.y + item.height,
        centerY,
      });
      continue;
    }

    targetLine.items.push(item);
    targetLine.top = Math.min(targetLine.top, item.y);
    targetLine.bottom = Math.max(targetLine.bottom, item.y + item.height);
    targetLine.centerY = targetLine.items.reduce((sum, lineItem) => sum + getTextItemCenterY(lineItem), 0) / targetLine.items.length;
  }

  const boxTop = box.y;
  const boxBottom = box.y + box.height;
  const boxCenterY = boxTop + box.height / 2;
  const overlappingLines = lines
    .map((line) => ({
      ...line,
      overlapY: Math.max(0, Math.min(line.bottom, boxBottom) - Math.max(line.top, boxTop)),
    }))
    .filter((line) => line.overlapY > 0);

  if (overlappingLines.length === 0) return [];

  const averageLineHeight = overlappingLines.reduce((sum, line) => sum + (line.bottom - line.top), 0) / overlappingLines.length;
  const singleLineSelection = box.height <= averageLineHeight * 1.35;
  const targetLines = singleLineSelection
    ? [overlappingLines.reduce((best, line) => {
        const bestDistance = Math.abs(best.centerY - boxCenterY);
        const lineDistance = Math.abs(line.centerY - boxCenterY);
        if (lineDistance < bestDistance) return line;
        if (lineDistance === bestDistance && line.overlapY > best.overlapY) return line;
        return best;
      })]
    : overlappingLines.filter((line) => {
        const lineHeight = line.bottom - line.top;
        return (line.centerY >= boxTop && line.centerY <= boxBottom) || line.overlapY >= lineHeight * 0.5;
      });

  const rects: Array<{ x: number; y: number; width: number; height: number }> = [];
  for (const line of targetLines) {
    for (const item of line.items) {
      const clippedLeft = Math.max(item.x, box.x);
      const clippedRight = Math.min(item.x + item.width, box.x + box.width);
      if (clippedRight > clippedLeft) {
        rects.push({ x: clippedLeft, y: item.y, width: clippedRight - clippedLeft, height: item.height });
      }
    }
  }

  return rects;
}

function squareBoxFromPoints(start: Point, end: Point, canvasWidth: number, canvasHeight: number) {
  const deltaXPx = (end.x - start.x) * canvasWidth;
  const deltaYPx = (end.y - start.y) * canvasHeight;
  const directionX = deltaXPx < 0 ? -1 : 1;
  const directionY = deltaYPx < 0 ? -1 : 1;
  const maxSideXPx = (directionX > 0 ? 1 - start.x : start.x) * canvasWidth;
  const maxSideYPx = (directionY > 0 ? 1 - start.y : start.y) * canvasHeight;
  const minSidePx = MIN_BOX_SIZE * Math.max(canvasWidth, canvasHeight);
  const sidePx = clamp(
    Math.max(Math.abs(deltaXPx), Math.abs(deltaYPx), minSidePx),
    minSidePx,
    Math.max(minSidePx, Math.min(maxSideXPx, maxSideYPx)),
  );
  const width = sidePx / canvasWidth;
  const height = sidePx / canvasHeight;
  const x = clamp(directionX > 0 ? start.x : start.x - width, 0, 1 - width);
  const y = clamp(directionY > 0 ? start.y : start.y - height, 0, 1 - height);

  return { x, y, width, height };
}

function normalizeFixedAspectBox(
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

function resizeFixedAspectShapeOverlay(
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

function getDrawBounds(points: Point[]) {
  if (points.length === 0) return { x: 0, y: 0, width: 0.01, height: 0.01 };
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const pad = 0.01;
  return {
    x: Math.max(0, minX - pad),
    y: Math.max(0, minY - pad),
    width: Math.max(0.01, maxX - minX + pad * 2),
    height: Math.max(0.01, maxY - minY + pad * 2),
  };
}

function buildLocalDrawPath(points: Point[], boundX: number, boundY: number, boundW: number, boundH: number, svgW: number, svgH: number): string {
  if (points.length === 0) return "";
  return points
    .map((p, i) => {
      const lx = boundW > 0 ? ((p.x - boundX) / boundW) * svgW : 0;
      const ly = boundH > 0 ? ((p.y - boundY) / boundH) * svgH : 0;
      return `${i === 0 ? "M" : "L"} ${Math.round(lx)} ${Math.round(ly)}`;
    })
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

    if (item.type === "textAnnotation") {
      return { ...item, rects: item.rects.map((rect) => ({ ...rect })) };
    }

    if (item.type === "text") {
      return {
        ...item,
        calloutTarget: item.calloutTarget ? { ...item.calloutTarget } : null,
        calloutBend: item.calloutBend ? { ...item.calloutBend } : null,
      };
    }

    return { ...item };
  });
}

function overlaysEqual(left: OverlayItem[], right: OverlayItem[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

/* ── signature font helpers ── */

const SIG_FONTS = [
  { label: "Dancing Script", family: "'Dancing Script', cursive" },
  { label: "Great Vibes", family: "'Great Vibes', cursive" },
  { label: "Pacifico", family: "'Pacifico', cursive" },
  { label: "Caveat", family: "'Caveat', cursive" },
];

const SIG_COLORS_EDIT: { value: string; label: string; gradient?: [string, string] }[] = [
  { value: "#000000", label: "Black" },
  { value: "#1565c0", label: "Blue" },
  { value: "#d32f2f", label: "Red" },
  { value: "#6a1b9a", label: "Purple" },
  { value: "#2e7d32", label: "Green" },
  { value: "#e65100", label: "Orange" },
  { value: "#4a148c", label: "Dark Purple" },
  { value: "#01579b", label: "Teal" },
  { value: "gradient-rose", label: "Rose Gradient", gradient: ["#ff4d6d", "#c9184a"] },
  { value: "gradient-ocean", label: "Ocean Gradient", gradient: ["#1565c0", "#00838f"] },
  { value: "gradient-sunset", label: "Sunset Gradient", gradient: ["#ff6f00", "#d32f2f"] },
  { value: "gradient-violet", label: "Violet Gradient", gradient: ["#7b1fa2", "#1565c0"] },
  { value: "gradient-emerald", label: "Emerald Gradient", gradient: ["#00c853", "#1565c0"] },
  { value: "gradient-gold", label: "Gold Gradient", gradient: ["#ff8f00", "#f4511e"] },
];

let sigFontsLoaded = false;

function ensureSigFonts(): Promise<void> {
  if (sigFontsLoaded) return Promise.resolve();
  return new Promise<void>((resolve) => {
    if (document.getElementById("__edit-sig-fonts")) {
      sigFontsLoaded = true;
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.id = "__edit-sig-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Caveat&family=Dancing+Script&family=Great+Vibes&family=Pacifico&display=swap";
    link.onload = () => { sigFontsLoaded = true; document.fonts.ready.then(() => resolve()); };
    link.onerror = () => { sigFontsLoaded = true; resolve(); };
    document.head.appendChild(link);
  });
}

const SIG_BG_OPTIONS = [
  { value: "transparent", label: "Transparent", css: "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 12px 12px" },
  { value: "#ffffff", label: "White", css: "#ffffff" },
  { value: "#f5f5f5", label: "Light Gray", css: "#f5f5f5" },
  { value: "#fffde7", label: "Cream", css: "#fffde7" },
  { value: "#e3f2fd", label: "Light Blue", css: "#e3f2fd" },
  { value: "#fce4ec", label: "Light Pink", css: "#fce4ec" },
  { value: "#e8f5e9", label: "Light Green", css: "#e8f5e9" },
  { value: "#f3e5f5", label: "Light Purple", css: "#f3e5f5" },
];

function sigColorEntry(colorValue: string): { value: string; label: string; gradient?: [string, string] } | undefined {
  return SIG_COLORS_EDIT.find((c) => c.value === colorValue);
}

function renderSigTextToDataUrl(text: string, fontFamily: string, color: string, fontSize = 48, bgColor = "transparent"): string {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  ctx.font = `${fontSize}px ${fontFamily}`;
  const m = ctx.measureText(text);
  const w = Math.ceil(m.width) + 24;
  const h = fontSize + 24;
  c.width = w;
  c.height = h;
  if (bgColor !== "transparent") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.font = `${fontSize}px ${fontFamily}`;
  const entry = sigColorEntry(color);
  if (entry?.gradient) {
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, entry.gradient[0]);
    grad.addColorStop(1, entry.gradient[1]);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = color;
  }
  ctx.textBaseline = "middle";
  ctx.fillText(text, 12, h / 2);
  return c.toDataURL("image/png");
}

function sigDataUrlToAsset(dataUrl: string, name: string): Promise<StampAsset> {
  return loadImageElement(dataUrl).then((img) => ({
    dataUrl,
    mimeType: "image/png" as const,
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    name,
  }));
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

async function buildStampAssetFromDraft(draft: StampDraft): Promise<StampAsset> {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Stamp canvas is unavailable.");
  }

  const text = draft.text.trim() || "Stamp";
  const timestamp = draft.includeTimestamp ? (draft.timestampText.trim() || formatStampTimestamp()) : "";
  const mainFontSize = text.length > 14 ? 66 : 78;
  const subFontSize = 28;
  const fontStyle = draft.italic ? "italic " : "";
  const fontWeight = draft.bold ? "700 " : "600 ";
  const mainFont = `${fontStyle}${fontWeight}${mainFontSize}px ${getCssFontFamily(draft.fontFamily)}`;
  const subFont = `${fontStyle}500 ${subFontSize}px ${getCssFontFamily(draft.fontFamily)}`;

  context.font = mainFont;
  const textWidth = context.measureText(text).width;
  context.font = subFont;
  const timestampWidth = timestamp ? context.measureText(timestamp).width : 0;

  const horizontalPadding = 72;
  const verticalPadding = timestamp ? 54 : 42;
  const width = Math.max(420, Math.min(Math.ceil(Math.max(textWidth, timestampWidth) + horizontalPadding * 2), 1180));
  const height = timestamp ? 228 : 166;

  canvas.width = width;
  canvas.height = height;

  context.clearRect(0, 0, width, height);
  drawRoundedRectPath(context, 8, 8, width - 16, height - 16, 28);
  context.fillStyle = draft.backgroundColor;
  context.fill();
  context.lineWidth = 6;
  context.strokeStyle = draft.textColor;
  context.stroke();

  context.fillStyle = draft.textColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = mainFont;
  const mainY = timestamp ? height * 0.42 : height / 2;
  context.fillText(text, width / 2, mainY);

  if (draft.underline) {
    const measuredWidth = context.measureText(text).width;
    context.lineWidth = Math.max(mainFontSize * 0.06, 3);
    context.beginPath();
    context.moveTo((width - measuredWidth) / 2, mainY + mainFontSize * 0.42);
    context.lineTo((width + measuredWidth) / 2, mainY + mainFontSize * 0.42);
    context.strokeStyle = draft.textColor;
    context.stroke();
  }

  if (timestamp) {
    context.font = subFont;
    context.fillStyle = draft.textColor;
    context.globalAlpha = 0.92;
    context.fillText(timestamp, width / 2, height * 0.73);
    context.globalAlpha = 1;
  }

  const dataUrl = canvas.toDataURL("image/png");
  return {
    dataUrl,
    mimeType: "image/png",
    width,
    height,
    name: createStampFileName(text),
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

type NormTextItem = {
  str: string; x: number; y: number; width: number; height: number;
  fontSize: number; fontFamily: string; fontName: string;
  bold: boolean; italic: boolean; color: string;
};

async function extractPageTextItems(bytes: ArrayBuffer, pageNumber: number): Promise<NormTextItem[]> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  const styles = (content as { styles?: PdfJsTextStyles }).styles ?? {};
  const pageW = viewport.width;
  const pageH = viewport.height;
  const results: NormTextItem[] = [];

  for (const item of content.items) {
    if (!item.str.trim()) continue;
    const [scaleX, , , scaleY, tx, ty] = item.transform;
    const fontSize = Math.abs(scaleY) || Math.abs(scaleX) || 12;
    const x = tx / pageW;
    const emH = fontSize / pageH;
    const actualH = item.height > 0 ? item.height / pageH : emH * 0.65;
    const fontTop = 1 - ty / pageH - emH;
    const y = fontTop + (emH - actualH) / 2;
    const h = actualH;
    const w = item.width / pageW;
    /* font detection */
    const rawFontName = item.fontName ?? "";
    const styleEntry = styles[rawFontName];
    const cssFamily = styleEntry?.fontFamily ?? "sans-serif";
    const nameLower = rawFontName.toLowerCase();
    const isBold = /bold|black|heavy/i.test(nameLower);
    const isItalic = /italic|oblique/i.test(nameLower);
    if (w > 0 && h > 0) {
      results.push({
        str: item.str, x, y, width: w, height: h,
        fontSize: Math.round(fontSize * 10) / 10, fontFamily: cssFamily, fontName: rawFontName,
        bold: isBold, italic: isItalic, color: "#000000",
      });
    }
  }

  return results;
}

/* Group adjacent text items on the same line into blocks for editing */
type TextBlock = {
  id: string;
  items: NormTextItem[];
  x: number; y: number; width: number; height: number;
  text: string;
  fontSize: number; fontFamily: string; fontName: string;
  bold: boolean; italic: boolean; color: string;
};

function groupTextBlocks(items: NormTextItem[]): TextBlock[] {
  if (!items.length) return [];
  /* Sort by y (top) then x (left) */
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const blocks: TextBlock[] = [];
  let current: NormTextItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = current[current.length - 1];
    const item = sorted[i];
    /* Same line: y overlap > 50% of height, and horizontally close */
    const yOverlap = Math.min(prev.y + prev.height, item.y + item.height) - Math.max(prev.y, item.y);
    const sameLine = yOverlap > Math.min(prev.height, item.height) * 0.5;
    const hGap = item.x - (prev.x + prev.width);
    const sameFont = item.fontName === prev.fontName && Math.abs(item.fontSize - prev.fontSize) < 1;
    if (sameLine && hGap < prev.height * 1.5 && sameFont) {
      current.push(item);
    } else {
      blocks.push(buildBlock(current, blocks.length));
      current = [item];
    }
  }
  if (current.length) blocks.push(buildBlock(current, blocks.length));
  return blocks;
}

function buildBlock(items: NormTextItem[], idx: number): TextBlock {
  const x = Math.min(...items.map((i) => i.x));
  const y = Math.min(...items.map((i) => i.y));
  const right = Math.max(...items.map((i) => i.x + i.width));
  const bottom = Math.max(...items.map((i) => i.y + i.height));
  const first = items[0];
  return {
    id: `tb-${idx}`,
    items,
    x, y, width: right - x, height: bottom - y,
    text: items.map((i) => i.str).join(" "),
    fontSize: first.fontSize,
    fontFamily: first.fontFamily,
    fontName: first.fontName,
    bold: first.bold,
    italic: first.italic,
    color: first.color,
  };
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
  await page.render({ canvasContext: context, viewport, canvas } as never).promise;
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
      return item.variant === "callout" ? "Callout" : "Text";
    case "draw":
      return item.drawStyle === "highlighter" ? "Freehand Highlighter" : "Freehand";
    case "highlight":
      return getShapeLabel(item.shapeKind);
    case "image":
      return "Image";
    case "textAnnotation":
      return item.annotationType === "highlight"
        ? "Highlight"
        : item.annotationType === "underline"
          ? "Underline"
          : item.annotationType === "squiggly"
            ? "Squiggly"
            : "Strikeout";
    default:
      return "Layer";
  }
}

function getLayerSwatchColor(layer: OverlayItem): string {
  if (layer.type === "image") {
    return "#d9dae6";
  }

  if (layer.type === "highlight") {
    return layer.strokeColor;
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
  const [editorMode, setEditorMode] = useState<EditorMode>("annotate");
  const [editTab, setEditTab] = useState<EditTab>("annotate");
  const [activeEditTool, setActiveEditTool] = useState<string | null>(null);
  const [editToolColor, setEditToolColor] = useState("#ef4444");
  const [editToolOpacity, setEditToolOpacity] = useState(1);
  const [editToolStroke, setEditToolStroke] = useState(2);
  const [editToolFill, setEditToolFill] = useState("#ef4444");
  const [editToolFillEnabled, setEditToolFillEnabled] = useState(false);
  const [editToolLineStyle, setEditToolLineStyle] = useState<LineStyle>("solid");
  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [activeTextVariant, setActiveTextVariant] = useState<TextToolVariant>("text");
  const [textAnnotationType, setTextAnnotationType] = useState<TextAnnotationType>("highlight");
  const [drawStyle, setDrawStyle] = useState<DrawStyle>("freehand");
  const [pageTextItems, setPageTextItems] = useState<NormTextItem[]>([]);
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [toolColor, setToolColor] = useState("#ff4d6d");
  const [brushSize, setBrushSize] = useState(0.0065);
  const [textSize, setTextSize] = useState(0.04);
  const [highlightOpacity, setHighlightOpacity] = useState(1.0);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [shapeKind, setShapeKind] = useState<ShapeKind>("rect");
  const [shapePaintMode, setShapePaintMode] = useState<ShapePaintMode>("both");
  const [zoom, setZoom] = useState(1);
  const [undoStack, setUndoStack] = useState<OverlayItem[][]>([]);
  const [redoStack, setRedoStack] = useState<OverlayItem[][]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stampAsset, setStampAsset] = useState<StampAsset | null>(null);
  const [savedStamps, setSavedStamps] = useState<StampAsset[]>([]);
  const [showStampDialog, setShowStampDialog] = useState(false);
  const [stampDraft, setStampDraft] = useState<StampDraft>({
    ...DEFAULT_STAMP_DRAFT,
    timestampText: formatStampTimestamp(),
  });
  /* ── signature dialog state ── */
  const [showSigDialog, setShowSigDialog] = useState(false);
  const [sigTab, setSigTab] = useState<"draw" | "type" | "upload">("draw");
  const [sigColor, setSigColor] = useState("#000000");
  const [sigBgColor, setSigBgColor] = useState("transparent");
  const [sigText, setSigText] = useState("");
  const [sigFontIdx, setSigFontIdx] = useState(0);
  const [sigFontPreviews, setSigFontPreviews] = useState<string[]>([]);
  const [sigUploadUrl, setSigUploadUrl] = useState("");
  const sigDrawCanvasRef = useRef<HTMLCanvasElement>(null);
  const sigDrawingRef = useRef(false);
  const sigLastPtRef = useRef<{ x: number; y: number } | null>(null);
  const sigUploadRef = useRef<HTMLInputElement>(null);
  /* ── Edit Text state ── */
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [textBlockEdits, setTextBlockEdits] = useState<Record<string, Partial<TextBlock>>>({});
  const [textBlocksLoading, setTextBlocksLoading] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [findResults, setFindResults] = useState<TextBlock[]>([]);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  /* ── Forms state ── */
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedFormFieldId, setSelectedFormFieldId] = useState<string | null>(null);
  const [formDragging, setFormDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [formResizing, setFormResizing] = useState<{ id: string; startW: number; startH: number; startX: number; startY: number } | null>(null);
  const formIdCounter = useRef(0);
  const [draftInteraction, setDraftInteraction] = useState<InteractionDraft>(null);
  const [imageEditMode, setImageEditMode] = useState<ImageEditMode>("move");
  const [pendingLine, setPendingLine] = useState<PendingLine | null>(null);
  const [lineSnapTarget, setLineSnapTarget] = useState<LineSnapTarget | null>(null);
  const [calloutPlacement, setCalloutPlacement] = useState<CalloutPlacementDraft | null>(null);
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
  const autoPageSyncOverlayIdRef = useRef<string | null>(null);
  const isEraserActive = editorMode === "edit" && activeEditTool === "eraser";
  const stampPreviewTimestamp = stampDraft.includeTimestamp ? (stampDraft.timestampText || formatStampTimestamp()) : "";

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
    setImageEditMode(selectedOverlay?.type === "image" ? "resize" : "move");
  }, [selectedOverlay?.type, selectedOverlayId]);

  useEffect(() => {
    if (editingTextId && editingTextId !== selectedOverlayId) {
      setEditingTextId(null);
    }
  }, [editingTextId, selectedOverlayId]);

  useEffect(() => {
    if (toolMode !== "highlight" || !shapeIsConnector(shapeKind)) {
      setPendingLine(null);
      setLineSnapTarget(null);
    }
  }, [shapeKind, toolMode]);

  useEffect(() => {
    if (toolMode !== "text" || activeTextVariant !== "callout") {
      setCalloutPlacement(null);
    }
  }, [activeTextVariant, toolMode]);

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
    setActiveTextVariant("text");
    setZoom(1);
    setErrorMessage(null);
    setDraftInteraction(null);
    setCalloutPlacement(null);
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
    setCalloutPlacement(null);
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
      setSavedStamps((prev) => {
        if (prev.some((s) => s.dataUrl === asset.dataUrl)) return prev;
        return [...prev, asset];
      });
      setToolMode("image");
      setActiveEditTool((current) => current === "insert-stamp" || current === "stamp" ? current : "insert-image");
      setShowStampDialog(false);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Image upload failed.");
    }
  }, []);

  const openStampDesigner = useCallback((preset?: StampPreset) => {
    const timestampText = formatStampTimestamp();
    setStampDraft(preset
      ? { ...DEFAULT_STAMP_DRAFT, ...preset.config, timestampText: preset.config.includeTimestamp ? timestampText : "" }
      : { ...DEFAULT_STAMP_DRAFT, timestampText });
    setShowStampDialog(true);
  }, []);

  const activateStampPlacement = useCallback((asset: StampAsset) => {
    setStampAsset(asset);
    setSavedStamps((prev) => {
      /* avoid duplicates by dataUrl */
      if (prev.some((s) => s.dataUrl === asset.dataUrl)) return prev;
      return [...prev, asset];
    });
    setEditorMode("edit");
    setEditTab("insert");
    setActiveEditTool("insert-stamp");
    setToolMode("image");
    setErrorMessage(null);
  }, []);

  const applyStampPreset = useCallback(async (preset: StampPreset) => {
    try {
      const asset = await buildStampAssetFromDraft({
        ...DEFAULT_STAMP_DRAFT,
        ...preset.config,
        timestampText: preset.config.includeTimestamp ? formatStampTimestamp() : "",
      });
      activateStampPlacement(asset);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Stamp creation failed.");
    }
  }, [activateStampPlacement]);

  const createCustomStamp = useCallback(async () => {
    try {
      const asset = await buildStampAssetFromDraft({
        ...stampDraft,
        timestampText: stampDraft.includeTimestamp ? (stampDraft.timestampText || formatStampTimestamp()) : "",
      });
      activateStampPlacement(asset);
      setShowStampDialog(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Stamp creation failed.");
    }
  }, [activateStampPlacement, stampDraft]);

  /* ── signature dialog callbacks ── */
  const openSigDialog = useCallback(() => {
    setSigTab("draw");
    setSigText("");
    setSigUploadUrl("");
    setSigBgColor("transparent");
    setShowSigDialog(true);
    ensureSigFonts().then(() => {
      setSigFontPreviews(SIG_FONTS.map((f) => renderSigTextToDataUrl("Your Name", f.family, sigColor, 48, "transparent")));
    });
  }, [sigColor]);

  const regenerateSigPreviews = useCallback((text: string, color: string, bg = "transparent") => {
    const t = text.trim() || "Your Name";
    setSigFontPreviews(SIG_FONTS.map((f) => renderSigTextToDataUrl(t, f.family, color, 48, bg)));
  }, []);

  const clearSigCanvas = useCallback(() => {
    const c = sigDrawCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, c.width, c.height);
  }, []);

  const onSigDrawDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = sigDrawCanvasRef.current;
    if (!c) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    sigDrawingRef.current = true;
    const r = c.getBoundingClientRect();
    sigLastPtRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);

  const onSigDrawMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!sigDrawingRef.current) return;
    const c = sigDrawCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const r = c.getBoundingClientRect();
    const scaleX = c.width / r.width;
    const scaleY = c.height / r.height;
    const pt = { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
    const last = sigLastPtRef.current;
    if (last) {
      const entry = sigColorEntry(sigColor);
      if (entry?.gradient) {
        const grad = ctx.createLinearGradient(0, 0, c.width, 0);
        grad.addColorStop(0, entry.gradient[0]);
        grad.addColorStop(1, entry.gradient[1]);
        ctx.strokeStyle = grad;
      } else {
        ctx.strokeStyle = sigColor;
      }
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(last.x * scaleX, last.y * scaleY);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    sigLastPtRef.current = { x: pt.x / scaleX, y: pt.y / scaleY };
  }, [sigColor]);

  const onSigDrawUp = useCallback(() => {
    sigDrawingRef.current = false;
    sigLastPtRef.current = null;
  }, []);

  const onSigUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setSigUploadUrl(String(reader.result));
    reader.readAsDataURL(f);
    e.target.value = "";
  }, []);

  const applySigResult = useCallback(async () => {
    let dataUrl = "";
    if (sigTab === "draw" && sigDrawCanvasRef.current) {
      const srcCanvas = sigDrawCanvasRef.current;
      /* composite draw canvas with optional background */
      if (sigBgColor !== "transparent") {
        const tmp = document.createElement("canvas");
        tmp.width = srcCanvas.width;
        tmp.height = srcCanvas.height;
        const tctx = tmp.getContext("2d")!;
        tctx.fillStyle = sigBgColor;
        tctx.fillRect(0, 0, tmp.width, tmp.height);
        tctx.drawImage(srcCanvas, 0, 0);
        dataUrl = tmp.toDataURL("image/png");
      } else {
        dataUrl = srcCanvas.toDataURL("image/png");
      }
    } else if (sigTab === "type" && sigFontPreviews[sigFontIdx]) {
      dataUrl = sigFontPreviews[sigFontIdx];
    } else if (sigTab === "upload" && sigUploadUrl) {
      /* composite uploaded image with optional background */
      if (sigBgColor !== "transparent") {
        try {
          const img = await loadImageElement(sigUploadUrl);
          const tmp = document.createElement("canvas");
          tmp.width = img.naturalWidth || img.width;
          tmp.height = img.naturalHeight || img.height;
          const tctx = tmp.getContext("2d")!;
          tctx.fillStyle = sigBgColor;
          tctx.fillRect(0, 0, tmp.width, tmp.height);
          tctx.drawImage(img, 0, 0);
          dataUrl = tmp.toDataURL("image/png");
        } catch {
          dataUrl = sigUploadUrl;
        }
      } else {
        dataUrl = sigUploadUrl;
      }
    }
    if (!dataUrl) return;
    try {
      const asset = await sigDataUrlToAsset(dataUrl, "signature.png");
      /* Place signature directly — don't use activateStampPlacement which switches to stamp mode */
      setStampAsset(asset);
      setEditorMode("edit");
      setEditTab("insert");
      setActiveEditTool("insert-signature");
      setToolMode("image");
      setShowSigDialog(false);
      setErrorMessage(null);
    } catch {
      setErrorMessage("Failed to create signature.");
    }
  }, [sigTab, sigFontPreviews, sigFontIdx, sigUploadUrl, sigBgColor]);

  /* ── Edit Text callbacks ── */
  const getEditedBlock = useCallback((blockId: string): TextBlock | undefined => {
    const block = textBlocks.find((b) => b.id === blockId);
    if (!block) return undefined;
    const edits = textBlockEdits[blockId];
    return edits ? { ...block, ...edits } : block;
  }, [textBlocks, textBlockEdits]);

  const updateBlockProp = useCallback(<K extends keyof TextBlock>(blockId: string, key: K, value: TextBlock[K]) => {
    setTextBlockEdits((prev) => ({
      ...prev,
      [blockId]: { ...prev[blockId], [key]: value },
    }));
  }, []);

  const doFindText = useCallback(() => {
    if (!findText.trim()) { setFindResults([]); return; }
    const needle = findText.toLowerCase();
    const results = textBlocks.filter((b) => {
      const edited = textBlockEdits[b.id];
      const txt = (edited?.text ?? b.text).toLowerCase();
      return txt.includes(needle);
    });
    setFindResults(results);
  }, [findText, textBlocks, textBlockEdits]);

  const doReplaceAll = useCallback(() => {
    if (!findText.trim()) return;
    const needle = findText;
    const updates: Record<string, Partial<TextBlock>> = {};
    for (const block of textBlocks) {
      const edited = textBlockEdits[block.id];
      const original = edited?.text ?? block.text;
      if (original.includes(needle)) {
        updates[block.id] = { ...textBlockEdits[block.id], text: original.split(needle).join(replaceText) };
      }
    }
    if (Object.keys(updates).length) {
      setTextBlockEdits((prev) => ({ ...prev, ...updates }));
      doFindText();
    }
  }, [findText, replaceText, textBlocks, textBlockEdits, doFindText]);

  const deleteTextBlock = useCallback((blockId: string) => {
    setTextBlockEdits((prev) => ({ ...prev, [blockId]: { ...prev[blockId], text: "" } }));
    setSelectedBlockId(null);
  }, []);

  /* Auto-focus inline editor when a block is selected */
  useEffect(() => {
    if (selectedBlockId) {
      requestAnimationFrame(() => {
        editTextareaRef.current?.focus();
      });
    }
  }, [selectedBlockId]);

  /* ── Form field callbacks ── */
  const addFormField = useCallback((type: FormFieldType) => {
    const defaults = FORM_FIELD_DEFAULTS[type];
    const id = `ff-${++formIdCounter.current}-${Date.now()}`;
    const field: FormField = {
      id,
      type,
      pageNumber: currentPage,
      x: 0.35 + Math.random() * 0.1,
      y: 0.35 + Math.random() * 0.1,
      width: defaults.width,
      height: defaults.height,
      label: defaults.label,
      value: "",
      checked: false,
      group: type === "radio" ? "group-1" : "",
      required: false,
      options: (type === "dropdown" || type === "listbox") ? ["Option 1", "Option 2", "Option 3"] : [],
      readOnly: false,
      multiline: false,
      includeIndicator: true,
      multiSelect: false,
    };
    setFormFields((prev) => [...prev, field]);
    setSelectedFormFieldId(id);
  }, [currentPage]);

  const updateFormField = useCallback((id: string, patch: Partial<FormField>) => {
    setFormFields((prev) => prev.map((f) => f.id === id ? { ...f, ...patch } : f));
  }, []);

  const removeFormField = useCallback((id: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== id));
    setSelectedFormFieldId((prev) => prev === id ? null : prev);
  }, []);

  const currentFormFields = useMemo(
    () => formFields.filter((f) => f.pageNumber === currentPage),
    [currentPage, formFields],
  );

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

  /* Extract text item positions for the current page */
  useEffect(() => {
    if (!pdf) { setPageTextItems([]); return; }
    let cancelled = false;
    void (async () => {
      try {
        const items = await extractPageTextItems(pdf.bytes, currentPage);
        if (!cancelled) setPageTextItems(items);
      } catch {
        if (!cancelled) setPageTextItems([]);
      }
    })();
    return () => { cancelled = true; };
  }, [currentPage, pdf]);

  /* Group text items into editable blocks when Edit Text tab is active */
  useEffect(() => {
    if (editTab !== "editText" || !pdf) {
      setTextBlocks([]);
      setSelectedBlockId(null);
      return;
    }
    setTextBlocksLoading(true);
    let cancelled = false;
    void (async () => {
      try {
        const items = await extractPageTextItems(pdf.bytes, currentPage);
        if (cancelled) return;
        const blocks = groupTextBlocks(items);
        setTextBlocks(blocks);
        setTextBlockEdits({});
        setSelectedBlockId(null);
      } catch {
        if (!cancelled) setTextBlocks([]);
      } finally {
        if (!cancelled) setTextBlocksLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [editTab, currentPage, pdf]);

  useEffect(() => {
    if (!selectedOverlayId) return;
    const selected = overlays.find((item) => item.id === selectedOverlayId);
    if (!selected) {
      setSelectedOverlayId(null);
      autoPageSyncOverlayIdRef.current = null;
      return;
    }

    if (autoPageSyncOverlayIdRef.current !== selectedOverlayId && selected.pageNumber !== currentPage) {
      setCurrentPage(selected.pageNumber);
    }
    autoPageSyncOverlayIdRef.current = selectedOverlayId;
  }, [currentPage, overlays, selectedOverlayId]);

  useEffect(() => {
    if (!selectedOverlayId) {
      autoPageSyncOverlayIdRef.current = null;
    }
  }, [selectedOverlayId]);

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
    const width = 0.22;
    const height = 0.08;
    const x = clamp(point.x, 0.02, 0.96 - width);
    const y = clamp(point.y, 0.02, 0.96 - height);
    const overlay: TextOverlay = {
      id: createId(),
      type: "text",
      variant: "text",
      pageNumber: currentPage,
      x,
      y,
      width,
      height,
      text: "Add text",
      fontFamily: "Helvetica",
      color: toolColor,
      fontSize: textSize,
      bold: false,
      italic: false,
      underline: false,
      strikeout: false,
      textAlign: "start",
      verticalAlign: "top",
      strokeColor: toolColor,
      strokeWidth: 0,
      textOpacity: 1,
      backgroundFill: false,
      backgroundColor: "#ffffff",
      backgroundOpacity: 0.88,
      calloutTarget: null,
      calloutBend: null,
    };

    commitOverlayState([...overlaysRef.current, overlay], overlay.id, true);
    setEditingTextId(overlay.id);
    setToolMode("select");
    setActiveEditTool(null);
  }, [commitOverlayState, currentPage, textSize, toolColor]);

  const finalizeCalloutPlacement = useCallback((draft: CalloutPlacementDraft) => {
    const box = getCalloutBoxFromCenter(draft.boxCenter, draft.width, draft.height);
    const overlay: TextOverlay = {
      id: createId(),
      type: "text",
      variant: "callout",
      pageNumber: draft.pageNumber,
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      text: "Add text",
      fontFamily: "Helvetica",
      color: toolColor,
      fontSize: textSize,
      bold: false,
      italic: false,
      underline: false,
      strikeout: false,
      textAlign: "start",
      verticalAlign: "top",
      strokeColor: toolColor,
      strokeWidth: 1.5,
      textOpacity: 1,
      backgroundFill: false,
      backgroundColor: "#ffffff",
      backgroundOpacity: 0.88,
      calloutTarget: { ...draft.target },
      calloutBend: draft.bend ? { ...draft.bend } : { ...draft.target },
    };

    commitOverlayState([...overlaysRef.current, overlay], overlay.id, true);
    setEditingTextId(overlay.id);
    setToolMode("select");
    setActiveEditTool(null);
    setActiveTextVariant("text");
  }, [commitOverlayState, textSize, toolColor]);

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
    /* deactivate stamp placement after placing one — user must re-select to place another */
    setStampAsset(null);
    setToolMode("select");
  }, [commitOverlayState, currentBox, currentPage, stampAsset]);

  const duplicateOverlay = useCallback((overlayId: string) => {
    const source = overlaysRef.current.find((item) => item.id === overlayId);
    if (!source || source.type === "draw" || source.type === "textAnnotation") return;
    const clone = {
      ...source,
      id: createId(),
      x: Math.min(source.x + 0.03, 0.95),
      y: Math.min(source.y + 0.03, 0.95),
    };
    commitOverlayState([...overlaysRef.current, clone], clone.id, true);
  }, [commitOverlayState]);

  const beginOverlayMove = useCallback((event: ReactPointerEvent<HTMLElement>, overlayId: string) => {
    const overlay = overlays.find((item) => item.id === overlayId);
    if (!overlay || overlay.pageNumber !== currentPage) return;

    event.stopPropagation();
    (editorCanvasRef.current ?? event.currentTarget).setPointerCapture(event.pointerId);
    interactionStartOverlaysRef.current = cloneOverlays(overlaysRef.current);
    const point = getCanvasPoint(event);
    setSelectedOverlayId(overlay.id);

    if (overlay.type === "draw") {
      const bounds = getDrawBounds(overlay.points);
      setDraftInteraction({
        type: "move",
        overlayId,
        pageNumber: currentPage,
        start: point,
        originX: bounds.x,
        originY: bounds.y,
        startPoints: overlay.points.map((p) => ({ x: p.x, y: p.y })),
      });
      return;
    }

    if (overlay.type === "textAnnotation") {
      /* Text annotations are not movable – only selectable for deletion */
      return;
    }

    setDraftInteraction({
      type: "move",
      overlayId,
      pageNumber: currentPage,
      start: point,
      originX: overlay.x,
      originY: overlay.y,
    });
  }, [currentPage, getCanvasPoint, overlays]);

  const beginImageResize = useCallback((event: ReactPointerEvent<HTMLElement>, overlayId: string, handle: CornerHandle) => {
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
    const overlay = overlays.find((item) => item.id === overlayId);
    if (!overlay || overlay.type !== "highlight" || overlay.pageNumber !== currentPage || shapeIsConnector(overlay.shapeKind)) return;

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
  }, [currentPage, getCanvasPoint, overlays]);

  const beginTextResize = useCallback((event: ReactPointerEvent<HTMLElement>, overlayId: string, handle: CornerHandle) => {
    const overlay = overlays.find((item) => item.id === overlayId);
    if (!overlay || overlay.type !== "text" || overlay.pageNumber !== currentPage) return;

    event.stopPropagation();
    (editorCanvasRef.current ?? event.currentTarget).setPointerCapture(event.pointerId);
    interactionStartOverlaysRef.current = cloneOverlays(overlaysRef.current);
    const point = getCanvasPoint(event);
    setSelectedOverlayId(overlay.id);
    setDraftInteraction({
      type: "resize-text",
      overlayId,
      pageNumber: currentPage,
      handle,
      start: point,
      startX: overlay.x,
      startY: overlay.y,
      startWidth: overlay.width,
      startHeight: overlay.height,
    });
  }, [currentPage, getCanvasPoint, overlays]);

  const beginCalloutPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>, overlayId: string) => {
    const overlay = overlays.find((item) => item.id === overlayId);
    if (!overlay || overlay.type !== "text" || overlay.pageNumber !== currentPage || overlay.variant !== "callout" || !overlay.calloutTarget) {
      return;
    }

    event.stopPropagation();
    (editorCanvasRef.current ?? event.currentTarget).setPointerCapture(event.pointerId);
    interactionStartOverlaysRef.current = cloneOverlays(overlaysRef.current);
    const point = getCanvasPoint(event);
    setSelectedOverlayId(overlay.id);
    setDraftInteraction({
      type: "move-callout-pointer",
      overlayId,
      pageNumber: currentPage,
      start: point,
      startTarget: { ...overlay.calloutTarget },
    });
  }, [currentPage, getCanvasPoint, overlays]);

  const beginCalloutBendMove = useCallback((event: ReactPointerEvent<HTMLElement>, overlayId: string) => {
    const overlay = overlays.find((item) => item.id === overlayId);
    if (!overlay || overlay.type !== "text" || overlay.pageNumber !== currentPage || overlay.variant !== "callout" || !overlay.calloutBend) {
      return;
    }

    event.stopPropagation();
    (editorCanvasRef.current ?? event.currentTarget).setPointerCapture(event.pointerId);
    interactionStartOverlaysRef.current = cloneOverlays(overlaysRef.current);
    const point = getCanvasPoint(event);
    setSelectedOverlayId(overlay.id);
    setDraftInteraction({
      type: "move-callout-bend",
      overlayId,
      pageNumber: currentPage,
      start: point,
      startBend: { ...overlay.calloutBend },
    });
  }, [currentPage, getCanvasPoint, overlays]);

  const beginDrawResize = useCallback((event: ReactPointerEvent<HTMLElement>, overlayId: string, handle: CornerHandle) => {
    const overlay = overlays.find((item) => item.id === overlayId);
    if (!overlay || overlay.type !== "draw" || overlay.pageNumber !== currentPage) return;

    event.stopPropagation();
    (editorCanvasRef.current ?? event.currentTarget).setPointerCapture(event.pointerId);
    interactionStartOverlaysRef.current = cloneOverlays(overlaysRef.current);
    const point = getCanvasPoint(event);
    const bounds = getDrawBounds(overlay.points);
    setSelectedOverlayId(overlay.id);
    setDraftInteraction({
      type: "resize-draw",
      overlayId,
      pageNumber: currentPage,
      handle,
      start: point,
      startPoints: overlay.points.map((p) => ({ x: p.x, y: p.y })),
      startBoundX: bounds.x,
      startBoundY: bounds.y,
      startBoundW: bounds.width,
      startBoundH: bounds.height,
    });
  }, [currentPage, getCanvasPoint, overlays]);

  const beginLineResize = useCallback((
    event: ReactPointerEvent<HTMLElement>,
    overlayId: string,
    endpoint: "start" | "end",
  ) => {
    const overlay = overlays.find((item) => item.id === overlayId);
    if (!overlay || overlay.type !== "highlight" || overlay.pageNumber !== currentPage || !shapeIsConnector(overlay.shapeKind)) return;

    event.stopPropagation();
    (editorCanvasRef.current ?? event.currentTarget).setPointerCapture(event.pointerId);
    interactionStartOverlaysRef.current = cloneOverlays(overlaysRef.current);
    const point = getCanvasPoint(event);
    const { start, end } = getLineEndpoints(overlay);
    setSelectedOverlayId(overlay.id);
    setLineSnapTarget(null);
    setDraftInteraction({
      type: "resize-line",
      overlayId,
      pageNumber: currentPage,
      endpoint,
      start: point,
      startLineStart: start,
      startLineEnd: end,
    });
  }, [currentPage, getCanvasPoint, overlays]);

  const goToPage = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
    setSelectedOverlayId(null);
    setEditingTextId(null);
    setPendingLine(null);
    setLineSnapTarget(null);
    setCalloutPlacement(null);
    setDraftInteraction(null);
  }, []);

  const beginImageCrop = useCallback((event: ReactPointerEvent<HTMLElement>, overlayId: string, handle: CropEdgeHandle) => {
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
  }, [currentPage, getCanvasPoint, overlays]);

  const beginImageReadjust = useCallback((event: ReactPointerEvent<HTMLDivElement>, overlayId: string) => {
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
  }, [currentPage, getCanvasPoint, overlays]);

  const onCanvasPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pdf) return;

    event.preventDefault();
    const point = getCanvasPoint(event);

    /* Deselect text block when clicking on canvas background in edit text mode */
    if (editTab === "editText") {
      setSelectedBlockId(null);
    }

    /* Place form field on click when a form tool is active */
    if (editTab === "forms" && activeEditTool && (activeEditTool === "signature-field" || activeEditTool === "text-field" || activeEditTool === "checkbox" || activeEditTool === "radio" || activeEditTool === "dropdown" || activeEditTool === "listbox")) {
      const type = activeEditTool as FormFieldType;
      const defaults = FORM_FIELD_DEFAULTS[type];
      const id = `ff-${++formIdCounter.current}-${Date.now()}`;
      const field: FormField = {
        id,
        type,
        pageNumber: currentPage,
        x: point.x - defaults.width / 2,
        y: point.y - defaults.height / 2,
        width: defaults.width,
        height: defaults.height,
        label: defaults.label,
        value: "",
        checked: false,
        group: type === "radio" ? "group-1" : "",
        required: false,
        options: (type === "dropdown" || type === "listbox") ? ["Option 1", "Option 2", "Option 3"] : [],
        readOnly: false,
        multiline: false,
        includeIndicator: true,
        multiSelect: false,
      };
      setFormFields((prev) => [...prev, field]);
      setSelectedFormFieldId(id);
      setActiveEditTool(null);
      return;
    }

    /* Deselect form field when clicking canvas background */
    if (editTab === "forms") {
      setSelectedFormFieldId(null);
    }

    if (toolMode === "text") {
      if (activeTextVariant === "callout") {
        setSelectedOverlayId(null);
        setEditingTextId(null);

        if (!calloutPlacement || calloutPlacement.pageNumber !== currentPage) {
          setCalloutPlacement({
            pageNumber: currentPage,
            target: point,
            bend: null,
            boxCenter: point,
            width: 0.26,
            height: 0.1,
            stage: "leader",
          });
          return;
        }

        if (calloutPlacement.stage === "leader") {
          setCalloutPlacement({
            ...calloutPlacement,
            bend: point,
            boxCenter: point,
            stage: "bend",
          });
          return;
        }

        if (calloutPlacement.stage === "bend") {
          setCalloutPlacement({
            ...calloutPlacement,
            boxCenter: point,
            stage: "box",
          });
          return;
        }

        finalizeCalloutPlacement({
          ...calloutPlacement,
          boxCenter: point,
        });
        setCalloutPlacement(null);
        return;
      }

      addTextOverlay(point);
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    if (isEraserActive) {
      setSelectedOverlayId(null);
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
        opacity: highlightOpacity,
        drawStyle,
      });
      return;
    }

    if (toolMode === "highlight") {
      if (shapeIsConnector(shapeKind)) {
        setSelectedOverlayId(null);
        const startPoint = getConnectorSnapTarget(point, overlaysRef.current, currentPage, editorWidth, editorHeight)?.point ?? point;
        if (pendingLine && pendingLine.pageNumber === currentPage) {
          const endPoint = lineSnapTarget?.point ?? point;
          const geometry = buildLineGeometry(pendingLine.start, endPoint);
          const overlay: HighlightOverlay = {
            id: createId(),
            type: "highlight",
            pageNumber: currentPage,
            x: geometry.x,
            y: geometry.y,
            width: geometry.width,
            height: geometry.height,
            shapeKind: pendingLine.shapeKind,
            paintMode: "stroke",
            strokeColor: toolColor,
            fillColor: editToolFill,
            opacity: highlightOpacity,
            strokeWidth: brushSize,
            lineStyle: editToolLineStyle,
            lineStart: geometry.lineStart,
            lineEnd: geometry.lineEnd,
          };
          commitOverlayState([...overlaysRef.current, overlay], overlay.id, true);
          setPendingLine(null);
          setLineSnapTarget(null);
          setToolMode("select");
        } else {
          setPendingLine({
            pageNumber: currentPage,
            shapeKind: shapeKind === "arrow" ? "arrow" : "line",
            start: startPoint,
            current: startPoint,
          });
          setLineSnapTarget(getConnectorSnapTarget(point, overlaysRef.current, currentPage, editorWidth, editorHeight));
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

    if (toolMode === "textAnnotate") {
      setSelectedOverlayId(null);
      setDraftInteraction({
        type: "textAnnotate",
        pageNumber: currentPage,
        start: point,
        current: point,
        annotationType: textAnnotationType,
        color: toolColor,
        opacity: highlightOpacity,
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
  }, [activeEditTool, activeTextVariant, addImageOverlay, addTextOverlay, brushSize, calloutPlacement, commitOverlayState, currentPage, drawStyle, editTab, editToolFill, editToolLineStyle, editorHeight, editorWidth, finalizeCalloutPlacement, getCanvasPoint, highlightOpacity, isEraserActive, lineSnapTarget, pdf, pendingLine, shapeKind, shapePaintMode, stampAsset, textAnnotationType, toolColor, toolMode, zoom]);

  const onCanvasPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const point = getCanvasPoint(event);

    if (calloutPlacement && calloutPlacement.pageNumber === currentPage) {
      if (calloutPlacement.stage === "leader") {
        setCalloutPlacement({ ...calloutPlacement, boxCenter: point });
      } else if (calloutPlacement.stage === "bend") {
        setCalloutPlacement({ ...calloutPlacement, boxCenter: point });
      } else if (calloutPlacement.stage === "box") {
        setCalloutPlacement({ ...calloutPlacement, boxCenter: point });
      }
    }

    if (pendingLine && pendingLine.pageNumber === currentPage) {
      const snapTarget = getConnectorSnapTarget(point, overlaysRef.current, currentPage, editorWidth, editorHeight);
      setLineSnapTarget(snapTarget);
      setPendingLine({ ...pendingLine, current: snapTarget?.point ?? point });
    }

    /* Form field drag / resize — must run before draftInteraction guard */
    if (formDragging) {
      const field = formFields.find((f) => f.id === formDragging.id);
      if (field) {
        const newX = clamp(point.x - formDragging.offsetX, 0, 1 - field.width);
        const newY = clamp(point.y - formDragging.offsetY, 0, 1 - field.height);
        setFormFields((prev) => prev.map((f) => f.id === formDragging.id ? { ...f, x: newX, y: newY } : f));
      }
      return;
    }
    if (formResizing) {
      const dx = point.x - formResizing.startX;
      const dy = point.y - formResizing.startY;
      const newW = Math.max(0.015, formResizing.startW + dx);
      const newH = Math.max(0.012, formResizing.startH + dy);
      setFormFields((prev) => prev.map((f) => f.id === formResizing.id ? { ...f, width: newW, height: newH } : f));
      return;
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

    if (draftInteraction.type === "textAnnotate") {
      setDraftInteraction({ ...draftInteraction, current: point });
      return;
    }

    if (draftInteraction.type === "move") {
      const deltaX = point.x - draftInteraction.start.x;
      const deltaY = point.y - draftInteraction.start.y;

      setOverlays((current) => current.map((item) => {
        if (item.id !== draftInteraction.overlayId) return item;

        if (item.type === "draw") {
          const sp = draftInteraction.startPoints;
          if (!sp) return item;
          return {
            ...item,
            points: sp.map((p) => ({
              x: p.x + deltaX,
              y: p.y + deltaY,
            })),
          };
        }

        if (item.type === "text") {
          const nextX = clamp(draftInteraction.originX + deltaX, 0, 1 - item.width);
          const nextY = clamp(draftInteraction.originY + deltaY, 0, 1 - item.height);
          return {
            ...item,
            x: nextX,
            y: nextY,
          };
        }

        if (item.type === "highlight" && shapeIsConnector(item.shapeKind)) {
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

        if (item.type === "textAnnotation") {
          /* Text annotations are not movable */
          return item;
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

        return shapeUsesFixedAspect(item.shapeKind)
          ? {
              ...item,
              ...resizeFixedAspectShapeOverlay(
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

    if (draftInteraction.type === "resize-text") {
      const deltaX = point.x - draftInteraction.start.x;
      const deltaY = point.y - draftInteraction.start.y;

      setOverlays((current) => current.map((item) => {
        if (item.id !== draftInteraction.overlayId || item.type !== "text") return item;
        return {
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

    if (draftInteraction.type === "move-callout-pointer") {
      const deltaX = point.x - draftInteraction.start.x;
      const deltaY = point.y - draftInteraction.start.y;

      setOverlays((current) => current.map((item) => {
        if (item.id !== draftInteraction.overlayId || item.type !== "text" || item.variant !== "callout") {
          return item;
        }

        return {
          ...item,
          calloutTarget: {
            x: clamp(draftInteraction.startTarget.x + deltaX, 0.02, 0.98),
            y: clamp(draftInteraction.startTarget.y + deltaY, 0.02, 0.98),
          },
        };
      }));
      return;
    }

    if (draftInteraction.type === "move-callout-bend") {
      const deltaX = point.x - draftInteraction.start.x;
      const deltaY = point.y - draftInteraction.start.y;

      setOverlays((current) => current.map((item) => {
        if (item.id !== draftInteraction.overlayId || item.type !== "text" || item.variant !== "callout") {
          return item;
        }

        return {
          ...item,
          calloutBend: {
            x: clamp(draftInteraction.startBend.x + deltaX, 0.02, 0.98),
            y: clamp(draftInteraction.startBend.y + deltaY, 0.02, 0.98),
          },
        };
      }));
      return;
    }

    if (draftInteraction.type === "resize-draw") {
      const deltaX = point.x - draftInteraction.start.x;
      const deltaY = point.y - draftInteraction.start.y;
      const newBox = resizeOverlayBox(
        draftInteraction.startBoundX,
        draftInteraction.startBoundY,
        draftInteraction.startBoundW,
        draftInteraction.startBoundH,
        draftInteraction.handle,
        deltaX,
        deltaY,
      );

      setOverlays((current) => current.map((item) => {
        if (item.id !== draftInteraction.overlayId || item.type !== "draw") return item;
        return {
          ...item,
          points: draftInteraction.startPoints.map((p) => ({
            x: newBox.x + ((p.x - draftInteraction.startBoundX) / draftInteraction.startBoundW) * newBox.width,
            y: newBox.y + ((p.y - draftInteraction.startBoundY) / draftInteraction.startBoundH) * newBox.height,
          })),
        };
      }));
      return;
    }

    if (draftInteraction.type === "resize-line") {
      const snapTarget = getConnectorSnapTarget(point, overlaysRef.current, currentPage, editorWidth, editorHeight, draftInteraction.overlayId);
      setLineSnapTarget(snapTarget);
      setOverlays((current) => current.map((item) => {
        if (item.id !== draftInteraction.overlayId || item.type !== "highlight" || !shapeIsConnector(item.shapeKind)) {
          return item;
        }

        const geometry = draftInteraction.endpoint === "start"
          ? buildLineGeometry(snapTarget?.point ?? point, draftInteraction.startLineEnd)
          : buildLineGeometry(draftInteraction.startLineStart, snapTarget?.point ?? point);

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

  }, [calloutPlacement, currentPage, draftInteraction, editorHeight, editorWidth, formDragging, formFields, formResizing, getCanvasPoint, pendingLine]);

  const onCanvasPointerUp = useCallback(() => {
    if (formDragging || formResizing) {
      setFormDragging(null);
      setFormResizing(null);
    }
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
          opacity: draftInteraction.opacity,
          drawStyle: draftInteraction.drawStyle,
        };
        commitOverlayState([...overlaysRef.current, overlay], null, true);
      }
    }

    if (draftInteraction.type === "highlight") {
      const box = shapeUsesFixedAspect(draftInteraction.shapeKind)
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
          strokeColor: draftInteraction.color,
          fillColor: editToolFill,
          opacity: draftInteraction.opacity,
          strokeWidth: draftInteraction.strokeWidth,
          lineStyle: editToolLineStyle,
        };
        commitOverlayState([...overlaysRef.current, overlay], overlay.id, true);
        setToolMode("select");
      }
    }

    if (draftInteraction.type === "textAnnotate") {
      const box = rawBoxFromPoints(draftInteraction.start, draftInteraction.current);
      const hitRects = getTextAnnotationRects(pageTextItems, box);
      if (hitRects.length > 0) {
        const overlay: TextAnnotationOverlay = {
          id: createId(),
          type: "textAnnotation",
          pageNumber: draftInteraction.pageNumber,
          rects: hitRects,
          annotationType: draftInteraction.annotationType,
          color: draftInteraction.color,
          opacity: draftInteraction.opacity,
        };
        /* Don't select annotation after creation – acts like a real pen/highlighter */
        commitOverlayState([...overlaysRef.current, overlay], null, true);
      }
    }

    if (draftInteraction.type === "move" || draftInteraction.type === "resize-image" || draftInteraction.type === "resize-shape" || draftInteraction.type === "resize-line" || draftInteraction.type === "resize-text" || draftInteraction.type === "resize-draw" || draftInteraction.type === "crop-image" || draftInteraction.type === "readjust-image" || draftInteraction.type === "move-callout-pointer" || draftInteraction.type === "move-callout-bend") {
      const starting = interactionStartOverlaysRef.current;
      const current = overlaysRef.current;
      if (starting && !overlaysEqual(starting, current)) {
        setUndoStack((stack) => [...stack.slice(-39), cloneOverlays(starting)]);
        setRedoStack([]);
      }
      interactionStartOverlaysRef.current = null;
    }

    setDraftInteraction(null);
    setLineSnapTarget(null);
  }, [commitOverlayState, draftInteraction, editToolFill, editToolLineStyle, editorHeight, editorWidth, formDragging, formResizing, pageTextItems]);

  const saveEditedPdf = useCallback(async () => {
    if (!pdf) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      const document = await PDFDocument.load(pdf.bytes.slice(0));
      const imageCache = new Map<string, PDFImage>();
      const fontCache = new Map<StandardFonts, PDFFont>();

      const getEmbeddedFont = async (fontFamily: TextFontFamily, bold: boolean, italic: boolean) => {
        const fontName = getStandardFontName(fontFamily, bold, italic);
        const cached = fontCache.get(fontName);
        if (cached) {
          return cached;
        }

        const embedded = await document.embedFont(fontName);
        fontCache.set(fontName, embedded);
        return embedded;
      };

      for (const [index, page] of document.getPages().entries()) {
        const pageNumber = index + 1;
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        const pageLayers = overlays.filter((item) => item.pageNumber === pageNumber);

        for (const layer of pageLayers) {
          if (layer.type === "text") {
            const fontSize = Math.max(pageHeight * layer.fontSize, 10);
            const font = await getEmbeddedFont(layer.fontFamily, layer.bold, layer.italic);
            const lineHeight = fontSize * 1.15;
            const boxX = pageWidth * layer.x;
            const boxY = pageHeight - pageHeight * (layer.y + layer.height);
            const boxWidth = pageWidth * layer.width;
            const boxHeight = pageHeight * layer.height;
            const padding = getTextPadding(fontSize);
            const contentWidth = Math.max(boxWidth - padding.x * 2, fontSize * 1.5);
            const lines = wrapTextToWidth(layer.text, font, fontSize, contentWidth);
            const textWidths = lines.map((line) => font.widthOfTextAtSize(line || " ", fontSize));
            const textHeight = font.heightAtSize(fontSize) + Math.max(0, lines.length - 1) * lineHeight;
            const contentLeft = boxX + padding.x;
            const contentRight = boxX + boxWidth - padding.x;
            const textTop = layer.verticalAlign === "middle"
              ? boxY + (boxHeight + textHeight) / 2
              : layer.verticalAlign === "bottom"
                ? boxY + textHeight + padding.y
                : boxY + boxHeight - padding.y;

            if (layer.variant === "callout") {
              const anchor = getCalloutAnchorPoint(layer);
              const target = layer.calloutTarget ?? {
                x: layer.x + layer.width,
                y: layer.y + layer.height,
              };
              const bend = layer.calloutBend ?? anchor;
              const startPoint = { x: pageWidth * anchor.x, y: pageHeight - pageHeight * anchor.y };
              const bendPoint = { x: pageWidth * bend.x, y: pageHeight - pageHeight * bend.y };
              const targetPoint = { x: pageWidth * target.x, y: pageHeight - pageHeight * target.y };
              const arrowHead = getArrowHeadPoints(bendPoint, targetPoint, 10, 4.5);
              page.drawLine({
                start: targetPoint,
                end: bendPoint,
                thickness: Math.max(layer.strokeWidth, 1),
                color: hexToRgb(layer.strokeColor),
                opacity: layer.textOpacity,
              });
              if (layer.calloutBend) {
                page.drawLine({
                  start: bendPoint,
                  end: startPoint,
                  thickness: Math.max(layer.strokeWidth, 1),
                  color: hexToRgb(layer.strokeColor),
                  opacity: layer.textOpacity,
                });
              }
              page.drawLine({
                start: targetPoint,
                end: arrowHead.left,
                thickness: Math.max(layer.strokeWidth, 1),
                color: hexToRgb(layer.strokeColor),
                opacity: layer.textOpacity,
              });
              page.drawLine({
                start: targetPoint,
                end: arrowHead.right,
                thickness: Math.max(layer.strokeWidth, 1),
                color: hexToRgb(layer.strokeColor),
                opacity: layer.textOpacity,
              });
              page.drawRectangle({
                x: boxX,
                y: boxY,
                width: boxWidth,
                height: boxHeight,
                color: layer.backgroundFill ? hexToRgb(layer.backgroundColor) : undefined,
                opacity: layer.backgroundFill ? layer.backgroundOpacity : undefined,
                borderColor: hexToRgb(layer.strokeColor),
                borderWidth: Math.max(layer.strokeWidth, 1),
                borderOpacity: layer.textOpacity,
              });
            } else if (layer.backgroundFill) {
              page.drawRectangle({
                x: Math.max(0, boxX),
                y: Math.max(0, boxY),
                width: Math.min(pageWidth - Math.max(0, boxX), boxWidth),
                height: Math.min(pageHeight, boxHeight),
                color: hexToRgb(layer.backgroundColor ?? "#ffffff"),
                opacity: layer.backgroundOpacity ?? 0.88,
              });
            }

            lines.forEach((line, index) => {
              const lineWidth = textWidths[index] ?? font.widthOfTextAtSize(line || " ", fontSize);
              const textX = layer.textAlign === "center"
                ? boxX + (boxWidth - lineWidth) / 2
                : layer.textAlign === "end"
                  ? contentRight - lineWidth
                  : contentLeft;
              const textY = textTop - font.heightAtSize(fontSize) - index * lineHeight;

              if (layer.strokeWidth > 0) {
                const outlineOffset = Math.max(layer.strokeWidth * 0.6, 0.75);
                const outlineOffsets = [
                  [-outlineOffset, 0],
                  [outlineOffset, 0],
                  [0, -outlineOffset],
                  [0, outlineOffset],
                  [-outlineOffset, -outlineOffset],
                  [-outlineOffset, outlineOffset],
                  [outlineOffset, -outlineOffset],
                  [outlineOffset, outlineOffset],
                ] as const;

                outlineOffsets.forEach(([offsetX, offsetY]) => {
                  page.drawText(line, {
                    x: textX + offsetX,
                    y: textY + offsetY,
                    size: fontSize,
                    font,
                    color: hexToRgb(layer.strokeColor),
                    opacity: layer.textOpacity,
                  });
                });
              }

              page.drawText(line, {
                x: textX,
                y: textY,
                size: fontSize,
                font,
                color: hexToRgb(layer.color),
                opacity: layer.textOpacity,
              });

              if (layer.underline) {
                page.drawLine({
                  start: { x: textX, y: textY - fontSize * 0.08 },
                  end: { x: textX + lineWidth, y: textY - fontSize * 0.08 },
                  thickness: Math.max(layer.strokeWidth * 0.45, 0.8),
                  color: hexToRgb(layer.color),
                  opacity: layer.textOpacity,
                });
              }

              if (layer.strikeout) {
                page.drawLine({
                  start: { x: textX, y: textY + fontSize * 0.32 },
                  end: { x: textX + lineWidth, y: textY + fontSize * 0.32 },
                  thickness: Math.max(layer.strokeWidth * 0.45, 0.8),
                  color: hexToRgb(layer.color),
                  opacity: layer.textOpacity,
                });
              }
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
                thickness: Math.max(layer.strokeWidth * pageWidth * (layer.drawStyle === "highlighter" ? 1.8 : 1), 1.5),
                color: hexToRgb(layer.color),
                opacity: layer.drawStyle === "highlighter" ? Math.min(layer.opacity * 0.32, 0.42) : layer.opacity,
              });
            }
            continue;
          }

          if (layer.type === "highlight") {
            if (shapeIsConnector(layer.shapeKind)) {
              const { start, end } = getLineEndpoints(layer);
              const strokeThickness = Math.max(layer.strokeWidth * pageWidth, 1.5);
              page.drawLine({
                start: { x: pageWidth * start.x, y: pageHeight - pageHeight * start.y },
                end: { x: pageWidth * end.x, y: pageHeight - pageHeight * end.y },
                thickness: strokeThickness,
                color: hexToRgb(layer.strokeColor),
                opacity: layer.opacity,
              });

              if (layer.shapeKind === "arrow") {
                const head = getArrowHeadPoints(start, end, Math.max(strokeThickness * 3.4 / Math.max(pageWidth, 1), 0.012), Math.max(strokeThickness * 1.4 / Math.max(pageWidth, 1), 0.005));
                page.drawLine({
                  start: { x: pageWidth * end.x, y: pageHeight - pageHeight * end.y },
                  end: { x: pageWidth * head.left.x, y: pageHeight - pageHeight * head.left.y },
                  thickness: strokeThickness,
                  color: hexToRgb(layer.strokeColor),
                  opacity: layer.opacity,
                });
                page.drawLine({
                  start: { x: pageWidth * end.x, y: pageHeight - pageHeight * end.y },
                  end: { x: pageWidth * head.right.x, y: pageHeight - pageHeight * head.right.y },
                  thickness: strokeThickness,
                  color: hexToRgb(layer.strokeColor),
                  opacity: layer.opacity,
                });
              }
              continue;
            }

            if (layer.shapeKind === "ellipse" || layer.shapeKind === "circle") {
              page.drawEllipse({
                x: pageWidth * (layer.x + layer.width / 2),
                y: pageHeight - pageHeight * (layer.y + layer.height / 2),
                xScale: (pageWidth * layer.width) / 2,
                yScale: (pageHeight * layer.height) / 2,
                color: layer.paintMode === "fill" || layer.paintMode === "both" ? hexToRgb(layer.fillColor) : undefined,
                opacity: layer.opacity,
                borderColor: layer.paintMode === "stroke" || layer.paintMode === "both" ? hexToRgb(layer.strokeColor) : undefined,
                borderWidth: layer.paintMode === "stroke" || layer.paintMode === "both" ? Math.max(layer.strokeWidth * pageWidth, 1) : undefined,
                borderOpacity: layer.opacity,
              });
              continue;
            }

            if (layer.shapeKind === "rect" || layer.shapeKind === "square") {
              page.drawRectangle({
                x: pageWidth * layer.x,
                y: pageHeight - pageHeight * (layer.y + layer.height),
                width: pageWidth * layer.width,
                height: pageHeight * layer.height,
                color: layer.paintMode === "fill" || layer.paintMode === "both" ? hexToRgb(layer.fillColor) : undefined,
                opacity: layer.opacity,
                borderColor: layer.paintMode === "stroke" || layer.paintMode === "both" ? hexToRgb(layer.strokeColor) : undefined,
                borderWidth: layer.paintMode === "stroke" || layer.paintMode === "both" ? Math.max(layer.strokeWidth * pageWidth, 1) : undefined,
                borderOpacity: layer.opacity,
              });
              continue;
            }

            const localWidth = pageWidth * layer.width;
            const localHeight = pageHeight * layer.height;
            const svgPath = buildShapePath(layer.shapeKind, localWidth, localHeight, true);
            if (svgPath) {
              page.drawSvgPath(svgPath, {
                x: pageWidth * layer.x,
                y: pageHeight - pageHeight * (layer.y + layer.height),
                color: shapeSupportsFill(layer.shapeKind) && (layer.paintMode === "fill" || layer.paintMode === "both") ? hexToRgb(layer.fillColor) : undefined,
                opacity: layer.opacity,
                borderColor: layer.paintMode === "stroke" || layer.paintMode === "both" ? hexToRgb(layer.strokeColor) : undefined,
                borderWidth: layer.paintMode === "stroke" || layer.paintMode === "both" ? Math.max(layer.strokeWidth * pageWidth, 1) : undefined,
                borderOpacity: layer.opacity,
              });
            }
            continue;
          }

          if (layer.type === "textAnnotation") {
            for (const rect of layer.rects) {
              const rX = pageWidth * rect.x;
              const rY = pageHeight - pageHeight * (rect.y + rect.height);
              const rW = pageWidth * rect.width;
              const rH = pageHeight * rect.height;
              if (layer.annotationType === "highlight") {
                page.drawRectangle({
                  x: rX, y: rY, width: rW, height: rH,
                  color: hexToRgb(layer.color),
                  opacity: layer.opacity * 0.35,
                });
              } else if (layer.annotationType === "underline") {
                const lineThickness = Math.max(rH * 0.08, 1);
                const underlineGap = Math.max(rH * 0.015, 0.75);
                page.drawLine({
                  start: { x: rX, y: rY - underlineGap - lineThickness / 2 },
                  end: { x: rX + rW, y: rY - underlineGap - lineThickness / 2 },
                  thickness: lineThickness,
                  color: hexToRgb(layer.color),
                  opacity: layer.opacity,
                });
              } else if (layer.annotationType === "squiggly") {
                const squiggleHeight = Math.max(rH * 0.18, 3.5);
                const points = buildSquigglePoints(rW, squiggleHeight);
                const topY = rY - Math.max(rH * 0.015, 0.75);
                const strokeThickness = Math.max(rH * 0.045, 0.9);
                for (let pointIndex = 1; pointIndex < points.length; pointIndex += 1) {
                  const start = points[pointIndex - 1];
                  const end = points[pointIndex];
                  page.drawLine({
                    start: { x: rX + start.x, y: topY - start.y },
                    end: { x: rX + end.x, y: topY - end.y },
                    thickness: strokeThickness,
                    color: hexToRgb(layer.color),
                    opacity: layer.opacity,
                  });
                }
              } else {
                /* strikeout */
                const lineThickness = Math.max(rH * 0.08, 1);
                const lineY = rY + rH * 0.5;
                page.drawLine({
                  start: { x: rX, y: lineY },
                  end: { x: rX + rW, y: lineY },
                  thickness: lineThickness,
                  color: hexToRgb(layer.color),
                  opacity: layer.opacity,
                });
              }
            }
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

      /* Apply text block edits: cover original text with white rect, draw new text */
      if (Object.keys(textBlockEdits).length > 0) {
        for (const block of textBlocks) {
          const edits = textBlockEdits[block.id];
          if (!edits) continue;
          const page = document.getPage(currentPage - 1);
          const { width: pageWidth, height: pageHeight } = page.getSize();
          const bx = pageWidth * block.x;
          const by = pageHeight * (1 - block.y - block.height);
          const bw = pageWidth * block.width;
          const bh = pageHeight * block.height;
          /* White-out original */
          page.drawRectangle({ x: bx, y: by, width: bw, height: bh, color: rgb(1, 1, 1) });
          /* Draw edited text */
          const editedText = edits.text ?? block.text;
          const editedColor = edits.color ?? block.color;
          const editedBold = edits.bold ?? block.bold;
          const editedItalic = edits.italic ?? block.italic;
          const editedFontSize = edits.fontSize ?? block.fontSize;
          /* Map fontFamily to standard font */
          let stdFamily: TextFontFamily = "Helvetica";
          const ff = (edits.fontFamily ?? block.fontFamily).toLowerCase();
          if (ff.includes("times") || ff.includes("serif")) stdFamily = "Times Roman";
          else if (ff.includes("courier") || ff.includes("mono")) stdFamily = "Courier";
          const font = await getEmbeddedFont(stdFamily, editedBold, editedItalic);
          page.drawText(editedText, {
            x: bx + 1,
            y: by + bh - editedFontSize * 0.8,
            size: editedFontSize,
            font,
            color: hexToRgb(editedColor),
            maxWidth: bw - 2,
            lineHeight: editedFontSize * 1.2,
          });
        }
      }

      /* Draw form fields onto the PDF as interactive AcroForm fields */
      if (formFields.length > 0) {
        const form = document.getForm();
        const helveticaFont = await getEmbeddedFont("Helvetica", false, false);

        /* Counter to ensure unique field names when labels collide */
        const nameCount = new Map<string, number>();
        const uniqueName = (base: string) => {
          const n = (nameCount.get(base) ?? 0) + 1;
          nameCount.set(base, n);
          return n === 1 ? base : `${base}_${n}`;
        };

        /* Collect radio buttons by group so we can process them together */
        const radioGroups = new Map<string, typeof formFields>();
        for (const field of formFields) {
          if (field.type === "radio") {
            const groupName = field.group || "radio-group";
            const arr = radioGroups.get(groupName) ?? [];
            arr.push(field);
            radioGroups.set(groupName, arr);
          }
        }
        /* Create radio groups first */
        const radioGroupMap = new Map<string, ReturnType<typeof form.createRadioGroup>>();
        for (const [groupName, fields] of radioGroups) {
          const rg = form.createRadioGroup(groupName);
          radioGroupMap.set(groupName, rg);

          for (const field of fields) {
            const page = document.getPage(field.pageNumber - 1);
            const { width: pageWidth, height: pageHeight } = page.getSize();
            const fx = pageWidth * field.x;
            const fy = pageHeight * (1 - field.y - field.height);
            const fw = pageWidth * field.width;
            const fh = pageHeight * field.height;
            const optionName = uniqueName(field.label || "Radio");
            rg.addOptionToPage(optionName, page, { x: fx, y: fy, width: fw, height: fh, borderWidth: 1, borderColor: rgb(0.4, 0.4, 0.4) });
            /* Store option name on field for later selection */
            (field as any)._optionName = optionName;
          }

          /* Select the checked one */
          const checked = fields.find((f) => f.checked);
          if (checked && (checked as any)._optionName) {
            rg.select((checked as any)._optionName);
          }

          /* Apply readOnly/required from first field in group */
          const first = fields[0];
          if (first.readOnly) rg.enableReadOnly();
          if (first.required) rg.enableRequired();
        }

        for (const field of formFields) {
          /* Skip radio — already handled above */
          if (field.type === "radio") continue;

          const page = document.getPage(field.pageNumber - 1);
          const { width: pageWidth, height: pageHeight } = page.getSize();
          const fx = pageWidth * field.x;
          const fy = pageHeight * (1 - field.y - field.height);
          const fw = pageWidth * field.width;
          const fh = pageHeight * field.height;
          const fieldName = uniqueName(field.label || field.type);

          if (field.type === "text-field") {
            const tf = form.createTextField(fieldName);
            tf.addToPage(page, { x: fx, y: fy, width: fw, height: fh, font: helveticaFont, borderWidth: 1, borderColor: rgb(0.6, 0.6, 0.6) });
            if (field.value) tf.setText(field.value);
            if (field.multiline) tf.enableMultiline();
            if (field.readOnly) tf.enableReadOnly();
            if (field.required) tf.enableRequired();
          } else if (field.type === "checkbox") {
            const cb = form.createCheckBox(fieldName);
            cb.addToPage(page, { x: fx, y: fy, width: fw, height: fh, borderWidth: 1, borderColor: rgb(0.4, 0.4, 0.4) });
            if (field.checked) cb.check();
            if (field.readOnly) cb.enableReadOnly();
            if (field.required) cb.enableRequired();
          } else if (field.type === "dropdown") {
            const dd = form.createDropdown(fieldName);
            if (field.options.length > 0) dd.addOptions(field.options);
            dd.addToPage(page, { x: fx, y: fy, width: fw, height: fh, font: helveticaFont, borderWidth: 1, borderColor: rgb(0.6, 0.6, 0.6) });
            if (field.value && field.options.includes(field.value)) dd.select(field.value);
            if (field.readOnly) dd.enableReadOnly();
            if (field.required) dd.enableRequired();
          } else if (field.type === "listbox") {
            const lb = form.createOptionList(fieldName);
            if (field.options.length > 0) lb.addOptions(field.options);
            lb.addToPage(page, { x: fx, y: fy, width: fw, height: fh, font: helveticaFont, borderWidth: 1, borderColor: rgb(0.6, 0.6, 0.6) });
            if (field.value && field.options.includes(field.value)) lb.select(field.value);
            if (field.multiSelect) lb.enableMultiselect();
            if (field.readOnly) lb.enableReadOnly();
            if (field.required) lb.enableRequired();
          } else if (field.type === "signature-field") {
            /* Signature field — create as a clickable text field styled as a signature area */
            const tf = form.createTextField(fieldName);
            tf.addToPage(page, {
              x: fx,
              y: fy,
              width: fw,
              height: fh,
              font: helveticaFont,
              borderWidth: 2,
              borderColor: rgb(0.4, 0.4, 0.4),
              backgroundColor: rgb(1, 1, 1),
            });
            tf.setFontSize(Math.min(fh * 0.4, 14));
            tf.setAlignment(1); /* 0=left, 1=center, 2=right — single-line auto-centers vertically */
            if (field.value) {
              tf.setText(field.value);
            } else {
              tf.setText("");
            }
            if (field.readOnly) tf.enableReadOnly();
            if (field.required) tf.enableRequired();
          }
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
  }, [overlays, pdf, textBlocks, textBlockEdits, currentPage, formFields]);

  const activePreviewUrl = editorPreviewUrl;
  const activePreviewLoading = editorPreviewLoading;
  const draftHighlightBox = draftInteraction?.type === "highlight" && draftInteraction.pageNumber === currentPage
    ? shapeUsesFixedAspect(draftInteraction.shapeKind)
      ? squareBoxFromPoints(draftInteraction.start, draftInteraction.current, editorWidth, editorHeight)
      : boxFromPoints(draftInteraction.start, draftInteraction.current)
    : null;
  const draftShapeKind = draftInteraction?.type === "highlight" ? draftInteraction.shapeKind : shapeKind;
  const draftTextAnnotateBox = draftInteraction?.type === "textAnnotate" && draftInteraction.pageNumber === currentPage
    ? rawBoxFromPoints(draftInteraction.start, draftInteraction.current)
    : null;
  /* Live preview: compute which text rects are hit during drag */
  const draftTextAnnotateRects = useMemo(() => {
    if (!draftTextAnnotateBox) return [];
    return getTextAnnotationRects(pageTextItems, draftTextAnnotateBox);
  }, [draftTextAnnotateBox, pageTextItems]);
  const activeLineDraft = pendingLine && pendingLine.pageNumber === currentPage && shapeIsConnector(pendingLine.shapeKind)
    ? buildLineGeometry(pendingLine.start, pendingLine.current)
    : null;
  const draftPath = draftInteraction?.type === "draw" && draftInteraction.pageNumber === currentPage
    ? buildPixelPath(draftInteraction.points, editorWidth, editorHeight)
    : "";
  const overlayPointerClass = "pointer-events-auto";
  const canvasTouchAction = toolMode === "draw" || toolMode === "highlight"
    ? "none"
    : zoom > 1
      ? "pan-x pan-y"
      : "auto";

  const renderLayerOverlay = (layer: OverlayItem) => {
    if (layer.type === "text") {
      const isSelected = selectedOverlayId === layer.id;
      const isEditing = editingTextId === layer.id;
      const fontSizePx = Math.max(layer.fontSize * editorHeight, 12);
      const padding = getTextPadding(fontSizePx);
      const calloutAnchor = layer.variant === "callout" ? getCalloutAnchorPoint(layer) : null;
      const calloutTarget = layer.variant === "callout" ? layer.calloutTarget : null;
      const calloutBend = layer.variant === "callout" ? layer.calloutBend : null;
      const relativeTargetX = calloutTarget ? ((calloutTarget.x - layer.x) / Math.max(layer.width, 0.0001)) * 100 : 0;
      const relativeTargetY = calloutTarget ? ((calloutTarget.y - layer.y) / Math.max(layer.height, 0.0001)) * 100 : 0;
      const relativeBendX = calloutBend ? ((calloutBend.x - layer.x) / Math.max(layer.width, 0.0001)) * 100 : 0;
      const relativeBendY = calloutBend ? ((calloutBend.y - layer.y) / Math.max(layer.height, 0.0001)) * 100 : 0;
      const localAnchor = calloutAnchor ? {
        x: (calloutAnchor.x - layer.x) * editorWidth,
        y: (calloutAnchor.y - layer.y) * editorHeight,
      } : null;
      const localBend = calloutBend ? {
        x: (calloutBend.x - layer.x) * editorWidth,
        y: (calloutBend.y - layer.y) * editorHeight,
      } : null;
      const localTarget = calloutTarget ? {
        x: (calloutTarget.x - layer.x) * editorWidth,
        y: (calloutTarget.y - layer.y) * editorHeight,
      } : null;
      const calloutArrowHead = localTarget && (localBend || localAnchor)
        ? getArrowHeadPoints(localBend || localAnchor || localTarget, localTarget, 16, 7)
        : null;
      return (
        <div
          key={layer.id}
          onPointerDown={(event) => {
            if (isEraserActive) {
              event.stopPropagation();
              removeOverlay(layer.id);
              return;
            }
            if (isEditing) {
              event.stopPropagation();
              return;
            }
            if (!isSelected) {
              event.stopPropagation();
              setSelectedOverlayId(layer.id);
              return;
            }
            event.stopPropagation();
          }}
          onDoubleClick={(event) => {
            event.stopPropagation();
            setSelectedOverlayId(layer.id);
            setEditingTextId(layer.id);
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (isSelected && !isEditing) {
              setEditingTextId(layer.id);
            } else {
              setSelectedOverlayId(layer.id);
            }
          }}
          className={`absolute overflow-visible rounded shadow-sm ${overlayPointerClass} ${isEditing ? "cursor-text" : "cursor-text"}`}
          style={{
            left: `${layer.x * 100}%`,
            top: `${layer.y * 100}%`,
            width: `${layer.width * 100}%`,
            height: `${layer.height * 100}%`,
          }}
        >
          {layer.variant === "callout" && calloutAnchor && calloutTarget ? (
            <svg className="pointer-events-none absolute inset-0 overflow-visible" preserveAspectRatio="none">
              <line
                x1={localTarget?.x}
                y1={localTarget?.y}
                x2={(localBend ?? localAnchor)?.x}
                y2={(localBend ?? localAnchor)?.y}
                stroke={layer.strokeColor}
                strokeOpacity={layer.textOpacity}
                strokeWidth={Math.max(layer.strokeWidth, 1.2)}
              />
              {localBend ? (
                <line
                  x1={localBend.x}
                  y1={localBend.y}
                  x2={localAnchor?.x}
                  y2={localAnchor?.y}
                  stroke={layer.strokeColor}
                  strokeOpacity={layer.textOpacity}
                  strokeWidth={Math.max(layer.strokeWidth, 1.2)}
                />
              ) : null}
              {calloutArrowHead ? (
                <>
                  <line
                    x1={localTarget?.x}
                    y1={localTarget?.y}
                    x2={calloutArrowHead.left.x}
                    y2={calloutArrowHead.left.y}
                    stroke={layer.strokeColor}
                    strokeOpacity={layer.textOpacity}
                    strokeWidth={Math.max(layer.strokeWidth, 1.2)}
                  />
                  <line
                    x1={localTarget?.x}
                    y1={localTarget?.y}
                    x2={calloutArrowHead.right.x}
                    y2={calloutArrowHead.right.y}
                    stroke={layer.strokeColor}
                    strokeOpacity={layer.textOpacity}
                    strokeWidth={Math.max(layer.strokeWidth, 1.2)}
                  />
                </>
              ) : null}
            </svg>
          ) : null}
          <div
            className={`absolute inset-0 rounded ${layer.variant === "callout" || isSelected ? "border" : "border border-transparent"}`}
            style={{
              backgroundColor: layer.backgroundFill
                ? hexToRgbaString(layer.backgroundColor ?? "#ffffff", layer.backgroundOpacity ?? 0.88)
                : isSelected
                  ? "rgba(255,255,255,0.94)"
                  : "transparent",
              borderColor: layer.variant === "callout"
                ? hexToRgbaString(layer.strokeColor, layer.textOpacity)
                : isSelected
                  ? "#ff4d6d"
                  : "transparent",
              borderWidth: layer.variant === "callout" ? `${Math.max(layer.strokeWidth, 1)}px` : isSelected ? "1px" : "0px",
            }}
          >
            {isEditing ? (
              <textarea
                autoFocus
                value={layer.text}
                onChange={(event) => updateOverlay(layer.id, (item) => item.type === "text" ? { ...item, text: event.target.value } : item)}
                onBlur={() => setEditingTextId(null)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setEditingTextId(null);
                  }
                  event.stopPropagation();
                }}
                onPointerDown={(event) => event.stopPropagation()}
                className="h-full w-full resize-none border-0 bg-transparent outline-none"
                style={{
                  color: hexToRgbaString(layer.color, layer.textOpacity),
                  fontWeight: layer.bold ? 700 : 500,
                  fontStyle: layer.italic ? "italic" : "normal",
                  fontFamily: getCssFontFamily(layer.fontFamily),
                  fontSize: `${fontSizePx}px`,
                  lineHeight: 1.15,
                  textAlign: getTextAlignCss(layer.textAlign),
                  textDecoration: getTextDecorationCss(layer),
                  padding: `${padding.y}px ${padding.x}px`,
                }}
              />
            ) : (
              <div
                className="flex h-full w-full whitespace-pre-wrap"
                style={{
                  alignItems: getVerticalAlignCss(layer.verticalAlign),
                  justifyContent: layer.textAlign === "center" ? "center" : layer.textAlign === "end" ? "flex-end" : "flex-start",
                  padding: `${padding.y}px ${padding.x}px`,
                  color: hexToRgbaString(layer.color, layer.textOpacity),
                  fontWeight: layer.bold ? 700 : 500,
                  fontStyle: layer.italic ? "italic" : "normal",
                  fontFamily: getCssFontFamily(layer.fontFamily),
                  fontSize: `${fontSizePx}px`,
                  lineHeight: 1.15,
                  textAlign: getTextAlignCss(layer.textAlign),
                  textDecoration: getTextDecorationCss(layer),
                  WebkitTextStroke: layer.strokeWidth > 0 ? `${layer.strokeWidth}px ${layer.strokeColor}` : undefined,
                }}
              >
                <div className="max-w-full">{coerceMultilineText(layer.text)}</div>
              </div>
            )}
          </div>
          {isSelected && !isEditing ? (
            <>
              <div className="pointer-events-none absolute inset-0 rounded border-2 border-[#ff4d6d] shadow-[0_0_0_1px_rgba(255,77,109,0.35)]" />
              <button
                type="button"
                onPointerDown={(event) => beginOverlayMove(event, layer.id)}
                className="absolute left-1/2 top-0 flex h-5 w-10 -translate-x-1/2 -translate-y-[120%] items-center justify-center rounded-full border border-white/70 bg-[#ff4d6d] text-[10px] font-semibold text-white shadow"
                aria-label="Move text box"
              >
                Move
              </button>
              {layer.variant === "callout" && calloutTarget ? (
                <>
                  <button
                    type="button"
                    onPointerDown={(event) => beginCalloutPointerMove(event, layer.id)}
                    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#f59e0b] shadow"
                    style={{
                      left: `${relativeTargetX}%`,
                      top: `${relativeTargetY}%`,
                    }}
                    aria-label="Move callout pointer"
                  />
                  {calloutBend ? (
                    <button
                      type="button"
                      onPointerDown={(event) => beginCalloutBendMove(event, layer.id)}
                      className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#3b82f6] shadow"
                      style={{
                        left: `${relativeBendX}%`,
                        top: `${relativeBendY}%`,
                      }}
                      aria-label="Move callout bend"
                    />
                  ) : null}
                </>
              ) : null}
              {([
                ["nw", "-left-2 -top-2 cursor-nwse-resize"],
                ["ne", "-right-2 -top-2 cursor-nesw-resize"],
                ["sw", "-left-2 -bottom-2 cursor-nesw-resize"],
                ["se", "-right-2 -bottom-2 cursor-nwse-resize"],
              ] as const).map(([handle, positionClass]) => (
                <button
                  key={handle}
                  type="button"
                  onPointerDown={(event) => beginTextResize(event, layer.id, handle)}
                  className={`absolute h-4 w-4 rounded-full border-2 border-white bg-[#ff4d6d] shadow ${positionClass}`}
                  aria-label={`Resize text ${handle}`}
                />
              ))}
            </>
          ) : null}
        </div>
      );
    }

    if (layer.type === "draw") {
      const bounds = getDrawBounds(layer.points);
      const localSvgW = Math.max(bounds.width * editorWidth, 1);
      const localSvgH = Math.max(bounds.height * editorHeight, 1);
      return (
        <div
          key={layer.id}
          onPointerDown={(event) => {
            if (isEraserActive) {
              event.stopPropagation();
              removeOverlay(layer.id);
            }
          }}
          className={`absolute ${overlayPointerClass} ${isEraserActive ? "cursor-cell" : "cursor-default"}`}
          style={{
            left: `${bounds.x * 100}%`,
            top: `${bounds.y * 100}%`,
            width: `${bounds.width * 100}%`,
            height: `${bounds.height * 100}%`,
          }}
        >
          <svg
            className="absolute inset-0"
            viewBox={`0 0 ${Math.round(localSvgW)} ${Math.round(localSvgH)}`}
            preserveAspectRatio="none"
          >
            <path
              d={buildLocalDrawPath(layer.points, bounds.x, bounds.y, bounds.width, bounds.height, localSvgW, localSvgH)}
              fill="none"
              stroke={layer.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={getStrokePx(layer.strokeWidth * (layer.drawStyle === "highlighter" ? 1.8 : 1), editorWidth, editorHeight)}
              strokeOpacity={layer.drawStyle === "highlighter" ? Math.min(layer.opacity * 0.32, 0.42) : layer.opacity}
              style={{ mixBlendMode: layer.drawStyle === "highlighter" ? "multiply" : undefined }}
            />
          </svg>
        </div>
      );
    }

    if (layer.type === "highlight") {
      const showShapeHandles = selectedOverlayId === layer.id;
      const showEndpointHandles = showShapeHandles && (shapeIsConnector(layer.shapeKind) || layer.shapeKind === "arc");
      const localLine = shapeIsConnector(layer.shapeKind) ? getLocalLineEndpoints(layer) : null;
      const connectorHandlePositions = localLine
        ? {
            start: {
              left: `${(localLine.start.x / Math.max(layer.width, 0.0001)) * 100}%`,
              top: `${(localLine.start.y / Math.max(layer.height, 0.0001)) * 100}%`,
            },
            end: {
              left: `${(localLine.end.x / Math.max(layer.width, 0.0001)) * 100}%`,
              top: `${(localLine.end.y / Math.max(layer.height, 0.0001)) * 100}%`,
            },
          }
        : null;
      const localWidth = Math.max(layer.width * editorWidth, 1);
      const localHeight = Math.max(layer.height * editorHeight, 1);
      const strokePx = Math.max(layer.strokeWidth * Math.min(editorWidth, editorHeight), 2);
      const dashArray = getLineStyleDashArray(layer.lineStyle, strokePx);
      const pathDefinition = buildShapePath(layer.shapeKind, localWidth, localHeight);
      const arcHandles = layer.shapeKind === "arc"
        ? {
            start: { x: 0, y: 0.92 },
            end: { x: 0.98, y: 0.36 },
          }
        : null;
      const localLinePx = localLine ? {
        start: { x: localLine.start.x * editorWidth, y: localLine.start.y * editorHeight },
        end: { x: localLine.end.x * editorWidth, y: localLine.end.y * editorHeight },
      } : null;
      const localArrowHead = layer.shapeKind === "arrow" && localLine
        ? getArrowHeadPoints(localLinePx!.start, localLinePx!.end, Math.max(strokePx * 4.8, 12), Math.max(strokePx * 1.9, 5))
        : null;
      return (
        <div
          key={layer.id}
          onPointerDown={(event) => {
            if (isEraserActive) {
              event.stopPropagation();
              removeOverlay(layer.id);
              return;
            }
            beginOverlayMove(event, layer.id);
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (isEraserActive) return;
            setSelectedOverlayId(layer.id);
          }}
          className={`absolute rounded ${overlayPointerClass} ${isEraserActive ? "cursor-cell" : "cursor-move"}`}
          style={{
            left: `${layer.x * 100}%`,
            top: `${layer.y * 100}%`,
            width: `${layer.width * 100}%`,
            height: `${layer.height * 100}%`,
            opacity: layer.opacity,
            boxShadow: selectedOverlayId === layer.id && !shapeIsConnector(layer.shapeKind) ? "0 0 0 2px rgba(255,77,109,0.35)" : undefined,
          }}
        >
          <svg className="pointer-events-none absolute inset-0 overflow-visible" viewBox={`0 0 ${localWidth} ${localHeight}`} preserveAspectRatio="none">
            {shapeIsConnector(layer.shapeKind) && localLine ? (
              <line
                x1={localLinePx!.start.x}
                y1={localLinePx!.start.y}
                x2={localLinePx!.end.x}
                y2={localLinePx!.end.y}
                stroke={layer.strokeColor}
                strokeWidth={strokePx}
                strokeLinecap="round"
                strokeDasharray={dashArray}
              />
            ) : null}
            {layer.shapeKind === "arrow" && localArrowHead ? (
              <>
                <line
                  x1={localLinePx!.end.x}
                  y1={localLinePx!.end.y}
                  x2={localArrowHead.left.x}
                  y2={localArrowHead.left.y}
                  stroke={layer.strokeColor}
                  strokeWidth={strokePx}
                  strokeLinecap="round"
                />
                <line
                  x1={localLinePx!.end.x}
                  y1={localLinePx!.end.y}
                  x2={localArrowHead.right.x}
                  y2={localArrowHead.right.y}
                  stroke={layer.strokeColor}
                  strokeWidth={strokePx}
                  strokeLinecap="round"
                />
              </>
            ) : null}
            {layer.shapeKind === "ellipse" || layer.shapeKind === "circle" ? (
              <ellipse
                cx={localWidth / 2}
                cy={localHeight / 2}
                rx={Math.max(localWidth / 2 - strokePx / 2, 1)}
                ry={Math.max(localHeight / 2 - strokePx / 2, 1)}
                fill={getShapeFillColor(layer)}
                stroke={getShapeBorderColor(layer)}
                strokeWidth={strokePx}
                strokeDasharray={dashArray}
              />
            ) : null}
            {layer.shapeKind === "rect" || layer.shapeKind === "square" ? (
              <rect
                x={strokePx / 2}
                y={strokePx / 2}
                width={Math.max(localWidth - strokePx, 1)}
                height={Math.max(localHeight - strokePx, 1)}
                fill={getShapeFillColor(layer)}
                stroke={getShapeBorderColor(layer)}
                strokeWidth={strokePx}
                strokeDasharray={dashArray}
              />
            ) : null}
            {!shapeIsConnector(layer.shapeKind) && pathDefinition ? (
              <path
                d={pathDefinition}
                fill={shapeUsesOpenPath(layer.shapeKind) ? "none" : getShapeFillColor(layer)}
                stroke={getShapeBorderColor(layer)}
                strokeWidth={strokePx}
                strokeDasharray={dashArray}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </svg>
          {showShapeHandles ? (
            <>
              {showEndpointHandles ? (
                <>
                  {shapeIsConnector(layer.shapeKind) ? (
                    <>
                      <button
                        type="button"
                        onPointerDown={(event) => beginLineResize(event, layer.id, "start")}
                        className="absolute z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff4d6d] shadow-[0_8px_20px_rgba(255,77,109,0.35)]"
                        style={connectorHandlePositions?.start}
                        aria-label="Resize line start"
                      />
                      <button
                        type="button"
                        onPointerDown={(event) => beginLineResize(event, layer.id, "end")}
                        className="absolute z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff4d6d] shadow-[0_8px_20px_rgba(255,77,109,0.35)]"
                        style={connectorHandlePositions?.end}
                        aria-label="Resize line end"
                      />
                    </>
                  ) : arcHandles ? (
                    <>
                      <button
                        type="button"
                        onPointerDown={(event) => beginShapeResize(event, layer.id, "sw")}
                        className="absolute z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff4d6d] shadow-[0_8px_20px_rgba(255,77,109,0.35)]"
                        style={{
                          left: `${arcHandles.start.x * 100}%`,
                          top: `${arcHandles.start.y * 100}%`,
                        }}
                        aria-label="Resize arc start"
                      />
                      <button
                        type="button"
                        onPointerDown={(event) => beginShapeResize(event, layer.id, "ne")}
                        className="absolute z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff4d6d] shadow-[0_8px_20px_rgba(255,77,109,0.35)]"
                        style={{
                          left: `${arcHandles.end.x * 100}%`,
                          top: `${arcHandles.end.y * 100}%`,
                        }}
                        aria-label="Resize arc end"
                      />
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="pointer-events-none absolute inset-0 rounded inherit border-2 border-[#ff4d6d] shadow-[0_0_0_1px_rgba(255,77,109,0.35)]" style={{ borderRadius: layer.shapeKind === "ellipse" || layer.shapeKind === "circle" ? "9999px" : undefined }} />
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
                      className={`absolute z-20 h-4 w-4 rounded-full border-2 border-white bg-[#ff4d6d] shadow ${positionClass}`}
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

    if (layer.type === "textAnnotation") {
      return (
        <div key={layer.id} className="pointer-events-none absolute inset-0">
          {layer.rects.map((rect, i) => {
            if (layer.annotationType === "highlight") {
              return (
                <div
                  key={i}
                  className={`absolute ${overlayPointerClass} cursor-default`}
                    onPointerDown={(event) => {
                      if (!isEraserActive) return;
                      event.stopPropagation();
                      removeOverlay(layer.id);
                    }}
                  style={{
                    left: `${rect.x * 100}%`,
                    top: `${rect.y * 100}%`,
                    width: `${rect.width * 100}%`,
                    height: `${rect.height * 100}%`,
                    backgroundColor: layer.color,
                    opacity: layer.opacity * 0.35,
                    mixBlendMode: "multiply",
                    borderRadius: "2px",
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (isEraserActive) {
                      removeOverlay(layer.id);
                      return;
                    }
                    setSelectedOverlayId(layer.id);
                  }}
                />
              );
            }
            if (layer.annotationType === "underline") {
              const lineHeight = getTextAnnotationLineHeight(rect.height);
              return (
                <div
                  key={i}
                  className={`absolute ${overlayPointerClass} cursor-default`}
                  onPointerDown={(event) => {
                    if (!isEraserActive) return;
                    event.stopPropagation();
                    removeOverlay(layer.id);
                  }}
                  style={{
                    left: `${rect.x * 100}%`,
                    top: `${getUnderlineTop(rect) * 100}%`,
                    width: `${rect.width * 100}%`,
                    height: `${lineHeight * 100}%`,
                    backgroundColor: layer.color,
                    opacity: layer.opacity,
                    borderRadius: "1px",
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (isEraserActive) {
                      removeOverlay(layer.id);
                      return;
                    }
                    setSelectedOverlayId(layer.id);
                  }}
                />
              );
            }
            if (layer.annotationType === "squiggly") {
              const squiggleHeight = getSquigglyHeight(rect);
              const squiggleWidth = Math.max(rect.width * editorWidth, 1);
              const squiggleViewHeight = Math.max(squiggleHeight * editorHeight, 1);
              const points = buildSquigglePoints(squiggleWidth, squiggleViewHeight);
              return (
                <svg
                  key={i}
                  className={`absolute ${overlayPointerClass} ${isEraserActive ? "cursor-cell" : "cursor-default"}`}
                  onPointerDown={(event) => {
                    if (!isEraserActive) return;
                    event.stopPropagation();
                    removeOverlay(layer.id);
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (isEraserActive) {
                      removeOverlay(layer.id);
                      return;
                    }
                    setSelectedOverlayId(layer.id);
                  }}
                  viewBox={`0 0 ${Math.round(squiggleWidth)} ${Math.round(squiggleViewHeight)}`}
                  preserveAspectRatio="none"
                  style={{
                    left: `${rect.x * 100}%`,
                    top: `${getSquigglyTop(rect) * 100}%`,
                    width: `${rect.width * 100}%`,
                    height: `${squiggleHeight * 100}%`,
                    overflow: "visible",
                  }}
                >
                  <polyline
                    fill="none"
                    points={points.map((point) => `${point.x},${point.y}`).join(" ")}
                    stroke={layer.color}
                    strokeOpacity={layer.opacity}
                    strokeWidth={Math.max(squiggleViewHeight * 0.25, 1.4)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              );
            }
            /* strikeout */
            return (
              <div
                key={i}
                className={`absolute ${overlayPointerClass} cursor-default`}
                onPointerDown={(event) => {
                  if (!isEraserActive) return;
                  event.stopPropagation();
                  removeOverlay(layer.id);
                }}
                style={{
                  left: `${rect.x * 100}%`,
                  top: `${getStrikeoutTop(rect) * 100}%`,
                  width: `${rect.width * 100}%`,
                  height: `${getTextAnnotationLineHeight(rect.height) * 100}%`,
                  backgroundColor: layer.color,
                  opacity: layer.opacity,
                  borderRadius: "1px",
                }}
                onClick={(event) => {
                  if (isEraserActive) {
                    event.stopPropagation();
                    removeOverlay(layer.id);
                    return;
                  }
                  event.stopPropagation();
                  setSelectedOverlayId(layer.id);
                }}
              />
            );
          })}
          {/* No selection border for text annotations – they act like real ink */}
        </div>
      );
    }

    const visible = getVisibleImageRatios(layer);
    const isSelectedImage = selectedOverlayId === layer.id;
    const showResizeHandles = isSelectedImage && imageEditMode === "resize";
    const showCropHandles = isSelectedImage && imageEditMode === "crop";
    const isReadjustMode = isSelectedImage && imageEditMode === "readjust";
    const canMoveImage = !isSelectedImage || imageEditMode === "move";
    const imagePointerDown = isReadjustMode
      ? (event: ReactPointerEvent<HTMLDivElement>) => beginImageReadjust(event, layer.id)
      : canMoveImage
        ? (event: ReactPointerEvent<HTMLDivElement>) => beginOverlayMove(event, layer.id)
        : undefined;

    return (
      <div
        key={layer.id}
        onPointerDown={(event) => {
          if (isEraserActive) {
            event.stopPropagation();
            removeOverlay(layer.id);
            return;
          }
          imagePointerDown?.(event);
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (isEraserActive) return;
          setSelectedOverlayId(layer.id);
        }}
        className={`absolute overflow-visible rounded-lg ${overlayPointerClass} ${isEraserActive ? "cursor-cell" : canMoveImage ? "cursor-move" : isReadjustMode ? "cursor-grab active:cursor-grabbing" : "cursor-default"} ${selectedOverlayId === layer.id ? "shadow-[0_0_0_2px_rgba(255,77,109,0.28)]" : ""}`}
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
        {selectedOverlayId === layer.id ? (
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

      {showStampDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4" onClick={() => setShowStampDialog(false)}>
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-[28px] border border-border bg-[#12121a] p-4 sm:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c8ea6]">Insert Stamp</div>
                <h3 className="mt-1 text-2xl font-semibold text-white">Create New Stamp</h3>
                <p className="mt-2 text-sm text-[#9b9db2]">Build a reusable stamp, then click on the page to place it.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowStampDialog(false)}
                className="rounded-full border border-border bg-surface/60 px-3 py-2 text-sm text-[#c7c8d8] transition hover:bg-white/[0.06]"
              >
                Close
              </button>
            </div>

            <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 lg:grid-cols-[1.15fr_0.95fr] overflow-y-auto min-h-0">
              <div>
                <div className="rounded-[24px] border border-border bg-[#f3f4f8] p-3 sm:p-5">
                  <div className="flex min-h-[180px] sm:min-h-[260px] items-center justify-center rounded-[20px] border border-[#ccd0db] bg-white/60 p-4 sm:p-6">
                    <div
                      className="max-w-full rounded-[24px] border-[5px] px-10 py-7 text-center shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
                      style={{
                        backgroundColor: stampDraft.backgroundColor,
                        borderColor: stampDraft.textColor,
                        color: stampDraft.textColor,
                        fontFamily: getCssFontFamily(stampDraft.fontFamily),
                      }}
                    >
                      <div
                        style={{
                          fontSize: stampDraft.text.length > 14 ? "2.6rem" : "3.2rem",
                          fontWeight: stampDraft.bold ? 700 : 600,
                          fontStyle: stampDraft.italic ? "italic" : "normal",
                          letterSpacing: "0.02em",
                          textDecoration: stampDraft.underline ? "underline" : "none",
                          lineHeight: 1.1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {stampDraft.text.trim() || "Stamp"}
                      </div>
                      {stampPreviewTimestamp ? (
                        <div className="mt-3 text-sm font-medium opacity-90">{stampPreviewTimestamp}</div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                  {STAMP_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => { void applyStampPreset(preset); }}
                      className="rounded-xl sm:rounded-2xl border border-border bg-surface/40 p-2 sm:p-3 text-left transition hover:border-[#ff4d6d]/45 hover:bg-white/[0.05]"
                    >
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap rounded-lg sm:rounded-xl border px-2 sm:px-4 py-2 sm:py-3 text-center text-sm sm:text-lg shadow-sm" style={{
                        backgroundColor: preset.config.backgroundColor,
                        borderColor: preset.config.textColor,
                        color: preset.config.textColor,
                        fontFamily: getCssFontFamily(preset.config.fontFamily),
                        fontWeight: preset.config.bold ? 700 : 600,
                        fontStyle: preset.config.italic ? "italic" : "normal",
                        textDecoration: preset.config.underline ? "underline" : "none",
                      }}>
                        {preset.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-[24px] border border-border bg-surface/30 p-5">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c8ea6]">Stamp Text</span>
                  <input
                    type="text"
                    value={stampDraft.text}
                    onChange={(event) => setStampDraft((current) => ({ ...current, text: event.target.value }))}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#ff4d6d]"
                    placeholder="Draft"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c8ea6]">Font Style</span>
                  <select
                    value={stampDraft.fontFamily}
                    onChange={(event) => setStampDraft((current) => ({ ...current, fontFamily: event.target.value as TextFontFamily }))}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#ff4d6d]"
                  >
                    {TEXT_FONT_OPTIONS.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  {([
                    ["bold", "B"],
                    ["italic", "I"],
                    ["underline", "U"],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStampDraft((current) => ({ ...current, [key]: !current[key] }))}
                      className={`h-10 w-10 rounded-xl border text-sm font-semibold transition ${stampDraft[key] ? "border-[#ff4d6d] bg-[#ff4d6d]/15 text-[#ff4d6d]" : "border-border bg-surface/70 text-[#d2d4e2] hover:bg-white/[0.05]"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c8ea6]">Text Color</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setStampDraft((current) => ({ ...current, textColor: color }))}
                        className={`h-7 w-7 rounded-full border-2 transition ${stampDraft.textColor === color ? "border-white shadow-[0_0_0_2px_rgba(255,77,109,0.45)]" : "border-transparent hover:border-white/40"}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Text color ${color}`}
                      />
                    ))}
                    <input
                      type="color"
                      value={stampDraft.textColor}
                      onChange={(event) => setStampDraft((current) => ({ ...current, textColor: event.target.value }))}
                      className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c8ea6]">Background Color</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {STAMP_BACKGROUND_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setStampDraft((current) => ({ ...current, backgroundColor: color }))}
                        className={`h-7 w-7 rounded-full border-2 transition ${stampDraft.backgroundColor === color ? "border-white shadow-[0_0_0_2px_rgba(255,77,109,0.45)]" : "border-transparent hover:border-white/40"}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Background color ${color}`}
                      />
                    ))}
                    <input
                      type="color"
                      value={stampDraft.backgroundColor}
                      onChange={(event) => setStampDraft((current) => ({ ...current, backgroundColor: event.target.value }))}
                      className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-[#d3d5e3]">
                  <input
                    type="checkbox"
                    checked={stampDraft.includeTimestamp}
                    onChange={(event) => setStampDraft((current) => ({
                      ...current,
                      includeTimestamp: event.target.checked,
                      timestampText: event.target.checked ? (current.timestampText || formatStampTimestamp()) : "",
                    }))}
                    className="accent-[#ff4d6d]"
                  />
                  Include timestamp
                </label>

                {stampDraft.includeTimestamp ? (
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c8ea6]">Timestamp Text</span>
                    <input
                      type="text"
                      value={stampDraft.timestampText}
                      onChange={(event) => setStampDraft((current) => ({ ...current, timestampText: event.target.value }))}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#ff4d6d]"
                    />
                  </label>
                ) : null}

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => stampInputRef.current?.click()}
                    className="rounded-full border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
                  >
                    Upload image stamp
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStampDialog(false)}
                    className="rounded-full border border-border bg-transparent px-4 py-2 text-sm font-semibold text-[#c7c8d8] transition hover:bg-white/[0.05]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => { void createCustomStamp(); }}
                    className="rounded-full bg-[#ff4d6d] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#ff365a]"
                  >
                    Create stamp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── signature dialog modal ── */}
      {showSigDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4" onClick={() => setShowSigDialog(false)}>
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-[#12121a] p-4 sm:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Create New Signature</h3>
              <button type="button" onClick={() => setShowSigDialog(false)} className="text-muted hover:text-white text-xl leading-none">&times;</button>
            </div>

            {/* tabs */}
            <div className="mt-4 flex gap-1 rounded-lg border border-border bg-surface-3/50 p-1">
              {(["draw", "type", "upload"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSigTab(t)}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition ${sigTab === t ? "bg-[#ff4d6d] text-white" : "text-muted hover:text-white"}`}
                >
                  {t === "draw" ? "Draw" : t === "type" ? "Type" : "Upload"}
                </button>
              ))}
            </div>

            <div className="mt-4 min-h-[200px] overflow-y-auto">
              {/* draw tab */}
              {sigTab === "draw" ? (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl border border-border bg-white">
                    <canvas
                      ref={sigDrawCanvasRef}
                      width={460}
                      height={180}
                      className="w-full cursor-crosshair touch-none"
                      onPointerDown={onSigDrawDown}
                      onPointerMove={onSigDrawMove}
                      onPointerUp={onSigDrawUp}
                      onPointerLeave={onSigDrawUp}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Draw Signature</span>
                    <button type="button" onClick={clearSigCanvas} className="text-sm text-muted hover:text-white transition">Clear</button>
                  </div>
                </div>
              ) : null}

              {/* type tab */}
              {sigTab === "type" ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={sigText}
                    onChange={(e) => {
                      setSigText(e.target.value);
                      regenerateSigPreviews(e.target.value, sigColor, sigBgColor);
                    }}
                    placeholder="Your Name"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#ff4d6d]"
                  />
                  <div className="space-y-2">
                    {sigFontPreviews.map((url, i) => (
                      <label
                        key={i}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${sigFontIdx === i ? "border-[#ff4d6d] bg-[#ff4d6d]/10" : "border-border bg-surface/50 hover:bg-surface/70"}`}
                      >
                        <input type="radio" name="sigFontEdit" checked={sigFontIdx === i} onChange={() => setSigFontIdx(i)} className="accent-[#ff4d6d]" />
                        <img src={url} alt={SIG_FONTS[i].label} className="h-10 max-w-[260px] object-contain" draggable={false} />
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* upload tab */}
              {sigTab === "upload" ? (
                <div className="space-y-3">
                  <input ref={sigUploadRef} type="file" accept="image/png,image/jpeg" onChange={onSigUpload} className="hidden" />
                  {sigUploadUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="overflow-hidden rounded-xl border border-border bg-white p-4">
                        <img src={sigUploadUrl} alt="Uploaded" className="max-h-32 max-w-full object-contain" draggable={false} />
                      </div>
                      <button type="button" onClick={() => sigUploadRef.current?.click()} className="text-sm text-muted hover:text-white transition">
                        Choose different image
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => sigUploadRef.current?.click()}
                      className="w-full rounded-xl border border-dashed border-border bg-surface/50 px-4 py-10 text-sm text-muted transition hover:border-[#ff4d6d]/50 hover:text-white"
                    >
                      Click to upload signature image (PNG / JPG)
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            {/* color + gradient picker */}
            <div className="mt-4 space-y-2">
              <span className="text-xs text-muted">Stroke color:</span>
              <div className="flex flex-wrap items-center gap-2">
                {SIG_COLORS_EDIT.filter((c) => !c.gradient).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    title={label}
                    onClick={() => {
                      setSigColor(value);
                      regenerateSigPreviews(sigText, value, sigBgColor);
                    }}
                    className={`h-7 w-7 rounded-full border-2 transition ${sigColor === value ? "border-white scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: value }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted">Gradients:</span>
              <div className="flex flex-wrap items-center gap-2">
                {SIG_COLORS_EDIT.filter((c) => c.gradient).map(({ value, label, gradient }) => (
                  <button
                    key={value}
                    type="button"
                    title={label}
                    onClick={() => {
                      setSigColor(value);
                      regenerateSigPreviews(sigText, value, sigBgColor);
                    }}
                    className={`h-7 w-7 rounded-full border-2 transition ${sigColor === value ? "border-white scale-110" : "border-transparent"}`}
                    style={{ background: `linear-gradient(135deg, ${gradient![0]}, ${gradient![1]})` }}
                  />
                ))}
              </div>
            </div>

            {/* background picker */}
            <div className="mt-3 space-y-2">
              <span className="text-xs text-muted">Background:</span>
              <div className="flex flex-wrap items-center gap-2">
                {SIG_BG_OPTIONS.map(({ value, label, css }) => (
                  <button
                    key={value}
                    type="button"
                    title={label}
                    onClick={() => {
                      setSigBgColor(value);
                      regenerateSigPreviews(sigText, sigColor, value);
                    }}
                    className={`h-7 w-7 rounded-md border-2 transition ${sigBgColor === value ? "border-white scale-110" : "border-transparent"}`}
                    style={{ background: css }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => { void applySigResult(); }}
                className="rounded-full bg-[#ff4d6d] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff365a]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}

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

          {/* ── mode switch + toolbar ── */}
          <div className="border-b border-border bg-surface px-4 py-3 md:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {/* Annotate / Edit toggle */}
                <div className="rounded-full border border-border bg-surface-3/50 p-1">
                  <button
                    type="button"
                    onClick={() => { setEditorMode("annotate"); setToolMode("select"); setActiveEditTool(null); }}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${editorMode === "annotate" ? "bg-white text-[#111118] shadow-sm" : "text-[#8d8ea5] hover:text-foreground"}`}
                  >
                    Annotate
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditorMode("edit"); setToolMode("select"); setActiveEditTool(null); }}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${editorMode === "edit" ? "bg-white text-[#111118] shadow-sm" : "text-[#8d8ea5] hover:text-foreground"}`}
                  >
                    Edit
                  </button>
                </div>

                {/* Annotate mode tools */}
                {editorMode === "annotate" ? (
                  <>
                    {TOOL_OPTIONS.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          setToolMode(tool.id);
                          if (tool.id === "text") {
                            setActiveTextVariant("text");
                          }
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
                  </>
                ) : null}

                {/* Edit mode sub-tabs + tools */}
                {editorMode === "edit" ? (
                  <>
                    {EDIT_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setEditTab(tab.id);
                          /* Auto-select first tool for editText tab */
                          if (tab.id === "editText") {
                            setActiveEditTool("edit-existing");
                          } else {
                            setActiveEditTool(null);
                          }
                          setToolMode("select");
                        }}
                        className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${editTab === tab.id ? "bg-[#ff4d6d]/15 text-[#ff4d6d]" : "text-foreground/60 hover:bg-surface/70 hover:text-foreground/80"}`}
                      >
                        <span className="text-base leading-none">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </>
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

          {/* ── Edit mode: tool icons row for active sub-tab ── */}
          {editorMode === "edit" ? (
            <div className="border-b border-border bg-surface-2/50 px-4 py-2 md:px-6">
              <div className="flex flex-wrap items-center gap-1">
                {EDIT_TAB_TOOLS[editTab].map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    title={tool.title}
                    onClick={() => {
                      const deselect = activeEditTool === tool.id;
                      setActiveEditTool(deselect ? null : tool.id);
                      if (deselect) {
                        setToolMode("select");
                        return;
                      }
                      const mapping = EDIT_TOOL_CANVAS_MAP[tool.id];
                      if (mapping) {
                        setToolMode(mapping.toolMode);
                        if (mapping.shapeKind) setShapeKind(mapping.shapeKind);
                        if (mapping.shapeKind) {
                          if (shapeSupportsFill(mapping.shapeKind)) {
                            setShapePaintMode(editToolFillEnabled ? "both" : "stroke");
                          } else {
                            setShapePaintMode(mapping.paintMode ?? "stroke");
                          }
                        } else if (mapping.paintMode) {
                          setShapePaintMode(mapping.paintMode);
                        }
                        if (mapping.textAnnotation) setTextAnnotationType(mapping.textAnnotation);
                        if (mapping.drawStyle) setDrawStyle(mapping.drawStyle);
                        if (mapping.textVariant) setActiveTextVariant(mapping.textVariant);
                        /* sync edit-tool props → canvas props */
                        setToolColor(editToolColor);
                        setHighlightOpacity(editToolOpacity);
                        setBrushSize(editToolStroke * 0.001);
                        if (tool.id === "insert-stamp" && !stampAsset) {
                          openStampDesigner();
                        }
                        if (tool.id === "insert-signature") {
                          openSigDialog();
                        }
                        if (tool.id === "stamp" || tool.id === "insert-image") {
                          if (!stampAsset) stampInputRef.current?.click();
                        }
                      }
                    }}
                    className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition ${activeEditTool === tool.id ? "bg-[#ff4d6d]/20 text-[#ff4d6d] ring-1 ring-[#ff4d6d]/40" : "text-foreground/70 hover:bg-[#ff4d6d]/10 hover:text-[#ff4d6d]"}`}
                  >
                    <span className="text-lg leading-none">{tool.icon}</span>
                    <span className="text-[10px] font-medium">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* ── Edit mode: active tool properties panel ── */}
          {editorMode === "edit" && activeEditTool && !EDIT_TOOLS_NO_PROPS.has(activeEditTool) ? (
            <div className="border-b border-border bg-surface px-4 py-3 md:px-6">
              <div className="flex flex-wrap items-start gap-6">
                {/* Tool name */}
                <div className="text-sm font-semibold text-white">
                  {EDIT_TAB_TOOLS[editTab].find((t) => t.id === activeEditTool)?.label ?? "Tool"}
                </div>

                {/* Color presets */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium text-foreground/50">Color</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => { setEditToolColor(color); setToolColor(color); }}
                        className={`h-6 w-6 rounded-full border-2 transition ${editToolColor === color ? "border-white shadow-[0_0_0_2px_rgba(255,77,109,0.5)]" : "border-transparent hover:border-white/40"}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                    <input
                      type="color"
                      value={editToolColor}
                      onChange={(e) => { setEditToolColor(e.target.value); setToolColor(e.target.value); }}
                      className="h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent"
                      title="Custom color"
                    />
                  </div>
                </div>

                {/* Stroke — only for pencil, shapes, lines */}
                {EDIT_TOOL_HAS_STROKE.has(activeEditTool) ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium text-foreground/50">Stroke</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={1}
                        max={20}
                        step={1}
                        value={editToolStroke}
                        onChange={(e) => { const v = Number(e.target.value); setEditToolStroke(v); setBrushSize(v * 0.001); }}
                        className="w-24 accent-[#ff4d6d]"
                      />
                      <span className="w-8 text-right text-xs text-foreground/60">{editToolStroke}px</span>
                    </div>
                  </div>
                ) : null}

                {/* Style — for underline, strikethrough, line, arrow */}
                {EDIT_TOOL_HAS_STYLE.has(activeEditTool) ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium text-foreground/50">Style</span>
                    <select
                      className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-foreground"
                      value={editToolLineStyle}
                      onChange={(event) => setEditToolLineStyle(event.target.value as LineStyle)}
                    >
                      <option value="solid">────</option>
                      <option value="dashed">┄┄┄┄</option>
                      <option value="dotted">······</option>
                    </select>
                  </div>
                ) : null}

                {/* Fill — for shapes */}
                {EDIT_TOOL_HAS_FILL.has(activeEditTool) ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-foreground/50">Fill</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !editToolFillEnabled;
                          setEditToolFillEnabled(next);
                          setShapePaintMode(next ? "both" : "stroke");
                        }}
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold transition ${editToolFillEnabled ? "bg-[#ff4d6d] text-white" : "bg-surface-2 text-foreground/40"}`}
                      >
                        {editToolFillEnabled ? "ON" : "OFF"}
                      </button>
                    </div>
                    {editToolFillEnabled ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {COLOR_PRESETS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEditToolFill(color)}
                            className={`h-5 w-5 rounded-full border-2 transition ${editToolFill === color ? "border-white shadow-[0_0_0_2px_rgba(255,77,109,0.5)]" : "border-transparent hover:border-white/40"}`}
                            style={{ backgroundColor: color }}
                            aria-label={`Fill ${color}`}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* Opacity — always shown */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium text-foreground/50">Opacity</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={editToolOpacity}
                      onChange={(e) => { const v = Number(e.target.value); setEditToolOpacity(v); setHighlightOpacity(v); }}
                      className="w-24 accent-[#ff4d6d]"
                    />
                    <span className="w-10 text-right text-xs text-foreground/60">{Math.round(editToolOpacity * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* ── tool settings + selected item strip ── */}
          <div className="border-b border-border bg-surface px-4 py-2.5 md:px-6">
            <div className="flex flex-wrap items-start gap-4">
              {/* tool defaults */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#c3c4d6]">
                <label className="flex items-center gap-1.5">
                  <span>Brush</span>
                  <input type="range" min={0.0025} max={0.018} step={0.0005} value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} className="w-20 accent-[#ff4d6d]" />
                </label>
                <label className="flex items-center gap-1.5">
                  <span>Text size</span>
                  <input type="range" min={0.024} max={0.09} step={0.002} value={textSize} onChange={(event) => setTextSize(Number(event.target.value))} className="w-20 accent-[#ff4d6d]" />
                </label>
                <label className="flex items-center gap-1.5">
                  <span>Opacity</span>
                  <input type="range" min={0.1} max={1} step={0.01} value={highlightOpacity} onChange={(event) => setHighlightOpacity(Number(event.target.value))} className="w-20 accent-[#ff4d6d]" />
                </label>
                {toolMode === "highlight" ? (
                  <div className="flex items-center gap-1 rounded-lg border border-border bg-surface/50 p-1">
                    {shapeSupportsFill(shapeKind) ? (
                      ([
                        ["fill", "Fill"],
                        ["stroke", "Border"],
                        ["both", "Both"],
                      ] as const).map(([mode, label]) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setShapePaintMode(mode);
                            setEditToolFillEnabled(mode !== "stroke");
                          }}
                          className={`rounded-md px-2 py-1 text-[10px] font-semibold transition ${shapePaintMode === mode ? "bg-[#ff4d6d] text-white" : "text-[#d6d7e4] hover:bg-white/[0.06]"}`}
                        >
                          {label}
                        </button>
                      ))
                    ) : (
                      <span className="px-2 py-1 text-[10px] font-semibold text-[#d6d7e4]">Stroke only</span>
                    )}
                  </div>
                ) : null}
                {stampAsset ? (
                  <span className="text-[10px] text-[#9ea0b5]">Stamp: {stampAsset.name}</span>
                ) : null}
                <button
                  type="button"
                  onClick={() => stampInputRef.current?.click()}
                  className="rounded-lg border border-border bg-surface/60 px-2 py-1 text-[10px] font-semibold text-[#d9dae6] transition hover:bg-white/[0.08]"
                >
                  Upload image
                </button>
              </div>

              {/* selected item inline props */}
              {selectedOverlay ? (
                <div className="ml-auto flex flex-wrap items-center gap-3 rounded-xl border border-[#ff4d6d]/30 bg-[#ff4d6d]/5 px-3 py-1.5 text-xs text-[#c5c6d8]">
                  <span className="font-semibold text-white">{formatLayerType(selectedOverlay)}</span>
                  {selectedOverlay.type === "text" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingTextId(selectedOverlay.id)}
                        className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-white/[0.06]"
                      >
                        Edit text
                      </button>
                      <label className="flex items-center gap-1">
                        <span>Font</span>
                        <select
                          value={selectedOverlay.fontFamily}
                          onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, fontFamily: event.target.value as TextFontFamily } : item)}
                          className="rounded-md border border-border bg-surface/70 px-2 py-1 text-[10px] text-white"
                        >
                          {TEXT_FONT_OPTIONS.map((font) => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </label>
                      <label className="flex items-center gap-1">
                        <span>Fill</span>
                        <input type="color" value={selectedOverlay.color} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, color: event.target.value } : item)} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent" />
                      </label>
                      <label className="flex items-center gap-1">
                        <span>Stroke</span>
                        <input type="color" value={selectedOverlay.strokeColor} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, strokeColor: event.target.value } : item)} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent" />
                      </label>
                      <label className="flex items-center gap-1">
                        <span>Size</span>
                        <input type="range" min={0.024} max={0.09} step={0.002} value={selectedOverlay.fontSize} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, fontSize: Number(event.target.value) } : item)} className="w-16 accent-[#ff4d6d]" />
                      </label>
                      <label className="flex items-center gap-1">
                        <span>Outline</span>
                        <input type="range" min={0} max={4} step={0.25} value={selectedOverlay.strokeWidth} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, strokeWidth: Number(event.target.value) } : item)} className="w-16 accent-[#ff4d6d]" />
                      </label>
                      <label className="flex items-center gap-1">
                        <span>Opacity</span>
                        <input type="range" min={0.1} max={1} step={0.02} value={selectedOverlay.textOpacity} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, textOpacity: Number(event.target.value) } : item)} className="w-16 accent-[#ff4d6d]" />
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={selectedOverlay.bold} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, bold: event.target.checked } : item)} className="accent-[#ff4d6d]" />
                        <span>Bold</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={selectedOverlay.italic} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, italic: event.target.checked } : item)} className="accent-[#ff4d6d]" />
                        <span>Italic</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={selectedOverlay.underline} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, underline: event.target.checked } : item)} className="accent-[#ff4d6d]" />
                        <span>Underline</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={selectedOverlay.strikeout} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, strikeout: event.target.checked } : item)} className="accent-[#ff4d6d]" />
                        <span>Strike</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <span>Align</span>
                        <select
                          value={selectedOverlay.textAlign}
                          onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, textAlign: event.target.value as TextHorizontalAlign } : item)}
                          className="rounded-md border border-border bg-surface/70 px-2 py-1 text-[10px] text-white"
                        >
                          <option value="start">Start</option>
                          <option value="center">Center</option>
                          <option value="end">End</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-1">
                        <span>Vertical</span>
                        <select
                          value={selectedOverlay.verticalAlign}
                          onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, verticalAlign: event.target.value as TextVerticalAlign } : item)}
                          className="rounded-md border border-border bg-surface/70 px-2 py-1 text-[10px] text-white"
                        >
                          <option value="top">Top</option>
                          <option value="middle">Middle</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={selectedOverlay.backgroundFill ?? false} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, backgroundFill: event.target.checked, backgroundColor: (item as TextOverlay).backgroundColor ?? "#ffffff", backgroundOpacity: (item as TextOverlay).backgroundOpacity ?? 0.88 } : item)} className="accent-[#ff4d6d]" />
                        <span>BG Fill</span>
                      </label>
                      {selectedOverlay.backgroundFill ? (
                        <>
                          <input type="color" value={selectedOverlay.backgroundColor ?? "#ffffff"} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, backgroundColor: event.target.value } : item)} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent" title="Fill color" />
                          <input type="range" min={0.1} max={1} step={0.02} value={selectedOverlay.backgroundOpacity ?? 0.88} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "text" ? { ...item, backgroundOpacity: Number(event.target.value) } : item)} className="w-14 accent-[#ff4d6d]" title="Fill opacity" />
                        </>
                      ) : null}
                    </>
                  ) : null}
                  {selectedOverlay.type === "draw" ? (
                    <>
                      <label className="flex items-center gap-1">
                        <span>Color</span>
                        <input type="color" value={selectedOverlay.color} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "draw" ? { ...item, color: event.target.value } : item)} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent" />
                      </label>
                      <label className="flex items-center gap-1">
                        <span>Width</span>
                        <input type="range" min={0.0025} max={0.018} step={0.0005} value={selectedOverlay.strokeWidth} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "draw" ? { ...item, strokeWidth: Number(event.target.value) } : item)} className="w-16 accent-[#ff4d6d]" />
                      </label>
                    </>
                  ) : null}
                  {selectedOverlay.type === "highlight" ? (
                    <>
                      <label className="flex items-center gap-1">
                        <span>Stroke</span>
                        <input type="color" value={selectedOverlay.strokeColor} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "highlight" ? { ...item, strokeColor: event.target.value } : item)} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent" />
                      </label>
                      {shapeSupportsFill(selectedOverlay.shapeKind) ? (
                        <label className="flex items-center gap-1">
                          <span>Fill</span>
                          <input type="color" value={selectedOverlay.fillColor} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "highlight" ? { ...item, fillColor: event.target.value } : item)} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent" />
                        </label>
                      ) : null}
                      <label className="flex items-center gap-1">
                        <span>Opacity</span>
                        <input type="range" min={0.1} max={1} step={0.01} value={selectedOverlay.opacity} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "highlight" ? { ...item, opacity: Number(event.target.value) } : item)} className="w-16 accent-[#ff4d6d]" />
                      </label>
                      <label className="flex items-center gap-1">
                        <span>Stroke</span>
                        <input type="range" min={0.0025} max={0.018} step={0.0005} value={selectedOverlay.strokeWidth} onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "highlight" ? { ...item, strokeWidth: Number(event.target.value) } : item)} className="w-16 accent-[#ff4d6d]" />
                      </label>
                      <label className="flex items-center gap-1">
                        <span>Style</span>
                        <select
                          value={selectedOverlay.lineStyle}
                          onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "highlight" ? { ...item, lineStyle: event.target.value as LineStyle } : item)}
                          className="rounded-md border border-border bg-surface/70 px-2 py-1 text-[10px] text-white"
                        >
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                        </select>
                      </label>
                      {shapeSupportsFill(selectedOverlay.shapeKind) ? (
                        <label className="flex items-center gap-1">
                          <span>Paint</span>
                          <select
                            value={selectedOverlay.paintMode}
                            onChange={(event) => updateOverlay(selectedOverlay.id, (item) => item.type === "highlight" ? { ...item, paintMode: event.target.value as ShapePaintMode } : item)}
                            className="rounded-md border border-border bg-surface/70 px-2 py-1 text-[10px] text-white"
                          >
                            <option value="fill">Fill</option>
                            <option value="stroke">Border</option>
                            <option value="both">Both</option>
                          </select>
                        </label>
                      ) : null}
                    </>
                  ) : null}
                  {selectedOverlay.type === "image" ? (
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface/50 p-1">
                      {(["move", "resize", "crop", "readjust"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setImageEditMode(mode)}
                          className={`rounded-md px-2 py-1 text-[10px] font-semibold capitalize transition ${imageEditMode === mode ? "bg-[#ff4d6d] text-white" : "text-[#d6d7e4] hover:bg-white/[0.06]"}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => duplicateOverlay(selectedOverlay.id)}
                    className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-[#d6d7e4] transition hover:bg-white/[0.06]"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => removeOverlay(selectedOverlay.id)}
                    className="rounded-md border border-rose-400/30 px-2 py-1 text-[10px] font-semibold text-[#ffb9c5] transition hover:bg-rose-400/10"
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid min-h-[820px] xl:grid-cols-[192px_minmax(0,1fr)_280px]">
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
                      onClick={() => goToPage(pageNumber)}
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
                    className={`relative overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.2)] ${isEraserActive ? "cursor-cell" : toolMode === "draw" ? "cursor-crosshair" : toolMode === "highlight" ? "cursor-crosshair" : toolMode === "textAnnotate" ? "cursor-text" : toolMode === "text" ? "cursor-text" : toolMode === "image" ? "cursor-copy" : "cursor-default"}`}
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

                      {/* Edit Text: under construction notice */}
                      {editTab === "editText" && (
                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                          <div className="rounded-2xl border border-amber-400/30 bg-amber-950/80 px-8 py-6 text-center shadow-xl backdrop-blur-sm">
                            <div className="text-3xl">🚧</div>
                            <div className="mt-2 text-sm font-semibold text-amber-300">Under Construction</div>
                            <div className="mt-1 text-xs text-amber-200/70">Text editing is being improved</div>
                          </div>
                        </div>
                      )}

                      {/* Form field overlays */}
                      {editTab === "forms" && currentFormFields.map((field) => {
                        const isSelected = selectedFormFieldId === field.id;
                        return (
                          <div
                            key={field.id}
                            className={`absolute z-20 ${isSelected ? "ring-2 ring-[#ff4d6d]" : "ring-1 ring-blue-400/50 hover:ring-blue-400"}`}
                            style={{
                              left: `${field.x * 100}%`,
                              top: `${field.y * 100}%`,
                              width: `${field.width * 100}%`,
                              height: `${field.height * 100}%`,
                              cursor: "grab",
                            }}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setSelectedFormFieldId(field.id);
                              const editor = editorCanvasRef.current;
                              if (editor) editor.setPointerCapture(e.pointerId);
                              const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                              if (!rect) return;
                              const px = (e.clientX - rect.left) / rect.width;
                              const py = (e.clientY - rect.top) / rect.height;
                              setFormDragging({ id: field.id, offsetX: px - field.x, offsetY: py - field.y });
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              if (field.type === "checkbox") {
                                updateFormField(field.id, { checked: !field.checked });
                              } else if (field.type === "radio") {
                                /* Only one radio in a group can be checked */
                                setFormFields((prev) => prev.map((f) =>
                                  f.group === field.group && f.type === "radio" && f.pageNumber === field.pageNumber
                                    ? { ...f, checked: f.id === field.id }
                                    : f
                                ));
                              }
                            }}
                          >
                            {field.type === "signature-field" ? (
                              <div className="flex h-full w-full items-center justify-center rounded border-2 border-dashed border-gray-400 bg-white/90">
                                <span className="text-gray-400" style={{ fontSize: `${Math.max(field.height * editorHeight * 0.35, 8)}px` }}>✍ Sign here</span>
                              </div>
                            ) : field.type === "text-field" ? (
                              <div className="flex h-full w-full items-center rounded border border-gray-300 bg-white px-1 shadow-sm">
                                <span className="truncate text-gray-400" style={{ fontSize: `${Math.max(field.height * editorHeight * 0.55, 8)}px` }}>
                                  {field.value || field.label}
                                </span>
                              </div>
                            ) : field.type === "checkbox" ? (
                              <div className="flex h-full w-full items-center justify-center rounded border-2 border-gray-400 bg-white">
                                {field.checked && <span className="text-blue-600 leading-none" style={{ fontSize: `${Math.max(field.height * editorHeight * 0.7, 8)}px` }}>✓</span>}
                              </div>
                            ) : field.type === "radio" ? (
                              <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-gray-400 bg-white">
                                {field.checked && <div className="rounded-full bg-blue-600" style={{ width: "45%", height: "45%" }} />}
                              </div>
                            ) : field.type === "dropdown" ? (
                              <div className="flex h-full w-full items-center justify-between rounded border border-gray-300 bg-white px-1 shadow-sm">
                                <span className="truncate text-gray-500" style={{ fontSize: `${Math.max(field.height * editorHeight * 0.55, 8)}px` }}>
                                  {field.value || field.options[0] || field.label}
                                </span>
                                <span className="ml-0.5 text-gray-400" style={{ fontSize: `${Math.max(field.height * editorHeight * 0.5, 7)}px` }}>▾</span>
                              </div>
                            ) : field.type === "listbox" ? (
                              <div className="flex h-full w-full flex-col overflow-hidden rounded border border-gray-300 bg-white shadow-sm">
                                {field.options.map((opt, i) => {
                                  const lineH = Math.max(field.height * editorHeight / Math.max(field.options.length, 1), 14);
                                  const isChosen = field.value === opt;
                                  return (
                                    <div
                                      key={i}
                                      className={`flex items-center px-1 ${isChosen ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
                                      style={{ height: `${lineH}px`, fontSize: `${Math.max(lineH * 0.6, 7)}px` }}
                                    >
                                      <span className="truncate">{opt}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                            {/* resize handle */}
                            {isSelected && (
                              <div
                                className="absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize rounded-sm bg-[#ff4d6d] border border-white shadow"
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  const editor = editorCanvasRef.current;
                                  if (editor) editor.setPointerCapture(e.pointerId);
                                  const rect = e.currentTarget.closest("[class*='absolute inset-0']")?.getBoundingClientRect();
                                  if (!rect) return;
                                  const px = (e.clientX - rect.left) / rect.width;
                                  const py = (e.clientY - rect.top) / rect.height;
                                  setFormResizing({ id: field.id, startW: field.width, startH: field.height, startX: px, startY: py });
                                  setFormDragging(null);
                                }}
                              />
                            )}
                          </div>
                        );
                      })}

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
                            opacity: highlightOpacity,
                          }}
                        >
                          <svg className="absolute inset-0 overflow-visible" viewBox={`0 0 ${Math.max(draftHighlightBox.width * editorWidth, 1)} ${Math.max(draftHighlightBox.height * editorHeight, 1)}`} preserveAspectRatio="none">
                            {draftShapeKind === "ellipse" || draftShapeKind === "circle" ? (
                              <ellipse
                                cx={(draftHighlightBox.width * editorWidth) / 2}
                                cy={(draftHighlightBox.height * editorHeight) / 2}
                                rx={Math.max((draftHighlightBox.width * editorWidth) / 2 - getStrokePx(brushSize, editorWidth, editorHeight) / 2, 1)}
                                ry={Math.max((draftHighlightBox.height * editorHeight) / 2 - getStrokePx(brushSize, editorWidth, editorHeight) / 2, 1)}
                                fill={shapeSupportsFill(draftShapeKind) && (shapePaintMode === "fill" || shapePaintMode === "both") ? editToolFill : "transparent"}
                                stroke={shapePaintMode === "stroke" || shapePaintMode === "both" ? toolColor : "transparent"}
                                strokeWidth={getStrokePx(brushSize, editorWidth, editorHeight)}
                                strokeDasharray={getLineStyleDashArray(editToolLineStyle, getStrokePx(brushSize, editorWidth, editorHeight))}
                              />
                            ) : null}
                            {draftShapeKind === "rect" || draftShapeKind === "square" ? (
                              <rect
                                x={getStrokePx(brushSize, editorWidth, editorHeight) / 2}
                                y={getStrokePx(brushSize, editorWidth, editorHeight) / 2}
                                width={Math.max(draftHighlightBox.width * editorWidth - getStrokePx(brushSize, editorWidth, editorHeight), 1)}
                                height={Math.max(draftHighlightBox.height * editorHeight - getStrokePx(brushSize, editorWidth, editorHeight), 1)}
                                fill={shapeSupportsFill(draftShapeKind) && (shapePaintMode === "fill" || shapePaintMode === "both") ? editToolFill : "transparent"}
                                stroke={shapePaintMode === "stroke" || shapePaintMode === "both" ? toolColor : "transparent"}
                                strokeWidth={getStrokePx(brushSize, editorWidth, editorHeight)}
                                strokeDasharray={getLineStyleDashArray(editToolLineStyle, getStrokePx(brushSize, editorWidth, editorHeight))}
                              />
                            ) : null}
                            {!(draftShapeKind === "rect" || draftShapeKind === "square" || draftShapeKind === "ellipse" || draftShapeKind === "circle") ? (
                              <path
                                d={buildShapePath(draftShapeKind, Math.max(draftHighlightBox.width * editorWidth, 1), Math.max(draftHighlightBox.height * editorHeight, 1)) ?? ""}
                                fill={shapeUsesOpenPath(draftShapeKind) || !shapeSupportsFill(draftShapeKind) || shapePaintMode === "stroke" ? "none" : editToolFill}
                                stroke={shapePaintMode === "stroke" || shapePaintMode === "both" || !shapeSupportsFill(draftShapeKind) ? toolColor : "transparent"}
                                strokeWidth={getStrokePx(brushSize, editorWidth, editorHeight)}
                                strokeDasharray={getLineStyleDashArray(editToolLineStyle, getStrokePx(brushSize, editorWidth, editorHeight))}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            ) : null}
                          </svg>
                        </div>
                      ) : null}

                      {/* Live text annotation draft preview – no selection rectangle, just the ink effect */}
                      {draftTextAnnotateRects.length > 0 && draftInteraction?.type === "textAnnotate" ? (
                        <>
                          {draftTextAnnotateRects.map((rect, i) => {
                            const aType = draftInteraction.annotationType;
                            if (aType === "highlight") {
                              return (
                                <div key={i} className="pointer-events-none absolute" style={{
                                  left: `${rect.x * 100}%`, top: `${rect.y * 100}%`,
                                  width: `${rect.width * 100}%`, height: `${rect.height * 100}%`,
                                  backgroundColor: draftInteraction.color, opacity: draftInteraction.opacity * 0.35,
                                  mixBlendMode: "multiply", borderRadius: "2px",
                                }} />
                              );
                            }
                            if (aType === "underline") {
                              const lineHeight = getTextAnnotationLineHeight(rect.height);
                              return (
                                <div key={i} className="pointer-events-none absolute" style={{
                                  left: `${rect.x * 100}%`, top: `${getUnderlineTop(rect) * 100}%`,
                                  width: `${rect.width * 100}%`, height: `${lineHeight * 100}%`,
                                  backgroundColor: draftInteraction.color, opacity: draftInteraction.opacity, borderRadius: "1px",
                                }} />
                              );
                            }
                            if (aType === "squiggly") {
                              const squiggleHeight = getSquigglyHeight(rect);
                              const squiggleWidth = Math.max(rect.width * editorWidth, 1);
                              const squiggleViewHeight = Math.max(squiggleHeight * editorHeight, 1);
                              const points = buildSquigglePoints(squiggleWidth, squiggleViewHeight);
                              return (
                                <svg
                                  key={i}
                                  className="pointer-events-none absolute"
                                  viewBox={`0 0 ${Math.round(squiggleWidth)} ${Math.round(squiggleViewHeight)}`}
                                  preserveAspectRatio="none"
                                  style={{
                                    left: `${rect.x * 100}%`,
                                    top: `${getSquigglyTop(rect) * 100}%`,
                                    width: `${rect.width * 100}%`,
                                    height: `${squiggleHeight * 100}%`,
                                    overflow: "visible",
                                  }}
                                >
                                  <polyline
                                    fill="none"
                                    points={points.map((point) => `${point.x},${point.y}`).join(" ")}
                                    stroke={draftInteraction.color}
                                    strokeOpacity={draftInteraction.opacity}
                                    strokeWidth={Math.max(squiggleViewHeight * 0.25, 1.4)}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              );
                            }
                            /* strikeout */
                            return (
                              <div key={i} className="pointer-events-none absolute" style={{
                                left: `${rect.x * 100}%`, top: `${getStrikeoutTop(rect) * 100}%`,
                                width: `${rect.width * 100}%`, height: `${getTextAnnotationLineHeight(rect.height) * 100}%`,
                                backgroundColor: draftInteraction.color, opacity: draftInteraction.opacity, borderRadius: "1px",
                              }} />
                            );
                          })}
                        </>
                      ) : null}

                      {calloutPlacement && calloutPlacement.pageNumber === currentPage ? (() => {
                        const targetPx = {
                          x: calloutPlacement.target.x * editorWidth,
                          y: calloutPlacement.target.y * editorHeight,
                        };
                        const bendPx = calloutPlacement.bend
                          ? {
                              x: calloutPlacement.bend.x * editorWidth,
                              y: calloutPlacement.bend.y * editorHeight,
                            }
                          : null;
                        const endPx = {
                          x: calloutPlacement.boxCenter.x * editorWidth,
                          y: calloutPlacement.boxCenter.y * editorHeight,
                        };
                        const arrowHead = getArrowHeadPoints(bendPx ?? endPx, targetPx, 16, 7);

                        return (
                          <>
                            <svg className="pointer-events-none absolute inset-0 overflow-visible" viewBox={`0 0 ${editorWidth} ${editorHeight}`} preserveAspectRatio="none">
                              <line
                                x1={targetPx.x}
                                y1={targetPx.y}
                                x2={(bendPx ?? endPx).x}
                                y2={(bendPx ?? endPx).y}
                                stroke={toolColor}
                                strokeOpacity={0.95}
                                strokeWidth={2}
                              />
                              {bendPx ? (
                                <line
                                  x1={bendPx.x}
                                  y1={bendPx.y}
                                  x2={endPx.x}
                                  y2={endPx.y}
                                  stroke={toolColor}
                                  strokeOpacity={0.95}
                                  strokeWidth={2}
                                />
                              ) : null}
                              <line
                                x1={targetPx.x}
                                y1={targetPx.y}
                                x2={arrowHead.left.x}
                                y2={arrowHead.left.y}
                                stroke={toolColor}
                                strokeWidth={2}
                              />
                              <line
                                x1={targetPx.x}
                                y1={targetPx.y}
                                x2={arrowHead.right.x}
                                y2={arrowHead.right.y}
                                stroke={toolColor}
                                strokeWidth={2}
                              />
                              {bendPx ? (
                                <circle
                                  cx={bendPx.x}
                                  cy={bendPx.y}
                                  r={4}
                                  fill={toolColor}
                                />
                              ) : null}
                            </svg>
                          </>
                        );
                      })() : null}

                      {activeLineDraft ? (
                        <svg className="pointer-events-none absolute inset-0" viewBox={`0 0 ${editorWidth} ${editorHeight}`} preserveAspectRatio="none">
                          {(() => {
                            const strokePx = getStrokePx(brushSize, editorWidth, editorHeight);
                            const startPx = { x: activeLineDraft.lineStart.x * editorWidth, y: activeLineDraft.lineStart.y * editorHeight };
                            const endPx = { x: activeLineDraft.lineEnd.x * editorWidth, y: activeLineDraft.lineEnd.y * editorHeight };
                            const draftArrowHead = pendingLine?.shapeKind === "arrow"
                              ? getArrowHeadPoints(startPx, endPx, Math.max(strokePx * 4.8, 12), Math.max(strokePx * 1.9, 5))
                              : null;
                            const dotRadius = Math.max(strokePx * 0.75, 4.5);

                            return (
                              <>
                                <line
                                  x1={startPx.x}
                                  y1={startPx.y}
                                  x2={endPx.x}
                                  y2={endPx.y}
                                  stroke={toolColor}
                                  strokeOpacity={highlightOpacity}
                                  strokeWidth={strokePx}
                                  strokeLinecap="round"
                                  strokeDasharray={getLineStyleDashArray(editToolLineStyle, strokePx)}
                                />
                                {draftArrowHead ? (
                                  <>
                                    <line
                                      x1={endPx.x}
                                      y1={endPx.y}
                                      x2={draftArrowHead.left.x}
                                      y2={draftArrowHead.left.y}
                                      stroke={toolColor}
                                      strokeOpacity={highlightOpacity}
                                      strokeWidth={strokePx}
                                      strokeLinecap="round"
                                    />
                                    <line
                                      x1={endPx.x}
                                      y1={endPx.y}
                                      x2={draftArrowHead.right.x}
                                      y2={draftArrowHead.right.y}
                                      stroke={toolColor}
                                      strokeOpacity={highlightOpacity}
                                      strokeWidth={strokePx}
                                      strokeLinecap="round"
                                    />
                                  </>
                                ) : null}
                                <circle
                                  cx={startPx.x}
                                  cy={startPx.y}
                                  r={dotRadius}
                                  fill="#ff4d6d"
                                  stroke="#ffffff"
                                  strokeWidth={1.5}
                                />
                                <circle
                                  cx={endPx.x}
                                  cy={endPx.y}
                                  r={dotRadius}
                                  fill="#ff4d6d"
                                  stroke="#ffffff"
                                  strokeWidth={1.5}
                                />
                              </>
                            );
                          })()}
                        </svg>
                      ) : null}
                      {lineSnapTarget ? (
                        <svg className="pointer-events-none absolute inset-0" viewBox={`0 0 ${editorWidth} ${editorHeight}`} preserveAspectRatio="none">
                          <rect
                            x={lineSnapTarget.point.x * editorWidth - 8}
                            y={lineSnapTarget.point.y * editorHeight - 8}
                            width={16}
                            height={16}
                            rx={2}
                            fill="rgba(255,255,255,0.2)"
                            stroke="#ff4d6d"
                            strokeWidth={2}
                          />
                        </svg>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </main>

            <aside className="border-l border-border bg-surface p-3 md:p-4 overflow-y-auto">
              <div className="flex h-full flex-col">
                {editorMode === "edit" && activeEditTool === "insert-stamp" ? (
                  <div className="mb-4 rounded-2xl border border-border bg-surface/30 p-3">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d8ea5]">Stamps</div>
                      <div className="text-[13px] leading-relaxed text-[#c8cad8]">{stampAsset ? "Click on the page to place the stamp." : "Select a stamp below or create a new one."}</div>
                      <button
                        type="button"
                        onClick={() => openStampDesigner()}
                        className="w-full rounded-xl border border-border bg-surface/70 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.06]"
                      >
                        + Create New Stamp
                      </button>
                    </div>

                    {stampAsset ? (
                      <div className="mt-3 rounded-xl border border-[#ff4d6d]/40 bg-[#ff4d6d]/5 p-2.5">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff4d6d]">Ready to Place</div>
                        <div className="mt-1.5 overflow-hidden rounded-lg border border-black/10 bg-white p-2">
                          <img src={stampAsset.dataUrl} alt={stampAsset.name} className="max-h-20 w-full object-contain" draggable={false} />
                        </div>
                      </div>
                    ) : null}

                    {savedStamps.length > 0 ? (
                      <div className="mt-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8d8ea5]">My Stamps</div>
                        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                          {savedStamps.map((saved, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => { setStampAsset(saved); setToolMode("image"); }}
                              className={`rounded-xl border p-1.5 transition ${stampAsset?.dataUrl === saved.dataUrl ? "border-[#ff4d6d]/60 bg-[#ff4d6d]/10" : "border-border bg-surface/40 hover:border-[#ff4d6d]/30 hover:bg-white/[0.05]"}`}
                            >
                              <div className="overflow-hidden rounded-lg border border-black/10 bg-white p-1.5">
                                <img src={saved.dataUrl} alt={saved.name} className="h-12 w-full object-contain" draggable={false} />
                              </div>
                              <div className="mt-1 truncate text-center text-[10px] text-[#9b9db2]">{saved.name.replace(/\.[^.]+$/, "")}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8d8ea5]">Presets</div>
                      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                        {STAMP_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => { void applyStampPreset(preset); }}
                            className="rounded-xl border border-border bg-surface/40 p-1.5 text-left transition hover:border-[#ff4d6d]/45 hover:bg-white/[0.05]"
                          >
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border px-2 py-1.5 text-center text-xs shadow-sm" style={{
                              backgroundColor: preset.config.backgroundColor,
                              borderColor: preset.config.textColor,
                              color: preset.config.textColor,
                              fontFamily: getCssFontFamily(preset.config.fontFamily),
                              fontWeight: preset.config.bold ? 700 : 600,
                              fontStyle: preset.config.italic ? "italic" : "normal",
                              textDecoration: preset.config.underline ? "underline" : "none",
                            }}>
                              {preset.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* ── Edit Text sidebar ── */}
                {editorMode === "edit" && editTab === "editText" ? (
                  <div className="mb-4 space-y-4">
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-950/30 p-4 text-center space-y-3">
                      <div className="text-3xl">🚧</div>
                      <div className="text-sm font-semibold text-amber-300">Under Construction</div>
                      <p className="text-xs text-amber-200/60 leading-relaxed">The text editing feature is being improved to better detect and preserve original fonts, sizes and styles. Check back soon!</p>
                    </div>
                  </div>
                ) : null}

                {/* ── Forms sidebar ── */}
                {editorMode === "edit" && editTab === "forms" ? (
                  <div className="mb-4 space-y-4">
                    {/* Instructions */}
                    <div className="rounded-2xl border border-border bg-surface/30 p-3 space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d8ea5]">Form Fields</div>
                      <p className="text-xs text-muted leading-relaxed">Select a field type from the toolbar, then click on the page to place it. Drag to move, resize from the corner handle. Double-click checkboxes / radios to toggle.</p>
                    </div>

                    {/* Quick add buttons */}
                    <div className="rounded-2xl border border-border bg-surface/30 p-3 space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d8ea5]">Quick Add</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {([
                          { type: "signature-field" as FormFieldType, icon: "✍", label: "Sign" },
                          { type: "text-field" as FormFieldType, icon: "⎕", label: "Text" },
                          { type: "checkbox" as FormFieldType, icon: "☐", label: "Check" },
                          { type: "radio" as FormFieldType, icon: "○", label: "Radio" },
                          { type: "dropdown" as FormFieldType, icon: "▾", label: "Combo" },
                          { type: "listbox" as FormFieldType, icon: "☰", label: "List" },
                        ]).map((btn) => (
                          <button
                            key={btn.type}
                            type="button"
                            onClick={() => addFormField(btn.type)}
                            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface/50 px-2 py-2.5 text-[10px] text-white transition hover:border-[#ff4d6d]/50 hover:bg-[#1b1015]"
                          >
                            <span className="text-base">{btn.icon}</span>
                            <span>{btn.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selected field properties */}
                    {selectedFormFieldId && (() => {
                      const field = formFields.find((f) => f.id === selectedFormFieldId);
                      if (!field) return null;
                      const typeLabel = field.type === "signature-field" ? "Signature Field" : field.type === "text-field" ? "Text Field" : field.type === "checkbox" ? "Checkbox" : field.type === "radio" ? "Radio Button" : field.type === "dropdown" ? "Combo Box" : "List Box";
                      return (
                        <div className="rounded-2xl border border-[#ff4d6d]/40 bg-[#ff4d6d]/5 p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff4d6d]">{typeLabel}</div>
                            <button
                              type="button"
                              onClick={() => removeFormField(field.id)}
                              className="rounded-lg bg-red-500/15 px-2 py-1 text-[10px] font-semibold text-red-400 transition hover:bg-red-500/25"
                            >Delete</button>
                          </div>

                          {/* Label */}
                          <label className="block space-y-1">
                            <span className="text-[10px] text-muted">Field Name</span>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                              className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#ff4d6d]"
                            />
                          </label>

                          {/* Default value for text fields */}
                          {field.type === "text-field" && (
                            <label className="block space-y-1">
                              <span className="text-[10px] text-muted">Default Value</span>
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) => updateFormField(field.id, { value: e.target.value })}
                                className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#ff4d6d]"
                              />
                            </label>
                          )}

                          {/* Options editor for dropdown / listbox */}
                          {(field.type === "dropdown" || field.type === "listbox") && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-muted">Options</span>
                              {field.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-1">
                                  <span className="cursor-grab text-[10px] text-muted/50">⠿</span>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const newOpts = [...field.options];
                                      newOpts[i] = e.target.value;
                                      updateFormField(field.id, { options: newOpts });
                                    }}
                                    className="flex-1 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-white outline-none focus:border-[#ff4d6d]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newOpts = field.options.filter((_, j) => j !== i);
                                      updateFormField(field.id, { options: newOpts });
                                    }}
                                    className="text-[10px] text-red-400 hover:text-red-300 px-1"
                                    title="Remove option"
                                  >🗑</button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => updateFormField(field.id, { options: [...field.options, `Option ${field.options.length + 1}`] })}
                                className="flex items-center gap-1 text-[10px] text-[#ff4d6d] hover:text-[#ff6b8a] transition"
                              >
                                <span>+</span> Add Option
                              </button>
                              {/* Selected value */}
                              <label className="block space-y-1 mt-2">
                                <span className="text-[10px] text-muted">Default Selected</span>
                                <select
                                  value={field.value}
                                  onChange={(e) => updateFormField(field.id, { value: e.target.value })}
                                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-white outline-none focus:border-[#ff4d6d]"
                                >
                                  <option value="">— None —</option>
                                  {field.options.map((opt, i) => (
                                    <option key={i} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          )}

                          {/* Checked state for checkbox/radio */}
                          {(field.type === "checkbox" || field.type === "radio") && (
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={field.checked}
                                onChange={(e) => {
                                  if (field.type === "radio" && e.target.checked) {
                                    setFormFields((prev) => prev.map((f) =>
                                      f.group === field.group && f.type === "radio" && f.pageNumber === field.pageNumber
                                        ? { ...f, checked: f.id === field.id }
                                        : f
                                    ));
                                  } else {
                                    updateFormField(field.id, { checked: e.target.checked });
                                  }
                                }}
                                className="accent-[#ff4d6d]"
                              />
                              <span className="text-xs text-white">Default checked</span>
                            </label>
                          )}

                          {/* Group for radio */}
                          {field.type === "radio" && (
                            <label className="block space-y-1">
                              <span className="text-[10px] text-muted">Radio Group</span>
                              <input
                                type="text"
                                value={field.group}
                                onChange={(e) => updateFormField(field.id, { group: e.target.value })}
                                className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#ff4d6d]"
                              />
                            </label>
                          )}

                          {/* Read Only toggle */}
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.readOnly}
                              onChange={(e) => updateFormField(field.id, { readOnly: e.target.checked })}
                              className="accent-[#ff4d6d]"
                            />
                            <span className="text-xs text-white">Read Only</span>
                          </label>

                          {/* Required toggle */}
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateFormField(field.id, { required: e.target.checked })}
                              className="accent-[#ff4d6d]"
                            />
                            <span className="text-xs text-white">Required</span>
                          </label>

                          {/* Multiline toggle (text-field only) */}
                          {field.type === "text-field" && (
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={field.multiline}
                                onChange={(e) => updateFormField(field.id, { multiline: e.target.checked })}
                                className="accent-[#ff4d6d]"
                              />
                              <span className="text-xs text-white">Multiline</span>
                            </label>
                          )}

                          {/* Multi Select toggle (listbox only) */}
                          {field.type === "listbox" && (
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={field.multiSelect}
                                onChange={(e) => updateFormField(field.id, { multiSelect: e.target.checked })}
                                className="accent-[#ff4d6d]"
                              />
                              <span className="text-xs text-white">Multi Select</span>
                            </label>
                          )}

                          {/* Include Field Indicator toggle */}
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.includeIndicator}
                              onChange={(e) => updateFormField(field.id, { includeIndicator: e.target.checked })}
                              className="accent-[#ff4d6d]"
                            />
                            <span className="text-xs text-white">Include Field Indicator</span>
                          </label>

                          {/* Field Size */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-muted">Field Size</span>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 flex-1">
                                <span className="text-[10px] text-muted">W</span>
                                <input
                                  type="number"
                                  min={10}
                                  max={800}
                                  value={Math.round(field.width * 1000)}
                                  onChange={(e) => updateFormField(field.id, { width: Math.max(0.01, Math.min(1, Number(e.target.value) / 1000)) })}
                                  className="w-full rounded-lg border border-border bg-surface px-2 py-1 text-xs text-white outline-none focus:border-[#ff4d6d]"
                                />
                              </label>
                              <label className="flex items-center gap-1 flex-1">
                                <span className="text-[10px] text-muted">H</span>
                                <input
                                  type="number"
                                  min={10}
                                  max={800}
                                  value={Math.round(field.height * 1000)}
                                  onChange={(e) => updateFormField(field.id, { height: Math.max(0.01, Math.min(1, Number(e.target.value) / 1000)) })}
                                  className="w-full rounded-lg border border-border bg-surface px-2 py-1 text-xs text-white outline-none focus:border-[#ff4d6d]"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Placed form fields list */}
                    <div className="rounded-2xl border border-border bg-surface/30 p-3 space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d8ea5]">
                        Fields on Page ({currentFormFields.length})
                      </div>
                      {currentFormFields.length > 0 ? (
                        <div className="max-h-64 space-y-1 overflow-y-auto">
                          {currentFormFields.map((field) => {
                            const icon = field.type === "signature-field" ? "✍" : field.type === "text-field" ? "⎕" : field.type === "checkbox" ? "☐" : field.type === "radio" ? "○" : field.type === "dropdown" ? "▾" : "☰";
                            const typeName = field.type === "signature-field" ? "Signature Field" : field.type === "text-field" ? "Text Field" : field.type === "checkbox" ? "Checkbox" : field.type === "radio" ? "Radio" : field.type === "dropdown" ? "Combo Box" : "List Box";
                            return (
                              <button
                                key={field.id}
                                type="button"
                                onClick={() => setSelectedFormFieldId(selectedFormFieldId === field.id ? null : field.id)}
                                className={`w-full rounded-xl border px-2.5 py-2 text-left text-xs transition ${
                                  selectedFormFieldId === field.id
                                    ? "border-[#ff4d6d]/60 bg-[#ff4d6d]/10 text-white"
                                    : "border-border bg-surface/40 text-[#c8cad8] hover:bg-surface/60"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{icon}</span>
                                  <span className="truncate">{field.label}</span>
                                </div>
                                <div className="mt-0.5 text-[10px] text-muted">
                                  {typeName}
                                  {field.required ? " · Required" : ""}
                                  {field.type === "radio" ? ` · ${field.group}` : ""}
                                  {(field.type === "dropdown" || field.type === "listbox") ? ` · ${field.options.length} options` : ""}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border px-3 py-4 text-xs text-muted text-center">
                          No form fields on this page. Click toolbar or &quot;Quick Add&quot; to place one.
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    {formFields.length > 0 && (
                      <div className="text-[10px] text-muted text-center">
                        {formFields.length} total field{formFields.length !== 1 ? "s" : ""} across all pages
                      </div>
                    )}
                  </div>
                ) : null}

                <div>
                  <h3 className="text-2xl font-semibold text-white">Layers</h3>
                  <div className="mt-1 text-sm text-[#9b9db2]">Page {currentPage}</div>
                </div>

                <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto">
                  {currentLayers.length ? (
                    [...currentLayers].reverse().map((layer) => (
                      <div
                        key={layer.id}
                        className={`rounded-2xl border p-3 transition ${selectedOverlayId === layer.id ? "border-[#ff4d6d]/70 bg-[#1b1015]" : "border-border bg-surface/30 hover:border-border-strong"}`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (layer.type === "draw") return;
                            setSelectedOverlayId(layer.id);
                          }}
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
                          {layer.type !== "draw" ? (
                            <>
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
                                onClick={() => duplicateOverlay(layer.id)}
                                className="rounded-full border border-border px-3 py-1 text-xs text-[#c9cada] transition hover:bg-white/[0.06]"
                              >
                                Duplicate
                              </button>
                            </>
                          ) : null}
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
                      No layers yet. Choose a tool, then click or drag on the page canvas.
                    </div>
                  )}
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
