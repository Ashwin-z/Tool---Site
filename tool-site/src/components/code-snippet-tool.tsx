"use client";

import { useMemo, useState } from "react";

const SAMPLE_HTML = `<div class="card">
  <h2>Hello, ToolCraft 👋</h2>
  <p>Edit HTML, CSS, and JS to see live preview.</p>
  <button id="actionBtn">Click me</button>
  <p id="output"></p>
</div>`;

const SAMPLE_CSS = `:root {
  color-scheme: dark;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  background: #0f1220;
  color: #f4f6ff;
  display: grid;
  place-items: center;
  min-height: 100vh;
}

.card {
  width: min(460px, 92vw);
  background: #1a1f35;
  border: 1px solid #2b3358;
  border-radius: 14px;
  padding: 20px;
}

h2 {
  margin: 0 0 8px;
}

p {
  margin: 0 0 12px;
  line-height: 1.6;
}

button {
  border: 1px solid #3d4b80;
  background: #29335f;
  color: #fff;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
}`;

const SAMPLE_JS = `const button = document.getElementById("actionBtn");
const output = document.getElementById("output");

let count = 0;

button?.addEventListener("click", () => {
  count += 1;
  if (output) {
    output.textContent = "You clicked " + count + " time" + (count === 1 ? "" : "s") + ".";
  }
});`;

function escapeClosingTag(value: string, tagName: string): string {
  const pattern = new RegExp(`</${tagName}`, "gi");
  return value.replace(pattern, `<\\/${tagName}`);
}

export default function CodeSnippetTool() {
  const [htmlCode, setHtmlCode] = useState<string>(SAMPLE_HTML);
  const [cssCode, setCssCode] = useState<string>(SAMPLE_CSS);
  const [jsCode, setJsCode] = useState<string>(SAMPLE_JS);

  const srcDoc = useMemo(() => {
    const safeCss = escapeClosingTag(cssCode, "style");
    const safeJs = escapeClosingTag(jsCode, "script");

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${safeCss}</style>
  </head>
  <body>
    ${htmlCode}
    <script>${safeJs}</script>
  </body>
</html>`;
  }, [htmlCode, cssCode, jsCode]);

  const clearAll = () => {
    setHtmlCode("");
    setCssCode("");
    setJsCode("");
  };

  const loadSample = () => {
    setHtmlCode(SAMPLE_HTML);
    setCssCode(SAMPLE_CSS);
    setJsCode(SAMPLE_JS);
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-surface-1">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Write snippets and watch preview update in real time.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSample}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold transition hover:opacity-90"
          >
            Load sample
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold transition hover:opacity-90"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
        <div className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="grid grid-cols-1 divide-y divide-border">
            <label className="block p-4">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-2)" }}>
                HTML
              </span>
              <textarea
                value={htmlCode}
                onChange={(event) => setHtmlCode(event.target.value)}
                spellCheck={false}
                className="h-44 w-full resize-y rounded-xl border border-border bg-surface-2 p-3 font-mono text-sm outline-none transition focus:ring-1"
                style={{ color: "var(--foreground)" }}
                placeholder="<h1>Hello</h1>"
              />
            </label>

            <label className="block p-4">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-2)" }}>
                CSS
              </span>
              <textarea
                value={cssCode}
                onChange={(event) => setCssCode(event.target.value)}
                spellCheck={false}
                className="h-44 w-full resize-y rounded-xl border border-border bg-surface-2 p-3 font-mono text-sm outline-none transition focus:ring-1"
                style={{ color: "var(--foreground)" }}
                placeholder="body { font-family: system-ui; }"
              />
            </label>

            <label className="block p-4">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-2)" }}>
                JavaScript
              </span>
              <textarea
                value={jsCode}
                onChange={(event) => setJsCode(event.target.value)}
                spellCheck={false}
                className="h-44 w-full resize-y rounded-xl border border-border bg-surface-2 p-3 font-mono text-sm outline-none transition focus:ring-1"
                style={{ color: "var(--foreground)" }}
                placeholder="console.log('Hello world');"
              />
            </label>
          </div>
        </div>

        <div className="flex min-h-[640px] flex-col">
          <div className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-2)" }}>
            Live Preview
          </div>
          <iframe
            title="Code snippet preview"
            sandbox="allow-scripts"
            srcDoc={srcDoc}
            className="h-full min-h-[590px] w-full bg-white"
          />
        </div>
      </div>
    </section>
  );
}