import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ImageConverterTool from "@/components/image-converter-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Convert Images Between JPG, PNG, WebP & More – Free Online",
  description:
    "Convert images between JPG, PNG, WebP, GIF, BMP, and TIFF formats online for free. Batch convert multiple files at once. Browser-based, no signup.",
  keywords: [
    "image format converter online",
    "convert image format free",
    "jpg to webp converter",
    "png to webp online",
    "convert image to jpg",
    "image converter free",
    "batch image converter",
  ],
  alternates: { canonical: "/tools/image-converter" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Image Format Converter – JPG, PNG, WebP, GIF Free | ToolMint",
    description: "Convert between JPG, PNG, WebP, GIF, BMP, and TIFF online free. Batch support, no signup.",
    url: "/tools/image-converter",
  },
  twitter: { card: "summary_large_image" },
};

const formats = [
  { title: "JPG / JPEG", desc: "Best for photographs and complex images. Lossy compression produces small files. No transparency support." },
  { title: "PNG", desc: "Lossless format supporting transparency. Best for logos, screenshots, and graphics with sharp edges or text." },
  { title: "WebP", desc: "Modern format developed by Google. Produces files 25-35% smaller than JPG at equal quality. Supported by all major browsers." },
];

const faqs = [
  { q: "Which image format is best for websites?", a: "WebP is the best choice for modern websites — it is smaller than JPG and PNG at similar quality. For maximum compatibility, JPG works for photos and PNG for graphics with transparency." },
  { q: "Can I convert multiple images at once?", a: "Yes. Upload a batch of images and convert all of them to the same output format in one operation." },
  { q: "Will converting between formats change the image dimensions?", a: "No. Format conversion changes how the image data is encoded, not the pixel dimensions. The width and height stay the same." },
  { q: "Is converting from JPG to PNG lossless?", a: "The PNG output is lossless, but converting from JPG does not restore quality lost in the original JPG compression. Start with the highest-quality source available." },
];

export default function ImageConverterPage() {
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
      <WebAppSchema slug="image-converter" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="image-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs items={[{ name: "Home", href: "/" },{ name: "Tools", href: "/tools" },{ name: "Image Tools", href: "/tools/image-tools" },{ name: "Image Converter" }]} />
        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert Images Between JPG, PNG, WebP and More
        </h1>

        <ProcessingBadge slug="image-converter" />
        <ToolAnalytics slug="image-converter" category="image" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert images between all major formats — JPG, PNG, WebP, GIF, BMP, and TIFF. Batch
          convert multiple files at once. All processing runs in your browser.
        </p>
        <div className="mt-8"><ImageConverterTool /></div>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Image Format Guide
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {formats.map((item) => (<article key={item.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><h3 className="font-semibold text-foreground">{item.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p></article>))}
          </div>
        </section>
        <section className="mt-16 space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Why Convert to WebP for Web Use?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              WebP was designed specifically for web delivery. At the same visual quality,
              WebP files are typically 25-35% smaller than JPG and 50-60% smaller than PNG.
              All modern browsers — Chrome, Firefox, Safari 14+, and Edge — support WebP natively.
              Converting your site images to WebP is one of the most effective single steps for
              improving page load speed and passing Core Web Vitals audits.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Choosing the Right Output Format
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Use JPG for photographs where file size matters and transparency is not needed. Use
              PNG for logos, icons, screenshots, and images with transparent backgrounds. Use WebP
              when building or updating a website and browser compatibility with modern browsers is
              all you need. Use GIF only for animated images — for static graphics, PNG or WebP
              is always better. BMP and TIFF are primarily used for archiving or printing workflows
              where lossless, uncompressed quality is required.
            </p>
          </div>
        </section>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((f, i) => (<div key={i}><dt className="font-semibold text-foreground">{f.q}</dt><dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd></div>))}
          </dl>
        </section>
        <RelatedTools slug="image-converter" />
      </main>
    </>
  );
}