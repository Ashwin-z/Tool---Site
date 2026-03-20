import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const MAX_CONVERSION_FILES = 25;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function sanitizeBaseName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "");
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export type HtmlSanitizeOptions = {
  sourceUrl?: string;
};

function makeAbsoluteUrl(rawUrl: string, sourceUrl?: string): string {
  const trimmedUrl = rawUrl.trim();
  if (!sourceUrl || !trimmedUrl) return trimmedUrl;

  if (
    trimmedUrl.startsWith("#") ||
    /^(data:|blob:|mailto:|tel:|javascript:|about:)/i.test(trimmedUrl)
  ) {
    return trimmedUrl;
  }

  try {
    return new URL(trimmedUrl, sourceUrl).toString();
  } catch {
    return trimmedUrl;
  }
}

function rewriteSrcSet(value: string, sourceUrl?: string): string {
  return value
    .split(",")
    .map((descriptor) => {
      const trimmedDescriptor = descriptor.trim();
      if (!trimmedDescriptor) return trimmedDescriptor;

      const parts = trimmedDescriptor.split(/\s+/);
      const firstPart = parts.shift() ?? "";
      return [makeAbsoluteUrl(firstPart, sourceUrl), ...parts].join(" ");
    })
    .join(", ");
}

function replaceUnsupportedColorFunctions(value: string): string {
  return value.replace(
    /(?:lab|lch|oklch|oklab|color-mix|light-dark|color)\s*\([^)]*(?:\([^)]*\)[^)]*)*\)/gi,
    "#888",
  );
}

export async function ensureImagesLoaded(
  container: HTMLElement,
  timeoutMs = 4000,
): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          const timer = setTimeout(() => resolve(), timeoutMs);
          const done = () => {
            clearTimeout(timer);
            resolve();
          };
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
        }),
    ),
  );
}

