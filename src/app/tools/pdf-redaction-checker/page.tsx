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
        <section id="limitations" className="mt-16 scroll-mt-24">
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
        <section id="methodology" className="mt-16 scroll-mt-24">
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
              It is validated against sixteen purpose-built fixtures — nine leak types, four
              legitimate documents that must <em>not</em> flag, two flattened scans, and one case
              it is expected to miss — every one of which is independently verified with PyMuPDF,
              a different PDF library, so the tests are not circular. Three further fixtures cover
              encrypted, corrupt and 300-page documents. It is additionally measured
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

        {/* ------------------------------------------------- test evidence */}
        <section id="testing" className="mt-16 scroll-mt-24">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How this was tested
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
            Fixtures are built <em>and</em> verified with PyMuPDF, a different PDF library from the
            one this checker runs on, so the expectations are not derived from the code being
            tested. These figures describe how it performed on that corpus. They are not an accuracy
            guarantee for your document, and they do not extend to the limitations listed above.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <caption className="sr-only">Measured results on the test corpus</caption>
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th scope="col" className="py-2 pr-4 font-semibold text-foreground">Result</th>
                  <th scope="col" className="py-2 pr-4 font-semibold text-foreground">Count</th>
                  <th scope="col" className="py-2 font-semibold text-foreground">Basis</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">Leaks correctly found</td>
                  <td className="py-2 pr-4 tabular-nums">9</td>
                  <td className="py-2">Each independently confirmed recoverable by PyMuPDF</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">Correctly reported clean</td>
                  <td className="py-2 pr-4 tabular-nums">15</td>
                  <td className="py-2">Six benign fixtures plus nine real published PDFs</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">False alarms</td>
                  <td className="py-2 pr-4 tabular-nums">0</td>
                  <td className="py-2">On that corpus, after fixing the causes described below</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Known misses</td>
                  <td className="py-2 pr-4 tabular-nums">1</td>
                  <td className="py-2">
                    A signature under a box &mdash; non-text content, kept as a deliberate failing case
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted">
            The real-world half of that corpus was nine published documents from different
            generators &mdash; US government publications, IRS forms with heavy shading and form
            fields, two LaTeX papers with figures, and a shareholder letter &mdash; totalling 169
            pages and roughly 26,700 text runs.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
            Two false-alarm sources were found during that measurement, and both mattered more than
            the detections. A four-page scanned government memo produced 878 findings, one for every
            word: a perfectly normal OCR layer. Uncorrected, this tool would have fired on every
            scanned document in existence. Separately, an early revision flagged sixteen cells of an
            ordinary shaded table because it ignored draw order.
          </p>
        </section>

        {/* --------------------------------------------------- scope comparison */}
        <section id="comparison" className="mt-16 scroll-mt-24">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How this compares with x-ray
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
            <a
              href="https://github.com/freelawproject/x-ray"
              rel="noopener noreferrer"
              target="_blank"
              className="underline decoration-dotted underline-offset-4 hover:text-foreground"
            >
              x-ray
            </a>{" "}
            is the Free Law Project&rsquo;s open-source bad-redaction detector, built on a different
            PDF library and run across a very large corpus of court filings. Several of the rules
            used here were adopted from it. The two tools have <em>different scopes</em>, not
            different quality: x-ray documents its scope as rectangles over text, and anything
            outside that is simply not what it sets out to cover.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <caption className="sr-only">Scope comparison, verified on identical fixtures</caption>
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th scope="col" className="py-2 pr-4 font-semibold text-foreground">Case</th>
                  <th scope="col" className="py-2 pr-4 font-semibold text-foreground">x-ray</th>
                  <th scope="col" className="py-2 font-semibold text-foreground">This checker</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">Text under a rectangle</td>
                  <td className="py-2 pr-4">Detects</td>
                  <td className="py-2">Detects</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">Ordinary documents (no false alarm)</td>
                  <td className="py-2 pr-4">Clean</td>
                  <td className="py-2">Clean</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">White-on-white text</td>
                  <td className="py-2 pr-4">Outside its scope</td>
                  <td className="py-2">Detects</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">Text under a pasted image</td>
                  <td className="py-2 pr-4">Outside its scope</td>
                  <td className="py-2">Detects</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">Document properties</td>
                  <td className="py-2 pr-4">Outside its scope</td>
                  <td className="py-2">Reports for review</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Runs without installing anything</td>
                  <td className="py-2 pr-4">No &mdash; Python library and CLI</td>
                  <td className="py-2">Yes &mdash; in the browser</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted">
            On identical fixtures the two agree on every case inside x-ray&rsquo;s documented scope.
            For processing PDFs in bulk or inside a pipeline, x-ray is the better fit; this tool
            exists for the person with one document and no ability to install software.
          </p>
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
            <p>
              For the failure patterns themselves, and the manual tests that catch each one, see{" "}
              <Link
                href="/blog/how-to-tell-if-pdf-redaction-failed"
                className="underline decoration-dotted underline-offset-4 hover:text-foreground"
              >
                how to tell if a PDF redaction failed
              </Link>
              .
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
