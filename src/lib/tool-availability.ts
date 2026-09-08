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

const unavailableToolSlugSet = new Set<string>(unavailableToolSlugs);

export { unavailableToolSlugs };

export function getToolSlugFromHref(href: string): string | null {
  if (!href.startsWith("/tools/")) return null;

  const slug = href.slice("/tools/".length).split("/")[0];
  return slug || null;
}

export function isToolAvailableSlug(slug: string): boolean {
  return !unavailableToolSlugSet.has(slug);
}

export function isToolAvailableHref(href: string): boolean {
  const slug = getToolSlugFromHref(href);
  return slug ? isToolAvailableSlug(slug) : true;
}

export function filterAvailableLinks<T extends { href: string }>(items: T[]): T[] {
  return items.filter((item) => isToolAvailableHref(item.href));
}
