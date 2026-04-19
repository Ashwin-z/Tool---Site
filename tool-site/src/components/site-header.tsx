"use client";

import Link from "next/link";
import { useNavShell } from "@/components/nav-shell-context";
import { useTheme } from "@/components/theme-context";
import BrandMark from "@/components/brand-mark";
import ToolSearch from "@/components/tool-search";

function MoonIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M12.9 2.8a6.8 6.8 0 1 0 4.3 12.2 6.6 6.6 0 0 1-4.3-12.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="3.2" fill="currentColor" />
      <path d="M10 2.2v2M10 15.8v2M17.8 10h-2M4.2 10h-2M15.5 4.5l-1.4 1.4M5.9 14.1l-1.4 1.4M15.5 15.5l-1.4-1.4M5.9 5.9 4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function SiteHeader() {
  const { navOpen, toggleNav } = useNavShell();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur" style={{ borderColor: "var(--border)", background: theme === "dark" ? "rgba(8,8,14,0.95)" : "rgba(248,249,251,0.95)" }}>
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
          <BrandMark size={28} className="shrink-0" />
          Tool<span className="text-[#6c63ff]">Mint</span>
        </Link>

        <div className="mx-auto hidden w-full max-w-xl items-center gap-2 md:flex">
          <ToolSearch />
        </div>

        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="relative flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200"
          style={{ borderColor: "var(--border-strong)", background: theme === "dark" ? "var(--surface-2)" : "var(--surface-3)" }}
        >
          <span
            className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-[#6c63ff] text-white shadow transition-transform duration-200"
            style={{ transform: theme === "dark" ? "translateX(2px)" : "translateX(26px)" }}
          >
            {theme === "dark" ? <MoonIcon /> : <SunIcon />}
          </span>
        </button>

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
