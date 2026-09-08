import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import PasswordGeneratorTool from "@/components/password-generator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Password Generator – Create Strong Random Passwords & Passphrases Free",
  description:
    "Generate cryptographically secure passwords or passphrases in your browser. Customize length, character sets, entropy score, and bulk-generate up to 20 at once. 100% browser-side, free.",
  keywords: [
    "strong password generator free",
    "random password generator online",
    "how to create a strong password",
    "secure password generator no login",
    "passphrase generator online free",
    "password entropy calculator",
    "generate password with special characters",
    "cryptographic password generator browser",
  ],
  alternates: { canonical: "/tools/password-generator" },
  openGraph: {
    title: "Password Generator – Strong Passwords & Passphrases with Entropy | ToolMint",
    description:
      "Generate cryptographically secure passwords or passphrases with entropy scoring. Up to 128 chars, custom rules, bulk generate up to 20 at once. 100% browser-side.",
    url: "/tools/password-generator",
  },
  twitter: { card: "summary_large_image" },
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
      <WebAppSchema slug="password-generator" />
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
            { name: "Password Generator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Password Generator – Strong Passwords & Passphrases with Entropy Score
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Create cryptographically secure passwords (up to 128 characters) or memorable
          passphrases in your browser. Customize character sets, exclude ambiguous characters,
          set word count and separators, and generate up to 20 at once. Every password is scored
          with Shannon entropy in bits so you see exactly how strong it is.
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Password Entropy: How to Measure How Strong a Password Really Is
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Password entropy is measured in bits and represents the number of possible
              combinations an attacker would need to try to crack a password by brute force.
              The formula is: entropy = log₂(character set size ^ password length). A 12-character
              password using only lowercase letters (26 chars) has log₂(26¹²) ≈ 56 bits of
              entropy. The same 12 characters using uppercase + lowercase + digits + symbols
              (94 chars) gives log₂(94¹²) ≈ 79 bits. General guidelines: below 40 bits is weak
              and crackable quickly with modern hardware; 60–80 bits is strong for most accounts;
              100+ bits is very strong and impractical to crack even with significant computing
              resources. Length increases entropy more efficiently than adding character types:
              a 20-character lowercase password (94 bits) is stronger than a 12-character
              mixed-charset password (79 bits). The entropy meter in this generator shows the
              exact bit count so you can make an informed choice rather than guessing.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Passphrases vs Passwords: Which Should You Use?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Passphrases — sequences of random words like <em>cloud-bridge-falcon-river</em> —
              have two advantages over traditional random-character passwords: they are easier
              to remember and type, and they can be longer (more entropy) without being harder
              to use. A 4-word passphrase drawn from a 7,776-word wordlist has log₂(7776⁴) ≈
              51 bits of entropy. A 5-word passphrase reaches ≈ 64 bits — equivalent to a
              12-character random string with full charset. For accounts you need to type from
              memory (laptop login, password manager master password, Wi-Fi password), passphrases
              are generally the better choice. For accounts where you copy-paste from a password
              manager, a fully random 20-character string is equally strong and slightly more
              compact. The key rule for both: never reuse. Use a different password or passphrase
              for every account. If one site is breached, unique passwords ensure the attacker
              cannot access your other accounts.
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

        <RelatedTools slug="password-generator" />
      </main>
    </>
  );
}
