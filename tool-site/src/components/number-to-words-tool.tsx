"use client";

import { useState, useMemo } from "react";

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const SCALES = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion"];

// Indian system scales
const INDIAN_SCALES = ["", "Thousand", "Lakh", "Crore", "Arab", "Kharab"];

function chunkToWords(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  return ONES[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + chunkToWords(n % 100) : "");
}

function numberToWordsWestern(num: number): string {
  if (num === 0) return "Zero";
  if (num < 0) return "Negative " + numberToWordsWestern(-num);

  const parts: string[] = [];
  let i = 0;
  let remaining = Math.floor(num);

  while (remaining > 0) {
    const chunk = remaining % 1000;
    if (chunk > 0) {
      const words = chunkToWords(chunk);
      parts.unshift(SCALES[i] ? words + " " + SCALES[i] : words);
    }
    remaining = Math.floor(remaining / 1000);
    i++;
  }

  return parts.join(" ");
}

function numberToWordsIndian(num: number): string {
  if (num === 0) return "Zero";
  if (num < 0) return "Negative " + numberToWordsIndian(-num);

  let remaining = Math.floor(num);
  const parts: string[] = [];

  // First chunk: last 3 digits
  const first = remaining % 1000;
  if (first > 0) parts.unshift(chunkToWords(first));
  remaining = Math.floor(remaining / 1000);

  // Subsequent chunks: 2 digits each
  let i = 1;
  while (remaining > 0) {
    const chunk = remaining % 100;
    if (chunk > 0) {
      const words = chunkToWords(chunk);
      parts.unshift(INDIAN_SCALES[i] ? words + " " + INDIAN_SCALES[i] : words);
    }
    remaining = Math.floor(remaining / 100);
    i++;
  }

  return parts.join(" ");
}

function numberToOrdinal(words: string): string {
  const mapping: Record<string, string> = {
    One: "First", Two: "Second", Three: "Third", Four: "Fourth", Five: "Fifth",
    Six: "Sixth", Seven: "Seventh", Eight: "Eighth", Nine: "Ninth", Ten: "Tenth",
    Eleven: "Eleventh", Twelve: "Twelfth", Thirteen: "Thirteenth",
    Fourteen: "Fourteenth", Fifteen: "Fifteenth", Sixteen: "Sixteenth",
    Seventeen: "Seventeenth", Eighteen: "Eighteenth", Nineteen: "Nineteenth",
    Twenty: "Twentieth", Thirty: "Thirtieth", Forty: "Fortieth", Fifty: "Fiftieth",
    Sixty: "Sixtieth", Seventy: "Seventieth", Eighty: "Eightieth", Ninety: "Ninetieth",
    Hundred: "Hundredth", Thousand: "Thousandth", Million: "Millionth",
    Billion: "Billionth", Trillion: "Trillionth",
  };

  const lastWord = words.split(" ").pop() || "";
  if (mapping[lastWord]) {
    return words.replace(new RegExp(lastWord + "$"), mapping[lastWord]);
  }
  return words + "th";
}

type System = "western" | "indian";
type Format = "standard" | "ordinal" | "currency";

export default function NumberToWordsTool() {
  const [input, setInput] = useState("");
  const [system, setSystem] = useState<System>("western");
  const [format, setFormat] = useState<Format>("standard");
  const [currency, setCurrency] = useState("USD");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const cleaned = input.replace(/,/g, "").trim();
    const num = parseFloat(cleaned);
    if (!cleaned || isNaN(num) || Math.abs(num) > 999999999999999) return null;

    const converter = system === "indian" ? numberToWordsIndian : numberToWordsWestern;
    const intPart = Math.floor(Math.abs(num));
    const decPart = Math.round((Math.abs(num) - intPart) * 100);

    const prefix = num < 0 ? "Negative " : "";

    if (format === "currency") {
      const currencyNames: Record<string, [string, string]> = {
        USD: ["Dollar", "Cent"],
        EUR: ["Euro", "Cent"],
        GBP: ["Pound", "Penny"],
        INR: ["Rupee", "Paisa"],
        JPY: ["Yen", "Sen"],
      };
      const [major, minor] = currencyNames[currency] || ["Dollar", "Cent"];
      const intWords = converter(intPart);
      const plural = intPart !== 1 ? "s" : "";
      let text = `${prefix}${intWords} ${major}${plural}`;
      if (decPart > 0) {
        const decWords = converter(decPart);
        const decPlural = decPart !== 1 ? "s" : "";
        text += ` and ${decWords} ${minor}${decPlural}`;
      }
      return text;
    }

    if (format === "ordinal") {
      return prefix + numberToOrdinal(converter(intPart));
    }

    let text = prefix + converter(intPart);
    if (decPart > 0) {
      text += " Point " + converter(decPart);
    }
    return text;
  }, [input, system, format, currency]);

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Enter a Number</h2>
        </div>

        <div className="px-5 py-5">
          <input
            type="text"
            inputMode="decimal"
            value={input}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9,.\-]/g, "");
              setInput(v);
            }}
            placeholder="e.g. 1234567.89"
            className="w-full rounded-lg border border-border-strong bg-surface-2 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border px-5 py-3">
          {/* System toggle */}
          <div className="flex rounded-lg border border-border bg-surface-2 p-0.5 text-xs">
            <button
              onClick={() => setSystem("western")}
              className={`rounded-md px-3 py-1.5 font-semibold transition ${system === "western" ? "bg-[#6c63ff] text-white" : "text-muted hover:text-foreground"}`}
            >
              Western
            </button>
            <button
              onClick={() => setSystem("indian")}
              className={`rounded-md px-3 py-1.5 font-semibold transition ${system === "indian" ? "bg-[#6c63ff] text-white" : "text-muted hover:text-foreground"}`}
            >
              Indian
            </button>
          </div>

          {/* Format toggle */}
          <div className="flex rounded-lg border border-border bg-surface-2 p-0.5 text-xs">
            {(["standard", "ordinal", "currency"] as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`rounded-md px-3 py-1.5 font-semibold capitalize transition ${format === f ? "bg-[#6c63ff] text-white" : "text-muted hover:text-foreground"}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Currency selector */}
          {format === "currency" && (
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-lg border border-border-strong bg-surface-2 px-3 py-1.5 text-xs font-semibold text-white outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold text-white">
              <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
              In Words
            </h3>
            <button
              onClick={copy}
              className="rounded-md border border-border-strong px-3 py-1.5 text-xs text-muted transition hover:text-foreground"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="px-5 py-5">
            <p className="text-lg font-semibold leading-8 text-white">{result}</p>
          </div>
        </div>
      )}

      {input && !result && (
        <div className="rounded-2xl border border-[#ff6584]/30 bg-[#ff6584]/5 px-5 py-4 text-center text-sm text-[#ff6584]">
          Number is too large or invalid. Max supported: 999,999,999,999,999
        </div>
      )}
    </div>
  );
}