export function sanitizeHtmlMarkup(markup: string, options?: HtmlSanitizeOptions): string {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(markup, "text/html");
  const sourceUrl = options?.sourceUrl;

  /* Remove dangerous or network-blocking elements */
  documentNode
    .querySelectorAll(
      "script, noscript, iframe, object, embed, link, meta, base, " +
        'link[rel="stylesheet"], link[rel="preload"], link[rel="preconnect"], link[rel="prefetch"]',
    )
    .forEach((node) => node.remove());

  /* Rewrite URL-bearing attributes when a source URL is available. */
  if (sourceUrl) {
    documentNode.querySelectorAll("[src], [href], [poster], [action], [srcset]").forEach((el) => {
      const src = el.getAttribute("src");
      if (src) el.setAttribute("src", makeAbsoluteUrl(src, sourceUrl));

      const href = el.getAttribute("href");
      if (href) el.setAttribute("href", makeAbsoluteUrl(href, sourceUrl));

      const poster = el.getAttribute("poster");
      if (poster) el.setAttribute("poster", makeAbsoluteUrl(poster, sourceUrl));

      const action = el.getAttribute("action");
      if (action) el.setAttribute("action", makeAbsoluteUrl(action, sourceUrl));

      const srcset = el.getAttribute("srcset");
      if (srcset) el.setAttribute("srcset", rewriteSrcSet(srcset, sourceUrl));
    });
  } else {
    /* Strip external images that will never load (keep data: URIs) */
    documentNode.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") ?? "";
      if (/^(https?:)?\/\//i.test(src)) {
        img.removeAttribute("src");
        img.style.display = "none";
      }
    });
  }

  /* Neutralise external url() in inline styles */
  documentNode.querySelectorAll("[style]").forEach((el) => {
    const style = el.getAttribute("style") ?? "";
    if (/url\s*\(/i.test(style)) {
      const rewrittenStyle = sourceUrl
        ? style.replace(
            /url\s*\(\s*(['"]?)([^'")]+)\1\s*\)/gi,
            (_, quote: string, urlValue: string) => `url(${quote}${makeAbsoluteUrl(urlValue, sourceUrl)}${quote})`,
          )
        : style.replace(/url\s*\(\s*['"]?https?:[^)]*\)/gi, "none");

      el.setAttribute("style", rewrittenStyle);
    }
  });

  const unsupportedColorRe =
    /(?:lab|lch|oklch|oklab|color-mix|light-dark|color)\s*\([^)]*(?:\([^)]*\)[^)]*)*\)/gi;

  documentNode.querySelectorAll("[style]").forEach((el) => {
    const style = el.getAttribute("style") ?? "";
    if (unsupportedColorRe.test(style)) {
      unsupportedColorRe.lastIndex = 0;
      el.setAttribute("style", replaceUnsupportedColorFunctions(style));
    }
  });

  /* Strip @import rules and replace unsupported colors in <style> tags */
  documentNode.querySelectorAll("style").forEach((styleEl) => {
    let css = styleEl.textContent ?? "";
    css = css.replace(/@import\s+url\([^)]*\)[^;]*;?/gi, "");
    css = replaceUnsupportedColorFunctions(css);
    styleEl.textContent = css;
  });

  return documentNode.body?.innerHTML?.trim() || documentNode.documentElement.innerHTML || markup;
}

function addTallCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;
  const addCanvas = (position: number) => {
    try {
      pdf.addImage(canvas, "PNG", 0, position, imageWidth, imageHeight, undefined, "FAST");
    } catch {
      const jpegData = canvas.toDataURL("image/jpeg", 0.98);
      pdf.addImage(jpegData, "JPEG", 0, position, imageWidth, imageHeight, undefined, "FAST");
    }
  };

  let remainingHeight = imageHeight;
  let position = 0;

  addCanvas(position);
  remainingHeight -= pageHeight;

  while (remainingHeight > 0) {
    position = remainingHeight - imageHeight;
    pdf.addPage();
    addCanvas(position);
    remainingHeight -= pageHeight;
  }
}

export async function renderElementToPdfBlob(
  element: HTMLElement,
  options?: {
    format?: "a4" | "letter";
    orientation?: "p" | "l";
    scale?: number;
  },
): Promise<Blob> {
  await ensureImagesLoaded(element);

  const canvas = await html2canvas(element, {
    scale: options?.scale ?? 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    allowTaint: true,
    logging: false,
    windowWidth: Math.max(element.scrollWidth, element.clientWidth, 1),
    windowHeight: Math.max(element.scrollHeight, element.clientHeight, 1),
  });

  const pdf = new jsPDF({
    orientation: options?.orientation ?? "p",
    unit: "pt",
    format: options?.format ?? "a4",
  });

  addTallCanvasToPdf(pdf, canvas);
  return pdf.output("blob");
}

export async function renderSlidesToPdfBlob(
  slideElements: HTMLElement[],
  options: {
    width: number;
    height: number;
    scale?: number;
  },
): Promise<Blob> {
  const orientation = options.width >= options.height ? "l" : "p";
  const pdf = new jsPDF({
    orientation,
    unit: "px",
    format: [options.width, options.height],
  });

  for (let index = 0; index < slideElements.length; index += 1) {
    const slideElement = slideElements[index];
    await ensureImagesLoaded(slideElement);
    const canvas = await html2canvas(slideElement, {
      scale: options.scale ?? 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: options.width,
      windowHeight: options.height,
    });

    if (index > 0) {
      pdf.addPage([options.width, options.height], orientation);
    }

    try {
      pdf.addImage(canvas, "PNG", 0, 0, options.width, options.height, undefined, "FAST");
    } catch {
      const jpegData = canvas.toDataURL("image/jpeg", 0.98);
      pdf.addImage(jpegData, "JPEG", 0, 0, options.width, options.height, undefined, "FAST");
    }
  }

  return pdf.output("blob");
}

export function createHiddenRenderContainer(className: string, innerHtml: string): HTMLDivElement {
  const container = document.createElement("div");
  container.className = className;
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.background = "#ffffff";
  container.style.color = "#111827";
  container.style.zIndex = "-1";
  container.innerHTML = innerHtml;
  document.body.appendChild(container);
  return container;
}
