import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import WifiSpeedCheckerTool from "@/components/wifi-speed-checker-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Internet Speed Test – Check WiFi Speed, Ping & Jitter Free",
  description:
    "Test your internet download speed, upload speed, ping, and jitter free in your browser. Shows IP, ISP, and server details with a live speed gauge. No app required.",
  keywords: [
    "internet speed test online free",
    "wifi speed checker free",
    "check internet speed online",
    "download speed test online free",
    "ping test online free",
    "upload speed test browser",
    "check ping and jitter online",
    "internet speed test no download",
  ],
  alternates: { canonical: "/tools/wifi-speed-checker" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Internet Speed Test – Check WiFi Speed, Ping & Jitter Free | ToolMint",
    description:
      "Test download, upload, ping, and jitter from your browser with live gauge feedback plus IP, ISP, and server details.",
    url: "/tools/wifi-speed-checker",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Ping & Jitter Test", desc: "Measures latency across multiple rounds, then calculates jitter from the variation between consecutive ping results." },
  { title: "Download Speed Test", desc: "Uses progressive Cloudflare download chunks to estimate your real browser download speed with live progress updates." },
  { title: "Upload Speed Test", desc: "Generates random payloads in the browser and measures upload throughput against test endpoints for a realistic upload result." },
  { title: "Connection Details & Gauge", desc: "Shows your public IP address, ISP metadata, test server details, and a live SVG speed gauge that updates during each phase." },
];

const useCases = [
  { title: "Troubleshooting Slow Internet", desc: "Run the speed test before and after rebooting your router, changing WiFi bands, or adjusting network settings to measure the actual improvement." },
  { title: "ISP Billing Verification", desc: "Check whether you are getting the download and upload speeds advertised in your plan. Test at different times to identify peak-hour throttling." },
  { title: "Remote Work & Video Calls", desc: "Check ping and jitter before important meetings. High jitter (even with acceptable ping) causes voice and video to stutter on calls." },
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
      <WebAppSchema slug="wifi-speed-checker" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Internet Speed Test" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Internet Speed Test — Download, Upload, Ping &amp; Jitter
        </h1>

        <ProcessingBadge slug="wifi-speed-checker" />
        <ToolAnalytics slug="wifi-speed-checker" category="more" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Test your download speed, upload speed, ping, and jitter directly from your browser. Also
          shows your IP address, ISP metadata, server details, and a live gauge while the test runs,
          using Cloudflare speed test endpoints for the underlying measurements. No app needed.
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
            When to Run an Internet Speed Test
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {useCases.map((u) => (
              <div key={u.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{u.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{u.desc}</p>
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Understanding Your Speed Test Results – Mbps, Ping, and Jitter Explained
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Speed test results contain four numbers that together describe your internet connection.
              Download speed (in Mbps — megabits per second) measures how fast data travels from the
              internet to your device. This is what determines how quickly pages load, how smoothly
              videos stream, and how fast files download. For reference: 25 Mbps is the US FCC definition
              of &quot;broadband&quot; for a single user; 100 Mbps handles 4K streaming comfortably; 500+ Mbps
              is suitable for large households with multiple simultaneous users. Upload speed measures
              how fast data goes from your device to the internet — important for video calls, uploading
              files to cloud storage, and live streaming. Most home connections are asymmetric with much
              faster download than upload. Ping (latency) is the round-trip time in milliseconds between
              your device and the test server. Under 20ms is excellent; 20–50ms is good; 50–100ms is
              acceptable; above 100ms causes noticeable delay in video calls and gaming. Jitter is the
              variation in ping — a connection with average ping 30ms but jitter 40ms will have ping ranging
              from 10ms to 70ms, causing audio/video to stutter even though the average looks acceptable.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Why Your Speed Test Result May Differ from Your ISP&apos;s Advertised Speed
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              ISPs advertise &quot;up to&quot; speeds that represent the theoretical maximum under ideal conditions.
              Real-world speeds are almost always lower for several reasons. Network congestion during
              peak hours (evenings on weekdays) can reduce speeds significantly as many users in your
              area share the same infrastructure. WiFi signal quality matters enormously: a 5 GHz WiFi
              connection two rooms away will consistently underperform a wired Ethernet connection even
              if your plan speed is the same. Browser-based speed tests also introduce some overhead
              because they measure throughput through the browser&apos;s network stack rather than the raw
              connection speed — dedicated apps or iperf3 tests typically show slightly higher numbers.
              For the most accurate comparison with your plan speed, test via wired Ethernet during
              off-peak hours (early morning) and run the test 2–3 times and average the results. If
              you consistently get less than 70–80% of your advertised speed under those conditions,
              contact your ISP with the test results as evidence.
            </p>
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

        <RelatedTools slug="wifi-speed-checker" />
      </main>
    </>
  );
}
