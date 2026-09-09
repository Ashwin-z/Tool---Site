/**
 * SINGLE SOURCE OF TRUTH for ToolMint's public identity.
 *
 * WHY THIS EXISTS
 * Two live sites use the identical brand name and the identical positioning:
 *   toolmint.online — "ToolMint | Privacy-First Utility Hub"
 *   toolmint.app    — "ToolMint — Free Online PDF, Image & File Tools | Privacy-First"
 * A search engine asked about toolmint.tools attributed *their* features to
 * us (9 languages, WebAssembly, pay-per-use — none of which are ours).
 *
 * Two consequences shape everything below.
 *
 * 1. We deliberately DO NOT use the phrase "privacy-first". Both competitors
 *    lead with it, so it identifies the category, not us. We describe the
 *    concrete, checkable behaviour instead: the file is never uploaded, and
 *    you can confirm that in your browser's Network tab.
 *
 * 2. The domain is the only genuinely unique token in the entity, so it is
 *    stated explicitly in the schema description rather than left implicit.
 *
 * The tool count is DERIVED from the registry, never written by hand. Eight
 * places claimed "80+" after Batch 1C retired four tools and the real number
 * became 77.
 */

import { toolCategories } from "@/lib/tool-categories";

export const BRAND_NAME = "ToolMint";

/** Helps disambiguate from the other ToolMints without renaming anything. */
export const BRAND_ALTERNATE_NAME = "ToolMint PDF Tools";

export const SITE_URL = "https://toolmint.tools";
export const SITE_HOST = "toolmint.tools";

/**
 * The one-line identity. Concrete and checkable, and deliberately not the
 * "privacy-first" wording both competitors use.
 */
export const BRAND_TAGLINE = "Browser tools that never upload your file";

/** Longer identity used for schema and social descriptions. */
export const BRAND_DESCRIPTION =
  `${BRAND_NAME} (${SITE_HOST}) is a free collection of browser-based tools for PDFs, ` +
  `images, text and everyday calculations. Every tool that accepts a PDF processes it ` +
  `on your own device — the file is never uploaded, which you can verify in your ` +
  `browser's Network tab. No account, no watermark, no software to install.`;

/**
 * Short form for <meta name="description">. The long BRAND_DESCRIPTION above
 * is for schema, where length is not penalised; reusing it as a meta
 * description produced a 318-character tag that search engines truncate.
 */
export const BRAND_META_DESCRIPTION =
  "Free browser tools for PDFs, images, text and calculations. PDF tools run on your device — your file is never uploaded. No signup, no watermark.";

/** Live, unique tools — derived, so it cannot drift again. */
export const TOOL_COUNT = new Set(
  toolCategories.flatMap((c) => c.tools.map((t) => t.slug)),
).size;

/** e.g. "77 tools". Use this instead of writing a number into copy. */
export const TOOL_COUNT_LABEL = `${TOOL_COUNT} tools`;

/**
 * Published contact addresses.
 *
 * IMPORTANT: toolmint.tools has no MX record, so mail to these addresses
 * bounces. Until DNS is configured (see docs/DNS-EMAIL.md) `contactWorks`
 * stays false and the UI must not present them as a working channel.
 */
export const CONTACT = {
  general: "hello@toolmint.tools",
  partnerships: "partnerships@toolmint.tools",
  /** Flip to true only once a test message has actually been received. */
  contactWorks: false,
} as const;

/**
 * Organization schema. No `sameAs` — we have no verified external profiles
 * and inventing them would be fabricating entity signals.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    alternateName: BRAND_ALTERNATE_NAME,
    url: SITE_URL,
    description: BRAND_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/branding/toolmint-logo-512.png`,
      width: 512,
      height: 512,
    },
  };
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: BRAND_NAME,
    alternateName: BRAND_ALTERNATE_NAME,
    url: SITE_URL,
    description: BRAND_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}
