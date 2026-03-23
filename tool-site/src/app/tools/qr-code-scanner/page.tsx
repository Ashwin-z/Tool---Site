import type { Metadata } from "next";
import Link from "next/link";
import QrCodeScannerTool from "@/components/qr-code-scanner-tool";

export const metadata: Metadata = {
  title: "QR Code Scanner — Scan QR Codes Online | ToolCraft",
  description:
    "Free QR Code Scanner. Scan QR codes using your camera or upload an image. Instant results, no app needed.",
};

export default function QrCodeScannerPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        QR Code Scanner
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Scan any QR code instantly using your camera or by uploading an image. Results stay private — everything runs in your browser.
      </p>

      <div className="mt-8">
        <QrCodeScannerTool />
      </div>
    </main>
  );
}
