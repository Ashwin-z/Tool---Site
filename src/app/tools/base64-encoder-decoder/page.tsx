import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import Base64EncoderDecoderTool from "@/components/base64-encoder-decoder-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Base64 Encoder / Decoder – Encode & Decode Text and Files Online Free",
  description:
    "Encode text or files (images, PDFs, binary) to Base64 and decode Base64 strings back to plain text. UTF-8 safe, drag-and-drop file support, 100% browser-side. Free, no signup.",
  keywords: [
    "base64 encoder decoder online free",
    "how to encode image to base64",
    "base64 encode text online",
    "decode base64 string online",
    "base64 file encoder online",
    "what is base64 encoding",
    "image to base64 converter",
    "base64 to text decoder free",
  ],
  alternates: { canonical: "/tools/base64-encoder-decoder" },
  openGraph: {
    title: "Base64 Encoder / Decoder – Encode & Decode Text & Files Online | ToolMint",
    description:
      "Encode text or files to Base64, decode Base64 strings back to plain text. UTF-8 safe, runs entirely in your browser.",
    url: "/tools/base64-encoder-decoder",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Text to Base64 Encoder", desc: "Type or paste any text and get the Base64-encoded result in real time." },
  { title: "Base64 to Text Decoder", desc: "Paste a Base64 string and decode it back to readable plain text instantly with a valid/invalid badge." },
  { title: "File to Base64 Encoder", desc: "Drag & drop any file — image, PDF, or binary — to encode it to a Base64 string without uploading." },
  { title: "Download Result", desc: "Save the encoded or decoded output as a .txt file with one click." },
];

const steps = [
  { title: "Choose Encode or Decode", desc: "Click the Encode tab to convert text or a file to Base64, or Decode to reverse a Base64 string back to plain text." },
  { title: "Paste text or upload a file", desc: "Type into the input area or drag & drop any file to load it automatically." },
  { title: "Copy the result", desc: "The output updates in real time — copy it directly from the output panel." },
  { title: "Download if needed", desc: "Click Download to save the encoded or decoded result as a .txt file." },
];

const faqs = [
  {
    q: "Can I encode images and binary files to Base64?",
    a: "Yes. Drag and drop any file — images, PDFs, or binary files — into the input area and the tool encodes it to a Base64 string immediately.",
  },
  {
    q: "Is this tool UTF-8 safe?",
    a: "Yes. ToolMint uses TextEncoder and TextDecoder rather than raw btoa/atob, so multi-byte Unicode characters (including Hindi, Arabic, Chinese, and emoji) are handled correctly without data loss.",
  },
  {
    q: "How do I decode a Base64 string?",
    a: "Click the Decode tab, paste your Base64 string into the input, and the decoded text appears instantly. A validation badge confirms whether the input is valid Base64.",
  },
  {
    q: "Are my files uploaded to a server?",
    a: "No. All encoding and decoding happens locally in your browser using Web APIs. No file or text is ever sent to any server.",
  },
  {
    q: "What is Base64 used for?",
    a: "Base64 is commonly used to embed binary data (images, files) in JSON or HTML, transmit data through APIs that only support text, encode email attachments (MIME), and store binary data in databases that only accept text.",
  },
];

export default function Base64EncoderDecoderPage() {
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
      <WebAppSchema slug="base64-encoder-decoder" />
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
            { name: "Base64 Encoder / Decoder" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Base64 Encoder / Decoder – Text & File Support
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Encode any text or file to Base64 — or decode a Base64 string back to plain text —
          all in real time inside your browser. UTF-8 safe with drag-and-drop file support for
          images, PDFs, and binary files. No server upload, no data left behind.
        </p>

        <div className="mt-8">
          <Base64EncoderDecoderTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Base64 Tools
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
            How to Encode or Decode Base64 Online
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
              What Is Base64 and Why Is It Used?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Base64 is an encoding scheme that converts binary data into a string of 64
              printable ASCII characters (A–Z, a–z, 0–9, +, /). The name comes from
              the character set size: 64. Base64 was designed to solve one specific problem:
              many systems that handle text — email protocols, JSON APIs, HTML attributes,
              XML — cannot safely transmit raw binary data because certain byte values are
              interpreted as control characters. Base64 removes that problem by representing
              every byte pattern as a combination of safe printable characters. The tradeoff
              is size: Base64-encoded data is approximately 33% larger than the original binary.
              Common uses: embedding images directly in CSS as
              <code className="rounded bg-white/10 px-1 text-xs">data:image/png;base64,...</code> URI strings
              to avoid an extra HTTP request, encoding JWT tokens (the header and payload are
              Base64url-encoded), passing binary data in JSON API payloads, and encoding email
              attachments in MIME format. Base64 is not encryption — it is a reversible encoding
              that anyone can decode.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Base64 vs Base64url: What Is the Difference?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Standard Base64 uses <code className="rounded bg-white/10 px-1 text-xs">+</code> and
              <code className="rounded bg-white/10 px-1 text-xs">/</code> as the 63rd and 64th characters, and
              <code className="rounded bg-white/10 px-1 text-xs">=</code> for padding. These characters have special
              meaning in URLs: <code className="rounded bg-white/10 px-1 text-xs">+</code> encodes as a space,
              <code className="rounded bg-white/10 px-1 text-xs">/</code> is a path separator, and
              <code className="rounded bg-white/10 px-1 text-xs">=</code> can break query strings. Base64url is a
              URL-safe variant that replaces <code className="rounded bg-white/10 px-1 text-xs">+</code> with
              <code className="rounded bg-white/10 px-1 text-xs">-</code> and <code className="rounded bg-white/10 px-1 text-xs">/</code> with
              <code className="rounded bg-white/10 px-1 text-xs">_</code>, and often omits padding. JWTs use
              Base64url for all three parts (header, payload, signature). If you are decoding a JWT
              and getting errors, switch to Base64url decoding and remove any trailing
              <code className="rounded bg-white/10 px-1 text-xs">=</code> padding. If you are encoding data to embed in a
              URL query parameter, use Base64url rather than standard Base64 to avoid the need for
              additional percent-encoding.
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

        <RelatedTools slug="base64-encoder-decoder" />
      </main>
    </>
  );
}
