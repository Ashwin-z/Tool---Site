"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

const MAX_FILES = 25;
const DRAG_TYPE = "application/x-toolcraft-pdf-id";

type QueuedPdf = {
  id: string;
  file: File;
  pageCount: number;
  previewUrl: string | null;
};

type MergeResult = {
  fileName: string;
  blob: Blob;
  totalFiles: number;
  totalPages: number;
  mergedSize: number;
};

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

let idCounter = 0;
function uid(): string {
  return `pdf_${++idCounter}_${Date.now()}`;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function truncateName(fileName: string, maxLength = 28): string {
  if (fileName.length <= maxLength) return fileName;
  const extIndex = fileName.lastIndexOf(".");
  const ext = extIndex > -1 ? fileName.slice(extIndex) : "";
  const base = extIndex > -1 ? fileName.slice(0, extIndex) : fileName;
  return `${base.slice(0, Math.max(10, maxLength - ext.length - 3))}...${ext}`;
}

async function renderPdfPreview(bytes: ArrayBuffer): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 0.55 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) return null;

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/png", 0.92);
}

async function readQueuedPdf(file: File): Promise<QueuedPdf> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const previewUrl = await renderPdfPreview(bytes).catch(() => null);

  return {
    id: uid(),
    file,
    pageCount: pdf.getPageCount(),
    previewUrl,
  };
}

