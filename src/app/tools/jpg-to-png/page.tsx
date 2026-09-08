import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import JpgToPngTool from "@/components/jpg-to-png-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Convert JPG to PNG Online – Lossless, Free, No Signup",
  description:
    "Convert JPG images to PNG format online for free. Get a lossless copy with transparency support. Browser-based — no signup, no upload to servers.",
  keywords: [
    "convert jpg to png online free",
    "jpg to png converter",
    "jpeg to png online",
    "jpg to png transparent background",
    "convert photo to png free",
  ],
  alternates: { canonical: "/tools/jpg-to-png" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Convert JPG to PNG Online – Free Lossless | ToolMint",
    description: "Convert JPG to lossless PNG with transparency support. Free, browser-based, no signup.",
    url: "/tools/jpg-to-png",
  },
  twitter: { card: "summary_large_image" },
};

const reasons = [
  { title: "Editing without quality loss", desc: "PNG is lossless. If you plan to edit and re-save an image multiple times, converting to PNG prevents the quality degradation that occurs with repeated JPG saves." },
  { title: "Transparency requirements", desc: "PNG supports transparency. Convert to PNG when you need to remove or work with transparent backgrounds in design tools." },
  { title: "Screenshots and graphics", desc: "Text and sharp-edged graphics look better as PNG. Converting a JPG diagram or screenshot to PNG preserves crispness." },
];

const faqs = [
  { q: "Does converting JPG to PNG improve image quality?", a: "No. PNG conversion saves the existing pixels without additional compression, but it cannot restore detail that was already discarded when the original JPG was saved." },
  { q: "Why is my PNG file larger than the original JPG?", a: "PNG is lossless and uncompressed compared to JPG. A larger file size is expected and indicates the format is working correctly." },
  { q: "Can I add a transparent background when converting JPG to PNG?", a: "The conversion saves the image as PNG, but removing the background requires a separate background removal step — this tool does the format conversion only." },
  { q: "When should I keep a JPG instead of converting?", a: "Keep JPG for photographs and images where you do not need to edit further. Convert to PNG when the image will go through editing, needs transparency, or requires sharp text rendering." },
];

export default function JpgToPngPage() {
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
      <WebAppSchema slug="jpg-to-png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="image-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs items={[{ name: "Home", href: "/" },{ name: "Tools", href: "/tools" },{ name: "Image Tools", href: "/tools/image-tools" },{ name: "JPG to PNG" }]} />
        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert JPG to PNG Online – Lossless, Free
        </h1>

        <ProcessingBadge slug="jpg-to-png" />
        <ToolAnalytics slug="jpg-to-png" category="image" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert JPEG images to lossless PNG format for editing, transparency support, and sharp
          graphics. Runs entirely in your browser with no file uploads.
        </p>
        <div className="mt-8"><JpgToPngTool /></div>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Why Convert JPG to PNG?</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {reasons.map((item) => (<article key={item.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><h3 className="font-semibold text-foreground">{item.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p></article>))}
          </div>
        </section>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((f, i) => (<div key={i}><dt className="font-semibold text-foreground">{f.q}</dt><dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd></div>))}
          </dl>
        </section>
        <RelatedTools slug="jpg-to-png" />
      </main>
    </>
  );
}