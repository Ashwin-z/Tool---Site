/**
 * SINGLE SOURCE OF TRUTH for loading pdf.js.
 *
 * Every tool that needs pdf.js must call `getPdfjs()` from here. Before Batch
 * 1B, ten components each inlined their own copy of this logic and two of them
 * (merge-pdf, split-pdf) fetched the worker from `https://unpkg.com` at
 * runtime — a third-party dependency on a privacy-first PDF tool, and a
 * single point of failure if unpkg is slow or blocked.
 *
 * Both files are served from this site's own /public/vendor/pdfjs:
 *   pdf.mjs             5.5.207
 *   pdf.worker.min.mjs  5.5.207
 * and package.json pins pdfjs-dist to the same 5.5.207. The worker and the
 * library MUST stay on the same version — pdf.js throws
 * "The API version does not match the Worker version" otherwise.
 * scripts/check-pdfjs-version.mjs enforces this at build time.
 *
 * The dynamic import goes through `new Function` so the bundler leaves the
 * URL alone and the browser fetches it at runtime from our own origin.
 */

export const PDFJS_VERSION = "5.5.207";
export const PDFJS_LIB_URL = "/vendor/pdfjs/pdf.mjs";
export const PDFJS_WORKER_URL = "/vendor/pdfjs/pdf.worker.min.mjs";

type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: unknown) => { promise: Promise<PdfJsDocument> };
  version?: string;
};

export type PdfJsDocument = {
  numPages: number;
  getPage: (n: number) => Promise<PdfJsPage>;
  destroy?: () => Promise<void>;
};

export type PdfJsPage = {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (opts: unknown) => { promise: Promise<void> };
};

let pdfjsPromise: Promise<PdfJsModule> | null = null;

export async function getPdfjs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    // Kept opaque to the bundler so this resolves against our own origin.
    const importPdfjs = new Function("url", "return import(url);") as (
      url: string,
    ) => Promise<PdfJsModule>;

    pdfjsPromise = importPdfjs(PDFJS_LIB_URL).then((pdfjs) => {
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      }
      return pdfjs;
    });
  }

  return pdfjsPromise;
}

/**
 * Render one page to a data URL, for thumbnails. Returns null rather than
 * throwing — a missing preview must never break the tool itself.
 */
export async function renderPageThumbnail(
  bytes: ArrayBuffer,
  pageNumber: number,
  scale = 0.5,
): Promise<string | null> {
  try {
    const pdfjs = await getPdfjs();
    const doc = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
    const page = await doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return null;

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({ canvasContext: context, viewport, canvas } as never).promise;
    const url = canvas.toDataURL("image/png", 0.9);
    await doc.destroy?.();
    return url;
  } catch {
    return null;
  }
}
