import type { Metadata } from "next";
import Link from "next/link";
import UrlEncoderDecoderTool from "@/components/url-encoder-decoder-tool";

export const metadata: Metadata = {
  title: "URL Encoder / Decoder — Encode, Decode & Parse URLs Online | ToolMint",
  description:
    "Free online URL Encoder & Decoder. Encode URLs with 4 methods (encodeURIComponent, encodeURI, form, spaces-only), decode with 3 methods, and parse any URL into protocol, host, path, and query parameters.",
  keywords: [
    "url encoder",
    "url decoder",
    "url encoder decoder online",
    "encode url online",
    "decode url online",
    "percent encoding",
    "url encode special characters",
    "encodeuricomponent online",
    "url parser",
    "query string parser",
    "url breakdown tool",
    "percent decode url",
    "url encoding tool free",
  ],
  alternates: { canonical: "/tools/url-encoder-decoder" },
  openGraph: {
    title: "URL Encoder / Decoder — Encode, Decode & Parse URLs Online | ToolMint",
    description:
      "Encode URLs with 4 percent-encoding methods, decode with 3 methods, and parse any URL into its components. 100% browser-side.",
    url: "/tools/url-encoder-decoder",
  },
};

const includedTools = [
  { title: "URL Encoder (4 Methods)", desc: "encodeURIComponent, encodeURI, form-urlencoded (+spaces), or spaces-only — choose the right method for your use case." },
  { title: "URL Decoder (3 Methods)", desc: "decodeURIComponent, decodeURI, or form-urlencoded (+ → space) to reverse any percent-encoded string." },
  { title: "URL Breakdown & Query Parser", desc: "Paste any full URL to see protocol, host, path, query string, fragment, and each query parameter listed as key=value pairs." },
];

const steps = [
  { title: "Choose mode", desc: "Select Encode to percent-encode special characters, or Decode to convert a percent-encoded URL back to plain text." },
  { title: "Select encoding method", desc: "Pick from 4 encode or 3 decode methods depending on whether you're handling query params, form data, or full URLs." },
  { title: "Paste your text", desc: "Type or paste the URL or text — the output updates in real time with character count and size diff stats." },
  { title: "Use URL breakdown", desc: "Paste a complete URL to split it into protocol, host, path, query, and hash — with individual query params listed below." },
];

const faqs = [
  {
    q: "What is the difference between encodeURIComponent and encodeURI?",
    a: "encodeURIComponent encodes all special characters including :/?# — best for individual query parameter values. encodeURI leaves URL-structural characters like :// intact — best for encoding a full URL.",
  },
  {
    q: "What is form-urlencoded encoding?",
    a: "Form encoding is like encodeURIComponent but replaces spaces with + instead of %20. It is used in HTML form submissions and the application/x-www-form-urlencoded content type.",
  },
  {
    q: "Can I parse a URL into its components?",
    a: "Yes. Paste any complete URL and the URL Breakdown section automatically splits it into protocol, host, path, query string, fragment, and individual query parameters.",
  },
  {
    q: "Is my URL data sent to a server?",
    a: "No. All encoding, decoding, and URL parsing is done entirely in your browser. Nothing is transmitted anywhere.",
  },
  {
    q: "How do I decode %20, +, and other encoded characters?",
    a: "Use Decode mode. Choose decodeURIComponent to convert %20 to a space, or form-urlencoded mode to convert + to a space as well.",
  },
];

export default function UrlEncoderDecoderPage() {
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
      <main className="dev-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          URL Encoder / Decoder — Encode, Decode &amp; Parse URLs
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Encode URLs using 4 percent-encoding methods or decode them with 3 methods — including form-urlencoded and
          encodeURIComponent. Paste any full URL to instantly break it down into protocol, host, path, and individual
          query parameters. 100% client-side, nothing sent to any server.
        </p>

        <div className="mt-8">
          <UrlEncoderDecoderTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included URL Tools
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            How to Encode or Decode a URL
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
      </main>
    </>
  );
}
