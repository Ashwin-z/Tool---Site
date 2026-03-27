"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { downloadBlob, formatBytes, sanitizeBaseName } from "@/lib/client-pdf-utils";

/* ─────────────── types ─────────────── */

type PageBox = { width: number; height: number };

type LoadedPdf = {
  file: File;
  bytes: ArrayBuffer;
  pageCount: number;
  pageBoxes: PageBox[];
};

type FieldType = "signature" | "initials" | "name" | "date" | "text" | "stamp"
  | "sig-field" | "text-field" | "checkbox-field" | "radio-field" | "listbox-field" | "combobox-field";

type FieldItem = {
  id: string;
  type: FieldType;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  /* form-field properties */
  readOnly?: boolean;
  required?: boolean;
  includeIndicator?: boolean;
  multiline?: boolean;
  multiSelect?: boolean;
  options?: string[];
  defaultValue?: string;
  signerId?: string;
};

type CornerHandle = "nw" | "ne" | "sw" | "se";

type MoveDraft = {
  kind: "move";
  fieldId: string;
  startPointer: { x: number; y: number };
  originX: number;
  originY: number;
};

type ResizeDraft = {
  kind: "resize";
  fieldId: string;
  handle: CornerHandle;
  startPointer: { x: number; y: number };
  startX: number;
  startY: number;
  startW: number;
  startH: number;
};

type Interaction = MoveDraft | ResizeDraft | null;

type SignatureTarget = "signature" | "initials" | "stamp";
type SigTab = "type" | "draw" | "upload";

type SignerInfo = {
  id: string;
  name: string;
  initials: string;
  color: string;
  signatureDataUrl: string;
  initialsDataUrl: string;
  stampDataUrl: string;
};

type PreviewMap = Record<number, string>;
type LoadingMap = Record<number, boolean>;

type PdfJsViewport = { width: number; height: number };
type PdfJsPage = {
  getViewport: (o: { scale: number }) => PdfJsViewport;
  render: (o: { canvasContext: CanvasRenderingContext2D; viewport: PdfJsViewport }) => { promise: Promise<void> };
};
type PdfJsDocument = { getPage: (n: number) => Promise<PdfJsPage> };
type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (o: { data: ArrayBuffer }) => { promise: Promise<PdfJsDocument> };
};

/* ─────────────── constants ─────────────── */

const MIN_FIELD_W = 0.06;
const MAX_FIELD_W = 0.65;
const MIN_FIELD_H = 0.025;
const MAX_FIELD_H = 0.45;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const BASE_WIDTH = 720;

const SIGNATURE_FONTS = [
  { label: "Dancing Script", family: "'Dancing Script', cursive" },
  { label: "Great Vibes", family: "'Great Vibes', cursive" },
  { label: "Pacifico", family: "'Pacifico', cursive" },
  { label: "Caveat", family: "'Caveat', cursive" },
];

const SIG_COLORS = [
  { hex: "#000000", label: "Black" },
  { hex: "#d32f2f", label: "Red" },
  { hex: "#1565c0", label: "Blue" },
  { hex: "#2e7d32", label: "Green" },
];

const SIGNER_COLORS = ["#ff4d6d", "#4d9fff", "#38c97a", "#ff9f4d", "#b84dff", "#00bcd4", "#ff6e40", "#7c4dff"];

const FIELD_META: Record<FieldType, { w: number; h: number; label: string; icon: string }> = {
  signature: { w: 0.24, h: 0.07, label: "Signature", icon: "✍️" },
  initials: { w: 0.10, h: 0.06, label: "Initials", icon: "🔤" },
  name: { w: 0.22, h: 0.035, label: "Name", icon: "👤" },
  date: { w: 0.16, h: 0.035, label: "Date", icon: "📅" },
  text: { w: 0.22, h: 0.035, label: "Text", icon: "📝" },
  stamp: { w: 0.14, h: 0.12, label: "Company Stamp", icon: "🏢" },
  "sig-field": { w: 0.24, h: 0.055, label: "Signature Field", icon: "🖊️" },
  "text-field": { w: 0.24, h: 0.04, label: "Text Field", icon: "📄" },
  "checkbox-field": { w: 0.04, h: 0.04, label: "Checkbox", icon: "☑️" },
  "radio-field": { w: 0.04, h: 0.04, label: "Radio Button", icon: "🔘" },
  "listbox-field": { w: 0.24, h: 0.12, label: "List Box", icon: "📋" },
  "combobox-field": { w: 0.24, h: 0.04, label: "Combo Box", icon: "🔽" },
};

const FORM_FIELD_TYPES: FieldType[] = ["sig-field", "text-field", "checkbox-field", "radio-field", "listbox-field", "combobox-field"];

