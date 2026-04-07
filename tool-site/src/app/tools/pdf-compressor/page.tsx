import type { Metadata } from "next";
import Link from "next/link";
import PdfCompressorTool from "@/components/pdf-compressor-tool";

export const metadata: Metadata = {
  title: "Compress PDF Online Free — Reduce PDF File Size",
  description:
    "Compress PDF files online for free with ToolMint. Reduce PDF size by up to 90% with three compression levels. No signup, no watermark — fast server-side PDF compression.",
  keywords: [
    "compress pdf",
    "reduce pdf size",
    "pdf compressor online free",
    "shrink pdf",
    "compress pdf file",
    "pdf size reducer",
    "make pdf smaller",
    "free pdf compressor",
  ],
  alternates: { canonical: "/tools/pdf-compressor" },
  openGraph: {
    title: "Compress PDF Online Free — Reduce PDF File Size | ToolMint",
    description:
      "Compress PDF files online for free. Reduce PDF size by up to 90% with three compression levels. No signup, no watermark.",
    url: "/tools/pdf-compressor",
  },
};

const steps = [
  { title: "Upload your PDF", desc: "Drag & drop or click to select a PDF file from your device." },
  { title: "Choose compression", desc: "Pick Low, Medium, or High compression depending on your needs." },
  { title: "Compress", desc: "Hit Compress and let the server-side engine optimize your file." },
  { title: "Download", desc: "Save your smaller PDF instantly. The original is never stored." },
];

const faqs = [
  {
    q: "How much can ToolMint reduce my PDF file size?",
    a: "Depending on the content, ToolMint can reduce PDF size by 30–90%. Image-heavy PDFs see the largest reductions, while text-only files are already compact.",
  },
  {
    q: "Is my PDF file secure during compression?",
    a: "Yes. Your file is processed on the server and automatically deleted after compression. We never store, share, or access your documents.",
  },
  {
    q: "What compression levels are available?",
    a: "ToolMint offers three levels: Low (best quality, moderate reduction), Medium (balanced), and High (smallest size, slight quality trade-off for images).",
  },
  {
    q: "Can I compress password-protected PDFs?",
    a: "Password-protected PDFs must be unlocked first. Use our Unlock PDF tool to remove the password, then compress the file.",
  },
  {
    q: "Is there a file size limit for PDF compression?",
    a: "There is no hard limit, but very large files over 100 MB may take longer to process. Files under 50 MB compress fastest.",
  },
];

export default function PdfCompressorPage() {
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
      <main className="pdf-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Compress PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Reduce the file size of any PDF document in seconds. ToolMint offers three compression
          levels — choose between maximum quality, balanced, or smallest file size. Compression
          runs server-side with a native PDF engine, delivering up to 90&nbsp;% file-size reduction
          without destroying readability.
        </p>

        <div className="mt-8">
          <PdfCompressorTool />
        </div>

        {/* How-to section */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Compress a PDF Online
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

        {/* FAQ section */}
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
