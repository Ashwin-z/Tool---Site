import type { Metadata } from "next";
import Link from "next/link";
import WifiSpeedCheckerTool from "@/components/wifi-speed-checker-tool";

export const metadata: Metadata = {
  title: "Internet Speed Test — Download, Upload, Ping, Jitter & IP | ToolMint",
  description:
    "Measure download speed, upload speed, ping, and jitter in your browser with ToolMint's Internet Speed Test. Includes IP, ISP, server details, a live gauge, and Cloudflare-based test endpoints.",
  keywords: [
    "internet speed test",
    "wifi speed checker",
    "download speed test",
    "upload speed test",
    "ping test",
    "jitter test",
    "browser speed test",
    "internet speed checker",
    "cloudflare speed test",
    "ip and isp test",
    "wifi speed test online",
    "toolmint speed test",
  ],
  alternates: { canonical: "/tools/wifi-speed-checker" },
  openGraph: {
    title: "Internet Speed Test — Download, Upload, Ping, Jitter & IP | ToolMint",
    description:
      "Test download, upload, ping, and jitter from your browser with live gauge feedback plus IP, ISP, and server details.",
    url: "/tools/wifi-speed-checker",
  },
};

const includedTools = [
  {
    title: "Ping & Jitter Test",
    desc: "Measures latency across multiple rounds, then calculates jitter from the variation between consecutive ping results.",
  },
  {
    title: "Download Speed Test",
    desc: "Uses progressive Cloudflare download chunks to estimate your real browser download speed with live progress updates.",
  },
  {
    title: "Upload Speed Test",
    desc: "Generates random payloads in the browser and measures upload throughput against test endpoints for a realistic upload result.",
  },
  {
    title: "Connection Details & Gauge",
    desc: "Shows your public IP address, ISP metadata, test server details, and a live SVG speed gauge that updates during each phase.",
  },
];

const steps = [
  { title: "Start the test", desc: "Launch the speed test to begin the full sequence of ping, download, and upload checks from your browser." },
  { title: "Wait for each phase", desc: "The tool runs ping, download, and upload tests in order, with live progress indicators and gauge feedback during each stage." },
  { title: "Review the metrics", desc: "Check your ping, jitter, download speed, and upload speed once the test finishes." },
  { title: "Inspect connection info", desc: "Use the built-in IP, ISP, and server information to understand where the test ran and what connection it measured." },
];

const faqs = [
  {
    q: "What does this internet speed test measure?",
    a: "ToolMint's Internet Speed Test measures 4 core metrics: ping, jitter, download speed, and upload speed. It also displays your IP address, ISP details, and the server information used for the test.",
  },
  {
    q: "How is download speed measured?",
    a: "The tool requests progressive download chunks from Cloudflare speed test endpoints and counts transferred bytes using the browser stream reader API. That lets it estimate throughput in Mbps based on real browser network activity.",
  },
  {
    q: "How is upload speed measured?",
    a: "The upload test creates random payloads in the browser using crypto.getRandomValues() and measures how quickly they can be sent to the test endpoint. This provides a practical upload throughput estimate.",
  },
  {
    q: "What is jitter?",
    a: "Jitter is the variation between consecutive ping times. Even if your average ping looks fine, high jitter can cause lag spikes in gaming, video calls, and real-time streaming. The tool calculates jitter after multiple ping rounds.",
  },
  {
    q: "Does the test require an app or plugin?",
    a: "No. Everything runs directly in your browser using standard web APIs and Cloudflare speed test endpoints. You do not need to install anything to measure your connection.",
  },
];

export default function WifiSpeedCheckerPage() {
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
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Internet Speed Test — Download, Upload, Ping &amp; Jitter
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Test your download speed, upload speed, ping, and jitter directly from your browser. ToolMint
          also shows your IP address, ISP metadata, server details, and a live gauge while the test runs,
          using Cloudflare speed test endpoints for the underlying measurements.
        </p>

        <div className="mt-8">
          <WifiSpeedCheckerTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Internet Speed Test Tools
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
            How to Run the Speed Test
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{index + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <dt className="font-semibold text-foreground">{faq.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}
