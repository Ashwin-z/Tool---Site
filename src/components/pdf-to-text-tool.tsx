"use client";

import { useCallback, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════
   PDF TO TEXT (OCR) TOOL
   – Upload PDF → render pages via pdf.js → OCR each page
   – Supports multi-page PDFs
   – Multi-language OCR
   – Copy / download extracted text
   ═══════════════════════════════════════════════════════ */

const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "hin", label: "Hindi" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "por", label: "Portuguese" },
  { code: "ita", label: "Italian" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "chi_tra", label: "Chinese (Traditional)" },
  { code: "ara", label: "Arabic" },
  { code: "rus", label: "Russian" },
  { code: "urd", label: "Urdu" },
  { code: "tha", label: "Thai" },
  { code: "vie", label: "Vietnamese" },
  { code: "nld", label: "Dutch" },
  { code: "pol", label: "Polish" },
  { code: "tur", label: "Turkish" },
  { code: "ben", label: "Bengali" },
] as const;

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not prepare page image for OCR."));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

interface PageResult {
  pageNum: number;
  text: string;
  confidence: number;
}

type PdfJsViewport = { width: number; height: number; transform?: number[] };
type PdfJsTextContent = { items: Array<{ str?: string }> };
type PdfJsPage = {
  getViewport: (options: { scale: number }) => PdfJsViewport;
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: PdfJsViewport; canvas?: HTMLCanvasElement }) => { promise: Promise<void> };
  getTextContent: () => Promise<PdfJsTextContent>;
};
type PdfJsDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
  destroy?: () => void;
};
type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { data: Uint8Array }) => { promise: Promise<PdfJsDocument> };
};

let pdfjsPromise: Promise<PdfJsModule> | null = null;

/* ── pdf.js helper (same pattern as other working PDF tools) ── */
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

