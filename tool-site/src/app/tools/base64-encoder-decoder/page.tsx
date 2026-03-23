import type { Metadata } from "next";
import Link from "next/link";
import Base64EncoderDecoderTool from "@/components/base64-encoder-decoder-tool";

export const metadata: Metadata = {
  title: "Base64 Encoder / Decoder — Encode & Decode Base64 Online | ToolCraft",
  description:
    "Free online Base64 Encoder & Decoder. Encode text or files to Base64 and decode Base64 strings instantly in your browser. No data leaves your device.",
};

export default function Base64EncoderDecoderPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Base64 Encoder / Decoder
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Encode text or files to Base64 and decode Base64 strings back to plain text — instantly in your browser
        with zero server processing.
      </p>

      <div className="mt-8">
        <Base64EncoderDecoderTool />
      </div>
    </main>
  );
}
