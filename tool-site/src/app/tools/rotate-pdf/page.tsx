import type { Metadata } from "next";
import RotatePdfTool from "@/components/rotate-pdf-tool";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "Rotate PDF Online Free - Turn PDF Pages Left or Right",
  description:
    "Rotate PDF pages online for free with ToolMint. Turn pages 90 degrees left, right, or 180 degrees. Live preview updates instantly. No signup, no watermark.",
  keywords: [
    "rotate pdf",
    "rotate pdf pages",
    "rotate pdf online free",
    "turn pdf pages",
    "flip pdf",
    "pdf rotator online",
    "free pdf rotate",
    "rotate pdf 90 degrees",
  ],
  alternates: { canonical: "/tools/rotate-pdf" },
  openGraph: {
    title: "Rotate PDF Online Free - Turn PDF Pages Left or Right | ToolMint",
    description:
      "Rotate PDF pages online for free with a live preview and no quality loss.",
    url: "/tools/rotate-pdf",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Drag and drop or select the PDF you want to rotate." },
  { title: "Choose direction", desc: "Click rotate left, right, or 180 degrees to adjust page orientation." },
  { title: "Preview", desc: "See a live preview update after each rotation so you get it exactly right." },
  { title: "Download", desc: "Save the rotated PDF to your device instantly." },
];

const faqs = [
  {
    q: "Can I rotate only specific pages?",
    a: "Yes. ToolMint lets you apply rotation to all pages or select individual pages to rotate independently.",
  },
  {
    q: "What rotation angles are supported?",
    a: "You can rotate pages 90 degrees clockwise, 90 degrees counter-clockwise, or 180 degrees.",
  },
  {
    q: "Does the rotation affect PDF quality?",
    a: "No. Rotation changes page orientation without recompressing the content, so the original quality is preserved.",
  },
  {
    q: "Is my PDF processed in the browser?",
    a: "Yes. Rotation is applied entirely in your browser, so the file is not uploaded for this task.",
  },
  {
    q: "Can I reset the rotation and start over?",
    a: "Yes. Use the reset option at any time to return all pages to their original orientation.",
  },
];

export default function RotatePdfPage() {
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
            { name: "Rotate PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Rotate PDF Pages Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Fix upside-down or sideways PDF pages with ToolMint. Rotate all pages or selected
          pages 90 degrees left, 90 degrees right, or 180 degrees. A live preview updates instantly
          so you can confirm the orientation before downloading.
        </p>

        <div className="mt-8">
          <RotatePdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Rotate a PDF Online
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

        <RelatedTools slug="rotate-pdf" />
      </main>
    </>
  );
}
