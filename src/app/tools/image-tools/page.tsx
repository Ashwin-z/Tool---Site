import type { Metadata } from "next";
import ToolCategoryHub from "@/components/tool-category-hub";

export const metadata: Metadata = {
  title: "Free Online Image Tools â€” Compress, Resize, Crop & Convert Images",
  description:
    "9 free online image tools on ToolMint. Compress, resize, crop images, convert between JPG, PNG, WebP and PDF, and extract text with OCR. No signup required.",
  keywords: [
    "image tools online",
    "compress image online",
    "resize image online",
    "image converter",
    "jpg to png",
    "png to jpg",
    "image cropper online",
    "image to text ocr",
  ],
  alternates: { canonical: "/tools/image-tools" },
  openGraph: {
    title: "Free Online Image Tools â€” Compress, Resize & Convert | ToolMint",
    description:
      "9 free browser-based image tools. Compress, resize, crop, convert, and OCR images with no signup.",
    url: "/tools/image-tools",
  },
};

export default function ImageToolsPage() {
  return <ToolCategoryHub categoryId="image" />;
}
