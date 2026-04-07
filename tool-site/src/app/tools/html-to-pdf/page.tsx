import type { Metadata } from "next";
import Link from "next/link";
import HtmlToPdfTool from "@/components/html-to-pdf-tool";

export const metadata: Metadata = {
  title: "HTML to PDF Online Free — Save Webpage as PDF",
  description:
    "Convert HTML to PDF online for free with ToolMint. Paste any webpage URL and download the fully rendered page as a PDF. No signup, no watermark — instant HTML to PDF.",
  keywords: [
    "html to pdf",
    "webpage to pdf",
    "save webpage as pdf",
    "convert html to pdf",
    "url to pdf",
    "website to pdf",
    "html to pdf converter online free",
    "web page to pdf",
  ],
  alternates: { canonical: "/tools/html-to-pdf" },
  openGraph: {
    title: "HTML to PDF Online Free — Save Webpage as PDF | ToolMint",
    description:
      "Convert HTML to PDF online for free. Paste any URL and download the rendered page as a PDF. No signup.",
    url: "/tools/html-to-pdf",
  },
};

const steps = [
  { title: "Paste a URL", desc: "Enter the full web address of the page you want to convert." },
  { title: "Preview", desc: "ToolMint renders the live page so you can verify the content." },
  { title: "Convert", desc: "Click Convert to generate a PDF from the rendered page." },
  { title: "Download", desc: "Save the PDF to your device instantly." },
];

const faqs = [
  {
    q: "Can I convert any webpage to PDF?",
    a: "ToolMint can convert most publicly accessible webpages. Pages behind logins or paywalls cannot be rendered.",
  },
  {
    q: "Does the PDF preserve the original page layout?",
    a: "Yes. ToolMint renders the page in a real browser engine, capturing layout, images, fonts, and CSS styling.",
  },
  {
    q: "Can I convert local HTML files to PDF?",
    a: "Currently, ToolMint converts live URLs only. For local HTML files, open them in your browser first and use the URL from the address bar.",
  },
  {
    q: "Is the conversion done securely?",
    a: "Yes. The URL is fetched server-side, rendered into a PDF, and the result is sent directly to you. Nothing is stored.",
  },
  {
    q: "What if the page has dynamic JavaScript content?",
    a: "ToolMint uses a full browser engine that executes JavaScript, so dynamic content, SPAs, and interactive elements are captured in the PDF.",
  },
];

export default function HtmlToPdfPage() {
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
          Convert HTML to PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Save any webpage as a PDF document with ToolMint. Paste a live URL and download a fully
          rendered, print-ready PDF that captures the page exactly as it appears in your
          browser — including CSS, images, and JavaScript-generated content.
        </p>

        <div className="mt-8">
          <HtmlToPdfTool />
        </div>

        {/* How-to section */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Convert a Webpage to PDF
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
