"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { renderPageThumbnail } from "@/lib/pdfjs-loader";
import { analytics, classifyError, sizeBucket } from "@/lib/analytics";

/** Identity for every analytics event this tool emits. */
const TOOL = { tool_slug: "split-pdf", category: "pdf", processing_mode: "browser" } as const;

/** Bucketed so an exact document page count is never transmitted. */
function pageBucket(n: number): string {
  if (n <= 1) return "1";
  if (n <= 10) return "2-10";
  if (n <= 50) return "11-50";
  if (n <= 200) return "51-200";
  return "200+";
}

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

type SplitTab = "range" | "pages";
type RangeMode = "custom" | "fixed";

type RangeItem = {
  id: string;
  from: number;
  to: number;
};

type UploadedPdf = {
  file: File;
  pageCount: number;
  bytes: ArrayBuffer;
};

type OutputFile = {
  fileName: string;
  blob: Blob;
  pageCount: number;
};

type SplitResult = {
  files: OutputFile[];
  zipBlob: Blob | null;
};

type PreviewCard = {
  id: string;
  title: string;
  from: number;
  to: number;
  merged: boolean;
};

const DEFAULT_RANGE: RangeItem = { id: "range_1", from: 1, to: 1 };

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

let rangeCounter = 1;
function createRange(from = 1, to = 1): RangeItem {
  rangeCounter += 1;
  return { id: `range_${rangeCounter}`, from, to };
}

function sanitizeBaseName(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "");
}

async function loadUploadedPdf(file: File): Promise<UploadedPdf> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  return { file, pageCount: pdf.getPageCount(), bytes };
}

async function renderPdfPagePreview(bytes: ArrayBuffer, pageNumber: number): Promise<string | null> {
  if (typeof window === "undefined") return null;
  // Shared loader: pdf.js and its worker both come from this site's own
  // /vendor/pdfjs. This used to fetch the worker from unpkg.com.
  return renderPageThumbnail(bytes, pageNumber, 0.42);
}

function buildRangePreviewCards(
  items: Array<{ id: string; from: number; to: number }>,
  mergeAllRanges: boolean,
): PreviewCard[] {
  return items.map((item, index) => ({
    id: item.id,
    title: mergeAllRanges ? `Range ${index + 1} • merged` : `Range ${index + 1}`,
    from: Math.min(item.from, item.to),
    to: Math.max(item.from, item.to),
    merged: mergeAllRanges,
  }));
}

function buildPagesPreviewCards(selectedPages: number[], mergeSelectedPages: boolean): PreviewCard[] {
  if (!selectedPages.length) return [];

  if (mergeSelectedPages) {
    return [
      {
        id: "selected-pages-merged",
        title: "Selected pages • merged",
        from: selectedPages[0],
        to: selectedPages[selectedPages.length - 1],
        merged: true,
      },
    ];
  }

  return selectedPages.map((page) => ({
    id: `selected-page-${page}`,
    title: `Page ${page}`,
    from: page,
    to: page,
    merged: false,
  }));
}

function PreviewDocument({
  imageUrl,
  pageNumber,
}: {
  imageUrl: string | null;
  pageNumber: number;
}) {
  return (
    <div className="rounded-[22px] border border-[#d1d5db] bg-[#f8fafc] p-4 shadow-[0_12px_40px_rgba(15,23,42,.08)]">
      <div className="mx-auto aspect-[210/297] w-full max-w-[180px] overflow-hidden rounded-sm bg-white shadow-[0_10px_28px_rgba(15,23,42,.14)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Preview of page ${pageNumber}`}
            width={420}
            height={594}
            unoptimized
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full flex-col bg-white px-4 py-5 text-[#1f2937]">
            <div className="mx-auto mb-4 h-2 w-16 rounded-full bg-[#111827]" />
            <div className="space-y-2">
              <div className="h-1.5 w-full rounded bg-slate-200" />
              <div className="h-1.5 w-[92%] rounded bg-slate-200" />
              <div className="h-1.5 w-[88%] rounded bg-slate-200" />
              <div className="h-1.5 w-[84%] rounded bg-slate-200" />
              <div className="h-1.5 w-[72%] rounded bg-slate-200" />
            </div>
            <div className="mt-auto grid grid-cols-4 gap-1">
              <div className="h-10 rounded-sm bg-amber-300" />
              <div className="h-14 rounded-sm bg-orange-400" />
              <div className="h-8 rounded-sm bg-sky-400" />
              <div className="h-12 rounded-sm bg-rose-400" />
            </div>
          </div>
        )}
      </div>
      <p className="mt-4 text-center text-base font-medium text-[#111827]">{pageNumber}</p>
    </div>
  );
}

