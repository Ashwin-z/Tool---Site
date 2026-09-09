import type { Metadata } from "next";
import Link from "next/link";

import PdfRedactionCheckerTool from "@/components/pdf-redaction-checker-tool-loader";
import ProcessingBadge from "@/components/processing-badge";
import RelatedTools from "@/components/related-tools";
import ToolAnalytics from "@/components/tool-analytics";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import { SITE_URL } from "@/lib/brand";

/** Kept under 160 characters so search engines do not truncate it. */
const DESCRIPTION =
  "Check whether a PDF's redactions removed the text or only covered it. Finds text under black boxes, invisible text and metadata. Runs in your browser.";

export const metadata: Metadata = {
  title: "PDF Redaction Checker – Find Text Under Black Boxes",
  description: DESCRIPTION,
  keywords: [
    "pdf redaction checker",
    "check pdf redaction",
    "verify redacted pdf",
    "hidden text in pdf",
    "test pdf redaction",
    "unredact pdf",
    "bad redaction detector",
    "pdf privacy checker",
  ],
  alternates: { canonical: "/tools/pdf-redaction-checker" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "PDF Redaction Checker – Find Text Under Black Boxes | ToolMint",
    description: DESCRIPTION,
    url: "/tools/pdf-redaction-checker",
  },
  twitter: { card: "summary_large_image" },
};

const detects = [
  {
    title: "Text under a black box",
    desc:
      "The classic failure: a filled rectangle is drawn over a name or number, but the text underneath is never deleted. Selecting the area reveals it. This is the mistake behind most published redaction leaks.",
  },
  {
    title: "Text under a pasted image",
    desc:
      "Same failure, but the cover is an opaque image rather than a drawn shape — what you get when someone patches a screenshot over a line of text.",
  },
  {
    title: "Invisible text",
    desc:
      "Text set to render invisibly. It never appears on screen or in print, but any extractor finds it. Scanned pages with a normal OCR layer are excluded, because that is how searchable scans work.",
  },
  {
    title: "Same-colour text",
    desc:
      "White text on a white page, or any text painted the same colour as what sits behind it. It looks blank and is completely intact in the file.",
  },
  {
    title: "Document properties and attachments",
    desc:
      "Title, Author, Subject, Keywords and embedded files travel with the document. These are reported for review rather than as a failure — nearly every PDF has them.",
  },
];

const cannotDetect = [
  "Non-text content hidden under a box. A signature, photograph, chart or map is invisible to text analysis — this checker reads text only.",
  "Whether the text that is visible should have been removed. It finds concealed content; it cannot judge sensitivity.",
  "Content preserved in an earlier incremental revision inside the file. A PDF can retain previous saved states, and reading those is outside these checks.",
  "Anything inside a password-protected PDF it cannot open.",
  "Vertical writing modes, which the text-position calculation does not model.",
];

const steps = [
  { title: "Choose a PDF", desc: "Drop in the document you are about to share or publish." },
  { title: "Run the check", desc: "Every page is parsed in your browser. Nothing is uploaded." },
  { title: "Read the result", desc: "Any recoverable text is shown with the page it came from." },
  { title: "Fix and re-check", desc: "Redact properly, then run the file through again to confirm." },
];

const faqs = [
  {
    q: "Does this upload my PDF?",
    a: "No. The document is read inside your browser tab using a local copy of pdf.js, and no part of it is sent anywhere. You can verify this yourself: open your browser's Network tab before running the check and confirm no request carries your file. This matters because a document you are redacting is, by definition, sensitive.",
  },
  {
    q: "What does 'no recoverable text was detected' actually mean?",
    a: "It means the specific checks this tool performs found nothing recoverable. It is not a certificate that the document is secure. In particular, non-text content under a box, an earlier revision inside the file, or sensitive information that is simply visible on the page will all pass this check.",
  },
  {
    q: "Why did it flag text on a page that looks fine?",
    a: "Because the text is present in the file even though it is not visible to you. Text under an opaque box, invisible text, and text painted the same colour as its background all render as nothing but stay fully extractable. Select the reported area in your PDF reader and you should be able to copy it out.",
  },
  {
    q: "Why did my scanned document not get flagged for invisible text?",
    a: "Searchable scans are an image with an invisible text layer on top — that is how the text is selectable at all. When essentially all of a page's text is invisible and a large image covers the page, the tool treats it as an OCR layer and says so, rather than reporting every word as hidden content.",
  },
  {
    q: "How do I redact a PDF so it passes?",
    a: "Use a tool that removes the underlying text rather than drawing over it. ToolMint's Redact PDF rebuilds each page as an image, so the text layer does not survive at all. Whatever you use, re-run the finished file through this checker before you send it.",
  },
  {
    q: "Is this a complete PDF security audit?",
    a: "No, and it is not offered as one. It tests for text that is present but concealed, plus document properties worth reviewing. The limitations listed on this page are part of the tool, not a disclaimer bolted on afterwards.",
  },
];

