import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | ToolMint",
  description:
    "Read how ToolMint collects, uses, and protects your data. Learn about cookies, analytics, advertising, and your privacy rights.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | ToolMint",
    description:
      "Read how ToolMint collects, uses, and protects your data. Learn about cookies, analytics, advertising, and your privacy rights.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-foreground">
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">Privacy Policy</h1>
      <p className="mt-3 text-sm leading-7 text-muted">Last updated: March 29, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-foreground/75">
        <section>
          <h2 className="font-display text-xl font-bold text-foreground">1. Introduction</h2>
          <p>
            ToolMint (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website{" "}
            <strong>toolmint.tools</strong>. This Privacy Policy explains what information we collect, how we
            use it, and your choices regarding your data. By using our website you agree to the practices
            described in this policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">2. Information We Collect</h2>
          <p className="mb-2">
            ToolMint is designed to work without requiring an account. Most tools run entirely in your
            browser, so your files and text are never uploaded to our servers unless explicitly stated on the
            tool page. We may collect:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Usage data</strong> — pages visited, time on page, referring URL, device type, browser
              type, operating system, and screen resolution, collected via analytics services.
            </li>
            <li>
              <strong>IP address</strong> — your IP address may be logged by our hosting provider and
              analytics partners for security, fraud prevention, and approximate geographic analytics.
            </li>
            <li>
              <strong>Cookies and similar technologies</strong> — small text files stored on your device. See
              our <Link href="/cookie-policy" className="text-accent-light hover:text-foreground">Cookie Policy</Link> for full details.
            </li>
            <li>
              <strong>Voluntarily provided information</strong> — if you contact us via email, we receive
              your email address, name, and message content.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">3. How We Use Your Information</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>To operate, maintain, and improve the website and its tools.</li>
            <li>To understand how visitors interact with our site (analytics).</li>
            <li>To display relevant advertisements through third-party ad networks.</li>
            <li>To detect, prevent, and address technical issues or abuse.</li>
            <li>To respond to your inquiries or support requests.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">4. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies for essential site functionality, analytics, and advertising. Third-party services
            such as <strong>Google Analytics</strong> and <strong>Google AdSense</strong> may place cookies on
            your device to collect anonymous usage data and serve personalized ads. You can manage cookie
            preferences in your browser settings. For more details, visit our{" "}
            <Link href="/cookie-policy" className="text-accent-light hover:text-foreground">Cookie Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">5. Third-Party Advertising (Google AdSense)</h2>
          <p>
            We use Google AdSense to display ads. Google and its partners may use cookies to serve ads based
            on your prior visits to our website or other websites. Google&apos;s use of advertising cookies
            enables it and its partners to serve ads based on your browsing history. You may opt out of
            personalized advertising by visiting{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-light hover:text-foreground"
            >
              Google Ads Settings
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">6. Third-Party Analytics (Google Analytics)</h2>
          <p>
            We use Google Analytics to understand website traffic and usage patterns. Google Analytics
            collects data such as how often users visit the site, what pages they view, and what other sites
            they visited prior. We use this data solely to improve our website. Google Analytics collects
            only the IP address assigned to you on the date you visit our site, rather than your name or
            other identifying information. You can opt out by installing the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-light hover:text-foreground"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">7. Data Sharing and Disclosure</h2>
          <p>
            We do not sell your personal information. We may share data with trusted third-party service
            providers (analytics, advertising, hosting) who assist in operating our website. These providers
            are bound by their own privacy policies. We may also disclose information when required by law,
            to enforce our terms, or to protect our rights.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">8. Data Retention</h2>
          <p>
            We retain collected data only for as long as necessary to fulfill the purposes outlined in this
            policy. Analytics data is retained according to the default retention settings of our analytics
            provider. Contact emails are kept as long as necessary to address your inquiry.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">9. Your Rights</h2>
          <p className="mb-2">
            Depending on your location, you may have the following rights regarding your personal data:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong>Access</strong> — request a copy of the data we hold about you.</li>
            <li><strong>Correction</strong> — request correction of inaccurate data.</li>
            <li><strong>Deletion</strong> — request deletion of your personal data.</li>
            <li><strong>Opt-out</strong> — opt out of personalized advertising or analytics tracking.</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, please contact us via our{" "}
            <Link href="/contact" className="text-accent-light hover:text-foreground">Contact page</Link>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">10. Children&apos;s Privacy</h2>
          <p>
            Our website is not directed to children under the age of 13. We do not knowingly collect
            personal information from children. If you believe a child has provided us with personal
            information, please contact us and we will promptly delete it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">11. Security</h2>
          <p>
            We take reasonable measures to protect the information collected through our website. However, no
            method of transmission over the Internet is 100% secure, and we cannot guarantee absolute
            security.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an
            updated &quot;Last updated&quot; date. We encourage you to review this page periodically.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">13. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please reach us via our{" "}
            <Link href="/contact" className="text-accent-light hover:text-foreground">Contact page</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
