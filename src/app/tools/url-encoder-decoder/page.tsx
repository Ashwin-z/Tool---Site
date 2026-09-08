import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import UrlEncoderDecoderTool from "@/components/url-encoder-decoder-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "URL Encoder / Decoder – Encode, Decode & Parse URLs Online Free",
  description:
    "Encode URLs with 4 percent-encoding methods, decode with 3 methods, and parse any URL into protocol, host, path, and query parameters. 100% browser-side, free, no signup.",
  keywords: [
    "url encoder decoder online free",
    "how to encode url with special characters",
    "encodeuricomponent online tool",
    "percent encode url online",
    "decode url percent encoding",
    "url query string parser online",
    "url encode space and special characters",
    "url breakdown tool online",
  ],
  alternates: { canonical: "/tools/url-encoder-decoder" },
  openGraph: {
    title: "URL Encoder / Decoder – Encode, Decode & Parse URLs | ToolMint",
    description:
      "Encode URLs with 4 percent-encoding methods, decode with 3 methods, and parse any URL into its components. 100% browser-side.",
    url: "/tools/url-encoder-decoder",
  },
  twitter: { card: "summary_large_image" },
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
      <WebAppSchema slug="url-encoder-decoder" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="dev-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Developer Tools", href: "/tools/developer-tools" },
            { name: "URL Encoder / Decoder" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          URL Encoder / Decoder – Encode, Decode & Parse URLs
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Encode URLs using 4 percent-encoding methods or decode them with 3 methods — including
          form-urlencoded and encodeURIComponent. Paste any full URL to instantly break it down
          into protocol, host, path, and individual query parameters. 100% client-side, nothing
          sent to any server.
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Percent Encoding: Which Characters Get Encoded and Why
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              URLs can only contain a limited set of ASCII characters. Characters outside this
              set — spaces, non-ASCII letters, and certain punctuation — must be percent-encoded
              as a <code className="rounded bg-white/10 px-1 text-xs">%</code> followed by the two-digit hex code of
              the byte value. Space becomes <code className="rounded bg-white/10 px-1 text-xs">%20</code>. The ampersand
              <code className="rounded bg-white/10 px-1 text-xs">&amp;</code> becomes <code className="rounded bg-white/10 px-1 text-xs">%26</code>.
              A Hindi character like &#x2018;&#x2019; encodes as its UTF-8 byte sequence in percent notation.
              Reserved characters (<code className="rounded bg-white/10 px-1 text-xs">: / ? # [ ] @ ! $ &amp; ' ( ) * + , ; =</code>)
              have structural meaning in URLs — whether to encode them depends on context.
              Inside a query parameter value, <code className="rounded bg-white/10 px-1 text-xs">&amp;</code> must be encoded
              as <code className="rounded bg-white/10 px-1 text-xs">%26</code> or it will be interpreted as a parameter
              separator. In a full URL, <code className="rounded bg-white/10 px-1 text-xs">&amp;</code> should stay as-is.
              This is exactly why <code className="rounded bg-white/10 px-1 text-xs">encodeURIComponent</code> encodes
              reserved characters (for query values) while <code className="rounded bg-white/10 px-1 text-xs">encodeURI</code>
              leaves them intact (for full URLs).
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Debugging URLs with the Query String Parser
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Long URLs with multiple query parameters are hard to read in their raw form. The
              URL breakdown tool splits any URL into its components — protocol, host, path,
              query string, and fragment — and lists each query parameter as a separate
              key-value pair. This is useful for: debugging tracking URLs (UTM parameters),
              inspecting OAuth redirect URLs, reading complex API endpoint URLs copied from
              browser developer tools, and verifying that a URL encoder produced the correct
              output. For example, a URL like
              <code className="rounded bg-white/10 px-1 text-xs text-wrap">https://example.com/search?q=hello+world&amp;sort=date&amp;page=2</code>
              breaks into <code className="rounded bg-white/10 px-1 text-xs">q = hello world</code>,
              <code className="rounded bg-white/10 px-1 text-xs">sort = date</code>,
              <code className="rounded bg-white/10 px-1 text-xs">page = 2</code> — instantly readable without manual
              parsing. Paste any URL from your browser address bar, API response, or log file
              and the parser handles the decoding automatically.
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

        <RelatedTools slug="url-encoder-decoder" />
      </main>
    </>
  );
}