export default function PdfRedactionCheckerPage() {
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
    name: "How to check whether a PDF's redactions actually removed the text",
    description: DESCRIPTION,
    url: `${SITE_URL}/tools/pdf-redaction-checker`,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.desc,
    })),
  };

  return (
    <>
      <WebAppSchema slug="pdf-redaction-checker" />
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
            { name: "PDF Redaction Checker" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          PDF Redaction Checker
        </h1>

        <ProcessingBadge slug="pdf-redaction-checker" />
        <ToolAnalytics slug="pdf-redaction-checker" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          A black box over a name does not remove the name. In most leaked documents the text is
          still sitting in the file, and anyone can copy it out in seconds. This tool reads a PDF
          in your browser and tells you whether any text is still recoverable — before you send
          the file, not after.
        </p>

        <div className="mt-8">
          <PdfRedactionCheckerTool />
        </div>

        {/* ------------------------------------------------------ who needs it */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Who this is for
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
            Anyone about to publish a document that has been redacted by someone else, or by
            themselves in a hurry: lawyers filing exhibits, journalists handling leaked material,
            FOI and public-records officers, compliance and HR teams, and researchers sharing data.
            The check takes seconds and answers one question — is the removed text really gone?
          </p>
        </section>

        {/* ---------------------------------------------------- what it detects */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What it checks for
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {detects.map((d) => (
              <article key={d.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{d.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{d.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------- how it works */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to check a redacted PDF
          </h2>
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

        {/* --------------------------------------------------------- limitations */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What this tool cannot check
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
            A security tool that overstates what it verifies is worse than no tool at all. These
            are the things this checker does not and cannot establish:
          </p>
          <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-7 text-muted">
            {cannotDetect.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
            A clear result means &ldquo;these checks found nothing recoverable&rdquo;. It does not
            mean the document is safe to publish.
          </p>
        </section>

        {/* --------------------------------------------------------- methodology */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Methodology
          </h2>
          <div className="mt-4 max-w-3xl space-y-4 text-sm leading-7 text-muted">
            <p>
              The checker walks each page&apos;s content stream in draw order and rebuilds every
              text run with its position, colour and rendering mode. Draw order is the whole
              game: a filled box only conceals text that was painted <em>before</em> it. An early
              revision of this engine ignored ordering and flagged sixteen cells of an ordinary
              shaded table, plus a report cover&apos;s own title, as &ldquo;hidden text&rdquo;.
              For a tool that makes a security claim, a false alarm on a normal document is more
              damaging than a missed edge case.
            </p>
            <p>
              Only opaque, axis-aligned rectangles and images larger than four points a side count
              as covers. Semi-transparent fills are highlights, not redactions. Rotated text is
              measured by transforming all four corners of its box rather than padding a baseline,
              because a rotated chart label otherwise collapses into a sliver that any nearby
              marker appears to cover.
            </p>
            <p>
              It is validated against fifteen purpose-built fixtures — six leak types, six
              legitimate documents that must <em>not</em> flag, two flattened scans, and one case
              it is expected to miss — every one of which is independently verified with PyMuPDF,
              a different PDF library, so the tests are not circular. It is additionally measured
              against nine real published PDFs (US government publications, IRS forms, arXiv
              papers and a shareholder letter; 169 pages, roughly 26,700 text runs), on which it
              currently reports zero false positives.
            </p>
            <p>
              Results were also compared against{" "}
              <a
                href="https://github.com/freelawproject/x-ray"
                rel="noopener noreferrer nofollow"
                target="_blank"
                className="underline decoration-dotted underline-offset-4 hover:text-foreground"
              >
                x-ray
              </a>
              , the Free Law Project&apos;s open-source bad-redaction detector, which is built on a
              different parser. The two agree on every case inside x-ray&apos;s documented scope of
              rectangles over text. This tool additionally reports invisible text, same-colour
              text, image overlays and document properties, which x-ray does not claim to cover.
            </p>
          </div>
        </section>

        {/* --------------------------------------------------- how to redact well */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to redact a PDF properly
          </h2>
          <div className="mt-4 max-w-3xl space-y-4 text-sm leading-7 text-muted">
            <p>
              The principle, stated by the NSA in its guidance on sanitising documents, is that
              sensitive information must be <em>removed</em>, not merely hidden from view. Drawing
              a shape over text, highlighting it in black, or recolouring it to match the page all
              leave the original characters in the file.
            </p>
            <p>
              Practical approach: redact with a tool that deletes the text or flattens the page to
              an image, clear the document properties, then re-open the finished file and try to
              select the redacted area. If you can copy anything out, the redaction failed. Running
              the result back through this checker is the same test, automated.
            </p>
            <p>
              <Link href="/tools/redact-pdf" className="underline decoration-dotted underline-offset-4 hover:text-foreground">
                ToolMint&apos;s Redact PDF
              </Link>{" "}
              rebuilds each redacted page as an image, so no text layer survives — then check the
              output here to confirm.
            </p>
          </div>
        </section>

        {/* ----------------------------------------------------------------- FAQ */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((f, i) => (
              <div key={i}>
                <dt className="font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <RelatedTools slug="pdf-redaction-checker" />
      </main>
    </>
  );
}
