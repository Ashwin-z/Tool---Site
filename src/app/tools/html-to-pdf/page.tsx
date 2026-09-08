import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import HtmlToPdfTool from "@/components/html-to-pdf-tool";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "HTML to PDF Converter – Convert Webpage to PDF Free",
  description:
    "Convert HTML files, pasted code, or a web page URL to PDF online for free. Preserves CSS styles and layout. No signup required.",
  keywords: [
    "html to pdf",
    "webpage to pdf",
    "save webpage as pdf",
    "convert html to pdf",
    "url to pdf",
    "website to pdf",
    "html to pdf converter online free",
    "web page to pdf",
  ],
  alternates: { canonical: "/tools/html-to-pdf" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "HTML to PDF Converter – Convert Webpage to PDF Free | ToolMint",
    description:
      "Convert HTML files, pasted code, or a web page URL to PDF online for free. Preserves CSS styles and layout. No signup required.",
    url: "/tools/html-to-pdf",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Save web content as PDF",
    desc: "Archive a live webpage, news article, or online document as a PDF for offline reading or record-keeping.",
  },
  {
    title: "Convert email templates",
    desc: "Turn an HTML email template into a PDF for client approval, archiving, or portfolio documentation.",
  },
  {
    title: "Snapshot web reports",
    desc: "Capture a rendered dashboard, analytics page, or data report as a PDF before the data changes.",
  },
];

const steps = [
  { title: "Paste a URL", desc: "Enter the full web address of the page you want to convert." },
  { title: "Preview", desc: "ToolMint renders the live page so you can verify the content." },
  { title: "Convert", desc: "Click Convert to generate a PDF from the rendered page." },
  { title: "Download", desc: "Save the PDF to your device instantly." },
];

const faqs = [
  {
    q: "Can I convert a full webpage URL to PDF?",
    a: "Yes. Paste any publicly accessible URL and ToolMint fetches and renders the page, then converts it to a PDF. Pages behind logins, paywalls, or CAPTCHA challenges cannot be accessed.",
  },
  {
    q: "Does the converter support CSS and JavaScript?",
    a: "Yes. ToolMint uses a full browser rendering engine that processes CSS stylesheets and executes JavaScript, so dynamic pages, single-page applications, and styled layouts all render correctly.",
  },
  {
    q: "How do I convert an HTML email template to PDF?",
    a: "If the template is hosted online, paste its URL. For a local HTML file, you can open it in your browser first and use the address bar URL, which typically starts with file:// — note that some converters do not support local file:// URLs.",
  },
  {
    q: "Why is my HTML PDF layout broken?",
    a: "Common causes are responsive CSS that resizes content below a certain viewport width, missing external fonts or stylesheets due to CORS restrictions, or lazy-loaded images that have not loaded by the time the PDF is generated.",
  },
  {
    q: "Can I convert HTML to PDF in bulk?",
    a: "ToolMint converts one URL at a time. For bulk conversion of many pages, a command-line tool like wkhtmltopdf or a browser automation script would be more efficient.",
  },
];

export default function HtmlToPdfPage() {
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
      <WebAppSchema slug="html-to-pdf" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="pdf-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "PDF Tools", href: "/tools/pdf-tools" },
            { name: "HTML to PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert HTML to PDF Online for Free
        </h1>

        <ProcessingBadge slug="html-to-pdf" />
        <ToolAnalytics slug="html-to-pdf" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Save any webpage as a PDF document with ToolMint. Paste a live URL and download a fully
          rendered, print-ready PDF that captures the page exactly as it appears in a browser —
          including CSS styles, images, and JavaScript-generated content.
        </p>

        <div className="mt-8">
          <HtmlToPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Common Uses for HTML to PDF Conversion
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
            How to Convert a Webpage to PDF
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Common Uses for HTML to PDF Conversion
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Archiving web content is one of the most frequent use cases — saving a news article,
              documentation page, or terms and conditions document as a PDF creates a permanent
              record that does not change if the original page is updated or taken down. Developers
              and designers use HTML to PDF to generate printable invoices, statements, and reports
              directly from web application templates. Teams also use it to create offline copies of
              online tools, wiki pages, or shared documents for distribution to recipients who may
              not have reliable internet access. For legal and compliance work, capturing a rendered
              webpage as a timestamped PDF can serve as evidence of what was published at a
              specific point in time.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Does HTML to PDF Preserve CSS Styling?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Yes, when the conversion uses a full browser rendering engine. ToolMint renders the
              URL in a real browser context before converting, which means external stylesheets,
              inline CSS, web fonts, and CSS Grid and Flexbox layouts all render as they would in a
              browser. The main limitations are media queries — some pages use CSS that specifically
              hides or rearranges content for print, which affects how the PDF looks. Backgrounds
              set with CSS may also be omitted depending on the print CSS settings of the page.
              If a page renders correctly in a browser but the PDF looks wrong, the issue is usually
              a print stylesheet overriding the screen layout.
            </p>
          </div>
        </section>

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

        <RelatedTools slug="html-to-pdf" />
      </main>
    </>
  );
}
