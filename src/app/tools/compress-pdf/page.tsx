import type { Metadata } from "next";
import Link from "next/link";
import RelatedTools from "@/components/related-tools";
import PdfCompressorTool from "@/components/pdf-compressor-tool";
import ProcessingBadge from "@/components/processing-badge";
import ToolStatusNotice from "@/components/tool-status-notice";
import ToolAnalytics from "@/components/tool-analytics";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Compress PDF in Your Browser – No Upload",
  description:
    "Compress a PDF without uploading it. The file is processed on your device and never sent to a server. Free, no signup, no watermark.",
  keywords: [
    "compress pdf",
    "reduce pdf size",
    "compress pdf without uploading",
    "offline pdf compressor",
    "shrink pdf",
    "make pdf smaller",
    "private pdf compressor",
    "free pdf compressor",
  ],
  alternates: { canonical: "/tools/compress-pdf" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Compress PDF in Your Browser – No Upload | ToolMint",
    description:
      "Compress a PDF without uploading it. Processed on your device, never sent to a server. Free, no signup, no watermark.",
    url: "/tools/compress-pdf",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Email attachments",
    desc: "Get a PDF under a mailbox limit before attaching it to Gmail, Outlook, or a support ticket.",
  },
  {
    title: "Portal uploads",
    desc: "Job applications, visa forms, school submissions and government portals often cap uploads at 2–5MB.",
  },
  {
    title: "Confidential documents",
    desc: "Contracts, medical records and HR files you are not allowed to upload to a third-party server.",
  },
];

const steps = [
  { title: "Choose your PDF", desc: "Drag it in or browse. The file is read by the page, not sent anywhere." },
  { title: "Pick a level", desc: "Recommended, Strong or Maximum, depending on how small you need it." },
  { title: "Compress", desc: "Your browser re-encodes the images inside the document." },
  { title: "Download", desc: "Save the result. Nothing was uploaded, so there is nothing to delete." },
];

const faqs = [
  {
    q: "Does this upload my PDF anywhere?",
    a: "No. The compression runs in your browser using JavaScript. Your file is read into the page's memory, processed on your device, and offered back to you as a download. It is never sent to ToolMint or to any third party. You can confirm this yourself: open your browser's developer tools, switch to the Network tab, and compress a file — you will see no upload request.",
  },
  {
    q: "How much smaller will my PDF get?",
    a: "It depends entirely on what is inside it. PDFs made of scans or photographs usually shrink dramatically, often by 80–95%, because photographic data is where the size is. A PDF that is mostly text and vector graphics may only shrink by a few percent, because there is very little to give up. We show you the real before and after figures rather than promising a fixed number.",
  },
  {
    q: "Will the text still be selectable?",
    a: "Yes. This tool only re-encodes the images embedded in the document. Page structure, text and vector graphics are left exactly as they were, so the PDF stays searchable and the text stays selectable.",
  },
  {
    q: "Why did my PDF barely get smaller?",
    a: "Almost certainly because it is already efficient. Text-only documents, files already compressed by another tool, and PDFs whose images use formats we do not re-encode all have little headroom. If the result would have been larger than the original, we give you the original back untouched rather than a worse file.",
  },
  {
    q: "Is there a file size limit?",
    a: "100MB per file, and up to 10 files at a time. This is a browser limit rather than a server one: your device has to hold the document in memory while it works. Very large files are slower on phones and older laptops. If a big file fails, split it first and compress the parts.",
  },
  {
    q: "Can I compress a password-protected PDF?",
    a: "Not directly. An encrypted PDF has to be unlocked before its contents can be read. Remove the password first, then compress the unlocked copy.",
  },
  {
    q: "Does it work on a phone?",
    a: "Yes. It runs in any modern mobile browser with no app to install. Because processing happens on your device, very large files take longer on a phone than on a laptop.",
  },
  {
    q: "Is it really free?",
    a: "Yes. There is no signup, no watermark, no page limit and no trial. Since your device does the work, serving this tool costs us almost nothing.",
  },
];

