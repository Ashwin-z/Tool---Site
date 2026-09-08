import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ImageCropperTool from "@/components/image-cropper-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Crop Images Online to Exact Dimensions – Free Browser Tool",
  description:
    "Crop JPG, PNG, and WebP images online for free. Select any area, crop to a fixed aspect ratio, or set exact pixel dimensions. No signup, no software.",
  keywords: [
    "crop image online free",
    "image cropper",
    "crop photo to exact size",
    "crop image to aspect ratio",
    "free online image crop",
    "crop jpg online",
    "crop png online",
  ],
  alternates: { canonical: "/tools/image-cropper" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Crop Images to Exact Dimensions – Free Online | ToolMint",
    description: "Crop any image to a precise area, aspect ratio, or pixel size. Browser-based, no signup.",
    url: "/tools/image-cropper",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  { title: "Profile photos", desc: "Crop a portrait or headshot to a centered square for LinkedIn, Twitter, or any platform that displays circular profile images." },
  { title: "Remove unwanted edges", desc: "Clean up screenshots with toolbars, watermarks, or empty space around the main subject by cropping to the content area." },
  { title: "Fixed-ratio thumbnails", desc: "Crop blog post or product images to a consistent 16:9, 4:3, or 1:1 ratio so all cards and thumbnails display uniformly." },
];

const steps = [
  { title: "Upload image", desc: "Select or drag a JPG, PNG, or WebP image into the tool." },
  { title: "Select crop area", desc: "Drag handles to define the region you want to keep." },
  { title: "Set ratio or size", desc: "Lock to a preset aspect ratio or enter exact pixel dimensions." },
  { title: "Download", desc: "Save the cropped image in your preferred format." },
];

const faqs = [
  { q: "Can I crop an image to a specific pixel size?", a: "Yes. Enter exact pixel values for width and height, or use the freehand drag to select the area and then fine-tune the crop box." },
  { q: "Does cropping reduce image quality?", a: "No. Cropping only removes the edges outside the selected area. The kept portion is saved at original quality unless you separately apply compression." },
  { q: "Can I crop to a 1:1 square ratio?", a: "Yes. Select the 1:1 ratio lock in the tool. The crop box will constrain to a perfect square." },
  { q: "What happens to the removed parts of the image?", a: "They are discarded. Only the area inside the crop boundary is included in the downloaded file." },
];

export default function ImageCropperPage() {
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
      <WebAppSchema slug="image-cropper" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="image-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Image Tools", href: "/tools/image-tools" },
            { name: "Image Cropper" },
          ]}
        />
        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Crop Images Online to Exact Dimensions
        </h1>

        <ProcessingBadge slug="image-cropper" />
        <ToolAnalytics slug="image-cropper" category="image" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Remove unwanted edges, crop to a fixed aspect ratio, or cut to a precise pixel area. Works
          with JPG, PNG, and WebP — fully browser-based with no signup required.
        </p>
        <div className="mt-8"><ImageCropperTool /></div>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">When to Crop an Image</h2>
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
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">How to Crop an Image Online</h2>
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
              Cropping vs. Resizing: When to Use Each
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Cropping removes portions of the image from any edge, reducing the total canvas area.
              The part of the image you keep stays at its original pixel density — nothing is
              scaled. Resizing changes the entire image to new dimensions, scaling all pixels up
              or down. Use cropping when you want to change what is shown. Use resizing when you
              want to change how large the image is. For most social media and web use cases, the
              best workflow is to crop first to the right composition, then resize to the target
              display dimensions, then compress for the web.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Common Aspect Ratios Explained
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              1:1 (square) is used for profile photos and Instagram posts. 16:9 (widescreen) is used
              for YouTube thumbnails, blog headers, and presentation slides. 4:3 is traditional for
              photos and older screen formats. 3:2 matches the natural aspect ratio of most DSLR
              cameras. 2:1 is common for Twitter post images and website banners. Choosing the right
              ratio before cropping ensures the platform does not add unexpected padding or cut into
              your subject when it displays the image.
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
        <RelatedTools slug="image-cropper" />
      </main>
    </>
  );
}