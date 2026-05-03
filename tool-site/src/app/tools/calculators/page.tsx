import type { Metadata } from "next";
import ToolCategoryHub from "@/components/tool-category-hub";

export const metadata: Metadata = {
  title: "Free Online Calculators - EMI, BMI, Compound Interest, GPA & More",
  description:
    "15 free online calculators on ToolMint. Calculate loan EMI, BMI, compound interest, percentages, profit margins, ROI, GST, GPA, Palworld breeding combinations and more. No signup required.",
  keywords: [
    "online calculator",
    "emi calculator",
    "bmi calculator",
    "compound interest calculator",
    "percentage calculator",
    "scientific calculator online",
    "gpa calculator",
    "roi calculator",
    "palworld breeding calculator",
  ],
  alternates: { canonical: "/tools/calculators" },
  openGraph: {
    title: "Free Online Calculators - EMI, BMI, Interest & More | ToolMint",
    description:
      "15 free calculators for finance, health, math, gaming, and everyday calculations. No signup required.",
    url: "/tools/calculators",
  },
};

export default function CalculatorsPage() {
  return <ToolCategoryHub categoryId="calculators" />;
}
