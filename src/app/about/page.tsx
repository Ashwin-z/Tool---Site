import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "About ToolMint — Free Online Tools for Everyone" },
  description:
    "Learn about ToolMint, a free suite of 80+ online tools for PDFs, images, text, calculations, SEO, and more. No signup, no watermark, no limits.",
  alternates: { canonical: "/about" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "About ToolMint — Free Online Tools for Everyone",
    description:
      "Learn about ToolMint, a free suite of 80+ online tools for PDFs, images, text, calculations, SEO, and more.",
    url: "/about",
  },
};

const stats = [
  { label: "Free Tools", value: "80+" },
  { label: "Categories", value: "8" },
  { label: "Signup Required", value: "None" },
  { label: "Cost", value: "Free" },
];

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-foreground">
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">
        About ToolMint
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
        Your go-to destination for fast, free, and privacy-first online tools.
      </p>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5 text-center">
            <p className="font-display text-2xl font-bold text-[#6c63ff]">{s.value}</p>
            <p className="mt-1 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-8 text-sm leading-7 text-foreground/75">
        <section>
          <h2 className="font-display text-xl font-bold text-foreground">Our Mission</h2>
          <p>
            ToolMint was built with a simple goal: give everyone access to powerful online tools without
            paywalls, sign-ups, or hidden limits. Whether you need to compress a PDF, convert an image,
            check your grammar, or calculate loan EMIs, ToolMint has you covered — instantly and for free.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">What We Offer</h2>
          <p className="mb-3">
            ToolMint provides a growing collection of 80+ tools across multiple categories:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>PDF Tools</strong> — Compress, merge, split, rotate, protect, unlock, redact, compare,
              watermark, crop, add page numbers, and convert PDFs.
            </li>
            <li>
              <strong>Image Tools</strong> — Compress, resize, crop, rotate, convert formats, extract text
              (OCR), and remove backgrounds.
            </li>
            <li>
              <strong>Text Tools</strong> — Word counter, case converter, text comparison, grammar checker,
              whitespace remover, and more.
            </li>
            <li>
              <strong>Calculators</strong> — Scientific, percentage, age, BMI, EMI, compound interest,
              profit margin, ROI, GST, calorie, GPA, and work hours calculators.
            </li>
            <li>
              <strong>Developer Tools</strong> — JSON formatter, code snippet generator, Python editor,
              Base64 encoder, password generator, URL encoder, and regex tester.
            </li>
            <li>
              <strong>SEO Tools</strong> — Meta tag generator, title/description checker, sitemap generator,
              robots.txt generator, keyword density checker, and OG tag generator.
            </li>
            <li>
              <strong>Converters</strong> — Length, weight, temperature, file size, and number-to-words
              converters.
            </li>
            <li>
              <strong>More Tools</strong> — QR code scanner and generator, YouTube thumbnail downloader,
              Wi-Fi speed checker, stopwatch, color converter, and more.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">Privacy First</h2>
          <p>
            Most ToolMint tools process your files and data entirely in your browser. Your documents,
            images, and text are never uploaded to our servers unless the tool explicitly requires server-side
            processing (which is clearly stated on the tool page). We believe your data should stay yours.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">How It Works</h2>
          <p>
            Just visit any tool page, upload your file or enter your data, and get results instantly. No
            account creation, no email verification, no download limits. Every tool is designed to be fast,
            intuitive, and mobile-friendly. Export your results with a single click.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">Our Values</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Free forever</strong> — All tools are free to use with no hidden costs or premium
              tiers.
            </li>
            <li>
              <strong>No signup</strong> — Use any tool instantly without creating an account.
            </li>
            <li>
              <strong>Privacy-focused</strong> — Browser-based processing keeps your data on your device.
            </li>
            <li>
              <strong>No watermarks</strong> — Download clean outputs without branding or watermarks.
            </li>
            <li>
              <strong>Continuously improving</strong> — We regularly add new tools and improve existing ones
              based on user feedback.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">Get in Touch</h2>
          <p>
            Have feedback, a bug report, or a tool request? We&apos;d love to hear from you. Visit our{" "}
            <Link href="/contact" className="text-accent-light hover:text-foreground">
              Contact page
            </Link>{" "}
            to reach out.
          </p>
        </section>
      </div>
    </main>
  );
}
