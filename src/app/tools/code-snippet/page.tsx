import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import CodeSnippetTool from "@/components/code-snippet-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "HTML CSS JS Playground – Live Code Preview Online Free",
  description:
    "Write HTML, CSS, and JavaScript in separate editors and see a live sandboxed preview update in real time. Free online code playground — no signup, no server, runs entirely in your browser.",
  keywords: [
    "html css js playground online free",
    "live html preview online",
    "codepen alternative free no login",
    "online code playground html css javascript",
    "front end code sandbox browser",
    "html css javascript editor online",
    "live code editor no signup",
    "test html css js online",
  ],
  alternates: { canonical: "/tools/code-snippet" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "HTML CSS JS Playground – Live Code Preview Online | ToolMint",
    description:
      "Write HTML, CSS, and JavaScript and see an instant live preview. Free in-browser playground — no signup needed.",
    url: "/tools/code-snippet",
  },
  twitter: { card: "summary_large_image" },
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
      <WebAppSchema slug="code-snippet" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="dev-tool-page mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Developer Tools", href: "/tools/developer-tools" },
            { name: "Code Snippet Playground" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Code Snippet Playground – Live HTML, CSS & JS Preview
        </h1>

        <ProcessingBadge slug="code-snippet" />
        <ToolAnalytics slug="code-snippet" category="developer" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Three separate editors — HTML, CSS, and JavaScript — with a sandboxed live preview
          that updates in real time as you type. No run button, no backend, no signup. The
          perfect front-end prototyping tool for quick snippets.
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              What You Can Build and Test in This Playground
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The playground is a sandboxed browser environment that executes real HTML, CSS,
              and JavaScript — the same languages the browser uses to render every website.
              Use it to prototype UI components without setting up a project, test a CSS
              layout or animation before copying it into production code, verify a JavaScript
              function works as expected, reproduce a bug from Stack Overflow to understand it,
              try out a CDN-hosted library like Chart.js or Alpine.js without installing anything,
              and share a minimal reproducible example when asking for help. It is especially
              useful for students and learners who want to experiment without configuring a
              local development environment. Add a Tailwind CSS CDN link in the HTML panel and
              you have a Tailwind prototyping environment in two seconds — no install, no build
              step, no configuration.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How the Sandbox Isolation Works
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The live preview renders inside an
              <code className="rounded bg-white/10 px-1 text-xs">&lt;iframe&gt;</code> with the
              <code className="rounded bg-white/10 px-1 text-xs">sandbox="allow-scripts"</code> attribute. This means the
              preview can run JavaScript but cannot: read or write cookies, access localStorage
              of the parent page, submit forms, navigate the parent window, or make same-origin
              requests to the parent&apos;s domain. It is the same isolation model used by CodePen and
              JSFiddle. The consequence for you as a user: you cannot accidentally break your
              browser session by running bad code in the playground — the worst that can happen
              is the preview crashes, which you fix by editing the code. Cross-origin network
              requests (fetching from an external API) do work if the target server sends CORS
              headers. If you need to test fetch() calls, use a public API with CORS enabled or
              add the CDN library for mocking.
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

        <RelatedTools slug="code-snippet" />
      </main>
    </>
  );
}
