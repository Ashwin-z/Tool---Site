"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PyodideInstance = {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (options: { batched?: (message: string) => void }) => void;
  setStderr: (options: { batched?: (message: string) => void }) => void;
  setStdin: (options: { stdin?: () => string | undefined }) => void;
};

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInstance>;
  }
}

const PYODIDE_VERSION = "0.27.7";
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const STORAGE_CODE_KEY = "toolmint-python-editor-code";
const STORAGE_INPUT_KEY = "toolmint-python-editor-stdin";

const SAMPLE_SNIPPETS = {
  hello: {
    label: "Hello World",
    code: `print("Hello from ToolMint Python")\nfor index in range(1, 4):\n    print(f"Line {index}")`,
    stdin: "",
  },
  sum: {
    label: "Input + Sum",
    code: `def add(a, b):\n    return a + b\n\na = int(input("Enter first number: "))\nb = int(input("Enter second number: "))\n\nprint(f"Sum of {a} and {b} is {add(a, b)}")`,
    stdin: "12\n30",
  },
  fibonacci: {
    label: "Fibonacci",
    code: `count = int(input("How many numbers? "))\na, b = 0, 1\nvalues = []\n\nfor _ in range(count):\n    values.append(a)\n    a, b = b, a + b\n\nprint("Fibonacci:", values)`,
    stdin: "10",
  },
} as const;

let pyodideScriptPromise: Promise<void> | null = null;

function ensurePyodideScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Pyodide is only available in the browser."));
  }

  if (window.loadPyodide) {
    return Promise.resolve();
  }

  if (!pyodideScriptPromise) {
    pyodideScriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-pyodide-loader="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load Pyodide.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = `${PYODIDE_INDEX_URL}pyodide.js`;
      script.async = true;
      script.dataset.pyodideLoader = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Pyodide."));
      document.head.appendChild(script);
    });
  }

  return pyodideScriptPromise;
}

