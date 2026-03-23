import type { Metadata } from "next";
import Link from "next/link";
import ColorConverterTool from "@/components/color-converter-tool";

export const metadata: Metadata = {
  title: "Color Converter — HEX to RGB to HSL | ToolCraft",
  description:
    "Free Color Converter. Convert HEX to RGB and HSL instantly, preview colors, and copy CSS-ready formats.",
};

export default function ColorConverterPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Color Converter
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert and copy colors in HEX, RGB, and HSL formats.
      </p>

      <div className="mt-8">
        <ColorConverterTool />
      </div>
    </main>
  );
}
