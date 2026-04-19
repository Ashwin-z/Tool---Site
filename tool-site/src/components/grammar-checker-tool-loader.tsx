"use client";

import dynamic from "next/dynamic";

const GrammarCheckerTool = dynamic(() => import("@/components/grammar-checker-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
      Loading grammar workspace...
    </div>
  ),
});

export default GrammarCheckerTool;