function buildFixedRanges(pageCount: number, chunkSize: number): Array<{ from: number; to: number }> {
  const ranges: Array<{ from: number; to: number }> = [];

  for (let start = 1; start <= pageCount; start += chunkSize) {
    ranges.push({ from: start, to: Math.min(pageCount, start + chunkSize - 1) });
  }

  return ranges;
}

function parsePageSelection(input: string, pageCount: number): number[] {
  const cleaned = input.replace(/\s+/g, "");
  if (!cleaned) throw new Error("Enter page numbers like 1,3,5-8.");

  const selected = new Set<number>();

  for (const part of cleaned.split(",")) {
    if (!part) continue;

    if (part.includes("-")) {
      const [rawStart, rawEnd] = part.split("-");
      const start = Number(rawStart);
      const end = Number(rawEnd);

      if (!Number.isInteger(start) || !Number.isInteger(end)) {
        throw new Error(`Invalid page range: ${part}`);
      }

      const from = Math.min(start, end);
      const to = Math.max(start, end);
      if (from < 1 || to > pageCount) {
        throw new Error(`Page range ${part} is outside the document bounds.`);
      }

      for (let page = from; page <= to; page += 1) selected.add(page);
      continue;
    }

    const page = Number(part);
    if (!Number.isInteger(page) || page < 1 || page > pageCount) {
      throw new Error(`Page ${part} is outside the document bounds.`);
    }
    selected.add(page);
  }

  return Array.from(selected).sort((a, b) => a - b);
}

function formatPageSelection(pages: number[]): string {
  if (!pages.length) return "";

  const sorted = Array.from(new Set(pages)).sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let previous = sorted[0];

  for (let index = 1; index <= sorted.length; index += 1) {
    const current = sorted[index];

    if (current === previous + 1) {
      previous = current;
      continue;
    }

    ranges.push(start === previous ? `${start}` : `${start}-${previous}`);
    start = current;
    previous = current;
  }

  return ranges.join(",");
}

function describePageSelection(pages: number[]): string {
  if (!pages.length) return "No pages selected.";

  const compact = formatPageSelection(pages);
  const countLabel = `${pages.length} page${pages.length > 1 ? "s" : ""}`;

  if (compact.length <= 36) {
    return `${countLabel} selected: ${compact}.`;
  }

  return `${countLabel} selected, from page ${pages[0]} to page ${pages[pages.length - 1]}, with exclusions in between.`;
}

