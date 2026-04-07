"use client";

import Link from "next/link";
import { useNavShell } from "@/components/nav-shell-context";
import { useTheme } from "@/components/theme-context";
import { useEffect } from "react";

export default function SiteHeader() {
  const { navOpen, toggleNav } = useNavShell();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("main-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur" style={{ borderColor: "var(--border)", background: theme === "dark" ? "rgba(8,8,14,0.95)" : "rgba(248,249,251,0.95)" }}>
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
          <span className="grid h-7 w-7 place-items-center rounded-md bg-linear-to-br from-[#6c63ff] to-[#a78bff] text-xs text-white">⚡</span>
          Tool<span className="text-[#6c63ff]">Mint</span>
        </Link>

        {/* Search */}
        <div className="mx-auto hidden w-full max-w-xl items-center gap-2 rounded-lg border px-3 py-2 md:flex" style={{ borderColor: "var(--border-strong)", background: "var(--surface-2)" }}>
          <span className="text-xs" style={{ color: "var(--muted-2)" }}>🔍</span>
          <input
            id="main-search"
            placeholder="Search tools... Ctrl+K"
            className="w-full bg-transparent text-sm outline-none" style={{ color: "var(--foreground)" }}
          />
        </div>

        {/* Theme toggle slider */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="relative flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200"
          style={{ borderColor: "var(--border-strong)", background: theme === "dark" ? "var(--surface-2)" : "var(--surface-3)" }}
        >
          <span
            className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-[#6c63ff] text-[10px] text-white shadow transition-transform duration-200"
            style={{ transform: theme === "dark" ? "translateX(2px)" : "translateX(26px)" }}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </span>
        </button>

        {/* Toggle nav */}
        <button
          onClick={toggleNav}
          className="flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition"
          style={{ borderColor: "var(--border-strong)", color: "var(--muted)" }}
        >
          {navOpen ? (
            <>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Hide Nav
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              Show Nav
            </>
          )}
        </button>
      </div>
    </header>
  );
}
