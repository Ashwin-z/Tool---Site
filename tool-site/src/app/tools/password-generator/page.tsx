import type { Metadata } from "next";
import Link from "next/link";
import RelatedTools from "@/components/related-tools";
import PasswordGeneratorTool from "@/components/password-generator-tool";

export const metadata: Metadata = {
  title: "Password Generator — Strong Passwords & Passphrases with Entropy | ToolMint",
  description:
    "Generate cryptographically secure passwords or passphrases in your browser. Up to 128 characters, custom charsets, exclude ambiguous characters, passphrase separators, entropy in bits, and bulk generation up to 20 at once.",
  keywords: [
    "password generator",
    "strong password generator",
    "random password generator",
    "secure password generator",
    "passphrase generator",
    "cryptographic password generator",
    "password strength checker",
    "password entropy calculator",
    "bulk password generator",
    "custom password generator",
    "online password generator free",
    "generate strong password",
  ],
  alternates: { canonical: "/tools/password-generator" },
  openGraph: {
    title: "Password Generator — Strong Passwords & Passphrases with Entropy | ToolMint",
    description:
      "Generate cryptographically secure passwords or passphrases with entropy scoring. Up to 128 chars, custom rules, bulk generate up to 20 at once. 100% browser-side.",
    url: "/tools/password-generator",
  },
};

const includedTools = [
  { title: "Random Password Generator", desc: "Up to 128 characters with uppercase, lowercase, digits, symbols, custom exclusions, and ambiguous-character filtering." },
  { title: "Passphrase Generator", desc: "Word-based passphrases with 3–12 words and a choice of separator: dash, dot, underscore, space, or none." },
  { title: "Entropy & Strength Meter", desc: "Shannon entropy shown in bits with a 5-tier rating: Very Weak, Weak, Fair, Strong, Very Strong." },
  { title: "Bulk Password Generation", desc: "Generate and copy up to 20 passwords or passphrases at once with a single Regenerate click." },
];

const steps = [
  { title: "Choose Password or Passphrase", desc: "Select the Password tab for character-based passwords or Passphrase for memorable word-based passwords." },
  { title: "Customize settings", desc: "Adjust length (4–128 chars), toggle character sets, exclude ambiguous characters, or set a word count and separator for passphrases." },
  { title: "Generate", desc: "Click Regenerate to create a fresh list. Use the count slider to generate up to 20 at once." },
  { title: "Copy & use", desc: "Copy individual passwords or all at once. The entropy meter shows the strength in bits so you know exactly how secure each one is." },
];

const faqs = [
  {
    q: "Is this password generator truly random?",
    a: "Yes. ToolMint uses the Web Crypto API (crypto.getRandomValues) — a cryptographically secure pseudo-random number generator (CSPRNG) built into browsers. It does not use Math.random().",
  },
  {
    q: "What is password entropy and why does it matter?",
    a: "Entropy (measured in bits) represents how unpredictable a password is. Higher entropy means more combinations an attacker must try. 60+ bits is generally considered strong; 100+ bits is very strong.",
  },
  {
    q: "What is a passphrase and why use one?",
    a: "A passphrase is a sequence of random words (e.g. river-table-flame-book) that is both memorable and highly secure. Four or more random words can reach 50+ bits of entropy while being easier to type and recall than a random character string.",
  },
  {
    q: "What does 'exclude ambiguous characters' do?",
    a: "It removes characters that look similar in many fonts — 0, O, I, l, 1, and others — reducing the chance of transcription errors when typing a password manually.",
  },
  {
    q: "Are generated passwords sent to a server?",
    a: "No. All randomness is generated client-side using the Web Crypto API. No password ever leaves your browser.",
  },
];

export default function PasswordGeneratorPage() {
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
          Password Generator — Passwords &amp; Passphrases with Entropy Score
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Create cryptographically secure passwords (up to 128 characters) or memorable passphrases in your browser.
          Customize character sets, exclude ambiguous characters, set word count and separators, and generate up to 20 at once.
          Every password is scored with Shannon entropy in bits so you see exactly how strong it is.
        </p>

        <div className="mt-8">
          <PasswordGeneratorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Password Tools
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
            How to Generate a Strong Password
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

        <RelatedTools slug="password-generator" />
      </main>
    </>
  );
}
