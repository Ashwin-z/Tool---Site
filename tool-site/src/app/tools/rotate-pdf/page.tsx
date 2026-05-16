import type { Metadata } from "next";
import RotatePdfTool from "@/components/rotate-pdf-tool";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Rotate PDF Pages Online Free â€“ Fix PDF Orientation",
  description:
    "Rotate PDF pages 90Â° or 180Â° online for free. Fix upside-down or sideways pages instantly. No signup required.",
  keywords: [
    "rotate pdf",
    "rotate pdf pages online free",
    "fix pdf orientation",
    "flip pdf pages",
    "turn pdf page",
    "pdf rotation tool",
    "rotate pdf 90 degrees",
    "free pdf rotator",
  ],
  alternates: { canonical: "/tools/rotate-pdf" },
  openGraph: {
    title: "Rotate PDF Pages Online Free â€“ Fix PDF Orientation | ToolMint",
    description:
      "Rotate PDF pages 90Â° or 180Â° online for free. Fix upside-down or sideways pages instantly. No signup required.",
    url: "/tools/rotate-pdf",
    images: [{ url: "/og/rotate-pdf.png" }],
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Fix scanned documents",
    desc: "Scanned pages often come out sideways or upside-down. Rotate individual pages or the entire PDF to the correct orientation before sharing.",
  },
  {
    title: "Correct landscape pages",
    desc: "When a single page in a multi-page PDF was scanned or saved in the wrong orientation, rotate only that page without affecting the rest.",
  },
  {
    title: "Standardize mixed documents",
    desc: "PDFs assembled from multiple sources sometimes have pages at different orientations. Rotate them all to a consistent view for printing or sharing.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Select the PDF you want to rotate from your device." },
  { title: "Select pages", desc: "Choose to rotate all pages or click individual page thumbnails." },
  { title: "Set rotation", desc: "Choose 90Â° clockwise, 90Â° counter-clockwise, or 180Â°." },
  { title: "Download", desc: "Save the correctly oriented PDF instantly." },
];

const faqs = [
  {
    q: "Can I rotate just one page in a PDF?",
    a: "Yes. After uploading, click the thumbnail of the specific page you want to rotate and apply the rotation to that page only. Other pages remain unchanged.",
  },
  {
    q: "Does rotating a PDF affect quality?",
    a: "No. Rotation is a geometric transformation applied to the PDF page content. It does not re-encode or recompress images, so there is no quality loss.",
  },
  {
    q: "How do I rotate a PDF on my iPhone?",
    a: "Open ToolMint in Safari or Chrome on your iPhone, upload the PDF, set the rotation, and download the result. No app installation is needed â€” the tool works directly in your mobile browser.",
  },
  {
    q: "Can I rotate a PDF 180 degrees?",
    a: "Yes. The 180Â° option flips the entire page upside-down, which corrects documents that were scanned or photographed in an inverted orientation.",
  },
  {
    q: "Why does my PDF look rotated when I open it?",
    a: "Some PDFs have a rotation value stored in the file metadata that is applied by the viewer on open. ToolMint's rotation tool permanently changes the page content orientation so it displays correctly in any viewer.",
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
      <WebAppSchema slug="rotate-pdf" />
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
          Fix sideways or upside-down PDF pages with ToolMint. Rotate all pages or individual pages
          in 90Â° increments and download the corrected PDF in seconds â€” no account required.
        </p>

        <div className="mt-8">
          <RotatePdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Rotate a PDF
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
            How to Rotate PDF Pages Online
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Why Are PDF Pages Rotated the Wrong Way?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Incorrect page orientation in PDFs comes from several sources. The most common is a
              scanner or phone camera that captured the physical document sideways â€” the image was
              saved at the angle it was photographed, not corrected to portrait. Software that
              exports PDFs from screen recordings or presentations sometimes defaults to landscape
              orientation. Another cause is the PDF viewer's interpretation of a rotation flag stored
              in the file metadata â€” the file itself may store pages in one orientation while the
              metadata flag tells viewers to display them rotated. ToolMint permanently corrects the
              visual orientation so the pages are right-side-up in every viewer.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How to Permanently Fix PDF Page Orientation
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Permanently fixing orientation requires applying the rotation to the page content, not
              just setting a viewer hint in the metadata. Some viewers like Adobe Reader show pages
              correctly because they respect the rotation metadata, while other viewers and printers
              ignore it and display the uncorrected orientation. ToolMint applies the rotation
              directly to the page geometry, which means the corrected orientation is baked into
              the file and displays consistently in all viewers, printers, and PDF readers â€”
              including browser-based viewers, mobile apps, and print drivers. This is the only
              reliable way to ensure a PDF looks correct on every device.
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

        <RelatedTools slug="rotate-pdf" />
      </main>
    </>
  );
}