export default function CompressPdfPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to compress a PDF in your browser",
    totalTime: "PT1M",
    tool: [{ "@type": "HowToTool", name: "A modern web browser" }],
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.desc,
    })),
  };

  return (
    <>
      <WebAppSchema slug="compress-pdf" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <main className="pdf-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "PDF Tools", href: "/tools/pdf-tools" },
            { name: "Compress PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Compress a PDF without uploading it
        </h1>

        <ToolStatusNotice slug="compress-pdf" />
        <ProcessingBadge slug="compress-pdf" />
        <ToolAnalytics slug="compress-pdf" category="pdf" />

        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Most online PDF compressors send your document to their servers. This one does not. The
          work happens inside this page on your own device, which means a contract, a medical
          record or a signed form never leaves your computer. Choose a file, pick how hard to
          compress, and you will see exactly how much smaller it got.
        </p>

        <div className="mt-8">
          <PdfCompressorTool />
        </div>

        {/* ---------------- how your file is processed ---------------- */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How your file is processed
          </h2>
          <div className="mt-4 max-w-3xl space-y-4 text-sm leading-7 text-muted">
            <p>
              When you choose a PDF, the browser reads it into this page&rsquo;s memory. The
              compression code then walks through the document, finds the images embedded in it,
              redraws each one at a lower quality and, where the image is larger than it needs to
              be, at fewer pixels. The rebuilt document is handed back to you as a download.
            </p>
            <p>
              No part of that involves a network request. There is no upload, no queue, no
              temporary copy on a server, and therefore no retention policy to trust — we could not
              read your document even if we wanted to. Closing the tab discards everything.
            </p>
            <p>
              You do not have to take our word for it. Open your browser&rsquo;s developer tools,
              select the Network tab, and compress a file. No request carrying your PDF appears,
              because none is made.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to compress a PDF
          </h2>
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
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to compress a PDF
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{i + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- honest expectations ---------------- */}
        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How much compression can you actually expect?
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              Honestly: it depends on the document, and any tool quoting one number for every file
              is guessing. Size in a PDF almost always comes from embedded raster images. A scanned
              contract is a stack of photographs of paper, and photographs re-encode extremely well
              — reductions above 90% are common. A report exported from Word with a couple of charts
              is mostly text and vector data, which is already about as compact as it gets; expect
              only a few percent there, and that is not a failure, it is the file already being
              efficient. We show you the real before and after size for every file so you can judge
              the result rather than trust a marketing claim.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              What the compression levels change
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              All three levels do the same thing — re-encode images — but with different limits.
              <strong className="text-foreground"> Recommended</strong> keeps images detailed enough
              for normal printing and is the right default. {" "}
              <strong className="text-foreground">Strong</strong> trades a little sharpness in
              photographs for a noticeably smaller file, which suits email and upload portals.{" "}
              <strong className="text-foreground">Maximum</strong> is for when the only thing that
              matters is fitting under a limit; photographs will visibly soften. Text and vector
              graphics are identical at every level, because they are never re-encoded at all.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------------- next steps ---------------- */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Next steps with your PDF
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
            These all run in your browser too.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Merge PDF", href: "/tools/merge-pdf", desc: "Combine several PDFs into one file." },
              { name: "Split PDF", href: "/tools/split-pdf", desc: "Pull out pages or break a large file up." },
              { name: "Rotate PDF", href: "/tools/rotate-pdf", desc: "Fix pages that scanned sideways." },
              { name: "PDF to JPG", href: "/tools/pdf-to-jpg", desc: "Turn pages into images." },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-xl border border-white/10 bg-white/[.02] p-4 transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <h3 className="font-semibold text-foreground">{t.name}</h3>
                <p className="mt-1 text-xs leading-5 text-muted">{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <RelatedTools slug="compress-pdf" />
      </main>
    </>
  );
}
