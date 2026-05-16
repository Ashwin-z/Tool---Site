import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import RobotsTxtGeneratorTool from "@/components/robots-txt-generator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Robots.txt Generator – Create a robots.txt File for Any Website Free",
  description:
    "Generate a valid robots.txt file for any website. Auto-detects WordPress, Shopify, and OpenCart. Blocks sensitive paths, reads existing sitemap reference, and downloads ready-to-upload. Free.",
  keywords: [
    "robots txt generator free",
    "how to create robots txt file",
    "robots txt generator wordpress",
    "robots txt file generator online",
    "create robots txt without plugin",
    "robots txt disallow path generator",
    "robots txt for shopify",
    "robots txt builder online",
  ],
  alternates: { canonical: "/tools/robots-txt-generator" },
  openGraph: {
    title: "Robots.txt Generator – Platform Detection & Sensitive Path Blocker | ToolMint",
    description:
      "Auto-detects WordPress, Shopify, OpenCart and sensitive paths to generate a valid robots.txt. Download instantly. Free.",
    url: "/tools/robots-txt-generator",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Platform Auto-Detector", desc: "Enter your site URL and the tool detects your CMS — WordPress, Shopify, OpenCart, or generic — and applies the right disallow rules automatically." },
  { title: "Sensitive Path Scanner", desc: "Fetches your existing robots.txt and scans for admin panels, login pages, and other sensitive paths to block from crawlers." },
  { title: "Sitemap Reference Finder", desc: "Reads your existing robots.txt and sitemap references and carries them into the generated file automatically." },
  { title: "Robots.txt Download", desc: "Copy the generated robots.txt to clipboard or download it as a ready-to-upload file in one click." },
];

const steps = [
  { title: "Enter your website URL", desc: "Type your site's base URL and click Start — the tool fetches your current robots.txt and detects your platform." },
  { title: "Review detected settings", desc: "The tool shows your detected platform, sitemap status, and sensitive paths it found and will block." },
  { title: "Check the generated file", desc: "Review the auto-built robots.txt with all user-agent rules, disallow paths, and default sitemap reference." },
  { title: "Download robots.txt", desc: "Copy to clipboard or download the file, then upload it to your website root (e.g. https://example.com/robots.txt)." },
];

const faqs = [
  {
    q: "What is a robots.txt file?",
    a: "A robots.txt file sits at the root of your website and tells search engine crawlers which pages or directories they should not access. It is the first file most crawlers request when visiting a site.",
  },
  {
    q: "Which CMS platforms are auto-detected?",
    a: "ToolMint's robots.txt generator detects WordPress, Shopify, and OpenCart. For each platform it applies the appropriate default disallow rules — for example, blocking /wp-admin/ for WordPress.",
  },
  {
    q: "Can search engines ignore robots.txt?",
    a: "Reputable crawlers like Googlebot follow robots.txt by convention, but it is not enforced by any technical mechanism. For truly sensitive content, use server-level access controls combined with robots.txt.",
  },
  {
    q: "How do I upload the robots.txt file?",
    a: "Upload the file to your website's root directory so it is accessible at https://yourdomain.com/robots.txt. On most hosts this is the public_html or www folder.",
  },
  {
    q: "Will this tool overwrite my existing robots.txt?",
    a: "No. The generator reads your existing file and uses it as reference, but you download the newly generated content separately. Your live file is unaffected until you manually replace it.",
  },
];

export default function RobotsTxtGeneratorPage() {
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
      <WebAppSchema slug="robots-txt-generator" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="seo-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "SEO Tools", href: "/tools/seo-tools" },
            { name: "Robots.txt Generator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Robots.txt Generator – Platform Detection & Sensitive Path Blocker
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Generate a ready-to-use robots.txt file for any website. Enter your URL and the tool
          automatically detects your CMS (WordPress, Shopify, OpenCart), scans for sensitive paths
          to block, and reads your existing sitemap reference — producing a well-formed robots.txt
          you can download and deploy instantly.
        </p>

        <div className="mt-8">
          <RobotsTxtGeneratorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What This Generator Builds for You
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
            How to Generate a robots.txt File
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
              What to Block in robots.txt (and Common Mistakes)
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Robots.txt is used to prevent crawlers from wasting time on pages that should not
              appear in search results. Pages worth blocking include: admin panels and login pages
              (/wp-admin/, /admin/, /login/), internal search result pages, URL parameter variants
              that create near-duplicate content (?sort=, ?ref=, ?session=), staging or preview
              environments, and private API endpoints. Do not block: your sitemap URL, public
              content pages you want indexed, CSS and JavaScript files (Google needs these to
              render and understand your pages — blocking them was a common old-school mistake that
              hurts rankings), and image files unless you specifically want to exclude image search.
              The most damaging robots.txt mistake is accidentally disallowing the entire site with
              &quot;Disallow: /&quot; under Googlebot — this is a single line that prevents Google from
              indexing anything. Always verify your live robots.txt at yourdomain.com/robots.txt
              after deploying.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Robots.txt for WordPress, Shopify, and Static Sites
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Different platforms have different directories that need protection. WordPress should
              block /wp-admin/ (allow /wp-admin/admin-ajax.php for AJAX functionality), /wp-includes/,
              and search URLs like /?s=. Shopify auto-generates a robots.txt and does not allow
              full customization — you can only add custom rules via the Shopify robots.txt.liquid
              template. OpenCart should block /admin/, /catalog/controller/, /install/, and
              /system/. Static sites (plain HTML, Next.js static export, Hugo, Gatsby) typically
              only need a minimal robots.txt allowing all crawlers and pointing to the sitemap.
              The generated file from this tool handles all these cases automatically based on
              the detected platform and adds the Sitemap: directive pointing to your sitemap.xml
              so crawlers know where to find it.
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

        <RelatedTools slug="robots-txt-generator" />
      </main>
    </>
  );
}
