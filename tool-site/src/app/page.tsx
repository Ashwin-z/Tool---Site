import type { Metadata } from "next";
import Link from "next/link";
import HomeWordCounter from "@/components/home-word-counter";

export const metadata: Metadata = {
  title: "ToolMint — Free Online PDF Tools, Converters & Calculators",
  description:
    "ToolMint offers 80+ free online tools — compress, merge, split and convert PDFs, edit images, format code, calculate finances and more. No signup required.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ToolMint — Free Online PDF Tools, Converters & Calculators",
    description:
      "80+ free online tools for PDFs, images, text, code, SEO, and calculators. No signup, no watermark.",
    url: "/",
  },
};

export default function Home() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ToolMint",
    url: "https://toolmint.tools",
    logo: "https://toolmint.tools/branding/toolmint-logo-512.png",
    sameAs: [],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ToolMint",
    url: "https://toolmint.tools",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://toolmint.tools/tools?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="noise">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-14">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#6c63ff]/30 bg-[#6c63ff]/12 px-3 py-1 text-xs text-[#b6b2ff]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6c63ff]" />
          100% Free · No signup · No watermark · No limits
        </div>

        <h1 className="font-display max-w-4xl text-4xl font-bold leading-[1.08] tracking-[-0.02em] md:text-6xl">
          Every online tool you <br />
          need, <span className="bg-gradient-to-r from-[#7c6fff] via-[#ff6584] to-[#ffa640] bg-clip-text text-transparent">all in one place.</span>
        </h1>

        <p className="mt-4 max-w-xl text-base leading-8 text-muted">
          Free tools for writers, developers, designers &amp; students. No installs, no sign-up.
        </p>

        <div className="mt-8">
          <HomeWordCounter />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Popular Free Online Tools
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
            Compress PDFs, convert images, format JSON, calculate EMIs, generate passwords, and
            much more — all from your browser, with zero uploads for most tools.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "PDF Compressor", href: "/tools/pdf-compressor", desc: "Reduce PDF size by up to 90%." },
              { name: "PDF Merger", href: "/tools/pdf-merger", desc: "Combine multiple PDFs into one." },
              { name: "Image Compressor", href: "/tools/image-compressor", desc: "Shrink images without quality loss." },
              { name: "Word Counter", href: "/tools/word-counter", desc: "Count words, characters & reading time." },
              { name: "JSON Formatter", href: "/tools/json-formatter", desc: "Beautify, validate & minify JSON." },
              { name: "Loan EMI Calculator", href: "/tools/loan-emi-calculator", desc: "Monthly installments & interest breakdown." },
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
          <div className="mt-6">
            <Link href="/tools" className="text-sm font-medium text-[#6c63ff] transition hover:underline">
              Browse all 80+ tools →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
