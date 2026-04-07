import type { Metadata } from "next";
import Link from "next/link";
import QrCodeGeneratorTool from "@/components/qr-code-generator-tool";

export const metadata: Metadata = {
  title: "QR Code Generator — PNG, SVG, Custom Colors & Copy Image | ToolMint",
  description:
    "Generate QR codes from text, URLs, and other content with custom foreground and background colors. ToolMint's QR Code Generator exports PNG, SVG, and supports copy image to clipboard.",
  keywords: [
    "qr code generator",
    "create qr code online",
    "png qr code generator",
    "svg qr code generator",
    "custom color qr code",
    "text to qr code",
    "url qr code generator",
    "copy qr code image",
    "qr code maker online",
    "qr generator with colors",
    "toolmint qr code generator",
    "browser qr code creator",
  ],
  alternates: { canonical: "/tools/qr-code-generator" },
  openGraph: {
    title: "QR Code Generator — PNG, SVG, Custom Colors & Copy Image | ToolMint",
    description:
      "Create QR codes from text or URLs, customize colors, preview instantly, and export as PNG or SVG or copy the image to clipboard.",
    url: "/tools/qr-code-generator",
  },
};

const includedTools = [
  {
    title: "Text & URL QR Generator",
    desc: "Generate QR codes from plain text, URLs, or any other byte-based content with a live preview that updates as you type.",
  },
  {
    title: "Foreground & Background Colors",
    desc: "Customize both the QR foreground and background colors with hex inputs and visual color pickers.",
  },
  {
    title: "PNG & SVG Export",
    desc: "Download the generated QR code as a high-resolution PNG or a scalable SVG vector file for print and web use.",
  },
  {
    title: "Copy Image & Capacity Meter",
    desc: "Copy the QR image directly to the clipboard and monitor byte usage against the generator's supported QR capacity.",
  },
];

const steps = [
  { title: "Enter your content", desc: "Type or paste the text, URL, or other data you want to encode in the QR code." },
  { title: "Customize colors", desc: "Set the foreground and background colors using the hex inputs or color pickers until the preview looks right." },
  { title: "Check the preview", desc: "Review the live QR code preview and the byte usage display to ensure your content fits within the supported range." },
  { title: "Download or copy", desc: "Export the final QR code as PNG or SVG, or copy the QR image directly to your clipboard." },
];

const faqs = [
  {
    q: "What can I put into this QR code generator?",
    a: "ToolMint's QR Code Generator accepts plain text, URLs, and other general byte-based content. As long as the content fits within the supported QR capacity, the tool can encode it into a scannable QR code.",
  },
  {
    q: "Can I customize the QR code colors?",
    a: "Yes. You can set both the foreground and background colors using hex color inputs and visual pickers. The preview updates immediately so you can fine-tune the design before exporting.",
  },
  {
    q: "What file formats can I download?",
    a: "The generator supports PNG and SVG downloads. PNG is useful for quick sharing and raster graphics, while SVG is ideal for scalable print or design workflows.",
  },
  {
    q: "Can I copy the QR code image without downloading it?",
    a: "Yes. The tool includes a copy-image feature that sends the generated QR code to the clipboard as a PNG image when your browser supports the Clipboard API.",
  },
  {
    q: "How much content can the QR code hold?",
    a: "This generator supports QR versions 1 through 10 in byte mode with Level-L error correction, which is enough for roughly up to 271 bytes in the highest supported version. The byte counter helps you stay within the supported range.",
  },
];

export default function QrCodeGeneratorPage() {
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
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          QR Code Generator — Custom Colors, PNG, SVG &amp; Copy Image
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Generate QR codes from text, URLs, and other content with live preview and custom foreground
          and background colors. ToolMint exports high-resolution PNG, scalable SVG, and can copy the QR
          image directly to your clipboard for quick reuse.
        </p>

        <div className="mt-8">
          <QrCodeGeneratorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included QR Generator Tools
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {includedTools.map((tool) => (
              <div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{tool.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Generate a QR Code
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{index + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <dt className="font-semibold text-foreground">{faq.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}