/* ─────────────── helpers ─────────────── */

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function hexToRgb(hex: string) {
  const c = hex.replace("#", "");
  const n = c.length === 3 ? c.split("").map((p) => p + p).join("") : c;
  const v = parseInt(n, 16);
  return rgb(((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255);
}

function getPageAspect(box?: PageBox) {
  if (!box || !box.width || !box.height) return 1 / 1.414;
  return box.width / box.height;
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const [, b64 = ""] = dataUrl.split(",");
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

/* ─────────────── pdf.js loader ─────────────── */

let pdfjsPromise: Promise<PdfJsModule> | null = null;

function getPdfjs() {
  if (!pdfjsPromise) {
    const imp = new Function("u", "return import(u)") as (u: string) => Promise<PdfJsModule>;
    pdfjsPromise = imp("/vendor/pdfjs/pdf.mjs").then((m) => {
      if (!m.GlobalWorkerOptions.workerSrc) m.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
      return m;
    });
  }
  return pdfjsPromise;
}

async function renderPagePreview(bytes: ArrayBuffer, page: number, scale = 1.15) {
  const pdfjs = await getPdfjs();
  const doc = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  const pg = await doc.getPage(page);
  const vp = pg.getViewport({ scale });
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  c.width = Math.ceil(vp.width);
  c.height = Math.ceil(vp.height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  await pg.render({ canvasContext: ctx, viewport: vp } as never).promise;
  return c.toDataURL("image/png", 0.92);
}

async function loadPdf(file: File): Promise<LoadedPdf> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  return {
    file,
    bytes,
    pageCount: doc.getPageCount(),
    pageBoxes: doc.getPages().map((p) => ({ width: p.getWidth(), height: p.getHeight() })),
  };
}

/* ─────────────── font loading ─────────────── */

let fontsLoaded = false;

function ensureSignatureFonts(): Promise<void> {
  if (fontsLoaded) return Promise.resolve();
  return new Promise<void>((resolve) => {
    if (document.getElementById("__sign-pdf-fonts")) {
      fontsLoaded = true;
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.id = "__sign-pdf-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Caveat&family=Dancing+Script&family=Great+Vibes&family=Pacifico&display=swap";
    link.onload = () => {
      fontsLoaded = true;
      document.fonts.ready.then(() => resolve());
    };
    link.onerror = () => {
      fontsLoaded = true;
      resolve();
    };
    document.head.appendChild(link);
  });
}

function renderTextToDataUrl(
  text: string,
  fontFamily: string,
  color: string,
  fontSize = 48,
): string {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  ctx.font = `${fontSize}px ${fontFamily}`;
  const m = ctx.measureText(text);
  const w = Math.ceil(m.width) + 24;
  const h = fontSize + 24;
  c.width = w;
  c.height = h;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 12, h / 2);
  return c.toDataURL("image/png");
}

/* ─────────────── resize helper ─────────────── */

function resizeField(
  sx: number, sy: number, sw: number, sh: number,
  handle: CornerHandle, dx: number, dy: number,
) {
  let x = sx, y = sy, w = sw, h = sh;
  if (handle === "nw" || handle === "sw") { x = clamp(sx + dx, 0, sx + sw - MIN_FIELD_W); w = sw + (sx - x); }
  if (handle === "ne" || handle === "se") { w = clamp(sw + dx, MIN_FIELD_W, MAX_FIELD_W); }
  if (handle === "nw" || handle === "ne") { y = clamp(sy + dy, 0, sy + sh - MIN_FIELD_H); h = sh + (sy - y); }
  if (handle === "sw" || handle === "se") { h = clamp(sh + dy, MIN_FIELD_H, MAX_FIELD_H); }
  w = clamp(w, MIN_FIELD_W, MAX_FIELD_W);
  h = clamp(h, MIN_FIELD_H, MAX_FIELD_H);
  x = clamp(x, 0, 1 - w);
  y = clamp(y, 0, 1 - h);
  return { x, y, width: w, height: h };
}

/* ═══════════════ component ═══════════════ */

export default function SignPdfTool() {
  /* ── pdf state ── */
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [signerMode, setSignerMode] = useState<"choose" | "single" | "multi">("choose");
  const [currentPage, setCurrentPage] = useState(1);
  const [thumbnailUrls, setThumbnailUrls] = useState<PreviewMap>({});
  const [thumbLoading, setThumbLoading] = useState<LoadingMap>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [zoom, setZoom] = useState(1);

  /* ── fields ── */
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [interaction, setInteraction] = useState<Interaction>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  /* ── field background toggle ── */
  const [showFieldBg, setShowFieldBg] = useState(true);

  /* ── undo / redo ── */
  const undoStack = useRef<FieldItem[][]>([]);
  const redoStack = useRef<FieldItem[][]>([]);
  const skipHistoryRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  /* ── signer data ── */
  const [signerName, setSignerName] = useState("");
  const [signerInitials, setSignerInitials] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [initialsDataUrl, setInitialsDataUrl] = useState("");
  const [stampDataUrl, setStampDataUrl] = useState("");

  /* ── signature dialog ── */
  const [showSigDialog, setShowSigDialog] = useState(false);
  const [sigTarget, setSigTarget] = useState<SignatureTarget>("signature");
  const [sigTab, setSigTab] = useState<SigTab>("type");
  const [sigColor, setSigColor] = useState("#000000");
  const [selectedFontIdx, setSelectedFontIdx] = useState(0);
  const [fontPreviews, setFontPreviews] = useState<string[]>([]);
  const [uploadedSigUrl, setUploadedSigUrl] = useState("");

  /* ── form field properties dialog ── */
  const [showFieldProps, setShowFieldProps] = useState(false);

  /* ── misc ── */
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ── multi-signer ── */
  const [signers, setSigners] = useState<SignerInfo[]>([]);
  const [currentSignerIdx, setCurrentSignerIdx] = useState(0);
  const [multiSetupDone, setMultiSetupDone] = useState(false);

  const switchSigner = useCallback((idx: number) => {
    if (idx === currentSignerIdx) return;
    /* save current signer data back */
    setSigners((prev) => prev.map((s, i) => i === currentSignerIdx ? {
      ...s,
      name: signerName,
      initials: signerInitials,
      signatureDataUrl,
      initialsDataUrl,
      stampDataUrl,
    } : s));
    /* load new signer data */
    const next = signers[idx];
    if (next) {
      setSignerName(next.name);
      setSignerInitials(next.initials);
      setSignatureDataUrl(next.signatureDataUrl);
      setInitialsDataUrl(next.initialsDataUrl);
      setStampDataUrl(next.stampDataUrl);
    }
    setCurrentSignerIdx(idx);
    setSelectedFieldId(null);
  }, [currentSignerIdx, signerName, signerInitials, signatureDataUrl, initialsDataUrl, stampDataUrl, signers]);

  /* ── refs ── */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigUploadRef = useRef<HTMLInputElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);
  const prevTokenRef = useRef(0);
  const thumbTokenRef = useRef(0);

  /* ── derived ── */
  const pageNumbers = useMemo(() => (pdf ? Array.from({ length: pdf.pageCount }, (_, i) => i + 1) : []), [pdf]);
  const currentBox = pdf?.pageBoxes[currentPage - 1];
  const aspect = getPageAspect(currentBox);
  const editorW = Math.round(BASE_WIDTH * zoom);
  const editorH = Math.round(editorW / aspect);
  const currentFields = useMemo(() => fields.filter((f) => f.pageNumber === currentPage), [fields, currentPage]);
  const selectedField = useMemo(() => fields.find((f) => f.id === selectedFieldId) ?? null, [fields, selectedFieldId]);

  /* ════════ undo / redo logic ════════ */

  const prevFieldsRef = useRef<FieldItem[]>([]);

  useEffect(() => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      prevFieldsRef.current = fields;
      return;
    }
    if (prevFieldsRef.current !== fields && prevFieldsRef.current !== undefined) {
      undoStack.current = [...undoStack.current, prevFieldsRef.current].slice(-50);
      redoStack.current = [];
      setCanUndo(true);
      setCanRedo(false);
    }
    prevFieldsRef.current = fields;
  }, [fields]);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current[undoStack.current.length - 1];
    undoStack.current = undoStack.current.slice(0, -1);
    redoStack.current = [...redoStack.current, fields];
    skipHistoryRef.current = true;
    setFields(prev);
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  }, [fields]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current[redoStack.current.length - 1];
    redoStack.current = redoStack.current.slice(0, -1);
    undoStack.current = [...undoStack.current, fields];
    skipHistoryRef.current = true;
    setFields(next);
    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
  }, [fields]);

  /* Ctrl+Z / Ctrl+Y keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  /* ════════ PDF loading ════════ */

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") { setErrorMsg("Please upload a PDF file."); return; }
    try {
      setErrorMsg(null);
      const loaded = await loadPdf(file);
      setPdf(loaded);
      setCurrentPage(1);
      setFields([]);
      setSelectedFieldId(null);
      setSignerMode("choose");
      setZoom(1);
    } catch {
      setErrorMsg("Failed to load the PDF.");
    }
  }, []);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  }, [handleFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  /* ════════ thumbnails + preview ════════ */

  useEffect(() => {
    if (!pdf) return;
    const token = ++thumbTokenRef.current;
    (async () => {
      for (const pg of pageNumbers) {
        if (token !== thumbTokenRef.current) return;
        setThumbLoading((p) => ({ ...p, [pg]: true }));
        try {
          const url = await renderPagePreview(pdf.bytes, pg, 0.4);
          if (token === thumbTokenRef.current) setThumbnailUrls((p) => ({ ...p, [pg]: url }));
        } catch { /* skip */ }
        setThumbLoading((p) => ({ ...p, [pg]: false }));
      }
    })();
  }, [pdf, pageNumbers]);

  useEffect(() => {
    if (!pdf) return;
    const token = ++prevTokenRef.current;
    setPreviewLoading(true);
    renderPagePreview(pdf.bytes, currentPage, 1.5)
      .then((url) => { if (token === prevTokenRef.current) setPreviewUrl(url); })
      .catch(() => {})
      .finally(() => { if (token === prevTokenRef.current) setPreviewLoading(false); });
  }, [pdf, currentPage]);

  /* ════════ zoom ════════ */

  const applyZoom = useCallback((v: number) => setZoom(clamp(+v.toFixed(2), MIN_ZOOM, MAX_ZOOM)), []);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      applyZoom(zoom + (e.deltaY < 0 ? 0.1 : -0.1));
    };
    vp.addEventListener("wheel", handler, { passive: false });
    return () => vp.removeEventListener("wheel", handler);
  }, [applyZoom, zoom]);

  /* ════════ field management ════════ */

  const addField = useCallback((type: FieldType) => {
    const meta = FIELD_META[type];
    let value = "";
    if (type === "name") value = signerName || "Your Name";
    if (type === "date") value = todayString();
    if (type === "text") value = "Text";
    if (type === "signature") value = signatureDataUrl;
    if (type === "initials") value = initialsDataUrl;
    if (type === "stamp") value = stampDataUrl;

    const id = uid();
    const isForm = FORM_FIELD_TYPES.includes(type);
    const field: FieldItem = {
      id,
      type,
      pageNumber: currentPage,
      x: 0.3,
      y: 0.4,
      width: meta.w,
      height: meta.h,
      value,
      ...(signerMode === "multi" ? { signerId: signers[currentSignerIdx]?.id } : {}),
      ...(isForm ? {
        readOnly: false,
        required: false,
        includeIndicator: false,
        ...(type === "text-field" ? { multiline: false, defaultValue: "" } : {}),
        ...(type === "listbox-field" ? { multiSelect: false, options: ["Option 1", "Option 2", "Option 3"] } : {}),
        ...(type === "combobox-field" ? { options: ["Option 1", "Option 2", "Option 3"] } : {}),
      } : {}),
    };
    setFields((prev) => [...prev, field]);
    setSelectedFieldId(id);

    if ((type === "signature" && !signatureDataUrl) || (type === "initials" && !initialsDataUrl) || (type === "stamp" && !stampDataUrl)) {
      setSigTarget(type === "stamp" ? "stamp" : type === "initials" ? "initials" : "signature");
      setSigTab(type === "stamp" ? "upload" : "type");
      setShowSigDialog(true);
    }
    if (isForm) {
      setShowFieldProps(true);
    }
  }, [currentPage, signerName, signatureDataUrl, initialsDataUrl, stampDataUrl, signerMode, signers, currentSignerIdx]);

  const removeField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  }, [selectedFieldId]);

  const updateFieldValue = useCallback((id: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  }, []);

  const updateFieldProp = useCallback((id: string, key: keyof FieldItem, val: unknown) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
  }, []);

  const addFieldOption = useCallback((id: string) => {
    setFields((prev) => prev.map((f) => {
      if (f.id !== id) return f;
      const opts = [...(f.options || []), `Option ${(f.options?.length || 0) + 1}`];
      return { ...f, options: opts };
    }));
  }, []);

  const removeFieldOption = useCallback((id: string, idx: number) => {
    setFields((prev) => prev.map((f) => {
      if (f.id !== id) return f;
      const opts = [...(f.options || [])];
      opts.splice(idx, 1);
      return { ...f, options: opts };
    }));
  }, []);

  const updateFieldOption = useCallback((id: string, idx: number, val: string) => {
    setFields((prev) => prev.map((f) => {
      if (f.id !== id) return f;
      const opts = [...(f.options || [])];
      opts[idx] = val;
      return { ...f, options: opts };
    }));
  }, []);

  /* ════════ pointer interaction ════════ */

  const getPoint = useCallback((e: ReactPointerEvent<HTMLElement>): { x: number; y: number } => {
    const r = (editorRef.current ?? e.currentTarget).getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / r.width, 0, 1), y: clamp((e.clientY - r.top) / r.height, 0, 1) };
  }, []);

  const onFieldPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>, fieldId: string) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setSelectedFieldId(fieldId);
    setEditingFieldId(null);
    const f = fields.find((x) => x.id === fieldId);
    if (!f) return;
    const pt = getPoint(e);
    setInteraction({ kind: "move", fieldId, startPointer: pt, originX: f.x, originY: f.y });
  }, [fields, getPoint]);

  const onHandlePointerDown = useCallback((e: ReactPointerEvent<HTMLElement>, fieldId: string, handle: CornerHandle) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const f = fields.find((x) => x.id === fieldId);
    if (!f) return;
    const pt = getPoint(e);
    setInteraction({ kind: "resize", fieldId, handle, startPointer: pt, startX: f.x, startY: f.y, startW: f.width, startH: f.height });
  }, [fields, getPoint]);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!interaction) return;
    const pt = getPoint(e);
    if (interaction.kind === "move") {
      const dx = pt.x - interaction.startPointer.x;
      const dy = pt.y - interaction.startPointer.y;
      const f = fields.find((x) => x.id === interaction.fieldId);
      if (!f) return;
      const nx = clamp(interaction.originX + dx, 0, 1 - f.width);
      const ny = clamp(interaction.originY + dy, 0, 1 - f.height);
      setFields((prev) => prev.map((x) => (x.id === interaction.fieldId ? { ...x, x: nx, y: ny } : x)));
    } else if (interaction.kind === "resize") {
      const dx = pt.x - interaction.startPointer.x;
      const dy = pt.y - interaction.startPointer.y;
      const r = resizeField(interaction.startX, interaction.startY, interaction.startW, interaction.startH, interaction.handle, dx, dy);
      setFields((prev) => prev.map((x) => (x.id === interaction.fieldId ? { ...x, ...r } : x)));
    }
  }, [interaction, fields, getPoint]);

  const onPointerUp = useCallback(() => { setInteraction(null); }, []);

  const onCanvasClick = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (e.target === editorRef.current || e.target === e.currentTarget) {
      setSelectedFieldId(null);
      setEditingFieldId(null);
    }
  }, []);

  /* ════════ keyboard ════════ */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedFieldId && !editingFieldId) {
        removeField(selectedFieldId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedFieldId, editingFieldId, removeField]);

  /* ════════ signature dialog ════════ */

  const openSigDialog = useCallback((target: SignatureTarget) => {
    setSigTarget(target);
    setSigTab(target === "stamp" ? "upload" : "type");
    setUploadedSigUrl("");
    setShowSigDialog(true);
    ensureSignatureFonts().then(() => {
      const text = target === "initials" ? (signerInitials || "AK") : (signerName || "Your Name");
      setFontPreviews(SIGNATURE_FONTS.map((f) => renderTextToDataUrl(text, f.family, sigColor)));
    });
  }, [signerName, signerInitials, sigColor]);

  /* regenerate font previews when name/color changes inside dialog */
  const regeneratePreviews = useCallback((name: string, initials: string, color: string, target: SignatureTarget) => {
    const text = target === "initials" ? (initials || "AK") : (name || "Your Name");
    ensureSignatureFonts().then(() => {
      setFontPreviews(SIGNATURE_FONTS.map((f) => renderTextToDataUrl(text, f.family, color)));
    });
  }, []);

  const applySigDialogResult = useCallback(() => {
    let dataUrl = "";
    if (sigTab === "type" && fontPreviews[selectedFontIdx]) {
      dataUrl = fontPreviews[selectedFontIdx];
    } else if (sigTab === "upload" && uploadedSigUrl) {
      dataUrl = uploadedSigUrl;
    } else if (sigTab === "draw" && drawCanvasRef.current) {
      dataUrl = drawCanvasRef.current.toDataURL("image/png");
    }
    if (!dataUrl) return;

    if (sigTarget === "signature") {
      setSignatureDataUrl(dataUrl);
      if (signerMode === "multi") {
        const sid = signers[currentSignerIdx]?.id;
        setSigners((prev) => prev.map((s, i) => i === currentSignerIdx ? { ...s, signatureDataUrl: dataUrl } : s));
        setFields((prev) => prev.map((f) => (f.type === "signature" && f.signerId === sid ? { ...f, value: dataUrl } : f)));
      } else {
        setFields((prev) => prev.map((f) => (f.type === "signature" ? { ...f, value: dataUrl } : f)));
      }
    } else if (sigTarget === "initials") {
      setInitialsDataUrl(dataUrl);
      if (signerMode === "multi") {
        const sid = signers[currentSignerIdx]?.id;
        setSigners((prev) => prev.map((s, i) => i === currentSignerIdx ? { ...s, initialsDataUrl: dataUrl } : s));
        setFields((prev) => prev.map((f) => (f.type === "initials" && f.signerId === sid ? { ...f, value: dataUrl } : f)));
      } else {
        setFields((prev) => prev.map((f) => (f.type === "initials" ? { ...f, value: dataUrl } : f)));
      }
    } else {
      setStampDataUrl(dataUrl);
      if (signerMode === "multi") {
        const sid = signers[currentSignerIdx]?.id;
        setSigners((prev) => prev.map((s, i) => i === currentSignerIdx ? { ...s, stampDataUrl: dataUrl } : s));
        setFields((prev) => prev.map((f) => (f.type === "stamp" && f.signerId === sid ? { ...f, value: dataUrl } : f)));
      } else {
        setFields((prev) => prev.map((f) => (f.type === "stamp" ? { ...f, value: dataUrl } : f)));
      }
    }
    setShowSigDialog(false);
  }, [sigTab, fontPreviews, selectedFontIdx, uploadedSigUrl, sigTarget, signerMode, signers, currentSignerIdx]);

  /* ── draw canvas helpers ── */

  const clearDrawCanvas = useCallback(() => {
    const c = drawCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (ctx) { ctx.clearRect(0, 0, c.width, c.height); }
  }, []);

  const onDrawPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = drawCanvasRef.current;
    if (!c) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const r = c.getBoundingClientRect();
    lastPtRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);

  const onDrawPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const c = drawCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const r = c.getBoundingClientRect();
    const scaleX = c.width / r.width;
    const scaleY = c.height / r.height;
    const pt = { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
    const last = lastPtRef.current;
    if (last) {
      ctx.strokeStyle = sigColor;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(last.x * scaleX, last.y * scaleY);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    lastPtRef.current = { x: pt.x / scaleX, y: pt.y / scaleY };
  }, [sigColor]);

  const onDrawPointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastPtRef.current = null;
  }, []);

  /* ── pre-populate draw canvas with existing signature ── */
  useEffect(() => {
    if (!showSigDialog || sigTab !== "draw") return;
    const existingUrl = sigTarget === "signature" ? signatureDataUrl
      : sigTarget === "initials" ? initialsDataUrl : "";
    if (!existingUrl) return;
    /* Wait a tick for the canvas to mount */
    const timer = setTimeout(() => {
      const c = drawCanvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, c.width, c.height);
        const scale = Math.min(c.width / img.width, c.height / img.height, 1);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
      };
      img.src = existingUrl;
    }, 50);
    return () => clearTimeout(timer);
  }, [showSigDialog, sigTab, sigTarget, signatureDataUrl, initialsDataUrl]);

  /* ── upload signature image ── */
  const onSigUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedSigUrl(String(reader.result));
    reader.readAsDataURL(f);
    e.target.value = "";
  }, []);

  /* ════════ export ════════ */

  const signAndDownload = useCallback(async () => {
    if (!pdf || fields.length === 0) return;
    setProcessing(true);
    setErrorMsg(null);

    /* In multi mode, save current signer data before exporting */
    if (signerMode === "multi") {
      setSigners((prev) => prev.map((s, i) => i === currentSignerIdx ? {
        ...s, name: signerName, initials: signerInitials,
        signatureDataUrl, initialsDataUrl, stampDataUrl,
      } : s));
    }

    try {
      const doc = await PDFDocument.load(pdf.bytes.slice(0));
      const pages = doc.getPages();

      for (const field of fields) {
        const page = pages[field.pageNumber - 1];
        if (!page) continue;
        const pw = page.getWidth();
        const ph = page.getHeight();
        const fx = field.x * pw;
        const fy = ph - (field.y + field.height) * ph;
        const fw = field.width * pw;
        const fh = field.height * ph;

        if (field.type === "signature" || field.type === "initials" || field.type === "stamp") {
          if (!field.value) continue;
          /* Ensure the image is always a proper PNG data-url pdf-lib can embed */
          let pngDataUrl = field.value;
          if (!pngDataUrl.startsWith("data:image/png")) {
            /* Re-draw onto a canvas to normalise JPEG / other formats to PNG */
            const tmpImg = await new Promise<HTMLImageElement>((res, rej) => {
              const im = new Image();
              im.onload = () => res(im);
              im.onerror = () => rej(new Error("Image load failed"));
              im.src = pngDataUrl;
            });
            const tmpC = document.createElement("canvas");
            tmpC.width = tmpImg.naturalWidth || tmpImg.width;
            tmpC.height = tmpImg.naturalHeight || tmpImg.height;
            const tmpCtx = tmpC.getContext("2d")!;
            tmpCtx.drawImage(tmpImg, 0, 0);
            pngDataUrl = tmpC.toDataURL("image/png");
          }
          const imgBytes = dataUrlToUint8Array(pngDataUrl);
          const img = await doc.embedPng(imgBytes);
          page.drawImage(img, { x: fx, y: fy, width: fw, height: fh });
        } else if (FORM_FIELD_TYPES.includes(field.type)) {
          /* ── create interactive PDF form fields ── */
          const form = doc.getForm();
          const fieldName = `${field.type}_${field.id}`;
          const rect = { x: fx, y: fy, width: fw, height: fh };

          if (field.type === "sig-field") {
            /* pdf-lib doesn't natively create signature form fields, so draw a visual placeholder */
            const borderColor = field.includeIndicator ? rgb(0, 0.4, 0.9) : rgb(0.6, 0.6, 0.6);
            page.drawRectangle({ x: fx, y: fy, width: fw, height: fh, borderColor, borderWidth: 1, color: rgb(0.95, 0.97, 1), opacity: 0.5 });
            const sigFontSize = Math.max(7, Math.min(fh * 0.35, 14));
            page.drawText("Sign here", { x: fx + 4, y: fy + fh * 0.3, size: sigFontSize, color: rgb(0.4, 0.4, 0.4) });
          } else if (field.type === "text-field") {
            const tf = form.createTextField(fieldName);
            tf.addToPage(page, rect);
            if (field.defaultValue) tf.setText(field.defaultValue);
            if (field.readOnly) tf.enableReadOnly();
            if (field.required) tf.enableRequired();
            if (field.multiline) tf.enableMultiline();
          } else if (field.type === "checkbox-field") {
            const cb = form.createCheckBox(fieldName);
            cb.addToPage(page, rect);
            if (field.readOnly) cb.enableReadOnly();
            if (field.required) cb.enableRequired();
          } else if (field.type === "radio-field") {
            const rg = form.createRadioGroup(fieldName);
            rg.addOptionToPage(`opt_${field.id}`, page, rect);
            if (field.readOnly) rg.enableReadOnly();
            if (field.required) rg.enableRequired();
          } else if (field.type === "listbox-field") {
            const ol = form.createOptionList(fieldName);
            ol.addToPage(page, rect);
            if (field.options?.length) ol.setOptions(field.options);
            if (field.readOnly) ol.enableReadOnly();
            if (field.required) ol.enableRequired();
            if (field.multiSelect) ol.enableMultiselect();
          } else if (field.type === "combobox-field") {
            const dd = form.createDropdown(fieldName);
            dd.addToPage(page, rect);
            if (field.options?.length) dd.setOptions(field.options);
            if (field.readOnly) dd.enableReadOnly();
            if (field.required) dd.enableRequired();
          }

          /* draw indicator border if enabled (except sig-field which already has one) */
          if (field.includeIndicator && field.type !== "sig-field") {
            page.drawRectangle({ x: fx, y: fy, width: fw, height: fh, borderColor: rgb(0, 0.4, 0.9), borderWidth: 1.5 });
          }
        } else {
          const text = field.value || "";
          if (!text.trim()) continue;
          const fontSize = Math.max(8, Math.min(fh * 0.7, 36));
          /* pdf-lib drawText can fail on certain chars — filter to Latin-safe set */
          const safeText = text.replace(/[^\x20-\x7E]/g, "");
          if (!safeText.trim()) continue;
          page.drawText(safeText, {
            x: fx + 4,
            y: fy + fh * 0.25,
            size: fontSize,
            color: hexToRgb("#000000"),
          });
        }
      }

      const saved = new Uint8Array(await doc.save());
      downloadBlob(
        new Blob([saved], { type: "application/pdf" }),
        `${sanitizeBaseName(pdf.file.name)}-signed.pdf`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
      setErrorMsg(`Export failed: ${msg}`);
    } finally {
      setProcessing(false);
    }
  }, [pdf, fields, signerMode, currentSignerIdx, signerName, signerInitials, signatureDataUrl, initialsDataUrl, stampDataUrl]);

  /* ════════ render helpers ════════ */

  const renderFieldOverlay = (field: FieldItem) => {
    const isSelected = field.id === selectedFieldId;
    const isEditing = field.id === editingFieldId;
    const isImage = field.type === "signature" || field.type === "initials" || field.type === "stamp";
    const isFormField = FORM_FIELD_TYPES.includes(field.type);
    const signerColor = signerMode === "multi" && field.signerId
      ? (signers.find((s) => s.id === field.signerId)?.color ?? "#ff4d6d")
      : "#ff4d6d";
    const signerLabel = signerMode === "multi" && field.signerId
      ? (signers.find((s) => s.id === field.signerId)?.name?.split(" ")[0] ?? "")
      : "";

    return (
      <div
        key={field.id}
        className="absolute"
        style={{
          left: `${field.x * 100}%`,
          top: `${field.y * 100}%`,
          width: `${field.width * 100}%`,
          height: `${field.height * 100}%`,
          cursor: interaction?.kind === "move" && interaction.fieldId === field.id ? "grabbing" : "grab",
          zIndex: isSelected ? 20 : 10,
          boxShadow: isSelected ? `0 0 0 2px ${signerColor}, 0 0 0 4px white` : undefined,
          borderRadius: "6px",
        }}
        onPointerDown={(e) => onFieldPointerDown(e, field.id)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (isImage) {
            openSigDialog(field.type as SignatureTarget);
          } else if (isFormField) {
            setShowFieldProps(true);
          } else {
            setEditingFieldId(field.id);
          }
        }}
      >
        {/* field content */}
        <div className={`relative h-full w-full overflow-hidden rounded-md border ${isFormField ? `border-solid border-blue-400/70 ${showFieldBg ? "bg-blue-50/90" : "bg-transparent"}` : `border-dashed ${showFieldBg ? "bg-white/80" : "bg-transparent"}`}`}
          style={!isFormField ? { borderColor: signerColor + "99" } : undefined}
        >
          {isImage ? (
            field.value ? (
              <img src={field.value} alt={field.type} className="h-full w-full object-contain" draggable={false} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                {FIELD_META[field.type].icon} Click to add
              </div>
            )
          ) : isFormField ? (
            <div className="flex h-full w-full items-center justify-center">
              {field.type === "sig-field" && (
                <div className="flex items-center gap-1 text-blue-600">
                  <span className="text-sm">🖊️</span>
                  <span style={{ fontSize: `${clamp(field.height * editorH * 0.4, 8, 16)}px` }} className="font-medium">Sign here</span>
                </div>
              )}
              {field.type === "text-field" && (
                <div className="flex h-full w-full items-center border-b border-blue-300 px-1.5">
                  <span className="text-gray-400 truncate" style={{ fontSize: `${clamp(field.height * editorH * 0.5, 8, 18)}px` }}>
                    {field.defaultValue || "Text field"}
                  </span>
                </div>
              )}
              {field.type === "checkbox-field" && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-[70%] w-[70%] max-h-6 max-w-6 rounded-sm border-2 border-blue-400 bg-white" />
                </div>
              )}
              {field.type === "radio-field" && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-[70%] w-[70%] max-h-6 max-w-6 rounded-full border-2 border-blue-400 bg-white" />
                </div>
              )}
              {field.type === "listbox-field" && (
                <div className="flex h-full w-full flex-col overflow-hidden px-1 py-0.5">
                  {(field.options || []).slice(0, 4).map((opt, i) => (
                    <div key={i} className="truncate border-b border-blue-200/50 text-gray-600 leading-tight" style={{ fontSize: `${clamp(field.height * editorH * 0.18, 7, 13)}px` }}>{opt}</div>
                  ))}
                  {(field.options?.length || 0) > 4 && <div className="text-[8px] text-gray-400">…</div>}
                </div>
              )}
              {field.type === "combobox-field" && (
                <div className="flex h-full w-full items-center justify-between px-1.5">
                  <span className="truncate text-gray-400" style={{ fontSize: `${clamp(field.height * editorH * 0.5, 8, 16)}px` }}>
                    {field.options?.[0] || "Select..."}
                  </span>
                  <span className="text-blue-500 text-xs ml-1">▼</span>
                </div>
              )}
            </div>
          ) : isEditing ? (
            <input
              autoFocus
              className="h-full w-full bg-transparent px-1 text-xs text-gray-900 outline-none"
              style={{ fontSize: `${clamp(field.height * editorH * 0.6, 10, 28)}px` }}
              value={field.value}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              onBlur={() => setEditingFieldId(null)}
              onKeyDown={(e) => { if (e.key === "Enter") setEditingFieldId(null); }}
            />
          ) : (
            <div
              className="flex h-full w-full items-center px-1 text-xs text-gray-800"
              style={{ fontSize: `${clamp(field.height * editorH * 0.6, 10, 28)}px` }}
            >
              {field.value || <span className="text-gray-400">{FIELD_META[field.type].label}</span>}
            </div>
          )}

          {/* type badge */}
          <div
            className="absolute -top-5 left-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold text-white shadow"
            style={{ backgroundColor: signerColor }}
          >
            {signerLabel ? `${signerLabel}: ` : ""}{FIELD_META[field.type].label}
          </div>

          {/* delete button */}
          {isSelected && (
            <button
              type="button"
              className="absolute -right-2.5 -top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white shadow hover:bg-red-700"
              onPointerDown={(e) => { e.stopPropagation(); removeField(field.id); }}
            >
              ✕
            </button>
          )}
        </div>

        {/* resize handles */}
        {isSelected && (
          <>
            {(["nw", "ne", "sw", "se"] as CornerHandle[]).map((h) => {
              const pos = h === "nw" ? "-left-1.5 -top-1.5 cursor-nw-resize"
                : h === "ne" ? "-right-1.5 -top-1.5 cursor-ne-resize"
                : h === "sw" ? "-left-1.5 -bottom-1.5 cursor-sw-resize"
                : "-right-1.5 -bottom-1.5 cursor-se-resize";
              return (
                <button
                  key={h}
                  type="button"
                  className={`absolute h-3.5 w-3.5 rounded-full border-2 border-white shadow ${pos}`}
                  style={{ backgroundColor: signerColor }}
                  onPointerDown={(e) => onHandlePointerDown(e, field.id, h)}
                />
              );
            })}
          </>
        )}
      </div>
    );
  };

  /* ═══════════════════ JSX ═══════════════════ */

  /* ── upload screen ── */
  if (!pdf) {
    return (
      <div className="space-y-6">
        <input ref={fileInputRef} type="file" accept="application/pdf" onChange={onFileInput} className="hidden" />
        <section
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`rounded-[28px] border border-dashed p-8 transition md:p-12 ${dragOver ? "border-[#ff4d6d]/80 bg-[#201018]" : "border-border-strong bg-surface"}`}
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="rounded-full border border-border bg-surface-3/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb8c6]">
              Sign PDF
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-white md:text-5xl">Upload a PDF to sign</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
              Add your signature, initials, name, date, text, and company stamp to any page. Place and resize
              elements exactly where you need them, then export a signed copy.
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
          </div>
        </section>
        {errorMsg && <p className="text-center text-sm text-red-400">{errorMsg}</p>}
      </div>
    );
  }

  /* ── signer mode selection ── */
  if (signerMode === "choose") {
    return (
      <div className="space-y-6">
        <input ref={fileInputRef} type="file" accept="application/pdf" onChange={onFileInput} className="hidden" />
        <section className="rounded-[28px] border border-border bg-surface p-8 md:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="rounded-full border border-border bg-surface-3/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb8c6] inline-block">
              Sign PDF
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-white md:text-4xl">Who is signing?</h2>
            <p className="mt-3 text-sm text-muted">Select one to continue</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSignerMode("single")}
                className="group rounded-2xl border border-border bg-surface-3/50 p-6 text-left transition hover:border-[#ff4d6d]/50 hover:bg-[#1b1015]"
              >
                <div className="mb-3 text-3xl">👤</div>
                <div className="text-lg font-semibold text-white">Single Signer</div>
                <p className="mt-1 text-sm text-muted">Only one person needs to sign the document.</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSigners([
                    { id: uid(), name: "", initials: "", color: SIGNER_COLORS[0], signatureDataUrl: "", initialsDataUrl: "", stampDataUrl: "" },
                    { id: uid(), name: "", initials: "", color: SIGNER_COLORS[1], signatureDataUrl: "", initialsDataUrl: "", stampDataUrl: "" },
                  ]);
                  setCurrentSignerIdx(0);
                  setMultiSetupDone(false);
                  setSignerMode("multi");
                }}
                className="group rounded-2xl border border-border bg-surface-3/50 p-6 text-left transition hover:border-[#4d9fff]/50 hover:bg-[#101520]"
              >
                <div className="mb-3 text-3xl">👥</div>
                <div className="text-lg font-semibold text-white">Multiple Signers</div>
                <p className="mt-1 text-sm text-muted">Multiple people need to sign the same document.</p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setPdf(null); }}
              className="mt-6 text-sm text-muted transition hover:text-white"
            >
              ← Upload a different PDF
            </button>
          </div>
        </section>
      </div>
    );
  }

  /* ── multi-signer setup ── */
  if (signerMode === "multi" && !multiSetupDone) {
    return (
      <div className="space-y-6">
        <input ref={fileInputRef} type="file" accept="application/pdf" onChange={onFileInput} className="hidden" />
        <section className="rounded-[28px] border border-border bg-surface p-8 md:p-12">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <div className="rounded-full border border-border bg-surface-3/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8cb8ff] inline-block">
                Multi-Sign
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-white md:text-4xl">Configure Signers</h2>
              <p className="mt-3 text-sm text-muted">Add the people who need to sign this document</p>
            </div>

            <div className="mt-8 space-y-3">
              {signers.map((signer, idx) => (
                <div key={signer.id} className="rounded-2xl border border-border bg-surface-3/50 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: signer.color }} />
                    <span className="text-sm font-semibold text-white">Signer {idx + 1}</span>
                    {signers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setSigners((prev) => prev.filter((_, i) => i !== idx))}
                        className="ml-auto text-xs text-red-400 hover:text-red-300 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="text-xs text-muted">Full name</span>
                      <input
                        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none focus:border-[#4d9fff]"
                        placeholder="Enter name"
                        value={signer.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          const initials = name.split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase()).join("").slice(0, 3);
                          setSigners((prev) => prev.map((s, i) => i === idx ? { ...s, name, initials } : s));
                        }}
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-xs text-muted">Initials</span>
                      <input
                        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none focus:border-[#4d9fff]"
                        placeholder="AB"
                        value={signer.initials}
                        onChange={(e) => setSigners((prev) => prev.map((s, i) => i === idx ? { ...s, initials: e.target.value } : s))}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {signers.length < 8 && (
              <button
                type="button"
                onClick={() => setSigners((prev) => [...prev, { id: uid(), name: "", initials: "", color: SIGNER_COLORS[prev.length % SIGNER_COLORS.length], signatureDataUrl: "", initialsDataUrl: "", stampDataUrl: "" }])}
                className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border bg-surface-3/30 px-4 py-3 text-sm text-muted transition hover:border-[#4d9fff]/50 hover:text-white w-full justify-center"
              >
                <span>+</span> Add Signer
              </button>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setSignerMode("choose"); setSigners([]); }}
                className="text-sm text-muted transition hover:text-white"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={signers.filter((s) => s.name.trim()).length < 2}
                onClick={() => {
                  const first = signers[0];
                  setSignerName(first.name);
                  setSignerInitials(first.initials);
                  setSignatureDataUrl(first.signatureDataUrl);
                  setInitialsDataUrl(first.initialsDataUrl);
                  setStampDataUrl(first.stampDataUrl);
                  setCurrentSignerIdx(0);
                  setMultiSetupDone(true);
                }}
                className="rounded-full bg-[#4d9fff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3d8fef] disabled:cursor-not-allowed disabled:bg-[#3a5070]"
              >
                Continue to Signing →
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ── signing workspace ── */
  return (
    <div className="space-y-0">
      <input ref={fileInputRef} type="file" accept="application/pdf" onChange={onFileInput} className="hidden" />

      {/* ── signature dialog modal ── */}
      {showSigDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowSigDialog(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-[#1a1a2e] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {sigTarget === "signature" ? "Set your signature" : sigTarget === "initials" ? "Set your initials" : "Upload company stamp"}
              </h3>
              <button type="button" onClick={() => setShowSigDialog(false)} className="text-muted hover:text-white text-xl leading-none">&times;</button>
            </div>

            {/* name / initials inputs */}
            {sigTarget !== "stamp" && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs text-muted">Full name</span>
                  <input
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none focus:border-[#ff4d6d]"
                    value={signerName}
                    placeholder="Your Name"
                    onChange={(e) => {
                      setSignerName(e.target.value);
                      regeneratePreviews(e.target.value, signerInitials, sigColor, sigTarget);
                    }}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-muted">Initials</span>
                  <input
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none focus:border-[#ff4d6d]"
                    value={signerInitials}
                    placeholder="AK"
                    onChange={(e) => {
                      setSignerInitials(e.target.value);
                      regeneratePreviews(signerName, e.target.value, sigColor, sigTarget);
                    }}
                  />
                </label>
              </div>
            )}

            {/* tabs */}
            {sigTarget !== "stamp" && (
              <div className="mt-5 flex gap-1 rounded-lg border border-border bg-surface-3/50 p-1">
                {(["type", "draw", "upload"] as SigTab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSigTab(t)}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${sigTab === t ? "bg-[#ff4d6d] text-white" : "text-muted hover:text-white"}`}
                  >
                    {t === "type" ? "Type" : t === "draw" ? "Draw" : "Upload"}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 min-h-[200px]">
              {/* ── type tab ── */}
              {sigTab === "type" && sigTarget !== "stamp" && (
                <div className="space-y-2">
                  {fontPreviews.map((url, i) => (
                    <label
                      key={i}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selectedFontIdx === i ? "border-[#ff4d6d] bg-[#ff4d6d]/10" : "border-border bg-surface/50 hover:bg-surface/70"}`}
                    >
                      <input
                        type="radio"
                        name="sigFont"
                        checked={selectedFontIdx === i}
                        onChange={() => setSelectedFontIdx(i)}
                        className="accent-[#ff4d6d]"
                      />
                      <img src={url} alt={SIGNATURE_FONTS[i].label} className="h-10 max-w-[260px] object-contain" draggable={false} />
                    </label>
                  ))}
                </div>
              )}

              {/* ── draw tab ── */}
              {sigTab === "draw" && (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl border border-border bg-white">
                    <canvas
                      ref={drawCanvasRef}
                      width={460}
                      height={180}
                      className="w-full cursor-crosshair touch-none"
                      onPointerDown={onDrawPointerDown}
                      onPointerMove={onDrawPointerMove}
                      onPointerUp={onDrawPointerUp}
                      onPointerLeave={onDrawPointerUp}
                    />
                  </div>
                  <button type="button" onClick={clearDrawCanvas} className="text-sm text-muted hover:text-white transition">Clear</button>
                </div>
              )}

              {/* ── upload tab ── */}
              {(sigTab === "upload" || sigTarget === "stamp") && (
                <div className="space-y-3">
                  <input ref={sigUploadRef} type="file" accept="image/png,image/jpeg" onChange={onSigUpload} className="hidden" />
                  {uploadedSigUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="overflow-hidden rounded-xl border border-border bg-white p-4">
                        <img src={uploadedSigUrl} alt="Uploaded" className="max-h-32 max-w-full object-contain" draggable={false} />
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
                      Click to upload {sigTarget === "stamp" ? "company stamp" : "signature"} image (PNG / JPG)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* color picker */}
            {sigTarget !== "stamp" && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-muted">Color:</span>
                {SIG_COLORS.map(({ hex, label }) => (
                  <button
                    key={hex}
                    type="button"
                    title={label}
                    onClick={() => {
                      setSigColor(hex);
                      regeneratePreviews(signerName, signerInitials, hex, sigTarget);
                    }}
                    className={`h-6 w-6 rounded-full border-2 transition ${sigColor === hex ? "border-white scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={applySigDialogResult}
                className="rounded-full bg-[#ff4d6d] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff365a]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── form field properties dialog ── */}
      {showFieldProps && selectedField && FORM_FIELD_TYPES.includes(selectedField.type) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowFieldProps(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* title */}
            <h3 className="text-lg font-bold text-gray-900">
              {FIELD_META[selectedField.type].label} Tool
            </h3>

            {/* Default Value — text-field only */}
            {selectedField.type === "text-field" && (
              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Value:</label>
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={selectedField.defaultValue ?? ""}
                  placeholder=""
                  onChange={(e) => updateFieldProp(selectedField.id, "defaultValue", e.target.value)}
                />
              </div>
            )}

            {/* Options — listbox / combobox */}
            {(selectedField.type === "listbox-field" || selectedField.type === "combobox-field") && (
              <div className="mt-5">
                <div className="text-sm font-bold text-gray-900 mb-2">Options</div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {(selectedField.options || []).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-500"
                        value={opt}
                        onChange={(e) => updateFieldOption(selectedField.id, idx, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeFieldOption(selectedField.id, idx)}
                        className="text-gray-400 hover:text-red-500 text-sm px-1"
                        title="Remove"
                      >✕</button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addFieldOption(selectedField.id)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >+ Add Option</button>
              </div>
            )}

            {/* divider */}
            <div className="mt-5 border-t border-gray-200" />

            {/* Properties */}
            <div className="mt-5">
              <div className="text-sm font-bold text-gray-900 mb-3">Properties</div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedField.readOnly}
                    onChange={(e) => updateFieldProp(selectedField.id, "readOnly", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Read Only
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedField.required}
                    onChange={(e) => updateFieldProp(selectedField.id, "required", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Required
                </label>
                {selectedField.type === "text-field" && (
                  <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!selectedField.multiline}
                      onChange={(e) => updateFieldProp(selectedField.id, "multiline", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Multiline
                  </label>
                )}
                {selectedField.type === "listbox-field" && (
                  <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!selectedField.multiSelect}
                      onChange={(e) => updateFieldProp(selectedField.id, "multiSelect", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Multi Select
                  </label>
                )}
                <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedField.includeIndicator}
                    onChange={(e) => updateFieldProp(selectedField.id, "includeIndicator", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Include Field Indicator
                </label>
              </div>
            </div>

            {/* divider */}
            <div className="mt-5 border-t border-gray-200" />

            {/* Field Size */}
            <div className="mt-5">
              <div className="text-sm font-bold text-gray-900 mb-3">Field Size</div>
              <div className="grid grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-sm text-gray-600">Width</span>
                  <input
                    type="number"
                    min={20}
                    max={600}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={Math.round(selectedField.width * (currentBox?.width || 612))}
                    onChange={(e) => {
                      const pw = currentBox?.width || 612;
                      const frac = clamp(Number(e.target.value) / pw, MIN_FIELD_W, MAX_FIELD_W);
                      updateFieldProp(selectedField.id, "width", frac);
                    }}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm text-gray-600">Height</span>
                  <input
                    type="number"
                    min={10}
                    max={400}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={Math.round(selectedField.height * (currentBox?.height || 792))}
                    onChange={(e) => {
                      const ph = currentBox?.height || 792;
                      const frac = clamp(Number(e.target.value) / ph, MIN_FIELD_H, MAX_FIELD_H);
                      updateFieldProp(selectedField.id, "height", frac);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* divider */}
            <div className="mt-5 border-t border-gray-200" />

            {/* Close button */}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFieldProps(false)}
                className="rounded-lg bg-[#5b7b9d] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#4a6a8c]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── main workspace ── */}
      <section className="overflow-hidden rounded-[30px] border border-border bg-background shadow-[0_30px_80px_rgba(0,0,0,0.32)]">
        {/* top bar */}
        <div className="border-b border-border bg-surface px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c8ea6]">{signerMode === "multi" ? "Multi-Sign PDF" : "Sign PDF"}</div>
              <h2 className="mt-1 text-xl font-semibold text-white md:text-2xl">
                {signerMode === "multi"
                  ? `Place fields for ${signers.length} signers`
                  : "Place signatures and fields on your document"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {pdf.file.name} · {pdf.pageCount} page{pdf.pageCount > 1 ? "s" : ""} · {formatBytes(pdf.file.size)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" disabled={!canUndo} onClick={undo} title="Undo" className="rounded-full border border-border bg-surface-3/50 px-3 py-2 text-sm font-medium text-white transition hover:bg-surface-3 disabled:opacity-40 disabled:cursor-not-allowed">
                ↩
              </button>
              <button type="button" disabled={!canRedo} onClick={redo} title="Redo" className="rounded-full border border-border bg-surface-3/50 px-3 py-2 text-sm font-medium text-white transition hover:bg-surface-3 disabled:opacity-40 disabled:cursor-not-allowed">
                ↪
              </button>
              <button type="button" onClick={signAndDownload} disabled={processing || fields.length === 0} title="Download signed PDF" className="rounded-full border border-border bg-[#ff4d6d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff365a] disabled:opacity-40 disabled:cursor-not-allowed">
                ⬇ Download
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full border border-border bg-surface-3/50 px-4 py-2 text-sm font-medium text-white transition hover:bg-surface-3">
                Replace PDF
              </button>
              <button type="button" onClick={() => { setPdf(null); setSignerMode("choose"); setSigners([]); setMultiSetupDone(false); setFields([]); }} className="rounded-full border border-border bg-transparent px-4 py-2 text-sm font-medium text-[#c5c6d6] transition hover:text-foreground">
                Start over
              </button>
            </div>
          </div>
        </div>

        {/* zoom bar */}
        <div className="border-b border-border bg-surface px-4 py-2.5 md:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">
              Page {currentPage} of {pdf.pageCount} · {currentFields.length} field{currentFields.length !== 1 ? "s" : ""} on this page
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/75">
              <button type="button" onClick={() => applyZoom(zoom - 0.1)} className="rounded-xl border border-border bg-surface/50 px-3 py-1.5 transition hover:bg-surface/70">−</button>
              <span className="min-w-[48px] text-center rounded-xl border border-border bg-surface/50 px-3 py-1.5">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => applyZoom(zoom + 0.1)} className="rounded-xl border border-border bg-surface/50 px-3 py-1.5 transition hover:bg-surface/70">+</button>
              <input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step={0.05} value={zoom} onChange={(e) => applyZoom(+e.target.value)} className="ml-1 w-28 accent-[#ff4d6d]" aria-label="Zoom" />
              <span className="mx-1 h-5 w-px bg-border" />
              <button
                type="button"
                onClick={() => setShowFieldBg((v) => !v)}
                title={showFieldBg ? "Hide field backgrounds" : "Show field backgrounds"}
                className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${showFieldBg ? "border-[#ff4d6d]/50 bg-[#ff4d6d]/15 text-[#ff4d6d]" : "border-border bg-surface/50 text-muted hover:text-white"}`}
              >
                {showFieldBg ? "BG On" : "BG Off"}
              </button>
            </div>
          </div>
        </div>

        {/* 3-column layout */}
        <div className="grid min-h-[780px] xl:grid-cols-[172px_minmax(0,1fr)_280px]">
          {/* ── left: thumbnails ── */}
          <aside className="border-r border-border bg-surface px-2 py-3 overflow-y-auto xl:max-h-[780px]">
            <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8d8ea5]">Pages</div>
            <div className="space-y-2">
              {pageNumbers.map((pg) => {
                const isActive = pg === currentPage;
                const url = thumbnailUrls[pg];
                const box = pdf.pageBoxes[pg - 1];
                const a = getPageAspect(box);
                const fieldCount = fields.filter((f) => f.pageNumber === pg).length;
                return (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`w-full rounded-xl border p-1.5 text-left transition ${isActive ? "border-[#ff4d6d]/70 bg-[#1b1015]" : "border-border bg-white/[0.02] hover:bg-surface/70"}`}
                  >
                    <div className="flex items-center justify-between px-1 pb-1 text-[10px] text-[#c6c7d7]">
                      <span>Page {pg}</span>
                      {fieldCount > 0 && <span className="rounded bg-[#ff4d6d]/20 px-1 text-[#ff4d6d]">{fieldCount}</span>}
                    </div>
                    <div className="overflow-hidden rounded-lg border border-black/10 bg-[#e9e7ef]" style={{ aspectRatio: `${a}` }}>
                      {url ? (
                        <img src={url} alt={`Page ${pg}`} className="h-full w-full object-contain" draggable={false} />
                      ) : (
                        <div className="flex h-full min-h-[100px] items-center justify-center text-[10px] text-[#696b82]">
                          {thumbLoading[pg] ? "…" : "—"}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── center: canvas ── */}
          <main className="flex min-w-0 flex-col bg-surface">
            <div
              ref={viewportRef}
              className="flex-1 overflow-auto bg-[#d8d6de] px-4 py-6 md:px-8"
            >
              <div className="mx-auto flex min-h-full items-start justify-center" style={{ minWidth: `${editorW + 48}px` }}>
                <div
                  ref={editorRef}
                  className="relative overflow-hidden rounded-[20px] border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
                  style={{ width: `${editorW}px`, height: `${editorH}px`, touchAction: "none" }}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                  onPointerDown={onCanvasClick}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt={`Page ${currentPage}`} className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none" draggable={false} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-white text-sm text-[#66697c]">
                      {previewLoading ? "Rendering…" : "Preview unavailable"}
                    </div>
                  )}
                  <div className="absolute inset-0">
                    {currentFields.map(renderFieldOverlay)}
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* ── right: signing options ── */}
          <aside className="border-l border-border bg-surface p-4 md:p-5 overflow-y-auto xl:max-h-[780px]">
            <div className="flex h-full flex-col">
              <h3 className="text-xl font-semibold text-white">Signing options</h3>
              <p className="mt-1 text-xs text-muted">Click a field to add it to the current page. Drag to position it, drag corners to resize.</p>

              {/* multi-signer selector tabs */}
              {signerMode === "multi" && (
                <div className="mt-4 space-y-1.5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c8ea6]">Current signer</div>
                  <div className="flex flex-wrap gap-1.5">
                    {signers.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => switchSigner(idx)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                          idx === currentSignerIdx
                            ? "text-white shadow-sm"
                            : "bg-surface-3/50 text-muted hover:text-white"
                        }`}
                        style={idx === currentSignerIdx ? { backgroundColor: s.color + "25", border: `1.5px solid ${s.color}`, color: s.color } : {}}
                      >
                        <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="truncate max-w-[80px]">{s.name || `Signer ${idx + 1}`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* signature / initials config */}
              <div className="mt-5 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c8ea6]">Required fields</div>
                <button
                  type="button"
                  onClick={() => addField("signature")}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-3/50 px-3 py-3 text-left transition hover:border-[#ff4d6d]/50 hover:bg-[#1b1015]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff4d6d]/15 text-lg">✍️</span>
                  <div>
                    <div className="text-sm font-medium text-white">Signature</div>
                    <div className="text-[11px] text-muted">{signatureDataUrl ? "Configured" : "Not set — click to add"}</div>
                  </div>
                  {signatureDataUrl && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); openSigDialog("signature"); }} className="ml-auto text-[11px] text-[#ff4d6d] hover:underline">
                      Edit
                    </button>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => addField("initials")}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-3/50 px-3 py-3 text-left transition hover:border-[#ff4d6d]/50 hover:bg-[#1b1015]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-lg">🔤</span>
                  <div>
                    <div className="text-sm font-medium text-white">Initials</div>
                    <div className="text-[11px] text-muted">{initialsDataUrl ? "Configured" : "Not set — click to add"}</div>
                  </div>
                  {initialsDataUrl && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); openSigDialog("initials"); }} className="ml-auto text-[11px] text-[#ff4d6d] hover:underline">
                      Edit
                    </button>
                  )}
                </button>
              </div>

              {/* additional fields */}
              <div className="mt-5 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c8ea6]">Additional fields</div>
                {(["name", "date", "text", "stamp"] as FieldType[]).map((type) => {
                  const meta = FIELD_META[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        if (type === "stamp" && !stampDataUrl) {
                          openSigDialog("stamp");
                        }
                        addField(type);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-3/50 px-3 py-2.5 text-left transition hover:border-[#ff4d6d]/50 hover:bg-[#1b1015]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-base">{meta.icon}</span>
                      <span className="text-sm font-medium text-white">{meta.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* selected field info */}
              {selectedField && (
                <div className="mt-5 rounded-xl border border-border bg-surface-3/50 p-3 space-y-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c8ea6]">
                      {FIELD_META[selectedField.type].label}
                    </div>
                    <div className="mt-1 text-[11px] text-muted">Drag to reposition · drag corners to resize</div>
                  </div>

                  {FORM_FIELD_TYPES.includes(selectedField.type) && (
                    <button
                      type="button"
                      onClick={() => setShowFieldProps(true)}
                      className="w-full rounded-lg bg-blue-500/15 px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/25"
                    >
                      Field Properties
                    </button>
                  )}

                  {!FORM_FIELD_TYPES.includes(selectedField.type) && (selectedField.type === "signature" || selectedField.type === "initials" || selectedField.type === "stamp") && (
                    <button
                      type="button"
                      onClick={() => openSigDialog(selectedField.type as SignatureTarget)}
                      className="rounded-lg bg-[#ff4d6d]/15 px-3 py-1.5 text-xs font-medium text-[#ff4d6d] transition hover:bg-[#ff4d6d]/25"
                    >
                      {selectedField.value ? "Change" : "Configure"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removeField(selectedField.id)}
                    className="w-full rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/25"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* placed fields list */}
              {fields.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c8ea6]">Placed fields ({fields.length})</div>
                  <div className="mt-2 max-h-36 space-y-1 overflow-y-auto">
                    {fields.map((f) => {
                      const fColor = signerMode === "multi" && f.signerId
                        ? (signers.find((s) => s.id === f.signerId)?.color ?? "#ff4d6d")
                        : "#ff4d6d";
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => { setCurrentPage(f.pageNumber); setSelectedFieldId(f.id); }}
                          className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition ${selectedFieldId === f.id ? "text-white" : "text-muted hover:text-white hover:bg-surface/70"}`}
                          style={selectedFieldId === f.id ? { backgroundColor: fColor + "25" } : undefined}
                        >
                          {signerMode === "multi" && <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: fColor }} />}
                          <span>{FIELD_META[f.type].icon}</span>
                          <span className="flex-1 truncate">{FIELD_META[f.type].label}</span>
                          <span className="text-[10px] text-muted">pg {f.pageNumber}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* sign button */}
              <div className="mt-auto pt-5">
                {errorMsg && <p className="mb-2 text-xs text-red-400">{errorMsg}</p>}
                <button
                  type="button"
                  onClick={signAndDownload}
                  disabled={processing || fields.length === 0}
                  className="w-full rounded-full bg-[#ff4d6d] py-3 text-sm font-semibold text-white transition hover:bg-[#ff365a] disabled:cursor-not-allowed disabled:bg-[#8f4151]"
                >
                  {processing ? "Processing…" : signerMode === "multi" ? "Sign All & Download" : "Sign & Download"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
