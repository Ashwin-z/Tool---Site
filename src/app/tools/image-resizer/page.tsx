import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ImageResizerTool from "@/components/image-resizer-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Resize Images Online to Any Dimension – Free, No Signup",
  description:
    "Resize JPG, PNG, and WebP images to exact pixel dimensions or a percentage online for free. No distortion, no signup — browser-based image resizer.",
  keywords: [
    "resize image online free",
    "image resizer",
    "resize photo to exact pixels",
    "resize image without stretching",
    "resize jpg online",
    "resize png online",
    "change image dimensions online",
    "bulk image resizer",
  ],
  alternates: { canonical: "/tools/image-resizer" },
  openGraph: {
    title: "Resize Images to Any Dimension – Free Online | ToolMint",
    description: "Resize JPG, PNG, and WebP images to exact pixel dimensions or percentage. Browser-based, no signup.",
    url: "/tools/image-resizer",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Social media thumbnails",
    desc: "Each platform has specific image dimensions. Resize photos to the exact pixel size required for Twitter, LinkedIn, Instagram, or Facebook cover images.",
  },
  {
    title: "Product listing photos",
    desc: "E-commerce platforms often require images at a specific resolution. Resize product photos to match platform requirements before uploading.",
  },
  {
    title: "Email and web images",
    desc: "Large images slow down emails and web pages. Resize to a display-appropriate size first, then compress for the best balance of quality and speed.",
  },
];

const steps = [
  { title: "Upload image", desc: "Drag or click to upload a JPG, PNG, or WebP file." },
  { title: "Set dimensions", desc: "Enter the target width and height in pixels or a percentage." },
  { title: "Maintain aspect ratio", desc: "Lock the ratio to prevent distortion when resizing." },
  { title: "Download", desc: "Download the resized image in your chosen format." },
];

const faqs = [
  {
    q: "How do I resize an image without stretching or distorting it?",
    a: "Enable the 'maintain aspect ratio' option. Enter either the target width or height — the other dimension is calculated automatically to keep the original proportions.",
  },
  {
    q: "Can I resize an image to a specific file size, not just pixel dimensions?",
    a: "Pixel dimensions and file size are related but not the same. After resizing to your target dimensions, use the Image Compressor to reduce the file size further.",
  },
  {
    q: "What is the difference between resizing and cropping?",
    a: "Resizing changes the entire image to new dimensions. Cropping cuts away the edges to show only a selected portion of the image.",
  },
  {
    q: "Can I resize multiple images at once?",
    a: "Yes. Upload several images together and apply the same dimensions to all files in one batch.",
  },
];

export default function ImageResizerPage() {
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
      <WebAppSchema slug="image-resizer" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="image-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Image Tools", href: "/tools/image-tools" },
            { name: "Image Resizer" },
          ]}
        />
        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Resize Images Online to Any Dimension
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Change image dimensions to exact pixels or a percentage of the original. Supports JPG,
          PNG, and WebP with aspect ratio lock to prevent distortion. Runs entirely in your browser.
        </p>
        <div className="mt-8"><ImageResizerTool /></div>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">When to Resize an Image</h2>
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
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">How to Resize an Image Online</h2>
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
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Common Image Dimensions by Platform</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Different platforms require specific image sizes. Profile photos are typically square
              (400x400 or 800x800 pixels). Blog post featured images are usually 1200x630 pixels
              for sharing previews. Twitter post images work best at 1200x675 pixels. Instagram
              square posts are 1080x1080 pixels. E-commerce product images vary but 800x800 or
              1000x1000 pixels is a common starting point. Resizing to the correct dimensions
              before uploading prevents platforms from cropping or compressing your images in
              unexpected ways.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Resize vs. Compress: What Is the Difference?</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Resizing changes the number of pixels in the image. A 4000x3000 pixel photo resized
              to 800x600 pixels contains less data, which automatically reduces file size as a
              side effect. Compression reduces file size by encoding the existing pixel data more
              efficiently, without changing the dimensions. For the best results, resize first to
              your target display dimensions, then apply compression to further reduce the file
              size without sacrificing sharpness.
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
        <RelatedTools slug="image-resizer" />
      </main>
    </>
  );
}