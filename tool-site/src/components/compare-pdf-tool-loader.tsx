"use client";

import dynamic from "next/dynamic";

const ComparePdfTool = dynamic(() => import("@/components/compare-pdf-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
      Loading compare workspace…
    </div>
  ),
});

export default ComparePdfTool;
