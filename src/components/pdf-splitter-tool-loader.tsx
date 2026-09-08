"use client";

import dynamic from "next/dynamic";

const PdfSplitterTool = dynamic(() => import("@/components/pdf-splitter-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
      Loading PDF splitter...
    </div>
  ),
});

export default PdfSplitterTool;
