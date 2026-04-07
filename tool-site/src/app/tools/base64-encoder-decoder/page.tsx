import type { Metadata } from "next";
import Link from "next/link";
import Base64EncoderDecoderTool from "@/components/base64-encoder-decoder-tool";

export const metadata: Metadata = {
  title: "Base64 Encoder / Decoder — Encode & Decode Text & Files Online | ToolMint",
  description:
    "Free online Base64 Encoder & Decoder. Encode text or files (images, PDFs, binary) to Base64 and decode Base64 strings instantly. UTF-8 safe, 100% browser-side — no data leaves your device.",
  keywords: [
    "base64 encoder",
    "base64 decoder",
    "base64 encoder decoder online",
    "encode to base64",
    "decode base64",
    "base64 online",
    "base64 file encoder",
    "image to base64",
    "base64 to text",
    "text to base64",
    "free base64 tool",
    "base64 converter online",
  ],
  alternates: { canonical: "/tools/base64-encoder-decoder" },
  openGraph: {
    title: "Base64 Encoder / Decoder — Encode & Decode Text & Files Online | ToolMint",
    description:
      "Encode text or files to Base64, decode Base64 strings back to plain text. UTF-8 safe, runs entirely in your browser.",
    url: "/tools/base64-encoder-decoder",
  },
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
    a: "Yes. ToolMint uses TextEncoder and TextDecoder rather than raw btoa/atob, so multi-byte Unicode characters are handled correctly without data loss.",
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
    a: "Base64 is commonly used to embed binary data (images, files) in JSON or HTML, transmit data through APIs that only support text, and encode email attachments.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="dev-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Base64 Encoder / Decoder — Text &amp; File Support
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Encode any text or file to Base64 — or decode a Base64 string back to plain text — all in real time inside your browser.
          UTF-8 safe with drag-and-drop file support for images, PDFs, and binary files. No server upload, no data left behind.
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
