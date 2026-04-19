import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import PdfCompressorTool from "@/components/pdf-compressor-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "Compress PDF Online Free - Reduce PDF File Size",
  description:
    "Compress PDF files online for free with ToolMint. Reduce PDF size by up to 90% with three compression levels. No signup, no watermark - fast server-side PDF compression.",
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
    title: "Compress PDF Online Free - Reduce PDF File Size | ToolMint",
    description:
      "Compress PDF files online for free. Reduce PDF size by up to 90% with three compression levels. No signup, no watermark.",
    url: "/tools/pdf-compressor",
  },
};

const steps = [
  { title: "Upload your PDF", desc: "Drag and drop or click to select a PDF file from your device." },
  { title: "Choose compression", desc: "Pick Low, Medium, or High compression depending on your needs." },
  { title: "Compress", desc: "Hit Compress and let the server-side engine optimize your file." },
  { title: "Download", desc: "Save your smaller PDF instantly. The original is never stored." },
];

const faqs = [
  {
    q: "How much can ToolMint reduce my PDF file size?",
    a: "Depending on the content, ToolMint can reduce PDF size by 30% to 90%. Image-heavy PDFs usually see the largest reductions, while text-only files are already compact.",
  },
  {
    q: "Is my PDF file secure during compression?",
    a: "Yes. Your file is processed on the server and automatically deleted after compression. We do not store, share, or access your documents.",
  },
  {
    q: "What compression levels are available?",
    a: "ToolMint offers three levels: Low for best quality, Medium for a balanced result, and High for the smallest size with a quality trade-off for images.",
  },
  {
    q: "Can I compress password-protected PDFs?",
    a: "Password-protected PDFs must be unlocked first. Use the Unlock PDF tool to remove the password, then compress the file.",
  },
  {
    q: "Is there a file size limit for PDF compression?",
    a: "There is no hard limit, but very large files over 100 MB may take longer to process. Files under 50 MB usually compress fastest.",
  },
];

const bestFor = [
  {
    title: "Email attachments",
    desc: "Reduce large PDFs before attaching them to Gmail, Outlook, or customer support messages with strict upload limits.",
  },
  {
    title: "Portal uploads",
    desc: "Shrink PDFs for job applications, visa forms, school submissions, or government portals that reject larger files.",
  },
  {
    title: "Faster sharing",
    desc: "Compress presentation decks, brochures, and scanned documents so they upload faster on slower connections.",
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
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "PDF Tools", href: "/tools/pdf-tools" },
            { name: "PDF Compressor" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Compress PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Reduce the file size of any PDF document in seconds. ToolMint offers three compression
          levels so you can choose between maximum quality, balanced compression, or the smallest
          possible file size for easier sharing and uploading.
        </p>

        <div className="mt-8">
          <PdfCompressorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Best Times to Compress a PDF
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {bestFor.map((item) => (
              <article key={item.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

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

        <RelatedTools slug="pdf-compressor" />
      </main>
    </>
  );
}
