import type { Metadata } from "next";
import Link from "next/link";
import FileSizeConverterTool from "@/components/file-size-converter-tool";

export const metadata: Metadata = {
  title: "File Size Converter — MB to GB, KB to MB, SI vs IEC Units | ToolMint",
  description:
    "Convert between 12 file size units — bits, bytes, KB, MB, GB, TB, PB (SI decimal) and KiB, MiB, GiB, TiB, PiB (IEC binary). Includes quick reference for real-world file sizes. Free.",
  keywords: [
    "file size converter",
    "MB to GB",
    "KB to MB",
    "GB to TB",
    "MB vs MiB",
    "SI vs IEC file size",
    "bits to bytes converter",
    "binary file size",
    "decimal file size",
    "GiB to GB",
    "file size unit converter",
    "storage unit converter",
  ],
  alternates: { canonical: "/tools/file-size-converter" },
  openGraph: {
    title: "File Size Converter — MB to GB, KB to MB, SI vs IEC Units | ToolMint",
    description:
      "Convert between 12 file size units including SI (KB/MB/GB) and IEC binary (KiB/MiB/GiB) formats with real-world quick reference cards.",
    url: "/tools/file-size-converter",
  },
};

const includedTools = [
  { title: "Decimal (SI) Units Converter", desc: "Convert using powers of 1,000 — KB, MB, GB, TB, PB — the standard used by hard drive manufacturers and file system tools on Windows." },
  { title: "Binary (IEC) Units Converter", desc: "Convert using powers of 1,024 — KiB, MiB, GiB, TiB, PiB — the standard used by RAM specs, Linux, and macOS Disk Utility." },
  { title: "Full Unit Input (12 Units)", desc: "Enter any value from bits to pebibytes. Both SI and IEC outputs update simultaneously so you can compare the two systems side by side." },
  { title: "Quick Reference Cards", desc: "See real-world size benchmarks — Floppy disk, CD, DVD, Blu-ray, USB drive, and SSD — in both SI and IEC formats at a glance." },
];

const steps = [
  { title: "Enter a value", desc: "Type the file size you want to convert into the input field." },
  { title: "Select the unit", desc: "Choose your source unit from the dropdown — from bits to pebibytes." },
  { title: "Read both outputs", desc: "The Decimal (SI) and Binary (IEC) sections both update instantly so you can see the difference between MB and MiB." },
  { title: "Check quick reference", desc: "Scroll to the Quick Reference section to compare your value against real-world storage media like CDs, Blu-rays, and SSDs." },
];

const faqs = [
  {
    q: "What is the difference between MB and MiB?",
    a: "MB (megabyte, SI) = 1,000 × 1,000 = 1,000,000 bytes. MiB (mebibyte, IEC) = 1,024 × 1,024 = 1,048,576 bytes. A 500 MB file is about 476.8 MiB. Windows reports sizes in MiB but labels them MB, which causes frequent confusion.",
  },
  {
    q: "Why does a 1 TB hard drive show as less in Windows?",
    a: "Hard drive manufacturers use SI decimal (1 TB = 1,000,000,000,000 bytes), but Windows reports in binary IEC units and labels them TB — so 1 TB (SI) appears as approximately 931 GiB in Windows Explorer.",
  },
  {
    q: "How many bytes are in a gigabyte?",
    a: "In SI/decimal: 1 GB = 1,000,000,000 bytes. In IEC/binary: 1 GiB = 1,073,741,824 bytes. For network speeds and storage specs, GB (decimal) is standard. For RAM and operating systems, GiB (binary) is used.",
  },
  {
    q: "What units does this file size converter support?",
    a: "ToolMint's File Size Converter supports 12 units: Bit, Byte, Kilobyte (KB), Megabyte (MB), Gigabyte (GB), Terabyte (TB), Petabyte (PB) and Kibibyte (KiB), Mebibyte (MiB), Gibibyte (GiB), Tebibyte (TiB), Pebibyte (PiB).",
  },
  {
    q: "How large is a Blu-ray disc in GB and GiB?",
    a: "A single-layer Blu-ray disc holds 25 GB (SI). In IEC units that is approximately 23.28 GiB. Dual-layer Blu-ray holds 50 GB ≈ 46.57 GiB. These values are shown in the Quick Reference cards.",
  },
];

export default function FileSizeConverterPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          File Size Converter — SI Decimal &amp; IEC Binary Units
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert between 12 file size units — bits, bytes, KB, MB, GB, TB, PB (SI decimal) and KiB, MiB,
          GiB, TiB, PiB (IEC binary). See both systems side by side, understand the MB vs MiB difference,
          and compare against real-world media sizes with built-in quick reference cards.
        </p>

        <div className="mt-8">
          <FileSizeConverterTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included File Size Converter Tools
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {includedTools.map((tool) => (
              <div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{tool.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Convert File Sizes
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{i + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((f, i) => (
              <div key={i}>
                <dt className="font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}
