"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob, sanitizeBaseName } from "@/lib/client-pdf-utils";

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

type PageBox = { width: number; height: number };
type Point = { x: number; y: number };
type InteractionMode = "search" | "manual";

type LoadedPdf = {
  file: File;
  bytes: ArrayBuffer;
  pageCount: number;
  pageBoxes: PageBox[];
};

type TextFragment = {
  id: string;
  pageNumber: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type SearchMatch = {
  id: string;
  pageNumber: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fragmentIds: string[];
};

type RedactionMark = {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  source: "search" | "manual";
};

type DraftRect = {
  start: Point;
  current: Point;
};

type PreviewMap = Record<number, string>;
type LoadingMap = Record<number, boolean>;

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
  Util: { transform: (left: number[], right: number[]) => number[] };
  getDocument: (options: { data: ArrayBuffer }) => { promise: Promise<PdfJsDocument> };
};

const BASE_EDITOR_WIDTH = 780;
const MIN_RECT_SIZE = 0.01;
const MAX_VISIBLE_MATCHES = 60;

let pdfjsPromise: Promise<PdfJsModule> | null = null;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function boxFromPoints(start: Point, end: Point) {
  const left = clamp(Math.min(start.x, end.x), 0, 1);
  const top = clamp(Math.min(start.y, end.y), 0, 1);
  const right = clamp(Math.max(start.x, end.x), 0, 1);
  const bottom = clamp(Math.max(start.y, end.y), 0, 1);

  return {
    x: left,
    y: top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

function getNormalizedPoint(event: ReactPointerEvent<HTMLElement>, boundsElement?: HTMLElement | null): Point {
  const bounds = (boundsElement ?? event.currentTarget).getBoundingClientRect();
  return {
    x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
    y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
  };
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

function formatZoom(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function truncateLabel(value: string, maxLength = 42): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
}

function mergeFragmentsToSearchLines(fragments: TextFragment[]): SearchMatch[] {
  const byPage = new Map<number, TextFragment[]>();
  for (const fragment of fragments) {
    const pageItems = byPage.get(fragment.pageNumber);
    if (pageItems) {
      pageItems.push(fragment);
    } else {
      byPage.set(fragment.pageNumber, [fragment]);
    }
  }

  const lines: SearchMatch[] = [];

  for (const [pageNumber, pageFragments] of byPage.entries()) {
    const sorted = [...pageFragments].sort((left, right) => {
      const yDiff = left.y - right.y;
      return Math.abs(yDiff) > 0.004 ? yDiff : left.x - right.x;
    });

    const grouped: TextFragment[][] = [];
    for (const fragment of sorted) {
      const centerY = fragment.y + fragment.height / 2;
      const group = grouped.find((line) => {
        const ref = line[0];
        const refCenterY = ref.y + ref.height / 2;
        return Math.abs(refCenterY - centerY) <= Math.max(ref.height, fragment.height) * 0.7;
      });

      if (group) {
        group.push(fragment);
      } else {
        grouped.push([fragment]);
      }
    }

    for (const line of grouped) {
      const ordered = [...line].sort((left, right) => left.x - right.x);
      const left = Math.min(...ordered.map((item) => item.x));
      const top = Math.min(...ordered.map((item) => item.y));
      const right = Math.max(...ordered.map((item) => item.x + item.width));
      const bottom = Math.max(...ordered.map((item) => item.y + item.height));

      lines.push({
        id: createId(),
        pageNumber,
        text: ordered.map((item) => item.text.trim()).filter(Boolean).join(" "),
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
        fragmentIds: ordered.map((item) => item.id),
      });
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

async function extractTextFragments(pdfDoc: PdfJsDocument): Promise<{ pageBoxes: PageBox[]; fragments: TextFragment[] }> {
  const pdfjs = await getPdfjs();
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
      const transformed = pdfjs.Util.transform(viewport.transform, item.transform);
      const height = Math.max(Math.hypot(transformed[2], transformed[3]), item.height ?? 0, 6);
      const width = Math.max(item.width, height * 0.35);
      const x = transformed[4];
      const y = transformed[5] - height;

      fragments.push({
        id: createId(),
        pageNumber,
        text: item.str,
        x: clamp(x / viewport.width, 0, 1),
        y: clamp(y / viewport.height, 0, 1),
        width: clamp(width / viewport.width, 0.0025, 1),
        height: clamp((height * 1.08) / viewport.height, 0.008, 1),
      });
    }
  }

  return { pageBoxes, fragments };
}

export default function RedactPdfTool() {
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [textFragments, setTextFragments] = useState<TextFragment[]>([]);
  const [thumbnailUrls, setThumbnailUrls] = useState<PreviewMap>({});
  const [thumbnailLoadingPages, setThumbnailLoadingPages] = useState<LoadingMap>({});
  const [editorPreviewUrl, setEditorPreviewUrl] = useState<string | null>(null);
  const [editorPreviewLoading, setEditorPreviewLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [redactions, setRedactions] = useState<RedactionMark[]>([]);
  const [draftRect, setDraftRect] = useState<DraftRect | null>(null);
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorCanvasRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<PdfJsDocument | null>(null);
  const thumbnailTokenRef = useRef(0);
  const previewTokenRef = useRef(0);

  const pageNumbers = useMemo(() => {
    if (!pdf) return [] as number[];
    return Array.from({ length: pdf.pageCount }, (_, index) => index + 1);
  }, [pdf]);

  const currentBox = useMemo(() => pdf?.pageBoxes[currentPage - 1], [currentPage, pdf]);
  const currentAspect = currentBox ? currentBox.width / currentBox.height : 1 / 1.414;
  const editorWidth = Math.round(BASE_EDITOR_WIDTH * zoom);
  const editorHeight = Math.round(editorWidth / currentAspect);
  const searchEntries = useMemo(() => mergeFragmentsToSearchLines(textFragments), [textFragments]);

  const searchResults = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return [] as SearchMatch[];

    const queryWords = normalized.split(/\s+/).filter(Boolean);
    const phraseResults = searchEntries.filter((entry) => {
      const haystack = entry.text.toLowerCase();
      return queryWords.every((word) => haystack.includes(word));
    });

    const fragmentResults = textFragments
      .filter((fragment) => {
        const haystack = fragment.text.toLowerCase();
        return queryWords.every((word) => haystack.includes(word));
      })
      .map<SearchMatch>((fragment) => ({
        id: `fragment-${fragment.id}`,
        pageNumber: fragment.pageNumber,
        text: fragment.text,
        x: fragment.x,
        y: fragment.y,
        width: fragment.width,
        height: fragment.height,
        fragmentIds: [fragment.id],
      }));

    const combined = [...phraseResults, ...fragmentResults];
    return combined.filter((item, index) => combined.findIndex((candidate) => candidate.id === item.id) === index);
  }, [searchEntries, searchQuery, textFragments]);

  const visibleSearchResults = useMemo(
    () => searchResults.slice(0, MAX_VISIBLE_MATCHES),
    [searchResults],
  );

  const currentPageSearchResults = useMemo(
    () => visibleSearchResults.filter((fragment) => fragment.pageNumber === currentPage),
    [currentPage, visibleSearchResults],
  );

  const currentPageRedactions = useMemo(
    () => redactions.filter((mark) => mark.pageNumber === currentPage),
    [currentPage, redactions],
  );

  const groupedRedactions = useMemo(() => {
    return redactions.reduce<Record<number, RedactionMark[]>>((groups, mark) => {
      groups[mark.pageNumber] ??= [];
      groups[mark.pageNumber].push(mark);
      return groups;
    }, {});
  }, [redactions]);

  useEffect(() => {
    return () => {
      pdfDocRef.current?.destroy?.();
    };
  }, []);

  useEffect(() => {
    if (!pdf) {
      setThumbnailUrls({});
      setThumbnailLoadingPages({});
      return;
    }

    const pdfDoc = pdfDocRef.current;
    if (!pdfDoc) return;

    const token = ++thumbnailTokenRef.current;
    setThumbnailUrls({});

    (async () => {
      for (const pageNumber of pageNumbers) {
        setThumbnailLoadingPages((current) => ({ ...current, [pageNumber]: true }));
        try {
          const previewUrl = await renderPagePreview(pdfDoc, pageNumber, 0.34);
          if (thumbnailTokenRef.current !== token) return;
          setThumbnailUrls((current) => ({ ...current, [pageNumber]: previewUrl }));
        } catch {
          if (thumbnailTokenRef.current !== token) return;
        } finally {
          if (thumbnailTokenRef.current === token) {
            setThumbnailLoadingPages((current) => ({ ...current, [pageNumber]: false }));
          }
        }
      }
    })();
  }, [pageNumbers, pdf]);

  useEffect(() => {
    if (!pdf) {
      setEditorPreviewUrl(null);
      setEditorPreviewLoading(false);
      return;
    }

    const pdfDoc = pdfDocRef.current;
    if (!pdfDoc) return;

    const token = ++previewTokenRef.current;
    setEditorPreviewLoading(true);

    (async () => {
      try {
        const renderScale = currentBox
          ? Math.max(1.8, (editorWidth / currentBox.width) * (typeof window !== "undefined" ? Math.max(window.devicePixelRatio, 1) : 1))
          : 1.8;
        const previewUrl = await renderPagePreview(pdfDoc, currentPage, renderScale);
        if (previewTokenRef.current !== token) return;
        setEditorPreviewUrl(previewUrl);
      } catch {
        if (previewTokenRef.current !== token) return;
        setEditorPreviewUrl(null);
      } finally {
        if (previewTokenRef.current === token) {
          setEditorPreviewLoading(false);
        }
      }
    })();
  }, [currentBox, currentPage, editorWidth, pdf, zoom]);

  const resetWorkspace = useCallback(() => {
    pdfDocRef.current?.destroy?.();
    pdfDocRef.current = null;
    setPdf(null);
    setTextFragments([]);
    setThumbnailUrls({});
    setThumbnailLoadingPages({});
    setEditorPreviewUrl(null);
    setEditorPreviewLoading(false);
    setCurrentPage(1);
    setInteractionMode("search");
    setSearchQuery("");
    setRedactions([]);
    setDraftRect(null);
    setZoom(1);
    setProcessing(false);
    setLoadingPdf(false);
    setDragOver(false);
    setErrorMessage(null);
    setStatusMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const loadPdfFile = useCallback(async (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`File exceeds the 1GB size limit.`);
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please choose a PDF file.");
      return;
    }

    setLoadingPdf(true);
    setErrorMessage(null);
    setStatusMessage("Analyzing pages and text content…");
    setRedactions([]);
    setSearchQuery("");
    setDraftRect(null);
    setCurrentPage(1);
    setZoom(1);

    try {
      const bytes = await file.arrayBuffer();
      const pdfjs = await getPdfjs();
      const pdfDoc = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
      const { pageBoxes, fragments } = await extractTextFragments(pdfDoc);

      pdfDocRef.current?.destroy?.();
      pdfDocRef.current = pdfDoc;
      setPdf({
        file,
        bytes,
        pageCount: pdfDoc.numPages,
        pageBoxes,
      });
      setTextFragments(fragments);
      setStatusMessage(`Loaded ${pdfDoc.numPages} page${pdfDoc.numPages === 1 ? "" : "s"}. Search text or draw redaction boxes.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load PDF.");
      pdfDocRef.current?.destroy?.();
      pdfDocRef.current = null;
      setPdf(null);
      setTextFragments([]);
    } finally {
      setLoadingPdf(false);
    }
  }, []);

  const onFileInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    void loadPdfFile(event.target.files?.[0] ?? null);
  }, [loadPdfFile]);

  const onDrop = useCallback((event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    void loadPdfFile(event.dataTransfer.files?.[0] ?? null);
  }, [loadPdfFile]);

  const addRedactionMark = useCallback((mark: Omit<RedactionMark, "id">) => {
    setRedactions((current) => {
      const duplicate = current.some((item) =>
        item.pageNumber === mark.pageNumber &&
        Math.abs(item.x - mark.x) < 0.002 &&
        Math.abs(item.y - mark.y) < 0.002 &&
        Math.abs(item.width - mark.width) < 0.002 &&
        Math.abs(item.height - mark.height) < 0.002,
      );

      if (duplicate) return current;

      return [...current, { ...mark, id: createId() }];
    });
  }, []);

  const addSearchResult = useCallback((fragment: SearchMatch) => {
    addRedactionMark({
      pageNumber: fragment.pageNumber,
      x: clamp(fragment.x - 0.004, 0, 1),
      y: clamp(fragment.y - 0.003, 0, 1),
      width: clamp(fragment.width + 0.008, MIN_RECT_SIZE, 1),
      height: clamp(fragment.height + 0.006, MIN_RECT_SIZE, 1),
      label: truncateLabel(fragment.text),
      source: "search",
    });
    setCurrentPage(fragment.pageNumber);
  }, [addRedactionMark]);

  const addAllSearchResults = useCallback(() => {
    for (const fragment of visibleSearchResults) {
      addSearchResult(fragment);
    }
  }, [addSearchResult, visibleSearchResults]);

  const removeRedaction = useCallback((markId: string) => {
    setRedactions((current) => current.filter((mark) => mark.id !== markId));
  }, []);

  const clearAllRedactions = useCallback(() => {
    setRedactions([]);
  }, []);

  const onCanvasPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pdf || interactionMode !== "manual") return;
    event.preventDefault();
    const point = getNormalizedPoint(event, editorCanvasRef.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraftRect({ start: point, current: point });
  }, [interactionMode, pdf]);

  const onCanvasPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draftRect || interactionMode !== "manual") return;
    const point = getNormalizedPoint(event, editorCanvasRef.current);
    setDraftRect({ ...draftRect, current: point });
  }, [draftRect, interactionMode]);

  const onCanvasPointerUp = useCallback(() => {
    if (!draftRect || interactionMode !== "manual") return;
    const box = boxFromPoints(draftRect.start, draftRect.current);
    if (box.width >= MIN_RECT_SIZE && box.height >= MIN_RECT_SIZE) {
      addRedactionMark({
        pageNumber: currentPage,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        label: `Manual area ${currentPage}`,
        source: "manual",
      });
      setStatusMessage(`Added manual redaction on page ${currentPage}.`);
    }
    setDraftRect(null);
  }, [addRedactionMark, currentPage, draftRect, interactionMode]);

  const handleExport = useCallback(async () => {
    if (!pdf || !pdfDocRef.current || !redactions.length) return;

    setProcessing(true);
    setErrorMessage(null);
    setStatusMessage("Rendering redacted pages…");

    try {
      const output = await PDFDocument.create();

      for (let pageNumber = 1; pageNumber <= pdf.pageCount; pageNumber += 1) {
        const page = await pdfDocRef.current.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not create export canvas.");
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport, canvas } as never).promise;

        const pageMarks = redactions.filter((mark) => mark.pageNumber === pageNumber);
        context.fillStyle = "#000000";
        for (const mark of pageMarks) {
          context.fillRect(
            Math.round(mark.x * canvas.width),
            Math.round(mark.y * canvas.height),
            Math.max(2, Math.round(mark.width * canvas.width)),
            Math.max(2, Math.round(mark.height * canvas.height)),
          );
        }

        const imageBytes = dataUrlToUint8Array(canvas.toDataURL("image/jpeg", 0.92));
        const embeddedImage = await output.embedJpg(imageBytes);
        const pageSize = pdf.pageBoxes[pageNumber - 1];
        const outPage = output.addPage([pageSize.width, pageSize.height]);
        outPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: pageSize.width,
          height: pageSize.height,
        });
      }

      const bytes = await output.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      downloadBlob(blob, `${sanitizeBaseName(pdf.file.name)}-redacted.pdf`);
      setStatusMessage("Redacted PDF exported successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to export redacted PDF.");
    } finally {
      setProcessing(false);
    }
  }, [pdf, redactions]);

  const currentDraftBox = draftRect ? boxFromPoints(draftRect.start, draftRect.current) : null;

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <input ref={fileInputRef} type="file" accept="application/pdf" onChange={onFileInput} className="hidden" />

      {!pdf ? (
        <section
          onDrop={onDrop}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`m-6 rounded-[28px] border border-dashed px-6 py-14 text-center transition ${dragOver ? "border-[#ff4d6d] bg-[#ff4d6d]/10" : "border-border bg-surface/30"}`}
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#ff4d6d]/10 text-3xl text-[#ff8aa0]">🛡️</div>
          <h2 className="mt-5 font-display text-3xl font-bold text-white">Redact PDF like a full workspace</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted md:text-base">
            Upload a PDF, search for sensitive text, add manual black-out boxes, review each marked area, and export a flattened redacted PDF.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#111118] transition hover:bg-[#f3f3f7]"
            >
              Choose PDF
            </button>
            <div className="rounded-full border border-border px-4 py-3 text-sm text-muted">
              Search text • manual boxes • flattened export
            </div>
          </div>
          {loadingPdf || statusMessage ? (
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-border bg-surface/50 px-4 py-3 text-sm text-foreground/75">
              {loadingPdf ? "Analyzing PDF and extracting searchable text…" : statusMessage}
            </div>
          ) : null}
          {errorMessage ? (
            <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {errorMessage}
            </div>
          ) : null}
        </section>
      ) : (
        <div>
          <div className="border-b border-border bg-surface px-4 py-3 md:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-border bg-surface/50 p-1">
                  <button
                    type="button"
                    onClick={() => setInteractionMode("search")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${interactionMode === "search" ? "bg-[#ff4d6d] text-white" : "text-foreground/75 hover:bg-surface/70"}`}
                  >
                    Search text
                  </button>
                  <button
                    type="button"
                    onClick={() => setInteractionMode("manual")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${interactionMode === "manual" ? "bg-[#ff4d6d] text-white" : "text-foreground/75 hover:bg-surface/70"}`}
                  >
                    Manual redact
                  </button>
                </div>
                <div className="rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-foreground/75">
                  {pdf.file.name}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-foreground/75">
                <button
                  type="button"
                  onClick={() => setZoom((current) => clamp(Number((current - 0.1).toFixed(2)), 0.7, 2.4))}
                  className="rounded-2xl border border-border bg-surface/50 px-3 py-2 transition hover:bg-surface/70"
                >
                  −
                </button>
                <div className="rounded-2xl border border-border bg-surface/50 px-3 py-2">{formatZoom(zoom)}</div>
                <button
                  type="button"
                  onClick={() => setZoom((current) => clamp(Number((current + 0.1).toFixed(2)), 0.7, 2.4))}
                  className="rounded-2xl border border-border bg-surface/50 px-3 py-2 transition hover:bg-surface/70"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={clearAllRedactions}
                  disabled={!redactions.length}
                  className="rounded-full border border-border px-4 py-2 font-medium transition hover:bg-surface/60 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={!redactions.length || processing}
                  className="rounded-full bg-[#ff4d6d] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#ff365a] disabled:cursor-not-allowed disabled:bg-[#8f4151]"
                >
                  {processing ? "Redacting…" : "Redact"}
                </button>
                <button
                  type="button"
                  onClick={resetWorkspace}
                  className="rounded-full border border-border px-4 py-2 font-medium transition hover:bg-surface/60"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="grid min-h-[860px] xl:grid-cols-[192px_minmax(0,1fr)_340px]">
            <aside className="border-r border-border bg-surface px-3 py-4">
              <div className="mb-3 flex items-center justify-between px-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8d8ea5]">Pages</div>
                  <div className="mt-1 text-sm text-white">{pdf.pageCount} thumbnails</div>
                </div>
                <div className="rounded-full border border-border bg-surface/60 px-2 py-1 text-xs text-foreground/75">
                  {redactions.length} marks
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto pr-1 xl:max-h-[770px]">
                {pageNumbers.map((pageNumber) => {
                  const previewUrl = thumbnailUrls[pageNumber] ?? null;
                  const isLoading = thumbnailLoadingPages[pageNumber] ?? false;
                  const pageBox = pdf.pageBoxes[pageNumber - 1];
                  const aspect = pageBox.width / pageBox.height;
                  const count = redactions.filter((mark) => mark.pageNumber === pageNumber).length;

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-full rounded-2xl border p-2 text-left transition ${currentPage === pageNumber ? "border-[#ff4d6d]/70 bg-[#1b1015] shadow-[0_0_0_1px_rgba(255,77,109,0.25)]" : "border-border bg-white/[0.02] hover:bg-surface/70"}`}
                    >
                      <div className="flex items-center justify-between px-1 pb-2 text-xs text-[#c6c7d7]">
                        <span>Page {pageNumber}</span>
                        <span>{count} mark{count === 1 ? "" : "s"}</span>
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
                Page {currentPage} of {pdf.pageCount} · {currentPageRedactions.length} redaction mark{currentPageRedactions.length === 1 ? "" : "s"} on this page
              </div>

              <div className="flex-1 overflow-auto bg-[#d8d6de] px-4 py-6 md:px-8">
                <div className="mx-auto flex min-h-full items-start justify-center" style={{ minWidth: `${editorWidth + 64}px` }}>
                  <div
                    ref={editorCanvasRef}
                    className={`relative overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.2)] ${interactionMode === "manual" ? "cursor-crosshair" : "cursor-default"}`}
                    style={{ width: `${editorWidth}px`, height: `${editorHeight}px`, touchAction: interactionMode === "manual" ? "none" : "auto" }}
                    onPointerDown={onCanvasPointerDown}
                    onPointerMove={onCanvasPointerMove}
                    onPointerUp={onCanvasPointerUp}
                    onPointerLeave={onCanvasPointerUp}
                  >
                    {editorPreviewUrl ? (
                      <img src={editorPreviewUrl} alt={`Page ${currentPage}`} className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none" draggable={false} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-white text-sm text-[#66697c]">
                        {editorPreviewLoading ? "Rendering page preview…" : "Preview unavailable"}
                      </div>
                    )}

                    <div className="absolute inset-0">
                      {interactionMode === "search"
                        ? currentPageSearchResults.map((fragment) => {
                            const alreadyMarked = currentPageRedactions.some((mark) =>
                              Math.abs(mark.x - clamp(fragment.x - 0.004, 0, 1)) < 0.003 &&
                              Math.abs(mark.y - clamp(fragment.y - 0.003, 0, 1)) < 0.003,
                            );
                            if (alreadyMarked) return null;

                            return (
                              <button
                                key={fragment.id}
                                type="button"
                                onClick={() => addSearchResult(fragment)}
                                title={`Mark “${fragment.text}” for redaction`}
                                className="absolute rounded-sm border-2 border-dashed border-[#3b82f6] bg-[#3b82f6]/10 transition hover:bg-[#3b82f6]/15"
                                style={{
                                  left: `${fragment.x * 100}%`,
                                  top: `${fragment.y * 100}%`,
                                  width: `${fragment.width * 100}%`,
                                  height: `${fragment.height * 100}%`,
                                }}
                              />
                            );
                          })
                        : null}

                      {currentPageRedactions.map((mark) => (
                        <div
                          key={mark.id}
                          className="absolute border border-black/90 bg-black/95 shadow-[0_0_0_1px_rgba(0,0,0,0.55)]"
                          style={{
                            left: `${mark.x * 100}%`,
                            top: `${mark.y * 100}%`,
                            width: `${mark.width * 100}%`,
                            height: `${mark.height * 100}%`,
                          }}
                        />
                      ))}

                      {currentDraftBox && interactionMode === "manual" ? (
                        <div
                          className="pointer-events-none absolute border-2 border-dashed border-[#ff4d6d] bg-black/65"
                          style={{
                            left: `${currentDraftBox.x * 100}%`,
                            top: `${currentDraftBox.y * 100}%`,
                            width: `${currentDraftBox.width * 100}%`,
                            height: `${currentDraftBox.height * 100}%`,
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </main>

            <aside className="border-l border-border bg-surface px-4 py-5">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-7 text-[#cfe8ff]">
                Search for sensitive text or switch to manual mode and drag black boxes directly over content.
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-surface/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c8ea6]">Search text</div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search text"
                  className="mt-3 w-full rounded-2xl border border-border bg-surface/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3b82f6]/60"
                />

                {searchQuery.trim() ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#9ea0b5]">
                      <span>{searchResults.length} match{searchResults.length === 1 ? "" : "es"} found</span>
                      <button
                        type="button"
                        onClick={addAllSearchResults}
                        disabled={!visibleSearchResults.length}
                        className="font-semibold text-[#7ab7ff] transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Mark visible
                      </button>
                    </div>

                    <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
                      {visibleSearchResults.length ? (
                        visibleSearchResults.map((result) => (
                          <div key={result.id} className="rounded-2xl border border-border bg-surface/30 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-medium text-white">{truncateLabel(result.text, 30)}</div>
                                <div className="mt-1 text-xs text-[#9ea0b5]">Page {result.pageNumber}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => addSearchResult(result)}
                                className="rounded-full border border-[#3b82f6]/40 px-3 py-1 text-xs font-semibold text-[#9bc8ff] transition hover:bg-[#3b82f6]/10 hover:text-foreground"
                              >
                                Mark
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border px-4 py-4 text-sm text-muted">
                          No matches found for this query.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-border px-4 py-4 text-sm text-muted">
                    Type a word or phrase to find matching text across the PDF.
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-surface/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c8ea6]">Marked for redaction</div>
                  <button
                    type="button"
                    onClick={clearAllRedactions}
                    disabled={!redactions.length}
                    className="text-xs font-semibold text-[#9ea0b5] transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Clear all
                  </button>
                </div>

                <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
                  {Object.keys(groupedRedactions).length ? (
                    Object.entries(groupedRedactions)
                      .sort(([left], [right]) => Number(left) - Number(right))
                      .map(([pageNumber, marks]) => (
                        <div key={pageNumber}>
                          <div className="mb-2 text-sm font-semibold text-white">Page {pageNumber}</div>
                          <div className="space-y-2">
                            {marks.map((mark) => (
                              <div key={mark.id} className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-surface/30 px-3 py-3">
                                <div>
                                  <div className="text-sm text-white">{mark.label}</div>
                                  <div className="mt-1 text-xs text-[#9ea0b5]">{mark.source === "search" ? "Search match" : "Manual area"}</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeRedaction(mark.id)}
                                  className="rounded-full border border-border px-2 py-1 text-xs text-[#c5c6d8] transition hover:bg-surface/60"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm leading-6 text-muted">
                      Select search results or drag manual boxes to build your redaction list.
                    </div>
                  )}
                </div>
              </div>

              {statusMessage ? (
                <div className="mt-5 rounded-2xl border border-border bg-surface/30 px-4 py-3 text-sm text-foreground/75">
                  {statusMessage}
                </div>
              ) : null}

              {errorMessage ? (
                <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {errorMessage}
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
