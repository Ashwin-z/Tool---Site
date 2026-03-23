import type { Metadata } from "next";
import Link from "next/link";
import PdfSecurityTool from "@/components/pdf-security-tool";

export const metadata: Metadata = {
  title: "Protect PDF — Lock PDF with Password Online | ToolCraft",
  description:
    "Protect PDF online with AES-256 password encryption. Lock your PDF with an open password and control permissions before downloading the secured file.",
};

export default function ProtectPdfPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Protect PDF
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Add password protection to a PDF using strong AES-256 encryption. Set the password required to open the file and choose the viewer permissions you want to allow.
      </p>

      <div className="mt-8">
        <PdfSecurityTool mode="protect" />
      </div>
    </main>
  );
}
