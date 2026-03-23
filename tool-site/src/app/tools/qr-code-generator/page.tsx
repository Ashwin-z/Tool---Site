import type { Metadata } from "next";
import Link from "next/link";
import QrCodeGeneratorTool from "@/components/qr-code-generator-tool";

export const metadata: Metadata = {
  title: "QR Code Generator — Create QR Codes Online | ToolCraft",
  description:
    "Free QR Code Generator. Create QR codes from text, URLs, or any content. Customize colors, download as PNG or SVG.",
};

export default function QrCodeGeneratorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        QR Code Generator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Generate QR codes from any text, URL, or content. Customize colors and download in PNG or SVG format.
      </p>

      <div className="mt-8">
        <QrCodeGeneratorTool />
      </div>
    </main>
  );
}
