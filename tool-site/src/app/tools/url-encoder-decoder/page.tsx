import type { Metadata } from "next";
import Link from "next/link";
import UrlEncoderDecoderTool from "@/components/url-encoder-decoder-tool";

export const metadata: Metadata = {
  title: "URL Encoder / Decoder — Encode & Decode URLs Online | ToolCraft",
  description:
    "Free online URL Encoder & Decoder. Encode special characters for safe URLs or decode percent-encoded strings back to readable text. Includes URL breakdown with query parameter parsing.",
};

export default function UrlEncoderDecoderPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        URL Encoder / Decoder
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Encode special characters for safe URLs or decode percent-encoded strings back to readable text.
        Includes a live URL breakdown with parsed query parameters.
      </p>

      <div className="mt-8">
        <UrlEncoderDecoderTool />
      </div>
    </main>
  );
}
