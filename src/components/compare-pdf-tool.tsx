"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
} from "react";
import { downloadBlob, sanitizeBaseName } from "@/lib/client-pdf-utils";

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

type CompareMode = "semantic" | "overlay";
type PageBox = { width: number; height: number };
type TextFragment = { id: string; pageNumber: number; text: string; x: number; y: number; width: number; height: number };
type SearchLine = { id: string; pageNumber: number; text: string };
type PreviewMap = Record<number, string>;
type LoadingMap = Record<number, boolean>;

type LoadedPdf = {
  file: File;
  bytes: ArrayBuffer;
  pageCount: number;
  pageBoxes: PageBox[];
  fragments: TextFragment[];
  lines: SearchLine[];
};

type DiffEntry = {
  id: string;
  pageNumber: number;
  type: "addition" | "removal";
  text: string;
};

type PdfSlot = "left" | "right";

type PdfJsViewport = { width: number; height: number; transform: number[] };

type PdfJsTextItem = { str: string; transform: number[]; width: number; height?: number };
type PdfJsTextContent = { items: Array<PdfJsTextItem | { str?: string }> };

type PdfJsPage = {
  getViewport: (options: { scale: number }) => PdfJsViewport;
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: PdfJsViewport }) => { promise: Promise<void> };
  getTextContent: () => Promise<PdfJsTextContent>;
};

type PdfJsDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
  destroy?: () => void;
};

type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { data: ArrayBuffer }) => { promise: Promise<PdfJsDocument> };
};

const BASE_VIEWER_WIDTH = 560;
const MAX_REPORT_ITEMS = 200;
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.5;

