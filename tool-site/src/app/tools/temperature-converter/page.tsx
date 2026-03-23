import type { Metadata } from "next";
import Link from "next/link";
import TemperatureConverterTool from "@/components/temperature-converter-tool";

export const metadata: Metadata = {
  title: "Temperature Converter — °C, °F, Kelvin, Rankine & more | ToolCraft",
  description:
    "Free online Temperature Converter. Convert between Celsius, Fahrenheit, Kelvin, Rankine, Delisle, Newton, Réaumur, and Rømer. Instant results with reference points.",
};

export default function TemperatureConverterPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Temperature Converter
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert between 8 temperature scales — Celsius, Fahrenheit, Kelvin, Rankine, and more.
        Includes reference points and fun facts about your temperature value.
      </p>

      <div className="mt-8">
        <TemperatureConverterTool />
      </div>
    </main>
  );
}
