import type { Metadata } from "next";
import ToolCategoryHub from "@/components/tool-category-hub";

export const metadata: Metadata = {
  title: "Free Online Text Tools â€” Word Counter, Text Compare, Case Converter & More",
  description:
    "7 free online text tools on ToolMint. Count words and characters, compare texts, change case, reverse text, remove whitespace and check grammar. No signup required.",
  keywords: [
    "text tools online",
    "word counter online",
    "text compare tool",
    "text case converter",
    "character counter",
    "whitespace remover",
    "grammar checker free",
  ],
  alternates: { canonical: "/tools/text-tools" },
  openGraph: {
    title: "Free Online Text Tools â€” Word Counter, Compare & More | ToolMint",
    description:
      "7 free browser-based text tools. Count words, compare texts, convert case and clean up text.",
    url: "/tools/text-tools",
  },
};

export default function TextToolsPage() {
  return <ToolCategoryHub categoryId="text" />;
}
