"use client";

import { useCallback, useRef, useState } from "react";
import JSZip from "jszip";
import {
  MAX_CONVERSION_FILES,
  downloadBlob,
  formatBytes,
  sanitizeBaseName,
} from "@/lib/client-pdf-utils";

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

type QualityPreset = "high" | "medium" | "low";

type QueuedPdf = {
  id: string;
  file: File;
  pageCount: number;
};

type ConvertedPage = {
  id: string;
  sourceId: string;
  sourceName: string;
  pageNumber: number;
  fileName: string;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
};

type ConvertedSource = {
  id: string;
  sourceName: string;
  pageCount: number;
  zipFileName: string;
  totalSize: number;
  pages: ConvertedPage[];
};

type ConversionResult = {
  files: ConvertedSource[];
  zipBlob: Blob | null;
};

type PdfJsDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getViewport: (options: { scale: number }) => { width: number; height: number };
    render: (options: unknown) => { promise: Promise<void> };
  }>;
};

type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { data: Uint8Array }) => { promise: Promise<PdfJsDocument> };
};

const QUALITY_MAP: Record<QualityPreset, { scale: number; jpegQuality: number; label: string }> = {
  high: { scale: 3, jpegQuality: 0.95, label: "High (300 DPI)" },
  medium: { scale: 2, jpegQuality: 0.85, label: "Medium (200 DPI)" },
  low: { scale: 1, jpegQuality: 0.7, label: "Low (100 DPI)" },
};

let idCounter = 0;
let pdfjsPromise: Promise<PdfJsModule> | null = null;

