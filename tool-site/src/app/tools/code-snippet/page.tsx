import type { Metadata } from "next";
import Link from "next/link";
import CodeSnippetTool from "@/components/code-snippet-tool";

export const metadata: Metadata = {
  title: "Code Snippet Playground — Live HTML, CSS & JS Preview Online | ToolMint",
  description:
    "Write HTML, CSS, and JavaScript in separate editors and see a live sandboxed preview update in real time. Free online code playground — no signup, no server, runs entirely in your browser.",
  keywords: [
    "code playground",
    "html css js playground",
    "live code preview",
    "online code editor",
    "html playground online",
    "css playground",
    "javascript playground",
    "codepen alternative",
    "live html preview",
    "front end playground",
    "html editor online",
    "web code sandbox",
  ],
  alternates: { canonical: "/tools/code-snippet" },
  openGraph: {
    title: "Code Snippet Playground — Live HTML, CSS & JS Preview | ToolMint",
    description:
      "Write HTML, CSS, and JavaScript and see an instant live preview. Free in-browser playground — no signup needed.",
    url: "/tools/code-snippet",
  },
};

const includedTools = [
  { title: "HTML Editor", desc: "Write or paste HTML markup with automatic tag and closing behavior." },
  { title: "CSS Editor", desc: "Add styles in a dedicated CSS panel applied live to your HTML output." },
  { title: "JavaScript Editor", desc: "Write JS logic that runs directly inside the sandboxed preview iframe." },
  { title: "Live Preview", desc: "Sandboxed iframe updates in real time as you type — no run button needed." },
];

const steps = [
  { title: "Write your HTML", desc: "Type or paste HTML into the HTML editor panel. The preview updates instantly as you type." },
  { title: "Add CSS styles", desc: "Switch to the CSS panel and style your elements — changes apply live to the preview." },
  { title: "Add JavaScript", desc: "Open the JS panel to add interactivity. Scripts run inside a sandboxed iframe with no access to your page." },
  { title: "Load a sample", desc: "Click 'Load sample' to see a prebuilt demo with a styled card and click counter, then remix it." },
];

const faqs = [
  {
    q: "Is this a CodePen alternative?",
    a: "Yes. ToolMint's Code Snippet Playground provides the same HTML/CSS/JS split-pane live preview experience, entirely in your browser with no login required.",
  },
  {
    q: "Does the JavaScript run securely?",
    a: "Yes. The preview iframe is sandboxed with allow-scripts only — no cookies, no form submission, no same-origin access. Your page and the preview are fully isolated.",
  },
  {
    q: "Does the preview auto-update as I type?",
    a: "Yes. There is no Run button — the iframe re-renders as you type in any of the three editors.",
  },
  {
    q: "Can I load external libraries like jQuery or Tailwind?",
    a: "Yes. Add a script src or link rel=stylesheet tag in the HTML editor to pull in any CDN-hosted library.",
  },
  {
    q: "Is my code saved between sessions?",
    a: "The code is kept in memory while the tab is open. Refresh or close the tab to start fresh.",
  },
];

export default function CodeSnippetPage() {
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
      <main className="dev-tool-page mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Code Snippet Playground — Live HTML, CSS &amp; JS Preview
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Three separate editors — HTML, CSS, and JavaScript — with a sandboxed live preview that updates in real time
          as you type. No run button, no backend, no signup. The perfect front-end prototyping tool for quick snippets.
        </p>

        <div className="mt-8">
          <CodeSnippetTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Editor Panels
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
            How to Use the Code Playground
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