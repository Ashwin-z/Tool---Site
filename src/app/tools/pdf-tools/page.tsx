import type { Metadata } from "next";
import ToolCategoryHub from "@/components/tool-category-hub";
import { toolCategories } from "@/lib/tool-categories";

export const metadata: Metadata = {
  title: "Free PDF Tools Online – No Signup Required",
  description:
    "Free PDF tools to compress, merge, split, convert, edit and secure PDFs. No signup, no watermark. Most tools run entirely in your browser.",
  keywords: [
    "free pdf tools online",
    "pdf tools no signup",
    "compress pdf online",
    "merge pdf online",
    "split pdf online",
    "pdf converter tools",
    "pdf editor online free",
    "pdf to word online",
    "word to pdf online",
    "protect pdf online",
  ],
  alternates: { canonical: "/tools/pdf-tools" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Free PDF Tools Online – No Signup Required | ToolMint",
    description:
      "Free PDF tools online for compressing, merging, splitting, converting, editing, and securing PDF documents. No signup, no watermark.",
    url: "/tools/pdf-tools",
  },
  twitter: { card: "summary_large_image" },
};

export default function PdfToolsPage() {
  const pdfCategory = toolCategories.find((entry) => entry.id === "pdf");

  const collectionSchema = pdfCategory
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Free PDF Tools Online – ToolMint",
        description:
          "Free online PDF tools for compression, merging, splitting, conversion, editing, and document security. No signup required.",
        url: "https://toolmint.tools/tools/pdf-tools",
        mainEntity: {
          "@type": "ItemList",
          itemListElement: pdfCategory.tools.map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: tool.name,
            url: `https://toolmint.tools/tools/${tool.slug}`,
          })),
        },
      }
    : null;

  return (
    <>
      {collectionSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      ) : null}
      <ToolCategoryHub categoryId="pdf" />
    </>
  );
}
