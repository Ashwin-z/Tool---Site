"use client";

import { useState, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   FULL SCIENTIFIC CALCULATOR
   ═══════════════════════════════════════════════════════ */

type AngleUnit = "DEG" | "RAD";

/* ──────────── safe eval engine ──────────── */

const factorial = (n: number): number => {
  if (n < 0) return NaN;
  if (!Number.isInteger(n)) return gamma(n + 1);
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
};

/** Stirling-based gamma for non-integer factorial */
const gamma = (z: number): number => {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
};

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

function evaluate(expression: string, angleUnit: AngleUnit, ans: number): number {
  let expr = expression;

  // Replace display symbols with JS operators
  expr = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");

  // Replace Ans
  expr = expr.replace(/Ans/g, `(${ans})`);

  // Replace constants
  expr = expr.replace(/π/g, `(${Math.PI})`);
  expr = expr.replace(/e(?![x])/g, `(${Math.E})`);

  // Handle percentage: number% → (number/100)
  expr = expr.replace(/(\d+\.?\d*)%/g, "($1/100)");

  // Handle implied multiplication: 2π, 3(, )(
  expr = expr.replace(/(\d)(π|\()/g, "$1*$2");
  expr = expr.replace(/(\))([\d(π])/g, "$1*$2");

  // Process factorial: number!
  expr = expr.replace(/(\d+\.?\d*)!/g, "FACT($1)");

  // Trig functions with angle conversion
  const trigFns = ["sin", "cos", "tan"];
  const invTrigFns = ["asin", "acos", "atan"];

  // Inverse trig first (so we don't confuse sin with asin)
  for (const fn of invTrigFns) {
    const re = new RegExp(`${fn}\\(`, "g");
    if (angleUnit === "DEG") {
      expr = expr.replace(re, `DEG_${fn.toUpperCase()}(`);
    } else {
      expr = expr.replace(re, `Math.${fn}(`);
    }
  }

  // Regular trig
  for (const fn of trigFns) {
    const re = new RegExp(`(?<!a)${fn}\\(`, "g");
    if (angleUnit === "DEG") {
      expr = expr.replace(re, `Math.${fn}(TORAD(`);
      // We need to close the extra paren - handled below
    } else {
      expr = expr.replace(re, `Math.${fn}(`);
    }
  }

  // Other math functions
  expr = expr.replace(/ln\(/g, "Math.log(");
  expr = expr.replace(/log\(/g, "Math.log10(");
  expr = expr.replace(/√\(/g, "Math.sqrt(");
  expr = expr.replace(/∛\(/g, "Math.cbrt(");
  expr = expr.replace(/abs\(/g, "Math.abs(");
  expr = expr.replace(/10\^/g, "Math.pow(10,");
  expr = expr.replace(/e\^/g, "Math.pow(Math.E,");

  // Power operator
  expr = expr.replace(/\^/g, "**");

  // Build safe function scope
  const FACT = factorial;
  const TORAD = toRad;
  const DEG_ASIN = (x: number) => toDeg(Math.asin(x));
  const DEG_ACOS = (x: number) => toDeg(Math.acos(x));
  const DEG_ATAN = (x: number) => toDeg(Math.atan(x));

  // If we used TORAD wrappers for trig in DEG mode, we need to balance parens
  if (angleUnit === "DEG") {
    // Count TORAD occurrences and add closing parens
    const toRadCount = (expr.match(/TORAD\(/g) || []).length;
    // We need an extra ) for each TORAD( since we added Math.sin(TORAD(  but original had sin(x)
    // The user's closing paren closes TORAD, but we need another for Math.sin
    // Actually let's just balance — count open vs close
    const opens = (expr.match(/\(/g) || []).length;
    const closes = (expr.match(/\)/g) || []).length;
    for (let i = 0; i < opens - closes; i++) expr += ")";
  }

  // Count and balance remaining parens
  const opens = (expr.match(/\(/g) || []).length;
  const closes = (expr.match(/\)/g) || []).length;
  for (let i = 0; i < opens - closes; i++) expr += ")";

  // 10^ needs closing parens too
  const pow10Count = (expr.match(/Math\.pow\(10,/g) || []).length;
  const ePowCount = (expr.match(/Math\.pow\(Math\.E,/g) || []).length;
  for (let i = 0; i < pow10Count + ePowCount; i++) {
    // check if already balanced
    const o = (expr.match(/\(/g) || []).length;
    const c = (expr.match(/\)/g) || []).length;
    if (o > c) expr += ")";
  }

  try {
    // Use Function constructor with safe math context
    const fn = new Function(
      "Math",
      "FACT",
      "TORAD",
      "DEG_ASIN",
      "DEG_ACOS",
      "DEG_ATAN",
      `"use strict"; return (${expr});`
    );
    const result = fn(Math, FACT, TORAD, DEG_ASIN, DEG_ACOS, DEG_ATAN);
    if (typeof result !== "number") return NaN;
    return result;
  } catch {
    return NaN;
  }
}

/* ──────────── format result ──────────── */

const formatResult = (n: number): string => {
  if (Number.isNaN(n)) return "Error";
  if (!Number.isFinite(n)) return n > 0 ? "∞" : "-∞";
  if (Math.abs(n) > 1e15 || (Math.abs(n) < 1e-10 && n !== 0)) {
    return n.toExponential(8);
  }
  // Remove trailing zeros
  const s = parseFloat(n.toPrecision(12)).toString();
  return s;
};

/* ──────────── button definitions ──────────── */

type BtnType = "num" | "op" | "fn" | "action" | "mem" | "const" | "equal";

interface CalcBtn {
  label: string;
  type: BtnType;
  value?: string;  // what gets appended to expression
  action?: string;  // special action id
  span?: number;    // grid column span
  accent?: boolean;
}

const BUTTONS_ROW: CalcBtn[][] = [
  // Row 1 — Mode & memory
  [
    { label: "RAD", type: "action", action: "toggle-angle" },
    { label: "MC", type: "mem", action: "mc" },
    { label: "MR", type: "mem", action: "mr" },
    { label: "M+", type: "mem", action: "m+" },
    { label: "M−", type: "mem", action: "m-" },
  ],
  // Row 2 — Advanced functions
  [
    { label: "x!", type: "fn", value: "!" },
    { label: "sin", type: "fn", value: "sin(" },
    { label: "cos", type: "fn", value: "cos(" },
    { label: "tan", type: "fn", value: "tan(" },
    { label: "π", type: "const", value: "π" },
  ],
  // Row 3 — More functions
  [
    { label: "xʸ", type: "fn", value: "^" },
    { label: "sin⁻¹", type: "fn", value: "asin(" },
    { label: "cos⁻¹", type: "fn", value: "acos(" },
    { label: "tan⁻¹", type: "fn", value: "atan(" },
    { label: "e", type: "const", value: "e" },
  ],
  // Row 4 — Roots & logs
  [
    { label: "x²", type: "fn", value: "^2" },
    { label: "√", type: "fn", value: "√(" },
    { label: "∛", type: "fn", value: "∛(" },
    { label: "log", type: "fn", value: "log(" },
    { label: "ln", type: "fn", value: "ln(" },
  ],
  // Row 5 — Powers
  [
    { label: "x³", type: "fn", value: "^3" },
    { label: "10ˣ", type: "fn", value: "10^" },
    { label: "eˣ", type: "fn", value: "e^" },
    { label: "abs", type: "fn", value: "abs(" },
    { label: "%", type: "op", value: "%" },
  ],
  // Row 6 — Parens, clear, delete
  [
    { label: "(", type: "op", value: "(" },
    { label: ")", type: "op", value: ")" },
    { label: "Ans", type: "const", value: "Ans" },
    { label: "AC", type: "action", action: "ac" },
    { label: "⌫", type: "action", action: "del" },
  ],
  // Row 7 — Digits 7-9, ÷
  [
    { label: "7", type: "num", value: "7" },
    { label: "8", type: "num", value: "8" },
    { label: "9", type: "num", value: "9" },
    { label: "÷", type: "op", value: "÷" },
    { label: "1/x", type: "fn", value: "1÷" },
  ],
  // Row 8 — Digits 4-6, ×
  [
    { label: "4", type: "num", value: "4" },
    { label: "5", type: "num", value: "5" },
    { label: "6", type: "num", value: "6" },
    { label: "×", type: "op", value: "×" },
    { label: "mod", type: "op", value: "%" },
  ],
  // Row 9 — Digits 1-3, −
  [
    { label: "1", type: "num", value: "1" },
    { label: "2", type: "num", value: "2" },
    { label: "3", type: "num", value: "3" },
    { label: "−", type: "op", value: "−" },
    { label: "EXP", type: "fn", value: "e" },
  ],
  // Row 10 — 0, dot, neg, +, =
  [
    { label: "0", type: "num", value: "0" },
    { label: ".", type: "num", value: "." },
    { label: "±", type: "action", action: "negate" },
    { label: "+", type: "op", value: "+" },
    { label: "=", type: "equal", action: "eval", accent: true },
  ],
];

/* ──────────── styles ──────────── */

const btnStyle: Record<BtnType | "accent", string> = {
  num: "bg-[#1c1c28] hover:bg-[#252535] text-white border-border",
  op: "bg-[#1a1a2e] hover:bg-[#252540] text-[#ff6584] border-border font-bold",
  fn: "bg-[#131320] hover:bg-[#1a1a2e] text-[#a39cff] border-border text-xs",
  action: "bg-[#191925] hover:bg-[#252530] text-muted border-border",
  mem: "bg-surface hover:bg-[#1a1a25] text-[#38d9a9] border-border text-xs",
  const: "bg-[#131320] hover:bg-[#1a1a2e] text-[#ffa640] border-border",
  equal: "bg-[#6c63ff] hover:bg-[#5b53ee] text-white border-[#6c63ff]/50 font-bold",
  accent: "", // unused standalone
};

/* ──────────── component ──────────── */

export default function ScientificCalculatorTool() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [angleUnit, setAngleUnit] = useState<AngleUnit>("DEG");
  const [memory, setMemory] = useState(0);
  const [ans, setAns] = useState(0);
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);

  const appendToExpression = useCallback(
    (value: string) => {
      if (justEvaluated) {
        // If we just got a result and user types a number, start fresh
        // If user types an operator, continue from result
        const isOperator = ["+", "−", "×", "÷", "^", "%"].includes(value);
        if (isOperator) {
          setExpression(display + value);
          setDisplay(display + value);
        } else {
          setExpression(value);
          setDisplay(value);
        }
        setJustEvaluated(false);
      } else {
        const newExpr = expression === "0" && ![".", "("].includes(value) && !/\d/.test(value)
          ? value
          : expression === "0" && /\d/.test(value)
          ? value
          : expression + value;
        setExpression(newExpr);
        setDisplay(newExpr);
      }
    },
    [expression, display, justEvaluated]
  );

  const handleButton = useCallback(
    (btn: CalcBtn) => {
      // Action buttons
      if (btn.action) {
        switch (btn.action) {
          case "ac":
            setExpression("");
            setDisplay("0");
            setJustEvaluated(false);
            break;
          case "del":
            if (justEvaluated) {
              setExpression("");
              setDisplay("0");
              setJustEvaluated(false);
            } else {
              const newExpr = expression.slice(0, -1) || "";
              setExpression(newExpr);
              setDisplay(newExpr || "0");
            }
            break;
          case "toggle-angle":
            setAngleUnit((u) => (u === "DEG" ? "RAD" : "DEG"));
            break;
          case "mc":
            setMemory(0);
            break;
          case "mr":
            appendToExpression(String(memory));
            break;
          case "m+": {
            const val = justEvaluated ? parseFloat(display) || 0 : evaluate(expression, angleUnit, ans);
            setMemory((m) => m + val);
            break;
          }
          case "m-": {
            const val = justEvaluated ? parseFloat(display) || 0 : evaluate(expression, angleUnit, ans);
            setMemory((m) => m - val);
            break;
          }
          case "negate": {
            if (justEvaluated) {
              const neg = -parseFloat(display);
              setDisplay(formatResult(neg));
              setExpression(String(neg));
              setAns(neg);
            } else if (expression) {
              setExpression("(-" + expression + ")");
              setDisplay("(-" + expression + ")");
            }
            break;
          }
          case "eval": {
            if (!expression) return;
            const result = evaluate(expression, angleUnit, ans);
            const resultStr = formatResult(result);
            setHistory((h) => [{ expr: expression, result: resultStr }, ...h].slice(0, 20));
            setDisplay(resultStr);
            setExpression(resultStr === "Error" ? "" : resultStr);
            if (!Number.isNaN(result)) setAns(result);
            setJustEvaluated(true);
            break;
          }
        }
        return;
      }

      // Value buttons
      if (btn.value !== undefined) {
        appendToExpression(btn.value);
      }
    },
    [expression, display, angleUnit, ans, memory, justEvaluated, appendToExpression]
  );

  // Keyboard support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const key = e.key;
      if (/^\d$/.test(key) || key === ".") {
        e.preventDefault();
        appendToExpression(key);
      } else if (key === "+") {
        e.preventDefault();
        appendToExpression("+");
      } else if (key === "-") {
        e.preventDefault();
        appendToExpression("−");
      } else if (key === "*") {
        e.preventDefault();
        appendToExpression("×");
      } else if (key === "/") {
        e.preventDefault();
        appendToExpression("÷");
      } else if (key === "(" || key === ")") {
        e.preventDefault();
        appendToExpression(key);
      } else if (key === "^") {
        e.preventDefault();
        appendToExpression("^");
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleButton({ label: "=", type: "equal", action: "eval" });
      } else if (key === "Backspace") {
        e.preventDefault();
        handleButton({ label: "⌫", type: "action", action: "del" });
      } else if (key === "Escape") {
        e.preventDefault();
        handleButton({ label: "AC", type: "action", action: "ac" });
      }
    },
    [appendToExpression, handleButton]
  );

  return (
    <div className="mx-auto max-w-lg" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        {/* ── Display ── */}
        <div className="border-b border-border px-5 py-4">
          {/* Mode indicators */}
          <div className="mb-2 flex items-center gap-2 text-[10px]">
            <span
              className={`rounded px-1.5 py-0.5 font-semibold ${
                angleUnit === "DEG"
                  ? "bg-[#6c63ff]/20 text-[#a39cff]"
                  : "bg-amber-400/20 text-amber-300"
              }`}
            >
              {angleUnit}
            </span>
            {memory !== 0 && (
              <span className="rounded bg-[#38d9a9]/20 px-1.5 py-0.5 font-semibold text-[#38d9a9]">
                M = {formatResult(memory)}
              </span>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="ml-auto rounded px-1.5 py-0.5 text-muted transition hover:bg-surface-3 hover:text-foreground"
            >
              {showHistory ? "Calculator" : "History"}
            </button>
          </div>

          {showHistory ? (
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-xs text-muted-3">No history yet</p>
              ) : (
                history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setExpression(h.result === "Error" ? "" : h.result);
                      setDisplay(h.result);
                      setShowHistory(false);
                      setJustEvaluated(true);
                    }}
                    className="block w-full rounded-lg bg-surface-3/50 px-3 py-1.5 text-left transition hover:bg-surface-3"
                  >
                    <div className="text-[10px] text-muted truncate">{h.expr}</div>
                    <div className="font-display text-sm font-bold text-[#6c63ff]">= {h.result}</div>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div ref={displayRef}>
              {/* Expression line */}
              <div className="min-h-[20px] text-right text-xs text-muted truncate">
                {expression || "\u00A0"}
              </div>
              {/* Main display */}
              <div
                className={`text-right font-display font-bold leading-none tracking-tight ${
                  display.length > 16
                    ? "text-xl"
                    : display.length > 12
                    ? "text-2xl"
                    : display.length > 8
                    ? "text-3xl"
                    : "text-4xl"
                } ${
                  display === "Error"
                    ? "text-red-400"
                    : justEvaluated
                    ? "text-[#6c63ff]"
                    : "text-white"
                }`}
              >
                {display}
              </div>
            </div>
          )}
        </div>

        {/* ── Button grid ── */}
        <div className="p-2">
          {BUTTONS_ROW.map((row, ri) => (
            <div key={ri} className="grid grid-cols-5 gap-1 mb-1">
              {row.map((btn) => (
                <button
                  key={btn.label + ri}
                  onClick={() => handleButton(btn)}
                  className={`flex items-center justify-center rounded-lg border px-1 py-3 text-sm transition active:scale-95 ${
                    btn.accent
                      ? btnStyle.equal
                      : btnStyle[btn.type]
                  } ${btn.span ? `col-span-${btn.span}` : ""}`}
                >
                  {btn.action === "toggle-angle" ? angleUnit : btn.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick reference ── */}
      <div className="mt-4 rounded-2xl border border-border bg-surface px-5 py-4">
        <h3 className="font-display text-sm font-bold text-white">Keyboard Shortcuts</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted sm:grid-cols-3">
          {[
            ["0–9, .", "Numbers"],
            ["+ − * /", "Operators"],
            ["( )", "Parentheses"],
            ["^", "Power"],
            ["Enter / =", "Calculate"],
            ["Backspace", "Delete"],
            ["Esc", "Clear all"],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center gap-2">
              <kbd className="rounded border border-border-strong bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-white">
                {key}
              </kbd>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Functions reference ── */}
      <div className="mt-4 rounded-2xl border border-border bg-surface px-5 py-4">
        <h3 className="font-display text-sm font-bold text-white">Available Functions</h3>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted sm:grid-cols-3">
          {[
            ["sin / cos / tan", "Trigonometric"],
            ["sin⁻¹ / cos⁻¹ / tan⁻¹", "Inverse trig"],
            ["log", "Base-10 logarithm"],
            ["ln", "Natural logarithm"],
            ["√ / ∛", "Square / cube root"],
            ["x² / x³ / xʸ", "Powers"],
            ["10ˣ / eˣ", "Exponentials"],
            ["x!", "Factorial"],
            ["abs", "Absolute value"],
            ["π / e", "Constants"],
            ["Ans", "Previous answer"],
            ["M+ / M− / MR / MC", "Memory"],
          ].map(([fn, desc]) => (
            <div key={fn} className="flex items-start gap-2 py-0.5">
              <span className="font-mono text-[11px] text-[#a39cff] shrink-0">{fn}</span>
              <span className="text-muted-2">— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
