import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_META_DESCRIPTION, SITE_HOST, TOOL_COUNT } from "@/lib/brand";

export const metadata: Metadata = {
  title: { absolute: "About ToolMint — Free Online Tools for Everyone" },
  description:
    BRAND_META_DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "About ToolMint — Free Online Tools for Everyone",
    description:
      BRAND_META_DESCRIPTION,
    url: "/about",
  },
};

const stats = [
  { label: "Free Tools", value: `${TOOL_COUNT}` },
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
        Free browser tools for PDFs, images and text. Your file never leaves your device.
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
          <h2 className="font-display text-xl font-bold text-foreground">
            Which ToolMint is this?
          </h2>
          <p className="mb-3">
            A fair question, because the name is not unique. Several unrelated websites and products
            also call themselves ToolMint — some offer online utilities, others sell AI software or
            newsletters. We are not affiliated with any of them, and we cannot speak for how they
            handle your files.
          </p>
          <p className="mb-3">
            This ToolMint is <strong>{SITE_HOST}</strong> and nothing else. If you arrived from a
            search result or a link, check the address bar. Anything published elsewhere — pricing,
            accounts, language options, mobile apps — is not ours.
          </p>
          <p>
            What distinguishes this site is not a slogan but something you can check yourself: open
            your browser&rsquo;s developer tools, switch to the Network tab, and run any of our PDF
            tools. No request carrying your document is made, because the work happens on your own
            device. That is the whole product.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">What We Offer</h2>
          <p className="mb-3">
            ToolMint provides {TOOL_COUNT} tools across several categories:
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
          <h2 className="font-display text-xl font-bold text-foreground">Your File Stays On Your Device</h2>
          <p>
            Most ToolMint tools process your files and data entirely in your browser. Your documents,
            images, and text are never uploaded to our servers unless the tool explicitly requires server-side
            processing, which is stated on the tool page itself. You do not have to take that on trust:
            open your browser&apos;s Network tab while a tool runs and you can see for yourself that no
            request carries your file.
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
          <h2 className="font-display text-xl font-bold text-foreground">Who Runs ToolMint</h2>
          <p>
            ToolMint is an independent project, not a company. It is built and maintained by one
            developer, has no investors, and does not sell data or resell anything you upload — the
            PDF tools have nothing to sell, because they never receive your file in the first place.
          </p>
          <p className="mt-3">
            Where a tool makes a claim that can be checked, the working is published rather than
            asserted. The{" "}
            <Link href="/tools/pdf-redaction-checker" className="text-accent-light hover:text-foreground">
              PDF Redaction Checker
            </Link>{" "}
            documents its{" "}
            <Link
              href="/tools/pdf-redaction-checker#methodology"
              className="text-accent-light hover:text-foreground"
            >
              detection method
            </Link>
            , the{" "}
            <Link
              href="/tools/pdf-redaction-checker#limitations"
              className="text-accent-light hover:text-foreground"
            >
              cases it cannot detect
            </Link>{" "}
            and{" "}
            <Link
              href="/tools/pdf-redaction-checker#testing"
              className="text-accent-light hover:text-foreground"
            >
              how it was tested
            </Link>
            , including the cases where it fails.
          </p>
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
