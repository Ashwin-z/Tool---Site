import type { Metadata } from "next";
import Link from "next/link";
import LengthConverterTool from "@/components/length-converter-tool";

export const metadata: Metadata = {
  title: "Length Converter — km, mi, ft, cm, inches & more | ToolCraft",
  description:
    "Free online Length Converter. Convert between kilometers, miles, feet, inches, centimeters, meters, yards, nautical miles, and more. Instant results with all-unit table.",
};

export default function LengthConverterPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Length Converter
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert between 12 length units — metric, imperial, nautical miles, and light years.
        See the result in all units at once.
      </p>

      <div className="mt-8">
        <LengthConverterTool />
      </div>
    </main>
  );
}
