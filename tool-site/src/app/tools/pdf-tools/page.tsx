import type { Metadata } from "next";
import ToolCategoryHub from "@/components/tool-category-hub";
import { toolCategories } from "@/lib/tool-categories";

export const metadata: Metadata = {
  title: "PDF Tools Online for Everyday Document Work | ToolMint",
  description:
    "Explore ToolMint's PDF tools for compressing PDFs, merging files, splitting page ranges, converting Office documents, and protecting or signing paperwork. Built for practical document cleanup and sharing tasks.",
  keywords: [
    "pdf tools online",
    "document tools",
    "compress pdf for email",
    "merge pdf files online",
    "split pdf by page range",
    "pdf converter tools",
    "password protect pdf",
    "pdf to word converter",
    "word to pdf converter",
    "pdf tools for students and office work",
  ],
  alternates: { canonical: "/tools/pdf-tools" },
  openGraph: {
    title: "PDF Tools Online for Everyday Document Work | ToolMint",
    description:
      "Compress, merge, split, convert, sign, and protect PDFs with practical tool pages built for real document workflows.",
    url: "/tools/pdf-tools",
  },
};

export default function PdfToolsPage() {
  const pdfCategory = toolCategories.find((entry) => entry.id === "pdf");

  const collectionSchema = pdfCategory
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "ToolMint PDF Tools",
        description:
          "PDF utilities for compression, merging, splitting, conversion, editing, and document security workflows.",
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
