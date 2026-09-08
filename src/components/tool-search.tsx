"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useId, useMemo, useState } from "react";
import { toolCategories } from "@/lib/tool-categories";

type ToolSearchProps = {
  className?: string;
};

const searchableTools = toolCategories.flatMap((category) =>
  category.tools.map((tool) => ({
    name: tool.name,
    href: `/tools/${tool.slug}`,
    description: tool.desc,
    category: category.title,
    haystack: `${tool.name} ${tool.desc} ${category.title}`.toLowerCase(),
  })),
);

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="5.75" stroke="currentColor" strokeWidth="1.6" />
      <path d="m13.5 13.5 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function ToolSearch({ className }: ToolSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return [];

    return searchableTools
      .map((tool) => {
        let score = 0;

        if (tool.name.toLowerCase() === normalizedQuery) score += 500;
        if (tool.name.toLowerCase().startsWith(normalizedQuery)) score += 300;
        if (tool.name.toLowerCase().includes(normalizedQuery)) score += 180;
        if (tool.category.toLowerCase().includes(normalizedQuery)) score += 60;
        if (tool.haystack.includes(normalizedQuery)) score += 30;

        return { tool, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
      .slice(0, 8)
      .map((entry) => entry.tool);
  }, [query]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      router.push("/tools");
      return;
    }

    setOpen(false);
    router.push(`/tools?q=${encodeURIComponent(normalizedQuery)}`);
  };

  return (
    <div className={`relative w-full ${className ?? ""}`}>
      <form onSubmit={handleSubmit} role="search" className="w-full">
        <label className="sr-only" htmlFor={inputId}>
          Search tools
        </label>
        <div
          className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 transition focus-within:border-[#6c63ff]/60"
          style={{
            borderColor: "var(--border-strong)",
            background: "var(--surface-1)",
            color: "var(--foreground)",
            boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
          }}
        >
          <span className="shrink-0" style={{ color: "var(--muted-2)" }}>
            <SearchIcon />
          </span>
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search tools by name or task"
            className="w-full border-0 bg-transparent text-sm outline-none"
            style={{ color: "var(--foreground)" }}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium transition"
            style={{ color: "var(--muted-2)", background: "var(--surface-1)" }}
          >
            Search
          </button>
        </div>
      </form>

      {open && query.trim() ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border shadow-2xl"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-1)",
            boxShadow: "0 18px 45px rgba(0,0,0,0.18)",
          }}
        >
          {results.length ? (
            <div className="py-2">
              {results.map((result) => (
                <Link
                  key={result.href}
                  href={result.href}
                  onClick={() => {
                    setQuery("");
                    setOpen(false);
                  }}
                  className="block px-4 py-3 transition"
                  style={{
                    background: pathname === result.href ? "var(--surface-3)" : "var(--surface-1)",
                  }}
                >
                  <div className="text-sm font-medium text-foreground">{result.name}</div>
                  <div className="mt-0.5 text-xs" style={{ color: "var(--muted-2)" }}>
                    {result.category} - {result.description}
                  </div>
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  router.push(`/tools?q=${encodeURIComponent(query.trim())}`);
                  setOpen(false);
                }}
                className="block w-full border-t px-4 py-3 text-left text-xs font-medium transition"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--accent-light)",
                  background: "var(--surface-1)",
                }}
              >
                View all results for &quot;{query.trim()}&quot;
              </button>
            </div>
          ) : (
            <div
              className="px-4 py-4 text-sm"
              style={{ color: "var(--muted-2)", background: "var(--surface-1)" }}
            >
              No tools matched &quot;{query.trim()}&quot;. Press Search to view the tools page anyway.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
