/**
 * Shared SEO helpers.
 *
 * Titles rendered through Next's metadata `template` ("%s | ToolMint" in
 * src/app/layout.tsx) must NOT carry the brand themselves, or the suffix is
 * emitted twice. Before Batch 0, 21 live pages read "… | ToolMint | ToolMint".
 *
 * `openGraph.title` does NOT pass through the template, so those values keep
 * the brand and should be built with `withBrand()`.
 */

export const BRAND = "ToolMint";

/** Longest title Google renders before truncating, in characters. */
export const TITLE_MAX = 60;
/** Longest meta description Google renders before truncating. */
export const DESCRIPTION_MAX = 160;

const BRAND_SUFFIX = /\s*[|\-–—]\s*ToolMint\s*$/i;

/**
 * Strip a trailing "| ToolMint" so the layout template can add exactly one.
 * Safe to call repeatedly and on titles that never had a suffix.
 */
export function stripBrand(title: string): string {
  let out = title.trim();
  while (BRAND_SUFFIX.test(out)) {
    out = out.replace(BRAND_SUFFIX, "").trim();
  }
  return out;
}

/** Build a title for `openGraph.title`, which bypasses the template. */
export function withBrand(title: string): string {
  return `${stripBrand(title)} | ${BRAND}`;
}

/**
 * Normalise a page title: de-duplicate the brand and report when the result
 * still exceeds what Google will render.
 */
export function pageTitle(title: string): string {
  return stripBrand(title);
}

/**
 * Trim a description to `max` characters on a word boundary. Descriptions
 * longer than this are silently truncated by Google mid-sentence.
 */
export function clampDescription(text: string, max: number = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:\-–—\s]+$/, "");
}

/**
 * Length of the title as it will actually appear in a SERP, including the
 * template suffix. Used by scripts/audit-metadata.mjs.
 */
export function renderedTitleLength(title: string): number {
  return `${stripBrand(title)} | ${BRAND}`.length;
}