function readStoredValue(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

function persistValue(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

function buildConsoleOutput(body: string, returnCode: number): string {
  const normalized = body.trimEnd();
  if (!normalized) {
    return `** Process exited - Return Code: ${returnCode} **`;
  }
  return `${normalized}\n\n** Process exited - Return Code: ${returnCode} **`;
}

function getLineIndent(line: string): string {
  const match = line.match(/^[ \t]*/);
  return match?.[0] ?? "";
}

export default function PythonCodeEditorTool() {
  const pyodideRef = useRef<PyodideInstance | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const [engineState, setEngineState] = useState<"loading" | "ready" | "error">("loading");
  const [runState, setRunState] = useState<"idle" | "running">("idle");
  const [statusMessage, setStatusMessage] = useState("Loading browser Python runtime...");
  const [code, setCode] = useState<string>(SAMPLE_SNIPPETS.sum.code);
  const [stdinValue, setStdinValue] = useState<string>(SAMPLE_SNIPPETS.sum.stdin);
  const [output, setOutput] = useState<string>("Run Python code in your browser. Output appears here.");
  const [selectedSample, setSelectedSample] = useState<keyof typeof SAMPLE_SNIPPETS>("sum");

  const isBusy = engineState !== "ready" || runState === "running";
  const lineNumbers = useMemo(() => {
    const total = Math.max(1, code.split("\n").length);
    return Array.from({ length: total }, (_, index) => index + 1);
  }, [code]);

  useEffect(() => {
    setCode(readStoredValue(STORAGE_CODE_KEY, SAMPLE_SNIPPETS.sum.code));
    setStdinValue(readStoredValue(STORAGE_INPUT_KEY, SAMPLE_SNIPPETS.sum.stdin));
  }, []);

  useEffect(() => {
    persistValue(STORAGE_CODE_KEY, code);
  }, [code]);

  useEffect(() => {
    persistValue(STORAGE_INPUT_KEY, stdinValue);
  }, [stdinValue]);

  useEffect(() => {
    let cancelled = false;

    async function loadEngine() {
      try {
        await ensurePyodideScript();
        if (!window.loadPyodide) {
          throw new Error("Pyodide loader is unavailable.");
        }
        const pyodide = await window.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
        if (cancelled) return;
        pyodideRef.current = pyodide;
        setEngineState("ready");
        setStatusMessage("Python runtime ready. Everything runs locally in your browser.");
      } catch (error) {
        if (cancelled) return;
        setEngineState("error");
        setStatusMessage(error instanceof Error ? error.message : "Failed to load browser Python runtime.");
      }
    }

    loadEngine();

    return () => {
      cancelled = true;
    };
  }, []);

  const exampleButtons = useMemo(
    () => Object.entries(SAMPLE_SNIPPETS) as Array<[keyof typeof SAMPLE_SNIPPETS, (typeof SAMPLE_SNIPPETS)[keyof typeof SAMPLE_SNIPPETS]]>,
    [],
  );

  const loadExample = (key: keyof typeof SAMPLE_SNIPPETS) => {
    setSelectedSample(key);
    setCode(SAMPLE_SNIPPETS[key].code);
    setStdinValue(SAMPLE_SNIPPETS[key].stdin);
    setOutput(`Loaded sample: ${SAMPLE_SNIPPETS[key].label}`);
  };

  const clearWorkspace = () => {
    setCode("");
    setStdinValue("");
    setOutput(buildConsoleOutput("Workspace cleared.", 0));
  };

  const updateCodeWithSelection = (nextValue: string, selectionStart: number, selectionEnd = selectionStart) => {
    setCode(nextValue);
    requestAnimationFrame(() => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      editor.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const editor = event.currentTarget;
    const { selectionStart, selectionEnd, value } = editor;
    const selectedText = value.slice(selectionStart, selectionEnd);
    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);
    const currentLineStart = before.lastIndexOf("\n") + 1;
    const currentLine = value.slice(currentLineStart, value.indexOf("\n", selectionStart) === -1 ? value.length : value.indexOf("\n", selectionStart));
    const indent = getLineIndent(currentLine);

    const wrapPairs: Record<string, string> = {
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
    };

    if (event.key === "Tab") {
      event.preventDefault();
      if (selectionStart !== selectionEnd) {
        const selectedBlock = value.slice(selectionStart, selectionEnd);
        const indentedBlock = selectedBlock
          .split("\n")
          .map((line) => `    ${line}`)
          .join("\n");
        const nextValue = `${before}${indentedBlock}${after}`;
        updateCodeWithSelection(nextValue, selectionStart + 4, selectionEnd + 4 * indentedBlock.split("\n").length);
        return;
      }
      const nextValue = `${before}    ${after}`;
      updateCodeWithSelection(nextValue, selectionStart + 4);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const shouldIndentMore = /:\s*$/.test(currentLine.trimEnd());
      const nextIndent = `${indent}${shouldIndentMore ? "    " : ""}`;
      const nextValue = `${before}\n${nextIndent}${after}`;
      updateCodeWithSelection(nextValue, selectionStart + 1 + nextIndent.length);
      return;
    }

    if (event.key === "Backspace" && selectionStart === selectionEnd) {
      const prevChar = value[selectionStart - 1];
      const nextChar = value[selectionStart];
      if ((prevChar === "(" && nextChar === ")") || (prevChar === "[" && nextChar === "]") || (prevChar === "{" && nextChar === "}") || (prevChar === '"' && nextChar === '"') || (prevChar === "'" && nextChar === "'")) {
        event.preventDefault();
        const nextValue = `${value.slice(0, selectionStart - 1)}${value.slice(selectionStart + 1)}`;
        updateCodeWithSelection(nextValue, selectionStart - 1);
      }
      return;
    }

    if (event.key in wrapPairs) {
      event.preventDefault();
      const closing = wrapPairs[event.key];
      const nextValue = `${before}${event.key}${selectedText}${closing}${after}`;
      const nextCursor = selectionStart + 1;
      const selectionOffset = selectedText.length ? nextCursor + selectedText.length : nextCursor;
      updateCodeWithSelection(nextValue, nextCursor, selectionOffset);
      return;
    }
  };

  const handleEditorScroll = () => {
    if (!editorRef.current || !gutterRef.current) return;
    gutterRef.current.scrollTop = editorRef.current.scrollTop;
  };

  const runCode = async () => {
    const pyodide = pyodideRef.current;
    if (!pyodide || engineState !== "ready") return;

    setRunState("running");
    setStatusMessage("Executing Python code in the browser...");

    let stdoutBuffer = "";
    let returnCode = 0;
    const stdinLines = stdinValue.replace(/\r/g, "").split("\n");
    let stdinIndex = 0;

    const appendOutput = (message: string) => {
      stdoutBuffer = stdoutBuffer ? `${stdoutBuffer}\n${message}` : message;
      setOutput(stdoutBuffer);
    };

    try {
      setOutput("");
      pyodide.setStdout({
        batched: (message) => appendOutput(message),
      });
      pyodide.setStderr({
        batched: (message) => appendOutput(message),
      });
      pyodide.setStdin({
        stdin: () => {
          if (stdinIndex >= stdinLines.length) {
            throw new Error("Standard input exhausted. Add more lines in the Input panel.");
          }
          const line = stdinLines[stdinIndex];
          stdinIndex += 1;
          return line;
        },
      });

      await pyodide.runPythonAsync(code);

      setOutput(buildConsoleOutput(stdoutBuffer, 0));
      setStatusMessage("Execution finished successfully.");
    } catch (error) {
      returnCode = 1;
      const message = error instanceof Error ? error.message : "Python execution failed.";
      stdoutBuffer = stdoutBuffer ? `${stdoutBuffer}\n${message}` : message;
      setOutput(buildConsoleOutput(stdoutBuffer, returnCode));
      setStatusMessage("Execution finished with an error.");
    } finally {
      setRunState("idle");
    }
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
      <div className="border-b border-border bg-surface-1 px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8cb8ff]">Client-Side Python</div>
            <h2 className="mt-1 text-xl font-semibold text-white md:text-2xl">Python Code Editor</h2>
            <p className="mt-1 text-sm text-muted">
              Runs entirely in your browser with Pyodide. No server execution, no backend session.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {exampleButtons.map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => loadExample(key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selectedSample === key
                    ? "border-[#4d9fff]/60 bg-[#4d9fff]/15 text-[#9cc7ff]"
                    : "border-border bg-surface-2 text-muted hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-surface-2 px-4 py-3 md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-muted">{statusMessage}</div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={runCode}
              disabled={isBusy}
              className="rounded-full bg-[#4d9fff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3d8fef] disabled:cursor-not-allowed disabled:bg-[#41556f]"
            >
              {runState === "running" ? "Running..." : engineState === "loading" ? "Loading runtime..." : "Run Python"}
            </button>
            <button
              type="button"
              onClick={() => setOutput("")}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-white transition hover:bg-surface-2"
            >
              Clear output
            </button>
            <button
              type="button"
              onClick={clearWorkspace}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-white transition hover:bg-surface-2"
            >
              Clear workspace
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border-b border-border xl:border-b-0 xl:border-r">
          <div className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8c8ea6]">
            main.py
          </div>
          <div className="flex min-h-[560px] bg-[#0f1320]">
            <div
              ref={gutterRef}
              className="w-14 shrink-0 overflow-hidden border-r border-white/5 bg-[#0b1020] px-2 py-4 text-right font-mono text-sm leading-7 text-[#5c6885]"
              aria-hidden="true"
            >
              {lineNumbers.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
            <textarea
              ref={editorRef}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={handleEditorKeyDown}
              onScroll={handleEditorScroll}
              spellCheck={false}
              className="min-h-[560px] w-full resize-y border-0 bg-[#0f1320] px-4 py-4 font-mono text-sm leading-7 text-[#dbe7ff] outline-none"
              placeholder="print('Hello, Python')"
            />
          </div>
        </div>

        <div className="grid grid-rows-[auto_auto_1fr]">
          <div className="border-b border-border px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c8ea6]">Input</div>
            <p className="mt-1 text-xs text-muted">Each line is consumed by one call to input().</p>
            <textarea
              value={stdinValue}
              onChange={(event) => setStdinValue(event.target.value)}
              spellCheck={false}
              className="mt-3 min-h-[120px] w-full resize-y rounded-xl border border-border bg-[#0f1320] px-3 py-3 font-mono text-sm leading-6 text-[#dbe7ff] outline-none"
              placeholder="12&#10;30"
            />
          </div>

          <div className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8c8ea6]">
            Output Console
          </div>

          <pre className="min-h-[320px] overflow-auto bg-[#070b14] px-4 py-4 font-mono text-sm leading-6 text-[#cde3ff] whitespace-pre-wrap break-words">
            {output}
          </pre>
        </div>
      </div>
    </section>
  );
}