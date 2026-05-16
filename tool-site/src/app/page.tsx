import type { Metadata } from "next";
import Link from "next/link";
import HomeWordCounter from "@/components/home-word-counter";
import { toolCategories } from "@/lib/tool-categories";

export const metadata: Metadata = {
  title: "ToolMint - Free Online PDF Tools, Converters & Calculators",
  description:
    "ToolMint offers 80+ free online tools - compress, merge, split and convert PDFs, edit images, format code, calculate finances and more. No signup required.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ToolMint - Free Online PDF Tools, Converters & Calculators",
    description:
      "80+ free online tools for PDFs, images, text, code, SEO, and calculators. No signup, no watermark.",
    url: "/",
  },
};

const valueProps = [
  {
    title: "Built for real tasks",
    desc: "ToolMint is organized around jobs people actually need to finish quickly: compress a file, clean up text, calculate a payment, or generate metadata.",
  },
  {
    title: "Low-friction to use",
    desc: "The site avoids signup walls and account funnels so visitors can solve a task and move on without unnecessary steps.",
  },
  {
    title: "Privacy-minded by default",
    desc: "Many tools run directly in the browser, and pages explain when server-side processing is needed for heavier conversions.",
  },
  {
    title: "Maintained as a library",
    desc: "The public catalog is focused on live tools, clear categories, and supporting instructions instead of under-construction or placeholder pages.",
  },
];

const faqs = [
  {
    q: "What kinds of visitors use ToolMint?",
    a: "The site is useful for students, office workers, marketers, developers, freelancers, and small business owners who need practical browser-based utilities.",
  },
  {
    q: "Does ToolMint focus on one category only?",
    a: "No. It covers documents, images, text, calculations, SEO helpers, and small technical tasks, but the goal is the same in every category: complete a clear job quickly.",
  },
  {
    q: "Why does the homepage include explanation instead of only tool links?",
    a: "Because a stronger utility site should help users understand what the library is for, how the categories differ, and what kind of workflow each section supports.",
  },
  {
    q: "How many live tools are available?",
    a: `ToolMint currently highlights ${toolCategories.reduce((sum, category) => sum + category.tools.length, 0)} tools across its public categories.`,
  },
];

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
  };

  const featuredCategories = toolCategories
    .filter((category): category is (typeof toolCategories)[number] & { path: string } => Boolean(category.path))
    .slice(0, 7);

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
          100% Free - No signup - No watermark - No limits
        </div>

        <h1 className="font-display max-w-4xl text-4xl font-bold leading-[1.08] tracking-[-0.02em] md:text-6xl">
          Every online tool you <br />
          need, <span className="bg-gradient-to-r from-[#7c6fff] via-[#ff6584] to-[#ffa640] bg-clip-text text-transparent">all in one place.</span>
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
          ToolMint brings together practical browser-based utilities for documents, images, writing, publishing, coding, and calculations.
          The focus is simple: make common digital tasks faster without making visitors sign up first.
        </p>

        <div className="mt-8">
          <HomeWordCounter />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Popular Free Online Tools
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
            Compress PDFs, convert images, format JSON, calculate EMIs, generate passwords, and much more from a single library of live tools.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Compress PDF", href: "/tools/compress-pdf", desc: "Reduce PDF size by up to 90%." },
              { name: "Merge PDF", href: "/tools/merge-pdf", desc: "Combine multiple PDFs into one." },
              { name: "Image Compressor", href: "/tools/image-compressor", desc: "Shrink images without quality loss." },
              { name: "Word Counter", href: "/tools/word-counter", desc: "Count words, characters, and reading time." },
              { name: "JSON Formatter", href: "/tools/json-formatter", desc: "Beautify, validate, and minify JSON." },
              { name: "Loan EMI Calculator", href: "/tools/loan-emi-calculator", desc: "Monthly installments and interest breakdown." },
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-xl border border-white/10 bg-white/[.02] p-4 transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <h3 className="font-semibold text-foreground">{tool.name}</h3>
                <p className="mt-1 text-xs leading-5 text-muted">{tool.desc}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/tools" className="text-sm font-medium text-[#6c63ff] transition hover:underline">
              Browse all 80+ tools -&gt;
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Explore By Category
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredCategories.map((category) => (
              <Link
                key={category.id}
                href={category.path}
                className="rounded-2xl border border-white/10 bg-white/[.02] p-5 transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <p className="text-2xl">{category.icon}</p>
                <h3 className="mt-3 font-semibold text-foreground">{category.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{category.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Why People Use ToolMint
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {valueProps.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.desc}</p>
              </article>
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
    </div>
  );
}
