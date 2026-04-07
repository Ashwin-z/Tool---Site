import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | ToolMint",
  description:
    "Read the terms governing your use of ToolMint's free online tools, including user obligations, intellectual property, and liability limitations.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | ToolMint",
    description:
      "Read the terms governing your use of ToolMint's free online tools, including user obligations, intellectual property, and liability limitations.",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-foreground">
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">Terms of Service</h1>
      <p className="mt-3 text-sm leading-7 text-muted">Last updated: March 29, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-foreground/75">
        <section>
          <h2 className="font-display text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ToolMint (&quot;the website&quot;), you agree to be bound by these Terms
            of Service. If you do not agree to these terms, please do not use the website. We reserve the
            right to update these terms at any time, and continued use after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">2. Description of Service</h2>
          <p>
            ToolMint provides free browser-based tools for PDF processing, image editing, text manipulation,
            calculations, code formatting, SEO analysis, and document generation. Most tools operate entirely
            in your browser. Some tools may use server-side processing, which is described on the respective
            tool page.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">3. User Obligations</h2>
          <p className="mb-2">When using ToolMint, you agree to:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Use the tools only for lawful purposes and in compliance with applicable laws.</li>
            <li>Not attempt to disrupt, overload, or interfere with the website&apos;s operation.</li>
            <li>Not use automated scripts, bots, or scrapers to access the website excessively.</li>
            <li>Not attempt to gain unauthorized access to any part of the website or its systems.</li>
            <li>Not upload malicious files intended to damage or exploit the service.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">4. Intellectual Property</h2>
          <p>
            The ToolMint name, logo, website design, code, and content are the intellectual property of
            ToolMint. You may not reproduce, distribute, or create derivative works from our website content
            without prior written permission. Files you upload and process remain your property — we do not
            claim any ownership over user content.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">5. No Warranty</h2>
          <p>
            All tools and services are provided &quot;as is&quot; and &quot;as available&quot; without
            warranties of any kind, either express or implied, including but not limited to fitness for a
            particular purpose, accuracy, or reliability of outputs. We do not guarantee that the tools will
            be error-free or uninterrupted.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">6. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, ToolMint and its operators shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising from your use of or
            inability to use the website, including but not limited to loss of data, revenue, or profits,
            even if we have been advised of the possibility of such damages.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">7. Third-Party Content and Links</h2>
          <p>
            Our website may contain links to third-party websites or integrate third-party services
            (advertising, analytics). We are not responsible for the content, privacy practices, or terms of
            any third-party websites or services.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">8. Advertising</h2>
          <p>
            ToolMint displays third-party advertisements to support the free availability of our tools. Ad
            content is provided by third-party networks and does not constitute endorsement by ToolMint. Your
            interaction with advertisers and any resulting transactions are solely between you and the
            advertiser.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">9. Termination</h2>
          <p>
            We reserve the right to restrict or terminate access to the website for any user who violates
            these terms or engages in behavior that may harm the service or other users, without prior
            notice.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">10. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with applicable laws. Any disputes
            arising from these terms or your use of the website shall be resolved in the appropriate courts
            of the jurisdiction in which the website operator resides.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">11. Changes to These Terms</h2>
          <p>
            We may modify these Terms of Service at any time. Changes will be posted on this page with an
            updated date. Your continued use of the website after changes are posted constitutes your
            acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">12. Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please reach us via our{" "}
            <Link href="/contact" className="text-accent-light hover:text-foreground">Contact page</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
