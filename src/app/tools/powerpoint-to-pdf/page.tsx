import type { Metadata } from "next";
import PowerPointToPdfTool from "@/components/powerpoint-to-pdf-tool";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolStatusNotice from "@/components/tool-status-notice";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "PowerPoint to PDF – Convert PPTX to PDF Free",
  description:
    "Convert PowerPoint presentations to PDF online free. Upload .pptx and download a high-quality PDF instantly. No signup.",
  keywords: [
    "powerpoint to pdf",
    "pptx to pdf",
    "convert powerpoint to pdf online free",
    "presentation to pdf",
    "slides to pdf",
    "microsoft powerpoint to pdf",
    "free pptx converter",
    "export pptx as pdf",
  ],
  alternates: { canonical: "/tools/powerpoint-to-pdf" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "PowerPoint to PDF – Convert PPTX to PDF Free | ToolMint",
    description:
      "Convert PowerPoint presentations to PDF online free. Upload .pptx and download a high-quality PDF instantly. No signup.",
    url: "/tools/powerpoint-to-pdf",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Sharing slide decks",
    desc: "Share presentations as PDFs so recipients can read them on any device without needing PowerPoint installed.",
  },
  {
    title: "Handouts and printouts",
    desc: "Convert slides to PDF before printing handouts for a meeting, class, or conference so the layout prints consistently.",
  },
  {
    title: "Archiving presentations",
    desc: "Save final presentation versions as PDF for long-term storage where the visual layout must be preserved exactly.",
  },
];

const steps = [
  { title: "Upload your PPTX", desc: "Select a .pptx file from your device." },
  { title: "Convert", desc: "ToolMint converts each slide to a PDF page." },
  { title: "Download", desc: "Save the PDF to your device instantly." },
];

const faqs = [
  {
    q: "Does converting PowerPoint to PDF keep slide notes?",
    a: "No. The standard PDF output includes only the slide content. Speaker notes are not included in the converted PDF. If you need notes included, use PowerPoint's built-in export which has a 'Notes Pages' layout option.",
  },
  {
    q: "Will animations be preserved in the PDF?",
    a: "No. PDF is a static format and cannot represent slide transitions or element animations. Each slide is converted as a single static frame at its final state.",
  },
  {
    q: "How do I convert a large PPTX to PDF quickly?",
    a: "Upload your file and click Convert — there are no extra steps. Very large files with many high-resolution images may take a bit longer to process, but there is no size limit for typical presentation files.",
  },
  {
    q: "Can I convert Google Slides to PDF?",
    a: "Google Slides can be downloaded as a .pptx file first (File → Download → Microsoft PowerPoint), then uploaded here for conversion to PDF.",
  },
  {
    q: "Why is my PowerPoint PDF blurry?",
    a: "Blurry output usually comes from low-resolution images in the original slides. If the presentation was built with compressed or small images, the PDF reflects that. Use high-resolution images in your slides to get a crisp PDF output.",
  },
];

export default function PowerPointToPdfPage() {
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
      <WebAppSchema slug="powerpoint-to-pdf" />
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
            { name: "PowerPoint to PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert PowerPoint to PDF Online for Free
        </h1>

        <ToolStatusNotice slug="powerpoint-to-pdf" />
        <ProcessingBadge slug="powerpoint-to-pdf" />
        <ToolAnalytics slug="powerpoint-to-pdf" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Turn .pptx slide decks into PDF documents with ToolMint. Upload your presentation and get
          a clean PDF where each slide becomes a page — no account, no software, instant download.
        </p>

        <div className="mt-8">
          <PowerPointToPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Convert PowerPoint to PDF
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <article key={item.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Convert PowerPoint to PDF Online
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{i + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Why Convert PowerPoint to PDF for Sharing?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              PowerPoint files look different depending on the software version the recipient uses.
              Fonts, transitions, and layout elements can shift significantly between PowerPoint
              versions and completely break in applications like Google Slides or LibreOffice Impress.
              PDF eliminates this problem by locking the visual layout at the time of conversion.
              Recipients can open the file in any PDF viewer, on any operating system, and see the
              slides exactly as intended. For external sharing, client presentations, and archiving,
              PDF is the more reliable format. Portals that accept presentation uploads also commonly
              require PDF rather than .pptx files.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Does PDF Preserve Slide Animations?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              No. PDF is a static document format — it captures a single visual state per page and
              cannot play animations, transitions, or embedded video. When converting a presentation
              with animated elements, each slide is rendered at its final animation state, which
              means build-in animations are shown in their completed form. If your presentation
              relies heavily on step-by-step animations to guide a live audience, the PDF will not
              replicate that experience. For a static handout, conference paper, or archive copy,
              however, this is not a limitation — the PDF captures the content and layout of every
              slide clearly.
            </p>
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

        <RelatedTools slug="powerpoint-to-pdf" />
      </main>
    </>
  );
}