export default function PdfToTextTool() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("eng");
  const [status, setStatus] = useState<"idle" | "loading-pdf" | "ocr" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [pageResults, setPageResults] = useState<PageResult[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [useOcrMode, setUseOcrMode] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  /* ── full extracted text ── */
  const fullText = pageResults.map((p) => p.text).join("\n\n--- Page Break ---\n\n");
  const wordCount = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
  const charCount = fullText.trim().length;
  const avgConfidence =
    pageResults.length > 0
      ? Math.round(pageResults.reduce((s, p) => s + p.confidence, 0) / pageResults.length)
      : 0;

  /* ── load PDF ── */
  const loadPdf = useCallback((file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please upload a valid PDF file.");
      setStatus("error");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(`File too large (${fmtSize(file.size)}). Maximum is ${fmtSize(MAX_FILE_SIZE)}.`);
      setStatus("error");
      return;
    }
    setPdfFile(file);
    setPageResults([]);
    setStatus("idle");
    setErrorMsg("");
    setProgress(0);
    setTotalPages(0);
  }, []);

  /* ── extract text: try native first, then OCR ── */
  const extractText = useCallback(async () => {
    if (!pdfFile) return;
    abortRef.current = false;
    setPageResults([]);
    setErrorMsg("");
    let currentStep = "initializing";

    try {
      setStatus("loading-pdf");
      setProgressLabel("Loading PDF…");
      setProgress(0);

      currentStep = "reading PDF file";
      const bytes = await pdfFile.arrayBuffer();
      currentStep = "loading pdf.js";
      const pdfjs = await getPdfjs();
      currentStep = "opening PDF document";
      const pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
      const numPages = pdfDoc.numPages;
      setTotalPages(numPages);

      setStatus("ocr");

      if (!useOcrMode) {
        /* ── Native text extraction ── */
        const results: PageResult[] = [];
        for (let i = 1; i <= numPages; i++) {
          if (abortRef.current) break;
          currentStep = `extracting native text from page ${i}`;
          setProgressLabel(`Extracting text from page ${i} of ${numPages}…`);
          setProgress(Math.round((i / numPages) * 100));
          const page = await pdfDoc.getPage(i);
          const content = await page.getTextContent();
          const text = (content.items as Array<{ str?: string }>)
            .map((item) => item.str ?? "")
            .join(" ");
          results.push({ pageNum: i, text: text.trim(), confidence: 100 });
        }
        pdfDoc.destroy?.();
        setPageResults(results);
      } else {
        /* ── OCR mode ── */
        currentStep = "loading Tesseract";
        const Tesseract = await import("tesseract.js");
        let worker: Awaited<ReturnType<typeof Tesseract.createWorker>> | null = null;
        let useDirectRecognizeFallback = false;

        try {
          currentStep = "creating OCR worker";
          worker = await Tesseract.createWorker(language, undefined, {
            logger: () => {},
          });
        } catch {
          useDirectRecognizeFallback = true;
        }

        const results: PageResult[] = [];
        for (let i = 1; i <= numPages; i++) {
          if (abortRef.current) break;
          currentStep = `rendering page ${i}`;
          setProgressLabel(`OCR: page ${i} of ${numPages}…`);
          setProgress(Math.round((i / numPages) * 100));

          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 2 });

          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;

          currentStep = `preparing page ${i} image for OCR`;
          const pageImage = await canvasToBlob(canvas, "image/png");
          currentStep = `running OCR on page ${i}`;
          const { data } = useDirectRecognizeFallback
            ? await Tesseract.recognize(pageImage, language, {
                logger: () => {},
              })
            : await worker!.recognize(pageImage);
          results.push({
            pageNum: i,
            text: data.text.trim(),
            confidence: Math.round(data.confidence),
          });
          setPageResults([...results]);
        }

        if (worker) {
          await worker.terminate();
        }
        pdfDoc.destroy?.();
        setPageResults(results);
      }

      setStatus("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to extract text from PDF.";
      setErrorMsg(`${message} (while ${currentStep})`);
      setStatus("error");
    }
  }, [pdfFile, language, useOcrMode]);

  /* ── file handlers ── */
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) loadPdf(file);
    },
    [loadPdf],
  );

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadPdf(file);
    },
    [loadPdf],
  );

  /* ── copy / download ── */
  const copyText = useCallback(async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullText]);

  const downloadText = useCallback(() => {
    const blob = new Blob([fullText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pdfFile?.name.replace(/\.pdf$/i, "") || "extracted"}-text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [fullText, pdfFile]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setPdfFile(null);
    setPageResults([]);
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
    setTotalPages(0);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const isProcessing = status === "loading-pdf" || status === "ocr";

  return (
    <div className="space-y-4">
      {/* ── Upload area ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">
            Upload PDF
          </h2>
          <div className="flex items-center gap-3">
            {/* Mode toggle */}
            <div className="flex rounded-lg border border-border bg-surface-2 p-0.5 text-xs">
              <button
                onClick={() => setUseOcrMode(true)}
                className={`rounded-md px-2.5 py-1.5 font-semibold transition ${
                  useOcrMode ? "bg-[#6c63ff] text-white" : "text-muted hover:text-foreground"
                }`}
              >
                OCR
              </button>
              <button
                onClick={() => setUseOcrMode(false)}
                className={`rounded-md px-2.5 py-1.5 font-semibold transition ${
                  !useOcrMode ? "bg-[#6c63ff] text-white" : "text-muted hover:text-foreground"
                }`}
              >
                Native
              </button>
            </div>
            {useOcrMode && (
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-white outline-none transition focus:border-[#6c63ff]/60"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Mode description */}
        <div className="border-b border-border px-5 py-2">
          <p className="text-[11px] text-muted-2">
            {useOcrMode
              ? "OCR mode — best for scanned PDFs and images-as-pages. Uses Tesseract.js to read text from rendered page images."
              : "Native mode — best for digitally-created PDFs with selectable text. Faster but won't work on scanned documents."}
          </p>
        </div>

        {!pdfFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`m-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-16 transition ${
              dragOver
                ? "border-[#6c63ff] bg-[#6c63ff]/10"
                : "border-border bg-surface-2/50 hover:border-[#6c63ff]/40"
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff6584]/15 text-3xl">
              📄
            </div>
            <div className="text-sm font-semibold text-white">
              Drop a PDF here or click to browse
            </div>
            <div className="text-[11px] text-muted-2">
              PDF files • Max {fmtSize(MAX_FILE_SIZE)}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={onFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#ff6584]/10 text-2xl">
                📄
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-white">{pdfFile.name}</div>
                <div className="text-xs text-muted">
                  {fmtSize(pdfFile.size)}
                  {totalPages > 0 && ` • ${totalPages} page${totalPages !== 1 ? "s" : ""}`}
                </div>
              </div>
              <div className="ml-auto flex flex-wrap gap-2">
                <button
                  onClick={extractText}
                  disabled={isProcessing}
                  className="rounded-lg bg-[#6c63ff] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5b53ee] active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? "Processing…" : "Extract Text"}
                </button>
                <button
                  onClick={reset}
                  className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted">{progressLabel}</span>
                  <span className="font-semibold text-[#6c63ff]">{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#38d9a9] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {status === "error" && errorMsg && (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-5 py-3 text-sm text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* ── Results ── */}
      {pageResults.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-white">
              <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
              Extracted Text
              {status === "done" && (
                <span className="ml-2 text-[10px] font-normal text-muted-2">
                  {pageResults.length} page{pageResults.length !== 1 ? "s" : ""}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={copyText}
                className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-foreground"
              >
                {copied ? "✓ Copied" : "Copy All"}
              </button>
              <button
                onClick={downloadText}
                className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-foreground"
              >
                Download .txt
              </button>
            </div>
          </div>

          {/* Per-page results */}
          <div className="max-h-[600px] divide-y divide-white/5 overflow-y-auto">
            {pageResults.map((pr) => (
              <div key={pr.pageNum} className="px-5 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                    Page {pr.pageNum}
                  </span>
                  {useOcrMode && (
                    <span className="text-[10px] text-muted-2">
                      Confidence: {pr.confidence}%
                    </span>
                  )}
                </div>
                {pr.text ? (
                  <pre className="whitespace-pre-wrap break-words rounded-lg border border-border bg-surface-2 p-3 font-sans text-sm leading-7 text-foreground/85">
                    {pr.text}
                  </pre>
                ) : (
                  <p className="text-xs italic text-muted-3">No text detected on this page.</p>
                )}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-px border-t border-border bg-surface-3/50 sm:grid-cols-4">
            <StatCell label="Pages" value={pageResults.length.toString()} />
            <StatCell label="Words" value={wordCount.toLocaleString()} />
            <StatCell label="Characters" value={charCount.toLocaleString()} />
            {useOcrMode && <StatCell label="Avg Confidence" value={`${avgConfidence}%`} />}
          </div>
        </div>
      )}

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard
          icon="📑"
          title="Two Modes"
          desc="Use 'Native' for digitally-created PDFs with selectable text. Use 'OCR' for scanned documents and image-based PDFs."
        />
        <InfoCard
          icon="🌐"
          title="20+ Languages"
          desc="OCR mode supports English, Hindi, Spanish, Chinese, Arabic, Japanese, and many more via Tesseract.js."
        />
        <InfoCard
          icon="🔒"
          title="100% Private"
          desc="All processing happens in your browser. No PDF data is uploaded to any server."
        />
      </div>
    </div>
  );
}

/* ── sub-components ── */

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-white">{value}</div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <span className="text-xl">{icon}</span>
      <h4 className="mt-2 text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-5 text-muted">{desc}</p>
    </div>
  );
}
