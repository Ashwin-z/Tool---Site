import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import PngToJpgTool from "@/components/png-to-jpg-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Convert PNG to JPG Online – Free, Instant, No Signup",
  description:
    "Convert PNG images to JPG format online for free. Reduce file size, remove transparency, and get email-compatible images instantly. Browser-based, no signup.",
  keywords: [
    "convert png to jpg online free",
    "png to jpg converter",
    "png to jpeg online",
    "change png to jpg",
    "png to jpg no background",
    "free png to jpg",
  ],
  alternates: { canonical: "/tools/png-to-jpg" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Convert PNG to JPG Free Online – Instant | ToolMint",
    description: "Convert PNG to JPG instantly. Reduce file size and remove transparency. Free, browser-based.",
    url: "/tools/png-to-jpg",
  },
  twitter: { card: "summary_large_image" },
};

const reasons = [
  { title: "Smaller file size", desc: "JPG uses lossy compression. A PNG converted to JPG at 80% quality is typically 60–80% smaller, making it much faster for web and email." },
  { title: "Email compatibility", desc: "Some email clients do not handle PNG well. JPG is universally supported for photo sharing and attachment use." },
  { title: "Platform requirements", desc: "Some upload forms and CMSs specify JPG format. Converting before upload avoids rejection." },
];

const faqs = [
  { q: "Will converting PNG to JPG reduce quality?", a: "JPG is a lossy format, so some minor detail is discarded during compression. At quality settings of 80% or above, the difference is invisible for most photos." },
  { q: "What happens to the transparent background in a PNG?", a: "JPG does not support transparency. The transparent areas are filled with a solid background color — usually white by default." },
  { q: "Should I always convert PNG to JPG for web use?", a: "For photographs and complex images, yes — JPG is smaller and faster to load. For logos, icons, and images requiring a transparent background, keep the PNG format." },
  { q: "Can I convert multiple PNG files to JPG at once?", a: "Yes. Upload multiple PNG files together and download the converted JPGs individually or as a ZIP." },
];

export default function PngToJpgPage() {
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
      <WebAppSchema slug="png-to-jpg" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="image-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Image Tools", href: "/tools/image-tools" },
            { name: "PNG to JPG" },
          ]}
        />
        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert PNG to JPG Online – Free, Instant
        </h1>

        <ProcessingBadge slug="png-to-jpg" />
        <ToolAnalytics slug="png-to-jpg" category="image" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert PNG images to JPG format to reduce file size and remove transparency. Fully
          browser-based — your images are never uploaded to a server.
        </p>
        <div className="mt-8"><PngToJpgTool /></div>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Why Convert PNG to JPG?</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {reasons.map((item) => (
              <article key={item.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              PNG vs. JPG: When to Use Each Format
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              PNG is the right format when you need a lossless image — one that preserves every
              pixel exactly. It is ideal for logos, icons, screenshots, and graphics with text or
              sharp edges. PNG also supports transparency, which makes it the only option when
              you need a see-through background.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              JPG is better for photographs, product images, and any complex image where a small
              amount of compression is acceptable. It produces much smaller files at comparable
              visual quality, which directly improves web performance and reduces storage costs.
              If the image will be displayed as a photo and does not need transparency, JPG is
              almost always the better choice.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              What Happens to Transparency When Converting to JPG?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              JPG does not support an alpha (transparency) channel. When you convert a PNG with a
              transparent background to JPG, the transparent area is filled with a solid color.
              By default this is white, which works well for images on white backgrounds. If your
              image will appear on a dark or colored background, consider whether transparency is
              necessary — if it is, keep the PNG format. If it is not, converting to JPG and
              accepting a white fill produces a smaller file.
            </p>
          </div>
        </section>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((f, i) => (
              <div key={i}>
                <dt className="font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
        <RelatedTools slug="png-to-jpg" />
      </main>
    </>
  );
}