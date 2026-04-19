import type { Metadata } from "next";
import ToolCategoryHub from "@/components/tool-category-hub";

export const metadata: Metadata = {
  title: "Free Online PDF Tools â€” Compress, Merge, Split, Convert & Edit PDFs",
  description:
    "24 free online PDF tools on ToolMint. Compress, merge, split, rotate, edit, sign, redact PDFs and convert between PDF, Word, Excel, PowerPoint, JPG and more. No signup required.",
  keywords: [
    "pdf tools online",
    "free pdf tools",
    "compress pdf online",
    "merge pdf online",
    "split pdf online",
    "pdf to word",
    "word to pdf",
    "pdf editor online free",
    "pdf converter",
  ],
  alternates: { canonical: "/tools/pdf-tools" },
  openGraph: {
    title: "Free Online PDF Tools â€” Compress, Merge, Convert & Edit | ToolMint",
    description:
      "24 free browser-based PDF tools. Compress, merge, split, convert and edit PDFs with no signup and no watermark.",
    url: "/tools/pdf-tools",
  },
};

export default function PdfToolsPage() {
  return <ToolCategoryHub categoryId="pdf" />;
}
