"use client";

import dynamic from "next/dynamic";

const WordCounterTool = dynamic(() => import("@/components/word-counter-tool"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl border border-white/10 bg-white/[.02]">
      <p className="text-sm text-muted">Loading Word Counter…</p>
    </div>
  ),
});

export default function HomeWordCounter() {
  return <WordCounterTool />;
}
