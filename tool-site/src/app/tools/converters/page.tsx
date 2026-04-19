import type { Metadata } from "next";
import ToolCategoryHub from "@/components/tool-category-hub";

export const metadata: Metadata = {
  title: "Free Online Unit Converters â€” Length, Weight, Temperature, File Size & Color",
  description:
    "6 free online converters on ToolMint. Convert length, weight, temperature, file size, colours and generate random numbers. Instant results, no signup required.",
  keywords: [
    "unit converter online",
    "length converter",
    "weight converter",
    "temperature converter",
    "file size converter",
    "color converter hex rgb",
    "random number generator",
  ],
  alternates: { canonical: "/tools/converters" },
  openGraph: {
    title: "Free Online Converters â€” Length, Weight, Temp & More | ToolMint",
    description:
      "6 free unit converters. Convert length, weight, temperature, file sizes and colours instantly.",
    url: "/tools/converters",
  },
};

export default function ConvertersPage() {
  return <ToolCategoryHub categoryId="converters" />;
}
