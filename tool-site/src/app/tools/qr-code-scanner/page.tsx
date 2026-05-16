import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import QrCodeScannerTool from "@/components/qr-code-scanner-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "QR Code Scanner – Scan QR Code Online Free with Camera or Image",
  description:
    "Scan QR codes instantly online using your camera or by uploading an image. Free, private, browser-based QR scanner — no app install, no signup needed.",
  keywords: [
    "qr code scanner online free",
    "scan qr code with camera online",
    "scan qr code from image online",
    "qr code reader online free",
    "online qr scanner no install",
    "read qr code from image free",
    "qr code decoder online",
    "browser qr code scanner free",
  ],
  alternates: { canonical: "/tools/qr-code-scanner" },
  openGraph: {
    title: "QR Code Scanner – Scan QR Code Online Free with Camera or Image | ToolMint",
    description:
      "Use your camera for live QR scanning or upload an image file. Runs locally in your browser with copy and link detection features.",
    url: "/tools/qr-code-scanner",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Live Camera Scanner", desc: "Use your device camera for real-time QR scanning with an animated overlay and environment-camera preference on supported devices." },
  { title: "Upload Image Scanner", desc: "Upload PNG, JPG, or WEBP files and let the tool attempt multiple detection passes for reliable QR extraction from images." },
  { title: "Copy & Link Detection", desc: "Copy scanned content to the clipboard instantly and detect when the result is a URL so it can be opened more easily." },
  { title: "Private In-Browser Processing", desc: "All scanning happens locally in the browser using BarcodeDetector and web APIs, with no file upload to a server." },
];

const useCases = [
  { title: "Desktop QR Scanning", desc: "Can't scan from your phone? Upload a screenshot, photo, or saved QR code image to decode it on your computer without an app." },
  { title: "Testing & Development", desc: "Verify that QR codes you generated link to the correct URL before distributing them in print materials or campaigns." },
  { title: "Quick Link Access", desc: "Scan a QR code from a physical document, event badge, or product label and copy the URL to use on your computer." },
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
      <WebAppSchema slug="qr-code-scanner" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "QR Code Scanner" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          QR Code Scanner – Camera Scan or Image Upload, Free & Private
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Scan any QR code instantly using your camera or by uploading an image. Processes the
          scan locally in your browser with BarcodeDetector support, then lets you copy the result or open
          detected links — without installing a separate app or uploading anything to a server.
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
            Who Uses a Browser QR Scanner
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How the Browser BarcodeDetector API Works
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The Web BarcodeDetector API is a browser-native interface that lets web pages decode barcodes
              and QR codes from image sources without any JavaScript library. It was proposed as part of the
              Shape Detection API and is currently well-supported in Chromium-based browsers (Chrome, Edge,
              Opera) on all platforms. Safari and Firefox do not yet support it natively, which means this
              scanner&apos;s camera mode requires a Chromium-based browser for live scanning. The API accepts an
              HTMLImageElement, HTMLVideoElement, ImageBitmap, or canvas as input — making it suitable for
              both uploaded images and live video frames. It is hardware-accelerated in supported browsers,
              which means detection is fast even on mobile devices. The tool attempts detection on the raw
              image first, then falls back to canvas-rendered copies at the original size and a scaled version
              to handle cases where the image resolution causes the detector to miss the code. This
              multi-pass approach significantly improves success rates for screenshots, photos taken at
              unusual angles, and images with poor contrast.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Privacy – Why Browser-Based Scanning Is Better Than App Scanning
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Most QR scanner apps on mobile phones request camera permissions that grant access to
              the camera at any time the app is open — and many send scanned URLs back to a server for
              analytics, link preview generation, or advertising purposes. A browser-based scanner has a
              fundamentally different permission model. Camera access is granted only for the current page
              load, only while the page is active in the foreground, and only for the duration the user
              has the scanner open. The browser will never grant camera access without an explicit user
              prompt per session. For uploaded images, the file is read directly into memory by the browser&apos;s
              File API and processed locally — no upload, no server. The decoded content is displayed only
              in your browser and never transmitted anywhere. For users who regularly scan QR codes that
              might contain sensitive information — internal business URLs, authentication tokens, event
              check-in links — a browser-based scanner with no server component is significantly more private
              than a dedicated app with an unclear data retention policy.
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

        <RelatedTools slug="qr-code-scanner" />
      </main>
    </>
  );
}
