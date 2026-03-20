import type { Metadata } from "next";
import Link from "next/link";
import ExcelToPdfTool from "@/components/excel-to-pdf-tool";

export const metadata: Metadata = {
  title: "Excel to PDF — Free Online Excel to PDF Converter",
  description:
    "Free online Excel to PDF converter. Upload up to 25 XLSX, XLS, or CSV files and turn each one into a polished PDF in your browser.",
};

export default function ExcelToPdfPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Excel to PDF
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9b9bb3] md:text-base">
        Convert spreadsheets into PDF documents. Upload up to 25 Excel or CSV files and download either a single PDF or a ZIP of converted files.
      </p>

      <div className="mt-8">
        <ExcelToPdfTool />
      </div>
    </main>
  );
}