function PageSelectionCard({
  pageNumber,
  imageUrl,
  selected,
  onClick,
}: {
  pageNumber: number;
  imageUrl: string | null;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-[26px] border p-1 text-left transition ${
        selected
          ? "border-emerald-400/70 bg-emerald-500/10 shadow-[0_0_0_2px_rgba(52,211,153,.18)]"
          : "border-border bg-surface-2 hover:border-white/25"
      }`}
    >
      {selected && (
        <div className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-lg font-bold text-white shadow-lg shadow-emerald-500/30">
          ✓
        </div>
      )}
      <PreviewDocument imageUrl={imageUrl} pageNumber={pageNumber} />
    </button>
  );
}

async function createPdfFromPages(sourceBytes: ArrayBuffer, pageNumbers: number[]): Promise<Uint8Array> {
  const src = await PDFDocument.load(sourceBytes);
  const output = await PDFDocument.create();
  const copied = await output.copyPages(
    src,
    pageNumbers.map((page) => page - 1),
  );

  copied.forEach((page) => output.addPage(page));
  return output.save();
}

async function zipOutputFiles(files: OutputFile[]): Promise<Blob | null> {
  if (files.length <= 1) return files[0]?.blob ?? null;

  const zip = new JSZip();
  files.forEach((file) => zip.file(file.fileName, file.blob));
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export default function PdfSplitterTool() {
  const [uploaded, setUploaded] = useState<UploadedPdf | null>(null);
  const [tab, setTab] = useState<SplitTab>("range");
  const [rangeMode, setRangeMode] = useState<RangeMode>("custom");
  const [ranges, setRanges] = useState<RangeItem[]>([DEFAULT_RANGE]);
  const [fixedChunkSize, setFixedChunkSize] = useState(1);
  const [mergeAllRanges, setMergeAllRanges] = useState(false);
  const [pageSelection, setPageSelection] = useState("");
  const [mergeSelectedPages, setMergeSelectedPages] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<SplitResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pagePreviewCache, setPagePreviewCache] = useState<Record<number, string | null>>({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pageCount = uploaded?.pageCount ?? 0;
  const fixedRangesPreview = useMemo(
    () => (pageCount > 0 ? buildFixedRanges(pageCount, Math.max(1, fixedChunkSize)) : []),
    [fixedChunkSize, pageCount],
  );

  const customRangePreviewCards = useMemo(
    () => buildRangePreviewCards(ranges, mergeAllRanges),
    [mergeAllRanges, ranges],
  );

  const fixedRangePreviewCards = useMemo(
    () =>
      buildRangePreviewCards(
        fixedRangesPreview.map((range, index) => ({
          id: `fixed_${index}_${range.from}_${range.to}`,
          from: range.from,
          to: range.to,
        })),
        false,
      ),
    [fixedRangesPreview],
  );

  const parsedSelectedPages = useMemo(() => {
    if (!uploaded || !pageSelection.trim()) return [];
    try {
      return parsePageSelection(pageSelection, uploaded.pageCount);
    } catch {
      return [];
    }
  }, [pageSelection, uploaded]);

  const pagesPreviewCards = useMemo(
    () => buildPagesPreviewCards(parsedSelectedPages, mergeSelectedPages),
    [mergeSelectedPages, parsedSelectedPages],
  );

  const selectedPagesSet = useMemo(() => new Set(parsedSelectedPages), [parsedSelectedPages]);

  const activePreviewCards = useMemo(() => {
    if (!uploaded) return [];
    if (tab === "range") {
      return rangeMode === "custom" ? customRangePreviewCards : fixedRangePreviewCards;
    }
    return pagesPreviewCards;
  }, [customRangePreviewCards, fixedRangePreviewCards, pagesPreviewCards, rangeMode, tab, uploaded]);

  const previewPagesNeeded = useMemo(() => {
    if (!uploaded) return [];

    if (tab === "pages") {
      return Array.from({ length: uploaded.pageCount }, (_, index) => index + 1);
    }

    const pages = new Set<number>();
    activePreviewCards.forEach((card) => {
      pages.add(card.from);
      pages.add(card.to);
    });
    return Array.from(pages).sort((a, b) => a - b);
  }, [activePreviewCards, tab, uploaded]);

  useEffect(() => {
    if (!uploaded) {
      setPagePreviewCache((prev) => (Object.keys(prev).length ? {} : prev));
      setPreviewLoading(false);
      return;
    }

    const missingPages = previewPagesNeeded.filter((page) => pagePreviewCache[page] === undefined);
    if (!missingPages.length) return;

    let cancelled = false;
    setPreviewLoading(true);

    void Promise.all(
      missingPages.map(async (page) => ({
        page,
        imageUrl: await renderPdfPagePreview(uploaded.bytes, page).catch(() => null),
      })),
    ).then((results) => {
      if (cancelled) return;
      setPagePreviewCache((prev) => {
        const next = { ...prev };
        results.forEach(({ page, imageUrl }) => {
          next[page] = imageUrl;
        });
        return next;
      });
      setPreviewLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [pagePreviewCache, previewPagesNeeded, uploaded]);

  const addFile = useCallback(async (fileList: FileList | null) => {
    if (!fileList?.length) return;

    const file = Array.from(fileList).find(
      (entry) => entry.type === "application/pdf" || entry.name.toLowerCase().endsWith(".pdf"),
    );

    if (!file) {
      setErrorMessage("Please upload a PDF file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`File exceeds the 1GB size limit.`);
      return;
    }

    try {
      const nextFile = await loadUploadedPdf(file);
      setUploaded(nextFile);
      setRanges([{ ...DEFAULT_RANGE, to: nextFile.pageCount }]);
      setFixedChunkSize(Math.min(5, Math.max(1, nextFile.pageCount)));
      setMergeAllRanges(false);
      setPageSelection("");
      setPagePreviewCache({});
      setResult(null);
      setErrorMessage(null);
    } catch {
      setErrorMessage("This PDF could not be opened. Password-protected or invalid PDFs are not supported.");
    }
  }, []);

  const updateRange = useCallback(
    (id: string, field: "from" | "to", value: number) => {
      setRanges((prev) =>
        prev.map((range) => {
          if (range.id !== id) return range;
          const nextValue = clamp(value, 1, Math.max(1, pageCount || 1));
          const next = { ...range, [field]: nextValue };
          if (next.from > next.to) {
            return field === "from" ? { ...next, to: nextValue } : { ...next, from: nextValue };
          }
          return next;
        }),
      );
      setResult(null);
    },
    [pageCount],
  );

  const addRange = useCallback(() => {
    if (!pageCount) return;
    setRanges((prev) => [...prev, createRange(1, pageCount)]);
    setMergeAllRanges(false);
    setResult(null);
  }, [pageCount]);

  const removeRange = useCallback((id: string) => {
    setRanges((prev) => (prev.length === 1 ? prev : prev.filter((range) => range.id !== id)));
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      await addFile(e.dataTransfer.files);
    },
    [addFile],
  );

  const handleReset = useCallback(() => {
    analytics.toolReset(TOOL);
    setUploaded(null);
    setResult(null);
    setErrorMessage(null);
    setRanges([DEFAULT_RANGE]);
    setPageSelection("");
    setFixedChunkSize(1);
    setMergeAllRanges(false);
    setPagePreviewCache({});
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleDownloadAll = useCallback(() => {
    analytics.toolDownload({ ...TOOL, output_type: "zip", file_count: result?.files.length ?? 0 });
    if (!result?.zipBlob) return;
    const url = URL.createObjectURL(result.zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.files.length > 1 ? "split_pdfs.zip" : result.files[0].fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const handleDownloadSingle = useCallback((file: OutputFile) => {
    analytics.toolDownload({ ...TOOL, output_type: "pdf", file_count: 1, file_size_bucket: sizeBucket(file.blob.size) });
    const url = URL.createObjectURL(file.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const togglePageSelection = useCallback(
    (pageNumber: number) => {
      const next = new Set(parsedSelectedPages);

      if (next.has(pageNumber)) next.delete(pageNumber);
      else next.add(pageNumber);

      setPageSelection(formatPageSelection(Array.from(next)));
      setResult(null);
      setErrorMessage(null);
    },
    [parsedSelectedPages],
  );

  const selectAllPages = useCallback(() => {
    if (!uploaded) return;
    setPageSelection(formatPageSelection(Array.from({ length: uploaded.pageCount }, (_, index) => index + 1)));
    setResult(null);
    setErrorMessage(null);
  }, [uploaded]);

  const clearSelectedPages = useCallback(() => {
    setPageSelection("");
    setResult(null);
    setErrorMessage(null);
  }, []);

  const handleSplit = useCallback(async () => {
    if (!uploaded) {
      setErrorMessage("Upload a PDF before splitting.");
      analytics.toolError({ ...TOOL, failure_type: "invalid_input" });
      return;
    }

    setProcessing(true);
    setErrorMessage(null);
    setResult(null);

    const startedAt = performance.now();
    analytics.toolStart({
      ...TOOL,
      file_type: "pdf",
      file_count: 1,
      file_size_bucket: sizeBucket(uploaded.file.size),
      split_mode: tab,
      page_count_bucket: pageBucket(uploaded.pageCount),
    });

    try {
      const sourceBytes = uploaded.bytes;
      const baseName = sanitizeBaseName(uploaded.file.name);
      let files: OutputFile[] = [];

      if (tab === "range") {
        const computedRanges =
          rangeMode === "fixed"
            ? buildFixedRanges(uploaded.pageCount, Math.max(1, fixedChunkSize))
            : ranges.map((range) => ({
                from: clamp(range.from, 1, uploaded.pageCount),
                to: clamp(range.to, 1, uploaded.pageCount),
              }));

        if (!computedRanges.length) {
          throw new Error("Add at least one valid range.");
        }

        if (mergeAllRanges) {
          const mergedPages = computedRanges.flatMap((range) => {
            const from = Math.min(range.from, range.to);
            const to = Math.max(range.from, range.to);
            return Array.from({ length: to - from + 1 }, (_, idx) => from + idx);
          });

          const mergedBytes = await createPdfFromPages(sourceBytes, mergedPages);
          files = [
            {
              fileName: `${baseName}_selected_ranges.pdf`,
              blob: new Blob([new Uint8Array(mergedBytes)], { type: "application/pdf" }),
              pageCount: mergedPages.length,
            },
          ];
        } else {
          files = await Promise.all(
            computedRanges.map(async (range, index) => {
              const from = Math.min(range.from, range.to);
              const to = Math.max(range.from, range.to);
              const pages = Array.from({ length: to - from + 1 }, (_, idx) => from + idx);
              const bytes = await createPdfFromPages(sourceBytes, pages);
              return {
                fileName: `${baseName}_range_${index + 1}_${from}-${to}.pdf`,
                blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
                pageCount: pages.length,
              };
            }),
          );
        }
      } else {
        const selectedPages = parsePageSelection(pageSelection, uploaded.pageCount);

        if (mergeSelectedPages) {
          const bytes = await createPdfFromPages(sourceBytes, selectedPages);
          files = [
            {
              fileName: `${baseName}_selected_pages.pdf`,
              blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
              pageCount: selectedPages.length,
            },
          ];
        } else {
          files = await Promise.all(
            selectedPages.map(async (page) => {
              const bytes = await createPdfFromPages(sourceBytes, [page]);
              return {
                fileName: `${baseName}_page_${page}.pdf`,
                blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
                pageCount: 1,
              };
            }),
          );
        }
      }

      const zipBlob = await zipOutputFiles(files);
      setResult({ files, zipBlob });

      analytics.toolComplete({
        ...TOOL,
        file_type: "pdf",
        output_type: files.length > 1 ? "zip" : "pdf",
        file_count: files.length,
        file_size_bucket: sizeBucket(zipBlob?.size ?? 0),
        split_mode: tab,
        page_count_bucket: pageBucket(uploaded.pageCount),
        duration_ms: Math.round(performance.now() - startedAt),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to split PDF.";
      setErrorMessage(message);
      analytics.toolError({
        ...TOOL,
        file_type: "pdf",
        file_size_bucket: sizeBucket(uploaded.file.size),
        split_mode: tab,
        failure_type: classifyError(error),
      });
    } finally {
      setProcessing(false);
    }
  }, [fixedChunkSize, mergeAllRanges, mergeSelectedPages, pageSelection, rangeMode, ranges, tab, uploaded]);

  return (
    <div className="space-y-4">
      {!result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#38d9a9] to-[#ffb347]" />

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
                  : uploaded
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-border hover:border-border-strong"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                aria-label="Choose a PDF to split"
                className="hidden"
                onChange={(e) => {
                  void addFile(e.target.files);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">
                ✂️
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                Drop your PDF here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-2">
                Split one PDF by ranges or selected pages, entirely in your browser.
              </p>
            </div>
          </div>

          {uploaded && (
            <div className="border-t border-border px-5 py-4">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/[.02] px-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6c63ff]/10 text-xl text-[#a39cff]">
                  📄
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{uploaded.file.name}</p>
                  <p className="mt-1 text-[11px] text-muted">
                    {uploaded.pageCount} pages • {fmtSize(uploaded.file.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="inline-flex min-h-11 items-center px-2 text-xs font-semibold text-[#ff6584] transition hover:text-[#ff8da6]"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && !processing && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {uploaded && !result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              {([
                ["range", "Range"],
                ["pages", "Pages"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setTab(value);
                    setResult(null);
                    setErrorMessage(null);
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    tab === value
                      ? "bg-[#6c63ff] text-white shadow-[0_4px_20px_rgba(108,99,255,.35)]"
                      : "bg-surface-3/50 text-muted hover:bg-surface-3 hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                Premium-style controls
              </span>
            </div>
          </div>

          {tab === "range" ? (
            <div className="space-y-5 px-5 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-3">Range mode:</span>
                {([
                  ["custom", "Custom"],
                  ["fixed", "Fixed"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setRangeMode(value);
                      setResult(null);
                    }}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      rangeMode === value
                        ? "bg-[#6c63ff] text-white"
                        : "bg-surface-3/50 text-muted hover:bg-surface-3 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {rangeMode === "custom" ? (
                <div className="space-y-4">
                  {ranges.map((range, index) => (
                    <div key={range.id} className="rounded-2xl border border-border bg-white/[.02] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">Range {index + 1}</p>
                        {ranges.length > 1 && (
                          <button
                            onClick={() => removeRange(range.id)}
                            className="text-xs font-semibold text-[#ff6584] transition hover:text-[#ff8da6]"
                          >
                            Remove range
                          </button>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
                        <label className="space-y-2 text-sm text-[#c7c7d8]">
                          <span className="block text-xs uppercase tracking-[0.16em] text-muted-3">From page</span>
                          <input
                            type="number"
                            min={1}
                            max={uploaded.pageCount}
                            value={range.from}
                            onChange={(e) => updateRange(range.id, "from", Number(e.target.value))}
                            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-white outline-none transition focus:border-[#6c63ff]/60"
                          />
                        </label>

                        <div className="mb-3 text-center text-sm text-[#7c7c95]">to</div>

                        <label className="space-y-2 text-sm text-[#c7c7d8]">
                          <span className="block text-xs uppercase tracking-[0.16em] text-muted-3">To page</span>
                          <input
                            type="number"
                            min={1}
                            max={uploaded.pageCount}
                            value={range.to}
                            onChange={(e) => updateRange(range.id, "to", Number(e.target.value))}
                            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-white outline-none transition focus:border-[#6c63ff]/60"
                          />
                        </label>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={addRange}
                      className="rounded-xl border border-border bg-surface-3/50 px-4 py-3 text-sm font-semibold text-white transition hover:bg-surface-3"
                    >
                      Add Range
                    </button>

                    <label className="flex items-center gap-3 text-sm text-[#c7c7d8]">
                      <input
                        type="checkbox"
                        checked={mergeAllRanges}
                        onChange={(e) => setMergeAllRanges(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-surface-2 text-[#6c63ff]"
                      />
                      Merge all ranges in one PDF file.
                    </label>
                  </div>

                  <p className="text-xs text-[#7c7c95]">
                    With multiple ranges, the default output is separate PDF files packed into one ZIP.
                    Turn on “Merge all ranges” only if you want one combined PDF.
                  </p>

                  {customRangePreviewCards.length > 0 && (
                    <div className="space-y-4 rounded-2xl border border-dashed border-border-strong bg-[#0d0d12] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">Live range preview</p>
                        <span className="text-[11px] text-[#8b8ba3]">
                          {previewLoading ? "Rendering previews…" : "Updates as you change pages"}
                        </span>
                      </div>

                      <div className="space-y-6">
                        {customRangePreviewCards.map((card, index) => (
                          <div key={card.id} className="rounded-2xl border border-border bg-surface-2 p-5">
                            <p className="text-center text-lg font-medium text-white">Range {index + 1}</p>

                            <div className="mt-5 grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                              <PreviewDocument imageUrl={pagePreviewCache[card.from] ?? null} pageNumber={card.from} />

                              <div className="text-center text-3xl font-black tracking-[0.3em] text-white/80">...</div>

                              <PreviewDocument imageUrl={pagePreviewCache[card.to] ?? null} pageNumber={card.to} />
                            </div>

                            <p className="mt-4 text-center text-sm text-muted">
                              {card.merged
                                ? `This range will be merged with the other selected ranges in one output PDF.`
                                : `This output will include pages ${card.from} to ${card.to}.`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-white/[.02] p-4">
                    <label className="space-y-2 text-sm text-[#c7c7d8]">
                      <span className="block text-xs uppercase tracking-[0.16em] text-muted-3">Split every N pages</span>
                      <input
                        type="number"
                        min={1}
                        max={uploaded.pageCount}
                        value={fixedChunkSize}
                        onChange={(e) => {
                          setFixedChunkSize(clamp(Number(e.target.value) || 1, 1, uploaded.pageCount));
                          setResult(null);
                        }}
                        className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-white outline-none transition focus:border-[#6c63ff]/60"
                      />
                    </label>
                  </div>

                  <div className="rounded-2xl border border-border bg-white/[.02] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-3">Preview ranges</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {fixedRangesPreview.map((range, index) => (
                        <span
                          key={`${range.from}-${range.to}`}
                          className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-[#c7c7d8]"
                        >
                          Part {index + 1}: {range.from}-{range.to}
                        </span>
                      ))}
                    </div>
                  </div>

                  {fixedRangePreviewCards.length > 0 && (
                    <div className="space-y-4 rounded-2xl border border-dashed border-border-strong bg-[#0d0d12] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">Live fixed-range preview</p>
                        <span className="text-[11px] text-[#8b8ba3]">
                          {previewLoading ? "Rendering previews…" : "Based on the current chunk size"}
                        </span>
                      </div>

                      <div className="grid gap-4 xl:grid-cols-2">
                        {fixedRangePreviewCards.slice(0, 4).map((card, index) => (
                          <div key={card.id} className="rounded-2xl border border-border bg-surface-2 p-5">
                            <p className="text-center text-base font-medium text-white">Part {index + 1}</p>

                            <div className="mt-5 grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                              <PreviewDocument imageUrl={pagePreviewCache[card.from] ?? null} pageNumber={card.from} />
                              <div className="text-center text-3xl font-black tracking-[0.3em] text-white/80">...</div>
                              <PreviewDocument imageUrl={pagePreviewCache[card.to] ?? null} pageNumber={card.to} />
                            </div>

                            <p className="mt-4 text-center text-sm text-muted">
                              This part will include pages {card.from} to {card.to}.
                            </p>
                          </div>
                        ))}
                      </div>

                      {fixedRangePreviewCards.length > 4 && (
                        <p className="text-center text-xs text-[#7c7c95]">
                          Showing the first 4 parts. The final split will still include all {fixedRangePreviewCards.length} parts.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-border pt-4 text-center">
                <button
                  onClick={handleSplit}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
                >
                  ✂️ Split PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 px-5 py-5">
              <div className="rounded-2xl border border-border bg-white/[.02] p-4">
                <label className="space-y-2 text-sm text-[#c7c7d8]">
                  <span className="block text-xs uppercase tracking-[0.16em] text-muted-3">Pages</span>
                  <input
                    type="text"
                    value={pageSelection}
                    onChange={(e) => {
                      setPageSelection(e.target.value);
                      setResult(null);
                    }}
                    placeholder="Example: 1,3,5-8"
                    className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-white outline-none transition focus:border-[#6c63ff]/60"
                  />
                </label>
                <p className="mt-2 text-xs text-[#7c7c95]">Use commas and ranges like 1, 4, 8-12.</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white/[.02] p-4">
                <div>
                  <p className="text-sm font-semibold text-white">Click pages to include or exclude them</p>
                  <p className="mt-1 text-xs text-[#7c7c95]">
                    The input stays synced with your clicks, so you can use both methods together.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={selectAllPages}
                    className="rounded-lg bg-surface-3/50 px-3 py-2 text-xs font-semibold text-white transition hover:bg-surface-3"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={clearSelectedPages}
                    className="rounded-lg bg-surface-3/50 px-3 py-2 text-xs font-semibold text-white transition hover:bg-surface-3"
                  >
                    Clear selection
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-border-strong bg-[#0d0d12] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">All pages</p>
                    <p className="mt-1 text-xs text-[#8b8ba3]">
                      {selectedPagesSet.size} of {uploaded.pageCount} page{uploaded.pageCount > 1 ? "s" : ""} selected
                    </p>
                  </div>
                  <span className="text-[11px] text-[#8b8ba3]">
                    {previewLoading ? "Rendering previews…" : "Click any page card to toggle it"}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: uploaded.pageCount }, (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <PageSelectionCard
                        key={pageNumber}
                        pageNumber={pageNumber}
                        imageUrl={pagePreviewCache[pageNumber] ?? null}
                        selected={selectedPagesSet.has(pageNumber)}
                        onClick={() => togglePageSelection(pageNumber)}
                      />
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-[#c7c7d8]">
                <input
                  type="checkbox"
                  checked={mergeSelectedPages}
                  onChange={(e) => setMergeSelectedPages(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-surface-2 text-[#6c63ff]"
                />
                Merge all selected pages in one PDF file.
              </label>

              {pageSelection.trim() && (
                <div className="space-y-4 rounded-2xl border border-dashed border-border-strong bg-[#0d0d12] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">Live pages preview</p>
                    <span className="text-[11px] text-[#8b8ba3]">
                      {previewLoading ? "Rendering previews…" : "Updates as you type page numbers"}
                    </span>
                  </div>

                  {pagesPreviewCards.length > 0 ? (
                    <div className="grid gap-4 xl:grid-cols-2">
                      {pagesPreviewCards.slice(0, mergeSelectedPages ? 1 : 6).map((card) => (
                        <div key={card.id} className="rounded-2xl border border-border bg-surface-2 p-5">
                          <p className="text-center text-base font-medium text-white">{card.title}</p>

                          <div className="mt-5 grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                            <PreviewDocument imageUrl={pagePreviewCache[card.from] ?? null} pageNumber={card.from} />
                            <div className="text-center text-3xl font-black tracking-[0.3em] text-white/80">
                              {card.from === card.to ? "•" : "..."}
                            </div>
                            <PreviewDocument imageUrl={pagePreviewCache[card.to] ?? null} pageNumber={card.to} />
                          </div>

                          <p className="mt-4 text-center text-sm text-muted">
                            {card.merged
                              ? describePageSelection(parsedSelectedPages)
                              : `This output contains page ${card.from} only.`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-red-300">Enter valid page numbers to see the preview.</p>
                  )}

                  {!mergeSelectedPages && pagesPreviewCards.length > 6 && (
                    <p className="text-center text-xs text-[#7c7c95]">
                      Showing the first 6 page previews. The final split will still include all {pagesPreviewCards.length} selected pages.
                    </p>
                  )}
                </div>
              )}

              <div className="border-t border-border pt-4 text-center">
                <button
                  onClick={handleSplit}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
                >
                  ✂️ Split PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {processing && (
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface px-5 py-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-[#6c63ff]" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-4 border-border border-b-[#38d9a9]"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>

          <p className="text-sm font-semibold text-white">Splitting your PDF…</p>
          <p className="text-xs text-muted">Preparing downloadable PDF parts in your browser.</p>
        </div>
      )}

      {result && (
        <>
          <div role="status" aria-live="polite" className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />

            <div className="flex flex-col items-center px-5 py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <svg
                  className="h-8 w-8 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="mt-4 font-display text-xl font-bold text-white">
                {result.files.length > 1 ? `${result.files.length} PDFs created!` : "PDF created!"}
              </h3>

              <button
                onClick={handleDownloadAll}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ Download {result.files.length > 1 ? "ZIP" : "PDF"}
              </button>

              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">Split Result</p>
                <p className="mt-1 text-3xl font-black text-emerald-400">{result.files.length}</p>
                <p className="mt-1 text-xs text-muted">Generated PDF file{result.files.length > 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Output Files</h3>
            </div>

            <div className="divide-y divide-white/5">
              {result.files.map((file) => (
                <div key={file.fileName} className="flex items-center gap-3 px-5 py-4">
                  <span className="text-base">📄</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{file.fileName}</p>
                    <p className="mt-1 text-[10px] text-muted">
                      {file.pageCount} page{file.pageCount > 1 ? "s" : ""} • {fmtSize(file.blob.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadSingle(file)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-transparent dark:bg-surface-3/50 dark:text-white dark:hover:bg-surface-3"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-5 py-4 text-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-border dark:bg-transparent dark:text-white dark:hover:bg-white/[.03]"
              >
                Split Another PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}