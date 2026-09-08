const unavailableToolSlugs = [
  "ai-content-detector",
  "background-remover",
  "cash-receipt-generator",
  "credit-note-generator",
  "delivery-note-generator",
  "estimate-generator",
  "image-watermark",
  "invoice-generator",
  "plagiarism-checker",
  "proforma-invoice-generator",
  "purchase-order-generator",
  "quotation-generator",
  "receipt-generator",
  "regex-tester",
  "sales-receipt-generator",
  "tax-invoice-generator",
] as const;

/**
 * RETIRED in Batch 1C — deliberately removed, not merely broken.
 *
 * Each of these depended on server-side Microsoft Office COM automation or
 * Ghostscript, neither of which works in production (all four returned 5xx to
 * every user). Each was then assessed for a browser rebuild and rejected on
 * evidence rather than effort:
 *
 *   pdf-to-pdfa        veraPDF 1.30.2 proves a browser pass-through can only
 *                      produce a compliant file when the source has no text
 *                      fonts at all (scans PASS; text PDFs FAIL clause 6.3.4,
 *                      "font programs shall be embedded"). A browser cannot
 *                      embed a font that is not already in the file, and files
 *                      that DO embed fonts still failed on other structural
 *                      rules (6.3.3.2). A converter that refuses most inputs
 *                      is not a product.
 *
 *   word-to-pdf        mammoth converts DOCX semantics, not appearance: page
 *                      size, margins, columns, fonts and positioning are
 *                      discarded by design. Users expect a Word-to-PDF export
 *                      to look identical to the document.
 *
 *   excel-to-pdf       The xlsx library does not evaluate formulas — a test
 *                      cell of =B2+C2 (220) read back as 0. A spreadsheet
 *                      converter that silently prints wrong numbers is worse
 *                      than no converter. Print areas, page breaks and charts
 *                      are also unavailable.
 *
 *   powerpoint-to-pdf  No PPTX parser exists in the dependency set (pptxgenjs
 *                      only writes). Hand-parsing DrawingML, theme inheritance
 *                      and EMU geometry is a multi-week job with poor expected
 *                      fidelity.
 *
 * All four source applications export PDF natively and for free, so the user
 * need is weak. These return 410 Gone: the content is deliberately gone and
 * is not coming back at this URL. A redirect would be dishonest — no other
 * ToolMint page satisfies "convert my PowerPoint to PDF".
 *
 * See docs/CONVERTER-DECISIONS.md for the full evidence.
 */
const retiredToolSlugs = [
  "excel-to-pdf",
  "pdf-to-pdfa",
  "powerpoint-to-pdf",
  "word-to-pdf",
] as const;

const retiredToolSlugSet = new Set<string>(retiredToolSlugs);

export { retiredToolSlugs };

export function isToolRetiredSlug(slug: string): boolean {
  return retiredToolSlugSet.has(slug);
}

const unavailableToolSlugSet = new Set<string>(unavailableToolSlugs);

export { unavailableToolSlugs };

export function getToolSlugFromHref(href: string): string | null {
  if (!href.startsWith("/tools/")) return null;

  const slug = href.slice("/tools/".length).split("/")[0];
  return slug || null;
}

export function isToolAvailableSlug(slug: string): boolean {
  return !unavailableToolSlugSet.has(slug) && !retiredToolSlugSet.has(slug);
}

export function isToolAvailableHref(href: string): boolean {
  const slug = getToolSlugFromHref(href);
  return slug ? isToolAvailableSlug(slug) : true;
}

export function filterAvailableLinks<T extends { href: string }>(items: T[]): T[] {
  return items.filter((item) => isToolAvailableHref(item.href));
}