function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}_${Date.now()}`;
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
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

async function openPdfDocument(pdfBytes: ArrayBuffer) {
  const pdfjs = await getPdfjs();
  return pdfjs.getDocument({ data: new Uint8Array(pdfBytes.slice(0)) }).promise;
}

async function renderPageToJpg(
  pdf: PdfJsDocument,
  pageNumber: number,
  scale: number,
  jpegQuality: number,
): Promise<Omit<ConvertedPage, "id" | "sourceId" | "sourceName" | "fileName">> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create canvas context.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: context, viewport, canvas } as never).promise;

  const dataUrl = canvas.toDataURL("image/jpeg", jpegQuality);
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return {
    pageNumber,
    dataUrl,
    blob,
    width: canvas.width,
    height: canvas.height,
  };
}

async function getPdfPageCount(bytes: ArrayBuffer): Promise<number> {
  const pdf = await openPdfDocument(bytes);
  return pdf.numPages;
}

async function buildSourceZip(source: ConvertedSource): Promise<Blob | null> {
  if (source.pages.length <= 1) {
    return null;
  }

  const zip = new JSZip();
  for (const page of source.pages) {
    zip.file(page.fileName, page.blob);
  }

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

async function buildAllResultsZip(files: ConvertedSource[]): Promise<Blob | null> {
  const totalPages = files.reduce((sum, file) => sum + file.pages.length, 0);
  if (totalPages <= 1) {
    return null;
  }

  const zip = new JSZip();
  for (const file of files) {
    const folder = zip.folder(sanitizeBaseName(file.sourceName));
    for (const page of file.pages) {
      folder?.file(page.fileName, page.blob);
    }
  }

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export default function PdfToJpgTool() {
  const [queue, setQueue] = useState<QueuedPdf[]>([]);
  const [quality, setQuality] = useState<QualityPreset>("high");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, label: "" });
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;

    setErrorMessage(null);

    const pdfFiles = Array.from(fileList).filter(isPdfFile);
    if (!pdfFiles.length) {
      setErrorMessage("Please upload PDF files only.");
      return;
    }

    const oversized = pdfFiles.filter((file) => file.size > MAX_FILE_SIZE);
    const validFiles = pdfFiles.filter((file) => file.size <= MAX_FILE_SIZE);

    if (oversized.length) {
      setErrorMessage(`${oversized.length} file${oversized.length > 1 ? "s" : ""} exceeded the 1GB size limit and ${oversized.length > 1 ? "were" : "was"} skipped.`);
    }

    if (!validFiles.length) return;

    const remainingSlots = MAX_CONVERSION_FILES - queue.length;
    if (remainingSlots <= 0) {
      setErrorMessage(`You can convert a maximum of ${MAX_CONVERSION_FILES} PDF files at a time.`);
      return;
    }

    const limitedFiles = validFiles.slice(0, remainingSlots);
    const preparedFiles: QueuedPdf[] = [];

    for (const file of limitedFiles) {
      try {
        const bytes = await file.arrayBuffer();
        const pageCount = await getPdfPageCount(bytes);
        preparedFiles.push({ id: uid("pdf"), file, pageCount });
      } catch {
        setErrorMessage(`Could not read ${file.name}. It may be corrupted or password-protected.`);
      }
    }

    if (!preparedFiles.length) return;

    setQueue((prev) => [...prev, ...preparedFiles]);
    setResult(null);

    if (validFiles.length > remainingSlots) {
      setErrorMessage(`Only the first ${remainingSlots} PDF file${remainingSlots > 1 ? "s were" : " was"} added.`);
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
      void addFiles(event.dataTransfer.files);
    },
    [addFiles],
  );

  const handleConvert = useCallback(async () => {
    if (!queue.length) return;

    setProcessing(true);
    setResult(null);
    setErrorMessage(null);

    const { scale, jpegQuality } = QUALITY_MAP[quality];
    const totalPages = queue.reduce((sum, item) => sum + item.pageCount, 0);
    setProgress({ done: 0, total: totalPages, label: queue[0]?.file.name ?? "" });

    try {
      const convertedFiles: ConvertedSource[] = [];
      let completedPages = 0;

      for (const item of queue) {
        const bytes = await item.file.arrayBuffer();
        const pdf = await openPdfDocument(bytes);
        const baseName = sanitizeBaseName(item.file.name);
        const convertedPages: ConvertedPage[] = [];

        for (let pageNumber = 1; pageNumber <= item.pageCount; pageNumber += 1) {
          setProgress({ done: completedPages, total: totalPages, label: `${item.file.name} · page ${pageNumber}` });
          const page = await renderPageToJpg(pdf, pageNumber, scale, jpegQuality);
          completedPages += 1;
          convertedPages.push({
            ...page,
            id: uid("jpg"),
            sourceId: item.id,
            sourceName: item.file.name,
            fileName: `${baseName}_page${page.pageNumber}.jpg`,
          });
          setProgress({ done: completedPages, total: totalPages, label: `${item.file.name} · page ${pageNumber}` });
        }

        convertedFiles.push({
          id: item.id,
          sourceName: item.file.name,
          pageCount: item.pageCount,
          zipFileName: `${baseName}_images.zip`,
          totalSize: convertedPages.reduce((sum, page) => sum + page.blob.size, 0),
          pages: convertedPages,
        });
      }

      const zipBlob = await buildAllResultsZip(convertedFiles);
      setResult({ files: convertedFiles, zipBlob });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to convert one or more PDFs to JPG images.",
      );
    } finally {
      setProcessing(false);
    }
  }, [quality, queue]);

  const handleDownloadAll = useCallback(() => {
    if (!result) return;

    const totalPages = result.files.reduce((sum, file) => sum + file.pages.length, 0);
    if (totalPages === 1) {
      const page = result.files[0]?.pages[0];
      if (page) {
        downloadBlob(page.blob, page.fileName);
      }
      return;
    }

    if (result.zipBlob) {
      downloadBlob(result.zipBlob, "pdf-to-jpg-images.zip");
    }
  }, [result]);

  const handleDownloadSource = useCallback(async (source: ConvertedSource) => {
    if (source.pages.length === 1) {
      downloadBlob(source.pages[0].blob, source.pages[0].fileName);
      return;
    }

    const zipBlob = await buildSourceZip(source);
    if (zipBlob) {
      downloadBlob(zipBlob, source.zipFileName);
    }
  }, []);

  const handleDownloadSingle = useCallback((page: ConvertedPage) => {
    downloadBlob(page.blob, page.fileName);
  }, []);

  const handleReset = useCallback(() => {
    setQueue([]);
    setResult(null);
    setErrorMessage(null);
    setProgress({ done: 0, total: 0, label: "" });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const queuedSize = queue.reduce((sum, item) => sum + item.file.size, 0);
  const totalOutputSize = result?.files.reduce((sum, file) => sum + file.totalSize, 0) ?? 0;
  const totalOutputPages = result?.files.reduce((sum, file) => sum + file.pages.length, 0) ?? 0;

  return (
    <div className="space-y-4">
      {!result && !processing && (
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
                  : queue.length
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border hover:border-border-strong"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={(event) => {
                  void addFiles(event.target.files);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">
                📄
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                Drop your PDF files here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-2">
                Convert up to {MAX_CONVERSION_FILES} PDFs into JPG images. Every page is exported as a separate JPG.
              </p>
            </div>
          </div>

          {queue.length > 0 && (
            <div className="border-t border-border">
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  {queue.length} PDF file{queue.length > 1 ? "s" : ""} selected
                  <span className="ml-2 text-xs font-normal text-muted-2">({formatBytes(queuedSize)} total)</span>
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
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6c63ff]/10 text-sm font-bold text-[#a39cff]">
                      📄
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{item.file.name}</p>
                      <p className="text-[10px] text-muted-2">
                        {formatBytes(item.file.size)} · {item.pageCount} page{item.pageCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(item.id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 dark:border-transparent dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {queue.length > 0 && (
            <div className="border-t border-border px-5 py-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-3">
                Image Quality
              </h3>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(QUALITY_MAP) as QualityPreset[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setQuality(key)}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                      quality === key
                        ? "bg-[#6c63ff] text-white shadow-[0_4px_12px_rgba(108,99,255,.35)]"
                        : "bg-surface-3/50 text-muted hover:bg-surface-3 hover:text-foreground"
                    }`}
                  >
                    {QUALITY_MAP[key].label}
                  </button>
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
              🖼️ Convert to JPG
            </button>
          </div>
        </div>
      )}

      {processing && (
        <div className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface px-5 py-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-[#6c63ff]" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-4 border-border border-b-[#ffb347]"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>
          <p className="text-center text-sm font-semibold text-slate-900 dark:text-white">
            Converting {progress.done} of {progress.total} pages
          </p>
          {progress.label ? <p className="text-center text-xs text-muted-2">{progress.label}</p> : null}
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-[#6c63ff] transition-all duration-300"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {result && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {result.files.length} PDF{result.files.length !== 1 ? "s" : ""} converted
                </h3>
                <p className="text-xs text-muted-2">
                  {totalOutputPages} JPG file{totalOutputPages !== 1 ? "s" : ""} · {formatBytes(totalOutputSize)} total · Quality: {QUALITY_MAP[quality].label}
                </p>
              </div>
              <button
                onClick={handleDownloadAll}
                className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ Download {totalOutputPages > 1 ? "All (ZIP)" : "JPG"}
              </button>
            </div>

            <div className="space-y-5 p-5">
              {result.files.map((source) => (
                <div key={source.id} className="overflow-hidden rounded-2xl border border-border bg-surface-2">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{source.sourceName}</p>
                      <p className="text-xs text-muted-2">
                        {source.pageCount} page{source.pageCount !== 1 ? "s" : ""} · {formatBytes(source.totalSize)}
                      </p>
                    </div>
                    <button
                      onClick={() => void handleDownloadSource(source)}
                      className="rounded-lg bg-surface-3/50 px-4 py-2 text-xs font-semibold text-muted transition hover:bg-surface-3 hover:text-foreground"
                    >
                      Download {source.pages.length > 1 ? "ZIP" : "JPG"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
                    {source.pages.map((page) => (
                      <div
                        key={page.id}
                        className="group overflow-hidden rounded-xl border border-border bg-surface transition hover:border-[#6c63ff]/30"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
                          <img
                            src={page.dataUrl}
                            alt={`${source.sourceName} page ${page.pageNumber}`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="flex items-center justify-between px-3 py-2">
                          <div>
                            <p className="text-xs font-medium text-slate-900 dark:text-white">Page {page.pageNumber}</p>
                            <p className="text-[10px] text-muted-2">
                              {page.width}×{page.height} · {formatBytes(page.blob.size)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDownloadSingle(page)}
                            className="rounded-lg bg-surface-3/50 px-2.5 py-1.5 text-[10px] font-semibold text-muted transition hover:bg-surface-3 hover:text-foreground"
                          >
                            ⬇
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface px-5 py-4 text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:text-white dark:hover:bg-white/[.03]"
            >
              Convert More PDFs
            </button>
          </div>
        </>
      )}
    </div>
  );
}
