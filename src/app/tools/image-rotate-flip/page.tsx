import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ImageRotateFlipTool from "@/components/image-rotate-flip-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Rotate and Flip Images Online – Free, No Software Needed",
  description:
    "Rotate images 90, 180, or 270 degrees and flip horizontally or vertically online for free. Fix sideways photos and mirror images instantly. Browser-based.",
  keywords: [
    "rotate image online free",
    "flip image online",
    "rotate photo 90 degrees",
    "mirror image online",
    "rotate image without losing quality",
    "fix sideways photo online",
  ],
  alternates: { canonical: "/tools/image-rotate-flip" },
  openGraph: {
    title: "Rotate and Flip Images Online – Free | ToolMint",
    description: "Rotate 90/180/270 degrees or flip images horizontally and vertically. Free, browser-based.",
    url: "/tools/image-rotate-flip",
  },
  twitter: { card: "summary_large_image" },
};

const operations = [
  { title: "Rotate 90° clockwise", desc: "Turn a landscape image into portrait orientation, or fix a photo taken with the phone held sideways." },
  { title: "Rotate 180°", desc: "Flip a photo that is completely upside down — common with some scanner outputs and camera orientations." },
  { title: "Flip horizontal / vertical", desc: "Mirror an image for design symmetry, create a reflection effect, or correct scanned text that appears reversed." },
];

const faqs = [
  { q: "Does rotating an image reduce quality?", a: "No. Rotation is a geometric transformation. The pixel data is rearranged, not re-encoded. The image quality stays identical." },
  { q: "Why does my phone photo appear sideways when uploaded to a website?", a: "Phones store orientation data in the EXIF metadata rather than physically rotating the image. Some apps read the EXIF and display correctly; others ignore it. Rotating and saving produces a file that looks correct everywhere." },
  { q: "Can I flip an image vertically as well as horizontally?", a: "Yes. Vertical flip (top-to-bottom mirror) and horizontal flip (left-to-right mirror) are both available." },
  { q: "Can I rotate animated GIF images?", a: "Support varies by tool. For still images — JPG, PNG, WebP — rotation is fully supported." },
];

export default function ImageRotateFlipPage() {
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
      <WebAppSchema slug="image-rotate-flip" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="image-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs items={[{ name: "Home", href: "/" },{ name: "Tools", href: "/tools" },{ name: "Image Tools", href: "/tools/image-tools" },{ name: "Rotate & Flip" }]} />
        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Rotate and Flip Images Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Fix sideways photos, create mirror effects, and rotate images to any angle. Supports JPG,
          PNG, and WebP — all processing runs locally in your browser.
        </p>
        <div className="mt-8"><ImageRotateFlipTool /></div>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Rotation and Flip Operations</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {operations.map((item) => (<article key={item.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><h3 className="font-semibold text-foreground">{item.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p></article>))}
          </div>
        </section>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Why Phone Photos Appear Sideways</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Modern phones store orientation information in the image EXIF data rather than
            physically rotating the pixels. When you take a photo in landscape mode, the phone
            records the pixels in their natural sensor orientation and adds a metadata tag saying
            the photo should be displayed rotated 90 degrees. Applications that read EXIF data —
            like the Photos app on your phone — display it correctly. Applications that ignore
            EXIF — like some web browsers and upload forms — show the image sideways.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            The fix is to physically rotate the pixels and save the file. This tool does exactly
            that — it transforms the pixel data so the image opens correctly in every application,
            regardless of whether EXIF metadata is read.
          </p>
        </section>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((f, i) => (<div key={i}><dt className="font-semibold text-foreground">{f.q}</dt><dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd></div>))}
          </dl>
        </section>
        <RelatedTools slug="image-rotate-flip" />
      </main>
    </>
  );
}