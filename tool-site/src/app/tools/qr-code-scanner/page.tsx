import type { Metadata } from "next";
import Link from "next/link";
import QrCodeScannerTool from "@/components/qr-code-scanner-tool";

export const metadata: Metadata = {
  title: "QR Code Scanner — Scan with Camera or Upload Image | ToolMint",
  description:
    "Scan QR codes instantly with your camera or by uploading an image. ToolMint's free QR Code Scanner runs entirely in your browser with BarcodeDetector, copy-to-clipboard, and automatic link detection.",
  keywords: [
    "qr code scanner",
    "scan qr code online",
    "camera qr scanner",
    "upload qr code image",
    "barcode detector qr scanner",
    "scan qr from image",
    "qr scanner browser",
    "qr code reader online",
    "toolmint qr scanner",
    "scan qr from photo",
    "private qr scanner",
    "in browser qr code scanner",
  ],
  alternates: { canonical: "/tools/qr-code-scanner" },
  openGraph: {
    title: "QR Code Scanner — Scan with Camera or Upload Image | ToolMint",
    description:
      "Use your camera for live QR scanning or upload an image file for detection. Runs locally in your browser with copy and link detection features.",
    url: "/tools/qr-code-scanner",
  },
};

const includedTools = [
  {
    title: "Live Camera Scanner",
    desc: "Use your device camera for real-time QR scanning with an animated overlay and environment-camera preference on supported devices.",
  },
  {
    title: "Upload Image Scanner",
    desc: "Upload PNG, JPG, or WEBP files and let the tool attempt multiple detection passes for reliable QR extraction from images.",
  },
  {
    title: "Copy & Link Detection",
    desc: "Copy scanned content to the clipboard instantly and detect when the result is a URL so it can be opened more easily.",
  },
  {
    title: "Private In-Browser Processing",
    desc: "All scanning happens locally in the browser using BarcodeDetector and web APIs, with no file upload to a server.",
  },
];

const steps = [
  { title: "Choose camera or upload", desc: "Pick live camera scanning if your device supports it, or upload an image containing a QR code." },
  { title: "Scan the code", desc: "Point the camera at the QR code or let the tool process the uploaded image through its detection pipeline." },
  { title: "Read the result", desc: "The decoded text or URL appears instantly once the QR code is detected successfully." },
  { title: "Copy or open", desc: "Copy the content to your clipboard or follow the link if the scanner recognizes the result as a URL." },
];

const faqs = [
  {
    q: "Can I scan a QR code with my camera in the browser?",
    a: "Yes. ToolMint's QR Code Scanner supports live camera scanning on compatible browsers using getUserMedia and BarcodeDetector. It prefers the environment-facing camera when available.",
  },
  {
    q: "Can I upload an image instead of using the camera?",
    a: "Yes. You can upload PNG, JPG, or WEBP files. The tool then tries multiple detection methods, including direct image, canvas, and scaled canvas processing, to improve success rates.",
  },
  {
    q: "Does the scanner upload my image or camera feed to a server?",
    a: "No. The scanner processes QR codes locally in your browser. It uses built-in web APIs and does not need to upload the image or video feed to a server to decode results.",
  },
  {
    q: "What happens if the scanned QR code contains a link?",
    a: "The tool detects URL-like results automatically so you can identify links easily after scanning. You can also copy the result directly to the clipboard with one click.",
  },
  {
    q: "Why might scanning fail on some browsers?",
    a: "The scanner relies on BarcodeDetector support, which is strongest in Chromium-based browsers such as Chrome and Edge. Older or unsupported browsers may not expose the necessary APIs for camera or QR decoding.",
  },
];

export default function QrCodeScannerPage() {
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
          QR Code Scanner — Camera Scan or Image Upload
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Scan any QR code instantly using your camera or by uploading an image. ToolMint processes the
          scan locally in your browser with BarcodeDetector support, then lets you copy the result or open
          detected links without installing a separate app.
        </p>

        <div className="mt-8">
          <QrCodeScannerTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included QR Scanner Tools
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
            How to Scan a QR Code Online
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
