import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import QrCodeGeneratorTool from "@/components/qr-code-generator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "QR Code Generator – Create QR Code Free Online, PNG & SVG",
  description:
    "Generate QR codes from any URL or text for free. Custom colors, PNG & SVG download, copy to clipboard. No signup, no watermark, instant results.",
  keywords: [
    "qr code generator online free",
    "create qr code for url free",
    "qr code generator no signup",
    "free qr code maker online",
    "qr code generator png download",
    "custom color qr code generator",
    "qr code generator svg free",
    "text to qr code generator online",
  ],
  alternates: { canonical: "/tools/qr-code-generator" },
  openGraph: {
    title: "QR Code Generator – Create QR Code Free Online, PNG & SVG | ToolMint",
    description:
      "Create QR codes from text or URLs, customize colors, preview instantly, and export as PNG or SVG.",
    url: "/tools/qr-code-generator",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Text & URL QR Generator", desc: "Generate QR codes from plain text, URLs, or any other byte-based content with a live preview that updates as you type." },
  { title: "Foreground & Background Colors", desc: "Customize both the QR foreground and background colors with hex inputs and visual color pickers." },
  { title: "PNG & SVG Export", desc: "Download the generated QR code as a high-resolution PNG or a scalable SVG vector file for print and web use." },
  { title: "Copy Image & Capacity Meter", desc: "Copy the QR image directly to the clipboard and monitor byte usage against the generator's supported QR capacity." },
];

const useCases = [
  { title: "Business & Marketing", desc: "Link product packaging, flyers, or business cards to a URL. Customize colors to match your brand before downloading as PNG or SVG." },
  { title: "Events & Presentations", desc: "Generate QR codes that link to slides, registration forms, or contact pages so attendees can scan rather than type a URL." },
  { title: "Personal & Education", desc: "Share your portfolio, resume, or class notes via QR code. Teachers can generate codes that link to learning resources." },
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
      <WebAppSchema slug="qr-code-generator" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "QR Code Generator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          QR Code Generator – Custom Colors, PNG &amp; SVG Download Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Generate QR codes from text, URLs, and other content with live preview and custom foreground
          and background colors. Exports high-resolution PNG, scalable SVG, and can copy the QR
          image directly to your clipboard. No signup, no watermark.
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
            Who Uses a QR Code Generator
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {useCases.map((u) => (
              <div key={u.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{u.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{u.desc}</p>
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How QR Codes Work – Error Correction, Versions, and Capacity
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              A QR code (Quick Response code) is a two-dimensional matrix barcode that encodes data as a
              pattern of black and white modules. It was invented by Denso Wave in 1994 and became an open
              standard. The code contains several functional regions: finder patterns (the three large corner
              squares that tell the scanner where the code starts), timing patterns (the alternating rows that
              establish the module grid), and the data region (the remaining modules that encode your content).
              QR codes support four error correction levels — L (7%), M (15%), Q (25%), and H (30%) — where
              the percentage indicates how much of the code can be damaged or obscured and still be read
              correctly. Higher error correction makes the code more reliable but larger. Capacity varies by
              version (size) and error correction level: Version 1 (21×21 modules) holds up to 41 alphanumeric
              characters at Level L. Version 10 (57×57 modules) holds up to 652 alphanumeric characters.
              URLs for common websites typically need Version 3–5. This generator works in byte mode, which
              encodes any UTF-8 byte sequence and is more universal than the specialized numeric or
              alphanumeric modes.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              PNG vs SVG – Which QR Code Format to Download
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The choice between PNG and SVG depends on how you plan to use the QR code. PNG is a raster
              format — it saves the code as a fixed grid of pixels. For digital use (websites, social media,
              email, WhatsApp, presentations), a high-resolution PNG is the right choice because every
              platform supports it natively. The downside is that PNG looks blurry if scaled up beyond its
              original resolution. SVG (Scalable Vector Graphics) stores the QR code as mathematical shapes
              that can be rendered at any size without loss of quality. For print use — business cards,
              posters, product packaging, signage — SVG is strongly preferred because it will look crisp at
              any print resolution from 72 DPI (screen) to 600+ DPI (commercial print). Most professional
              design tools (Illustrator, Figma, Inkscape) accept SVG natively. If you are unsure, download
              both: use SVG for print and PNG for digital. The generated SVG from this tool is clean and
              well-structured, making it easy to import into any vector editor for further styling.
            </p>
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

        <RelatedTools slug="qr-code-generator" />
      </main>
    </>
  );
}