let pdfjsPromise: Promise<PdfJsModule> | null = null;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatZoom(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function truncateText(value: string, max = 140): string {
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`;
}

function normalizeLineText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function buildSearchLines(fragments: TextFragment[]): SearchLine[] {
  const byPage = new Map<number, TextFragment[]>();
  for (const fragment of fragments) {
    const items = byPage.get(fragment.pageNumber);
    if (items) items.push(fragment);
    else byPage.set(fragment.pageNumber, [fragment]);
  }

  const lines: SearchLine[] = [];
  for (const [pageNumber, pageFragments] of byPage.entries()) {
    const sorted = [...pageFragments].sort((left, right) => {
      const yDiff = left.y - right.y;
      return Math.abs(yDiff) > 0.004 ? yDiff : left.x - right.x;
    });

    const groups: TextFragment[][] = [];
    for (const fragment of sorted) {
      const centerY = fragment.y + fragment.height / 2;
      const group = groups.find((line) => {
        const ref = line[0];
        const refCenterY = ref.y + ref.height / 2;
        return Math.abs(refCenterY - centerY) <= Math.max(ref.height, fragment.height) * 0.7;
      });
      if (group) group.push(fragment);
      else groups.push([fragment]);
    }

    for (const group of groups) {
      const text = normalizeLineText(group.sort((a, b) => a.x - b.x).map((item) => item.text).join(" "));
      if (!text) continue;
      lines.push({ id: createId(), pageNumber, text });
    }
  }

  return lines;
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

async function renderPagePreview(pdfDoc: PdfJsDocument, pageNumber: number, scale: number): Promise<string> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create preview canvas.");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport, canvas } as never).promise;
  return canvas.toDataURL("image/png", 0.92);
}

async function renderPageCanvas(pdfDoc: PdfJsDocument, pageNumber: number, scale: number): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create preview canvas.");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport, canvas } as never).promise;
  return canvas;
}

async function extractTextFragments(pdfDoc: PdfJsDocument): Promise<{ pageBoxes: PageBox[]; fragments: TextFragment[]; lines: SearchLine[] }> {
  const pageBoxes: PageBox[] = [];
  const fragments: TextFragment[] = [];

  for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber += 1) {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    pageBoxes.push({ width: viewport.width, height: viewport.height });

    const textContent = await page.getTextContent();
    for (const rawItem of textContent.items) {
      if (!("str" in rawItem) || !rawItem.str || !rawItem.str.trim()) continue;
      const item = rawItem as PdfJsTextItem;
      const x = item.transform[4];
      const y = item.transform[5];
      const height = Math.max(item.height ?? 0, 6);
      const width = Math.max(item.width, height * 0.35);
      fragments.push({
        id: createId(),
        pageNumber,
        text: item.str,
        x: clamp(x / viewport.width, 0, 1),
        y: clamp((viewport.height - y) / viewport.height, 0, 1),
        width: clamp(width / viewport.width, 0.0025, 1),
        height: clamp((height * 1.08) / viewport.height, 0.008, 1),
      });
    }
  }

  return {
    pageBoxes,
    fragments,
    lines: buildSearchLines(fragments),
  };
}

function computeDiffEntries(leftPdf: LoadedPdf, rightPdf: LoadedPdf): DiffEntry[] {
  const maxPages = Math.max(leftPdf.pageCount, rightPdf.pageCount);
  const result: DiffEntry[] = [];

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const leftLines = leftPdf.lines.filter((line) => line.pageNumber === pageNumber).map((line) => line.text);
    const rightLines = rightPdf.lines.filter((line) => line.pageNumber === pageNumber).map((line) => line.text);
    const leftSet = new Set(leftLines);
    const rightSet = new Set(rightLines);

    for (const line of rightLines) {
      if (!leftSet.has(line)) {
        result.push({ id: createId(), pageNumber, type: "addition", text: line });
      }
    }

    for (const line of leftLines) {
      if (!rightSet.has(line)) {
        result.push({ id: createId(), pageNumber, type: "removal", text: line });
      }
    }
  }

  return result.slice(0, MAX_REPORT_ITEMS);
}

async function buildOverlayDiff(leftDoc: PdfJsDocument, rightDoc: PdfJsDocument, pageNumber: number, scale: number): Promise<string | null> {
  const [leftCanvas, rightCanvas] = await Promise.all([
    renderPageCanvas(leftDoc, pageNumber, scale),
    renderPageCanvas(rightDoc, pageNumber, scale),
  ]);

  const width = Math.max(leftCanvas.width, rightCanvas.width);
  const height = Math.max(leftCanvas.height, rightCanvas.height);
  const diffCanvas = document.createElement("canvas");
  diffCanvas.width = width;
  diffCanvas.height = height;
  const context = diffCanvas.getContext("2d");
  if (!context) return null;

  const tempLeft = document.createElement("canvas");
  tempLeft.width = width;
  tempLeft.height = height;
  tempLeft.getContext("2d")?.drawImage(leftCanvas, 0, 0, width, height);

  const tempRight = document.createElement("canvas");
  tempRight.width = width;
  tempRight.height = height;
  tempRight.getContext("2d")?.drawImage(rightCanvas, 0, 0, width, height);

  const leftData = tempLeft.getContext("2d")?.getImageData(0, 0, width, height);
  const rightData = tempRight.getContext("2d")?.getImageData(0, 0, width, height);
  if (!leftData || !rightData) return null;

  const output = context.createImageData(width, height);
  let changedPixels = 0;

  for (let index = 0; index < leftData.data.length; index += 4) {
    const redDiff = Math.abs(leftData.data[index] - rightData.data[index]);
    const greenDiff = Math.abs(leftData.data[index + 1] - rightData.data[index + 1]);
    const blueDiff = Math.abs(leftData.data[index + 2] - rightData.data[index + 2]);
    const delta = redDiff + greenDiff + blueDiff;
    if (delta > 36) {
      output.data[index] = 255;
      output.data[index + 1] = 79;
      output.data[index + 2] = 121;
      output.data[index + 3] = 180;
      changedPixels += 1;
    }
  }

  if (!changedPixels) return null;

  context.putImageData(output, 0, 0);
  return diffCanvas.toDataURL("image/png", 0.92);
}

function formatReport(diffEntries: DiffEntry[], leftName: string, rightName: string): string {
  const header = [`ToolMint Compare PDF Report`, `Left: ${leftName}`, `Right: ${rightName}`, ``];
  const body = diffEntries.map((entry) => `[Page ${entry.pageNumber}] ${entry.type.toUpperCase()}: ${entry.text}`);
  return [...header, ...body].join("\n");
}

export default function ComparePdfTool() {
  const [leftPdf, setLeftPdf] = useState<LoadedPdf | null>(null);
  const [rightPdf, setRightPdf] = useState<LoadedPdf | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [compareMode, setCompareMode] = useState<CompareMode>("semantic");
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOver, setDragOver] = useState<PdfSlot | null>(null);
  const [loadingSlot, setLoadingSlot] = useState<PdfSlot | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [, setLeftThumbs] = useState<PreviewMap>({});
  const [, setRightThumbs] = useState<PreviewMap>({});
  const [, setLeftThumbLoading] = useState<LoadingMap>({});
  const [, setRightThumbLoading] = useState<LoadingMap>({});
  const [leftPreviewUrl, setLeftPreviewUrl] = useState<string | null>(null);
  const [rightPreviewUrl, setRightPreviewUrl] = useState<string | null>(null);
  const [overlayPreviewUrl, setOverlayPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const leftDocRef = useRef<PdfJsDocument | null>(null);
  const rightDocRef = useRef<PdfJsDocument | null>(null);
  const thumbTokenRef = useRef(0);
  const previewTokenRef = useRef(0);

  const maxPages = Math.max(leftPdf?.pageCount ?? 0, rightPdf?.pageCount ?? 0);
  const pageNumbers = useMemo(() => Array.from({ length: maxPages }, (_, index) => index + 1), [maxPages]);
  const leftBox = leftPdf?.pageBoxes[currentPage - 1] ?? null;
  const rightBox = rightPdf?.pageBoxes[currentPage - 1] ?? null;
  const leftAspect = leftBox ? leftBox.width / leftBox.height : 1 / 1.414;
  const rightAspect = rightBox ? rightBox.width / rightBox.height : 1 / 1.414;
  const viewerWidth = Math.round(BASE_VIEWER_WIDTH * zoom);
  const leftHeight = Math.round(viewerWidth / leftAspect);
  const rightHeight = Math.round(viewerWidth / rightAspect);
  const leftFileName = leftPdf?.file.name ?? "Original PDF";
  const rightFileName = rightPdf?.file.name ?? "Revised PDF";
  const leftPageCount = leftPdf?.pageCount ?? 0;
  const rightPageCount = rightPdf?.pageCount ?? 0;

  const diffEntries = useMemo(() => {
    if (!leftPdf || !rightPdf) return [] as DiffEntry[];
    return computeDiffEntries(leftPdf, rightPdf);
  }, [leftPdf, rightPdf]);

  const filteredDiffEntries = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return diffEntries;
    return diffEntries.filter((entry) => entry.text.toLowerCase().includes(normalized));
  }, [diffEntries, searchQuery]);

  const groupedDiffEntries = useMemo(() => {
    return filteredDiffEntries.reduce<Record<number, DiffEntry[]>>((groups, entry) => {
      groups[entry.pageNumber] ??= [];
      groups[entry.pageNumber].push(entry);
      return groups;
    }, {});
  }, [filteredDiffEntries]);

  const handleZoomOut = useCallback(() => {
    setZoom((current) => clamp(Number((current - 0.1).toFixed(2)), MIN_ZOOM, MAX_ZOOM));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((current) => clamp(Number((current + 0.1).toFixed(2)), MIN_ZOOM, MAX_ZOOM));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  useEffect(() => {
    return () => {
      leftDocRef.current?.destroy?.();
      rightDocRef.current?.destroy?.();
    };
  }, []);

  const loadPdfIntoSlot = useCallback(async (slot: PdfSlot, file: File | null) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`File exceeds the 1GB size limit.`);
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please choose PDF files for comparison.");
      return;
    }

    setLoadingSlot(slot);
    setErrorMessage(null);
    setStatusMessage(`Analyzing ${slot === "left" ? "left" : "right"} PDF…`);

    try {
      const bytes = await file.arrayBuffer();
      const pdfjs = await getPdfjs();
      const doc = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
      const extracted = await extractTextFragments(doc);
      const payload: LoadedPdf = {
        file,
        bytes,
        pageCount: doc.numPages,
        pageBoxes: extracted.pageBoxes,
        fragments: extracted.fragments,
        lines: extracted.lines,
      };

      if (slot === "left") {
        leftDocRef.current?.destroy?.();
        leftDocRef.current = doc;
        setLeftPdf(payload);
      } else {
        rightDocRef.current?.destroy?.();
        rightDocRef.current = doc;
        setRightPdf(payload);
      }

      setCurrentPage(1);
      setStatusMessage("PDFs loaded. Review semantic text changes or switch to content overlay.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load PDF.");
    } finally {
      setLoadingSlot(null);
    }
  }, []);

  const handleInputChange = useCallback((slot: PdfSlot, event: ChangeEvent<HTMLInputElement>) => {
    void loadPdfIntoSlot(slot, event.target.files?.[0] ?? null);
  }, [loadPdfIntoSlot]);

  const handleDrop = useCallback((slot: PdfSlot, event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(null);
    void loadPdfIntoSlot(slot, event.dataTransfer.files?.[0] ?? null);
  }, [loadPdfIntoSlot]);

  useEffect(() => {
    if (!leftPdf || !leftDocRef.current) {
      setLeftThumbs({});
      setLeftThumbLoading({});
      return;
    }

    const token = ++thumbTokenRef.current;
    setLeftThumbs({});
    (async () => {
      for (let pageNumber = 1; pageNumber <= leftPdf.pageCount; pageNumber += 1) {
        setLeftThumbLoading((current) => ({ ...current, [pageNumber]: true }));
        try {
          const preview = await renderPagePreview(leftDocRef.current!, pageNumber, 0.34);
          if (thumbTokenRef.current !== token) return;
          setLeftThumbs((current) => ({ ...current, [pageNumber]: preview }));
        } finally {
          if (thumbTokenRef.current === token) {
            setLeftThumbLoading((current) => ({ ...current, [pageNumber]: false }));
          }
        }
      }
    })();
  }, [leftPdf]);

  useEffect(() => {
    if (!rightPdf || !rightDocRef.current) {
      setRightThumbs({});
      setRightThumbLoading({});
      return;
    }

    const token = ++thumbTokenRef.current;
    setRightThumbs({});
    (async () => {
      for (let pageNumber = 1; pageNumber <= rightPdf.pageCount; pageNumber += 1) {
        setRightThumbLoading((current) => ({ ...current, [pageNumber]: true }));
        try {
          const preview = await renderPagePreview(rightDocRef.current!, pageNumber, 0.34);
          if (thumbTokenRef.current !== token) return;
          setRightThumbs((current) => ({ ...current, [pageNumber]: preview }));
        } finally {
          if (thumbTokenRef.current === token) {
            setRightThumbLoading((current) => ({ ...current, [pageNumber]: false }));
          }
        }
      }
    })();
  }, [rightPdf]);

  useEffect(() => {
    if (!leftDocRef.current && !rightDocRef.current) {
      setLeftPreviewUrl(null);
      setRightPreviewUrl(null);
      setOverlayPreviewUrl(null);
      setPreviewLoading(false);
      return;
    }

    const token = ++previewTokenRef.current;
    setPreviewLoading(true);

    (async () => {
      try {
        const scaleBoost = typeof window !== "undefined" ? Math.max(window.devicePixelRatio, 1) : 1;
        const leftScale = leftBox ? Math.max(1.6, (viewerWidth / leftBox.width) * scaleBoost) : 1.6;
        const rightScale = rightBox ? Math.max(1.6, (viewerWidth / rightBox.width) * scaleBoost) : 1.6;

        const [leftUrl, rightUrl, overlayUrl] = await Promise.all([
          leftDocRef.current && currentPage <= (leftPdf?.pageCount ?? 0)
            ? renderPagePreview(leftDocRef.current, currentPage, leftScale)
            : Promise.resolve<string | null>(null),
          rightDocRef.current && currentPage <= (rightPdf?.pageCount ?? 0)
            ? renderPagePreview(rightDocRef.current, currentPage, rightScale)
            : Promise.resolve<string | null>(null),
          compareMode === "overlay" && leftDocRef.current && rightDocRef.current && currentPage <= (leftPdf?.pageCount ?? 0) && currentPage <= (rightPdf?.pageCount ?? 0)
            ? buildOverlayDiff(leftDocRef.current, rightDocRef.current, currentPage, Math.max(leftScale, rightScale))
            : Promise.resolve<string | null>(null),
        ]);

        if (previewTokenRef.current !== token) return;
        setLeftPreviewUrl(leftUrl);
        setRightPreviewUrl(rightUrl);
        setOverlayPreviewUrl(overlayUrl);
      } catch {
        if (previewTokenRef.current !== token) return;
        setLeftPreviewUrl(null);
        setRightPreviewUrl(null);
        setOverlayPreviewUrl(null);
      } finally {
        if (previewTokenRef.current === token) setPreviewLoading(false);
      }
    })();
  }, [compareMode, currentPage, leftBox, leftPdf?.pageCount, rightBox, rightPdf?.pageCount, viewerWidth, zoom]);

  const downloadReport = useCallback(() => {
    if (!leftPdf || !rightPdf || !filteredDiffEntries.length) return;
    const reportText = formatReport(filteredDiffEntries, leftPdf.file.name, rightPdf.file.name);
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `${sanitizeBaseName(leftPdf.file.name)}-vs-${sanitizeBaseName(rightPdf.file.name)}-report.txt`);
  }, [filteredDiffEntries, leftPdf, rightPdf]);

  const resetWorkspace = useCallback(() => {
    leftDocRef.current?.destroy?.();
    rightDocRef.current?.destroy?.();
    leftDocRef.current = null;
    rightDocRef.current = null;
    setLeftPdf(null);
    setRightPdf(null);
    setCurrentPage(1);
    setCompareMode("semantic");
    setZoom(1);
    setSearchQuery("");
    setDragOver(null);
    setLoadingSlot(null);
    setErrorMessage(null);
    setStatusMessage(null);
    setLeftThumbs({});
    setRightThumbs({});
    setLeftThumbLoading({});
    setRightThumbLoading({});
    setLeftPreviewUrl(null);
    setRightPreviewUrl(null);
    setOverlayPreviewUrl(null);
    if (leftInputRef.current) leftInputRef.current.value = "";
    if (rightInputRef.current) rightInputRef.current.value = "";
  }, []);

  const bothLoaded = Boolean(leftPdf && rightPdf);

  const UploadCard = ({ slot, file, onPick }: { slot: PdfSlot; file: LoadedPdf | null; onPick: () => void }) => (
    <div
      onDrop={(event) => handleDrop(slot, event)}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(slot);
      }}
      onDragLeave={() => setDragOver(null)}
      className={`rounded-[24px] border border-dashed px-5 py-10 text-center transition ${dragOver === slot ? "border-[#6c63ff] bg-[#6c63ff]/10" : "border-border bg-surface/30"}`}
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#6c63ff]/15 text-2xl text-[#b7b2ff]">{slot === "left" ? "📄" : "📑"}</div>
      <h3 className="mt-4 text-lg font-semibold text-white">{slot === "left" ? "Original PDF" : "Revised PDF"}</h3>
      <p className="mt-2 text-sm text-muted">Upload the {slot === "left" ? "baseline" : "comparison"} file to start page-by-page comparison.</p>
      <button type="button" onClick={onPick} className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#111118] transition hover:bg-[#f3f3f7]">Choose PDF</button>
      {file ? <div className="mt-5 rounded-2xl border border-border bg-surface/50 p-4 text-left text-sm text-white">{file.file.name}</div> : null}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <input ref={leftInputRef} type="file" accept="application/pdf" onChange={(event) => handleInputChange("left", event)} className="hidden" />
      <input ref={rightInputRef} type="file" accept="application/pdf" onChange={(event) => handleInputChange("right", event)} className="hidden" />

      {!bothLoaded ? (
        <div className="grid gap-6 p-6 xl:grid-cols-2">
          <UploadCard slot="left" file={leftPdf} onPick={() => leftInputRef.current?.click()} />
          <UploadCard slot="right" file={rightPdf} onPick={() => rightInputRef.current?.click()} />
          {(loadingSlot || statusMessage) ? <div className="xl:col-span-2 rounded-2xl border border-border bg-surface/50 px-4 py-3 text-sm text-foreground/75">{loadingSlot ? `Analyzing ${loadingSlot} PDF…` : statusMessage}</div> : null}
          {errorMessage ? <div className="xl:col-span-2 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{errorMessage}</div> : null}
        </div>
      ) : (
        <div>
          <div className="border-b border-border bg-surface px-4 py-3 md:px-6">
            <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className="rounded-full border border-border bg-surface/50 p-1">
                  <button type="button" onClick={() => setCompareMode("semantic")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${compareMode === "semantic" ? "bg-[#ff4d6d] text-white" : "text-foreground/75 hover:bg-surface/70"}`}>Semantic Text</button>
                  <button type="button" onClick={() => setCompareMode("overlay")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${compareMode === "overlay" ? "bg-[#ff4d6d] text-white" : "text-foreground/75 hover:bg-surface/70"}`}>Content Overlay</button>
                </div>
                <div className="max-w-full truncate rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-foreground/75 sm:max-w-[280px]">{leftFileName}</div>
                <div className="max-w-full truncate rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-foreground/75 sm:max-w-[280px]">{rightFileName}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-foreground/75">
                <button type="button" onClick={handleZoomOut} className="rounded-2xl border border-border bg-surface/50 px-3 py-2 transition hover:bg-surface/70">−</button>
                <div className="rounded-2xl border border-border bg-surface/50 px-3 py-2">{formatZoom(zoom)}</div>
                <button type="button" onClick={handleZoomIn} className="rounded-2xl border border-border bg-surface/50 px-3 py-2 transition hover:bg-surface/70">+</button>
                <button type="button" onClick={downloadReport} disabled={!filteredDiffEntries.length} className="rounded-full bg-[#ff4d6d] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#ff365a] disabled:cursor-not-allowed disabled:bg-[#8f4151]">Download report</button>
                <button type="button" onClick={resetWorkspace} className="rounded-full border border-border px-4 py-2 font-medium transition hover:bg-surface/60">Reset</button>
              </div>
            </div>
          </div>

          <div className="grid min-h-[880px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 2xl:border-r 2xl:border-border">
              <div className="grid min-w-0 xl:grid-cols-2">
                <section className="min-w-0 border-b border-border bg-surface xl:border-b-0 xl:border-r xl:border-border">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm text-muted md:px-6">
                    <div>Left PDF · Page {currentPage} of {leftPageCount}</div>
                    <div className="flex items-center gap-2 text-sm text-foreground/75">
                      <span className="text-xs uppercase tracking-[0.16em] text-muted-2">Zoom</span>
                      <button type="button" onClick={handleZoomOut} className="rounded-xl border border-border bg-surface/50 px-3 py-1.5 transition hover:bg-surface/70">−</button>
                      <div className="rounded-xl border border-border bg-surface/50 px-3 py-1.5">{formatZoom(zoom)}</div>
                      <button type="button" onClick={handleZoomIn} className="rounded-xl border border-border bg-surface/50 px-3 py-1.5 transition hover:bg-surface/70">+</button>
                      <button type="button" onClick={handleZoomReset} className="rounded-xl border border-border bg-surface/50 px-3 py-1.5 transition hover:bg-surface/70">Reset</button>
                    </div>
                  </div>
                  <div className="overflow-auto bg-[#d8d6de] px-4 py-6 md:px-8">
                    <div className="mx-auto flex min-w-max items-start justify-center" style={{ minWidth: `${viewerWidth + 48}px` }}>
                      <div className="relative overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.2)]" style={{ width: `${viewerWidth}px`, height: `${leftHeight}px` }}>
                        {leftPreviewUrl ? <img src={leftPreviewUrl} alt={`Left page ${currentPage}`} className="pointer-events-none absolute inset-0 h-full w-full object-contain" draggable={false} /> : <div className="absolute inset-0 flex items-center justify-center bg-white text-sm text-[#66697c]">{previewLoading ? "Rendering page preview…" : "Preview unavailable"}</div>}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="min-w-0 bg-surface xl:border-border">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm text-muted md:px-6">
                    <div>Right PDF · Page {currentPage} of {rightPageCount}</div>
                    <div className="flex items-center gap-2 text-sm text-foreground/75">
                      <span className="text-xs uppercase tracking-[0.16em] text-muted-2">Zoom</span>
                      <button type="button" onClick={handleZoomOut} className="rounded-xl border border-border bg-surface/50 px-3 py-1.5 transition hover:bg-surface/70">−</button>
                      <div className="rounded-xl border border-border bg-surface/50 px-3 py-1.5">{formatZoom(zoom)}</div>
                      <button type="button" onClick={handleZoomIn} className="rounded-xl border border-border bg-surface/50 px-3 py-1.5 transition hover:bg-surface/70">+</button>
                      <button type="button" onClick={handleZoomReset} className="rounded-xl border border-border bg-surface/50 px-3 py-1.5 transition hover:bg-surface/70">Reset</button>
                    </div>
                  </div>
                  <div className="overflow-auto bg-[#d8d6de] px-4 py-6 md:px-8">
                    <div className="mx-auto flex min-w-max items-start justify-center" style={{ minWidth: `${viewerWidth + 48}px` }}>
                      <div className="relative overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.2)]" style={{ width: `${viewerWidth}px`, height: `${rightHeight}px` }}>
                        {rightPreviewUrl ? <img src={rightPreviewUrl} alt={`Right page ${currentPage}`} className="pointer-events-none absolute inset-0 h-full w-full object-contain" draggable={false} /> : <div className="absolute inset-0 flex items-center justify-center bg-white text-sm text-[#66697c]">{previewLoading ? "Rendering page preview…" : "Preview unavailable"}</div>}
                        {compareMode === "overlay" && overlayPreviewUrl ? <img src={overlayPreviewUrl} alt={`Overlay diff page ${currentPage}`} className="pointer-events-none absolute inset-0 h-full w-full object-contain mix-blend-multiply opacity-95" draggable={false} /> : null}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <aside className="border-t border-border bg-surface px-4 py-5 2xl:border-t-0 2xl:border-l 2xl:border-border">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-7 text-[#cfe8ff]">
                {compareMode === "semantic" ? "Compare text changes between two PDFs." : "Overlay page renders to highlight visual changes on the current page."}
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-surface/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c8ea6]">Search text</div>
                <input type="text" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search text" className="mt-3 w-full rounded-2xl border border-border bg-surface/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6c63ff]/60" />
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-surface/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c8ea6]">Change report ({filteredDiffEntries.length})</div>
                  <button type="button" onClick={downloadReport} disabled={!filteredDiffEntries.length} className="text-xs font-semibold text-[#9ea0b5] transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40">Download</button>
                </div>

                <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
                  {Object.keys(groupedDiffEntries).length ? (
                    Object.entries(groupedDiffEntries)
                      .sort(([left], [right]) => Number(left) - Number(right))
                      .map(([pageNumber, entries]) => (
                        <div key={pageNumber}>
                          <button type="button" onClick={() => setCurrentPage(Number(pageNumber))} className="mb-2 text-left text-sm font-semibold text-white transition hover:text-[#ff9bb0]">Page {pageNumber}</button>
                          <div className="space-y-2">
                            {entries.map((entry) => (
                              <div key={entry.id} className={`rounded-2xl border px-3 py-3 ${entry.type === "addition" ? "border-emerald-400/20 bg-emerald-400/10" : "border-rose-400/20 bg-rose-400/10"}`}>
                                <div className="flex items-center justify-between gap-3">
                                  <div className={`text-xs font-semibold uppercase tracking-[0.15em] ${entry.type === "addition" ? "text-emerald-200" : "text-rose-200"}`}>{entry.type}</div>
                                  <div className="text-xs text-[#cfd2e4]">Page {entry.pageNumber}</div>
                                </div>
                                <div className="mt-2 text-sm leading-6 text-white">{truncateText(entry.text, 220)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm leading-6 text-muted">No differences matched the current filter.</div>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-surface/30 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c8ea6]">Pages</div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {pageNumbers.map((pageNumber) => {
                    const isActive = pageNumber === currentPage;
                    return (
                      <button key={pageNumber} type="button" onClick={() => setCurrentPage(pageNumber)} className={`rounded-xl border px-3 py-2 text-sm transition ${isActive ? "border-[#ff4d6d]/70 bg-[#ff4d6d]/10 text-white" : "border-border bg-surface/50 text-foreground/75 hover:bg-surface/70"}`}>{pageNumber}</button>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
      {(statusMessage && bothLoaded) ? <div className="border-t border-border px-6 py-3 text-sm text-foreground/75">{statusMessage}</div> : null}
      {errorMessage ? <div className="border-t border-rose-400/20 bg-rose-400/10 px-6 py-3 text-sm text-rose-100">{errorMessage}</div> : null}
    </div>
  );
}
