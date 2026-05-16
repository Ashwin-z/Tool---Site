import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import PythonCodeEditorTool from "@/components/python-code-editor-tool-loader";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Python Code Editor – Run Python Online Without Installing Anything",
  description:
    "Write and run Python code directly in your browser. Powered by Pyodide (WebAssembly CPython) with stdin simulation, output console, and auto-saved workspace. No install, no signup, free.",
  keywords: [
    "run python online without install",
    "python online compiler free",
    "python code editor browser",
    "python playground online free",
    "execute python code online",
    "python editor no download",
    "online python interpreter free",
    "pyodide python browser editor",
  ],
  alternates: { canonical: "/tools/python-code-editor" },
  openGraph: {
    title: "Python Code Editor – Run Python Online Free in Browser | ToolMint",
    description:
      "Write and run Python right in your browser. Powered by Pyodide — no install, no server, with stdin simulation and output console.",
    url: "/tools/python-code-editor",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Python Code Editor", desc: "Full-height editor with line numbers, auto-indent, tab-to-spaces, and bracket auto-pairing." },
  { title: "Stdin Input Simulator", desc: "Provide multi-line standard input — each line feeds one input() call in your program in order." },
  { title: "Output Console", desc: "Preformatted console showing stdout, stderr, and the process return code after every run." },
  { title: "Sample Code Snippets", desc: "Load Hello World, Input & Sum, or Fibonacci examples to get started instantly." },
];

const steps = [
  { title: "Write or paste Python", desc: "Type your Python code in the editor. Auto-indent and bracket pairing help you code faster." },
  { title: "Add input values", desc: "If your code calls input(), put each value on a new line in the Input panel below the editor." },
  { title: "Click Run Python", desc: "Pyodide (WebAssembly CPython) executes your code locally — no internet connection needed after load." },
  { title: "Read the output", desc: "Stdout and stderr appear in the Output Console along with the process return code." },
];

const faqs = [
  {
    q: "How does Python run without a server?",
    a: "ToolMint uses Pyodide — a full CPython interpreter compiled to WebAssembly. It runs natively in your browser tab with no backend server involved.",
  },
  {
    q: "Can I simulate user input with input()?",
    a: "Yes. Type each input value on a separate line in the Input panel. The editor intercepts input() calls and feeds them from your provided lines in order.",
  },
  {
    q: "Is my code saved if I refresh the page?",
    a: "Yes. Both your code and stdin values are automatically persisted to localStorage and restored on your next visit.",
  },
  {
    q: "Can I use Python libraries like math or random?",
    a: "Yes. The Python standard library is fully available via Pyodide. Third-party packages that ship with Pyodide (like numpy) can also be imported.",
  },
  {
    q: "Why does the first run take a moment?",
    a: "On first load, Pyodide downloads the WebAssembly CPython runtime. Subsequent runs on the same page are instant.",
  },
];

export default function PythonCodeEditorPage() {
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
      <WebAppSchema slug="python-code-editor" />
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
            { name: "Python Code Editor" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Python Code Editor – Run Python in Your Browser
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted md:text-base">
          Write and execute Python code entirely in your browser — powered by Pyodide
          (WebAssembly CPython). Simulate stdin input, view stdout and stderr in a clean
          console, and keep your workspace auto-saved between sessions. No installation,
          no server, no account needed.
        </p>

        <div className="mt-8">
          <PythonCodeEditorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Python Editor Features
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
            How to Run Python in Your Browser
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
              How Pyodide Runs Python in the Browser Without a Server
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Traditional online Python compilers send your code to a server, execute it there,
              and return the output over the network — which means latency, rate limits, and
              privacy concerns about your code leaving your device. Pyodide takes a completely
              different approach: it compiles CPython (the same interpreter you install locally)
              to WebAssembly, which is a binary instruction format that modern browsers can run
              natively at near-native speed. When you click &quot;Run Python,&quot; your code executes
              inside your own browser tab — the same process as your JavaScript. No network
              request is made. The Python standard library is bundled with Pyodide and available
              immediately: <code className="rounded bg-white/10 px-1 text-xs">import math</code>,
              <code className="rounded bg-white/10 px-1 text-xs">import json</code>,
              <code className="rounded bg-white/10 px-1 text-xs">import random</code>,
              <code className="rounded bg-white/10 px-1 text-xs">import datetime</code> all work without any setup.
              The initial load takes a few seconds the first time because the WebAssembly
              runtime is downloaded (~10MB). After that, execution is instant.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Who This Python Editor Is Most Useful For
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Students learning Python: run code from a tutorial or textbook without installing
              Python locally. This removes the setup barrier that causes many beginners to give
              up before writing their first program. The stdin simulator handles practice
              problems that use <code className="rounded bg-white/10 px-1 text-xs">input()</code> — common in
              competitive programming and classroom exercises. Developers who need a quick
              scratchpad: test a data transformation, string manipulation, regex pattern, or
              algorithm without opening an IDE or terminal for a small throwaway script. Teachers
              and content creators: demonstrate Python concepts in a live, immediately runnable
              format without requiring students to have any local setup. The auto-save feature
              means returning students find their last code intact. Interview preparation: practice
              coding problems using the same syntax and standard library as the actual interview
              environment, with immediate output feedback on each run.
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

        <RelatedTools slug="python-code-editor" />
      </main>
    </>
  );
}
