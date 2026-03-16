"use client";

import Link from "next/link";
import { useNavShell } from "@/components/nav-shell-context";
import { useEffect } from "react";

export default function SiteHeader() {
  const { navOpen, toggleNav } = useNavShell();

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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08080e]/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-linear-to-br from-[#6c63ff] to-[#a78bff] text-xs">⚡</span>
          Tool<span className="text-[#6c63ff]">Craft</span>
        </Link>

        {/* Search */}
        <div className="mx-auto hidden w-full max-w-xl items-center gap-2 rounded-lg border border-white/15 bg-[#17171f] px-3 py-2 md:flex focus-within:border-[#6c63ff]">
          <span className="text-xs text-[#5b5b70]">🔍</span>
          <input
            id="main-search"
            placeholder="Search tools... Ctrl+K"
            className="w-full bg-transparent text-sm text-[#d5d5e5] outline-none placeholder:text-[#4b4b61]"
          />
        </div>

        {/* Toggle nav */}
        <button
          onClick={toggleNav}
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-[#9b9bb3] transition hover:bg-white/5 hover:text-white"
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