export default function PdfMergerTool() {
  const [queue, setQueue] = useState<QueuedPdf[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<MergeResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList) return;

      const selected = Array.from(fileList);
      const pdfs = selected.filter(
        (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"),
      );

      if (!pdfs.length) {
        setErrorMessage("Please upload PDF files only.");
        return;
      }

      const remainingSlots = MAX_FILES - queue.length;
      if (remainingSlots <= 0) {
        setErrorMessage(`You can upload a maximum of ${MAX_FILES} PDFs at a time.`);
        return;
      }

      const limitedPdfs = pdfs.slice(0, remainingSlots);

      try {
        const nextItems = await Promise.all(limitedPdfs.map((file) => readQueuedPdf(file)));
        setQueue((prev) => [...prev, ...nextItems]);
        setResult(null);

        if (pdfs.length > remainingSlots) {
          setErrorMessage(
            `Only the first ${remainingSlots} PDF${remainingSlots > 1 ? "s were" : " was"} added. Maximum ${MAX_FILES} PDFs allowed.`,
          );
        } else if (selected.length !== pdfs.length) {
          setErrorMessage("Some non-PDF files were skipped.");
        } else {
          setErrorMessage(null);
        }
      } catch {
        setErrorMessage(
          "One or more PDFs could not be read. Password-protected or invalid PDFs are not supported.",
        );
      }
    },
    [queue.length],
  );

  const handleRemove = useCallback((id: string) => {
    setQueue((prev) => prev.filter((file) => file.id !== id));
    setResult(null);
    setErrorMessage(null);
  }, []);

  const handleMove = useCallback((fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      return moveItem(prev, fromIndex, toIndex);
    });
    setResult(null);
  }, []);

  const handleUploadDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);

      if (e.dataTransfer.files?.length) {
        await addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const handleCardDrop = useCallback(
    (targetId: string) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const sourceId = e.dataTransfer.getData(DRAG_TYPE) || draggedId;
      if (!sourceId || sourceId === targetId) {
        setDropTargetId(null);
        return;
      }

      setQueue((prev) => {
        const fromIndex = prev.findIndex((item) => item.id === sourceId);
        const toIndex = prev.findIndex((item) => item.id === targetId);
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;
        return moveItem(prev, fromIndex, toIndex);
      });

      setDraggedId(null);
      setDropTargetId(null);
      setResult(null);
    },
    [draggedId],
  );

  const handleMerge = useCallback(async () => {
    if (queue.length < 2) {
      setErrorMessage("Add at least 2 PDFs to merge them.");
      return;
    }

    setProcessing(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of queue) {
        const bytes = await item.file.arrayBuffer();
        const src = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(src, src.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      const totalPages = queue.reduce((sum, item) => sum + item.pageCount, 0);

      setResult({
        fileName: `merged-${Date.now()}.pdf`,
        blob,
        totalFiles: queue.length,
        totalPages,
        mergedSize: blob.size,
      });
    } catch {
      setErrorMessage("Failed to merge PDFs. Please try different files.");
    } finally {
      setProcessing(false);
    }
  }, [queue]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const handleReset = useCallback(() => {
    setQueue([]);
    setResult(null);
    setErrorMessage(null);
    setDraggedId(null);
    setDropTargetId(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const totalSize = queue.reduce((sum, item) => sum + item.file.size, 0);
  const totalPages = queue.reduce((sum, item) => sum + item.pageCount, 0);

  return (
    <div className="space-y-4">
      {!result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#38d9a9] to-[#ffb347]" />

          <div className="px-5 py-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleUploadDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 transition ${
                dragOver
                  ? "border-[#6c63ff] bg-[#6c63ff]/5"
                  : queue.length
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-white/10 hover:border-white/20"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  void addFiles(e.target.files);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">
                🧩
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                Drop your PDFs here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 text-xs text-[#57576f]">
                Upload and merge up to {MAX_FILES} PDFs. Everything is merged locally in your browser.
              </p>
            </div>
          </div>

          {queue.length > 0 && (
            <div className="border-t border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <h3 className="font-display text-sm font-bold text-white">
                  {queue.length} PDF{queue.length > 1 ? "s" : ""} selected
                  <span className="ml-2 text-xs font-normal text-[#57576f]">
                    ({totalPages} pages • {fmtSize(totalSize)})
                  </span>
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="text-[10px] font-semibold text-[#ff6584] transition hover:text-[#ff8da6]"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-[560px] overflow-y-auto px-5 pb-5">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                  {queue.map((item, index) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedId(item.id);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData(DRAG_TYPE, item.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggedId && draggedId !== item.id) {
                          setDropTargetId(item.id);
                        }
                      }}
                      onDragLeave={() => {
                        if (dropTargetId === item.id) {
                          setDropTargetId(null);
                        }
                      }}
                      onDrop={handleCardDrop(item.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDropTargetId(null);
                      }}
                      className={`group relative overflow-hidden rounded-2xl border transition ${
                        dropTargetId === item.id
                          ? "border-[#6c63ff]/70 bg-[#6c63ff]/10 ring-2 ring-[#6c63ff]/25"
                          : draggedId === item.id
                            ? "border-[#6c63ff]/40 bg-[#6c63ff]/5 opacity-70"
                            : "border-white/10 bg-[#17171f] hover:border-white/20"
                      }`}
                    >
                      <div className="p-4">
                        <div className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-[#6c63ff]/90 text-sm font-bold text-white shadow-lg shadow-[#6c63ff]/20">
                          {index + 1}
                        </div>

                        <div className="rounded-2xl bg-[#efeff5] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.65)]">
                          <div className="mx-auto aspect-[210/297] w-full overflow-hidden rounded-sm bg-white shadow-[0_8px_25px_rgba(15,23,42,.12)]">
                            {item.previewUrl ? (
                              <Image
                                src={item.previewUrl}
                                alt={`${item.file.name} preview`}
                                width={420}
                                height={594}
                                unoptimized
                                className="h-full w-full object-cover object-top"
                                draggable={false}
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
                        </div>

                        <div className="mt-4 min-w-0 text-center">
                          <p className="truncate text-sm font-semibold text-white" title={item.file.name}>
                            {truncateName(item.file.name)}
                          </p>
                          <p className="mt-1 text-[11px] text-[#9b9bb3]">
                            {item.pageCount} page{item.pageCount > 1 ? "s" : ""} • {fmtSize(item.file.size)}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                          <span className="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b9bb3]">
                            Drag to reorder
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMove(index, index - 1)}
                            disabled={index === 0}
                            className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ↑ Up
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, index + 1)}
                            disabled={index === queue.length - 1}
                            className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ↓ Down
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && !processing && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {errorMessage}
        </div>
      )}

      {queue.length > 0 && !result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
          <div className="border-b border-white/10 px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">Merge Setup</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[.02] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#61617a]">Order</p>
              <p className="mt-2 text-sm text-white">Drag document cards or use Up/Down to set the final merge order.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.02] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#61617a]">Preview</p>
              <p className="mt-2 text-sm text-white">Each card shows a first-page document preview so ordering feels visual.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.02] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#61617a]">Limit</p>
              <p className="mt-2 text-sm text-white">Merge up to {MAX_FILES} PDFs at a time.</p>
            </div>
          </div>

          <div className="border-t border-white/10 px-5 py-4 text-center">
            <button
              onClick={handleMerge}
              disabled={queue.length < 2}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              🧩 Merge {queue.length} PDF{queue.length > 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {processing && (
        <div className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#111118] px-5 py-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/10 border-t-[#6c63ff]" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-4 border-white/5 border-b-[#38d9a9]"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>

          <p className="text-sm font-semibold text-white">Merging your PDFs…</p>
          <p className="text-xs text-[#9b9bb3]">Combining {queue.length} files in the exact order shown above.</p>
        </div>
      )}

      {result && (
        <>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />

            <div className="flex flex-col items-center px-5 py-10 text-center">
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

              <h3 className="mt-4 font-display text-xl font-bold text-white">Your PDFs have been merged!</h3>

              <button
                onClick={handleDownload}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ Download merged PDF
              </button>

              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">Merged Output</p>
                <p className="mt-1 text-3xl font-black text-emerald-400">{result.totalFiles} PDFs</p>
                <p className="mt-1 text-xs text-[#9b9bb3]">
                  {result.totalPages} total pages • {fmtSize(result.mergedSize)}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
            <div className="border-b border-white/10 px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Merged Order</h3>
            </div>

            <div className="divide-y divide-white/5">
              {queue.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6c63ff]/10 text-sm font-bold text-[#a39cff]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{item.file.name}</p>
                    <p className="mt-1 text-[10px] text-[#9b9bb3]">
                      {item.pageCount} page{item.pageCount > 1 ? "s" : ""} • {fmtSize(item.file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 px-5 py-4 text-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[.03]"
              >
                Merge More PDFs
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}