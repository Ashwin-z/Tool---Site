"use client";

import dynamic from "next/dynamic";

const PdfToWordTool = dynamic(() => import("@/components/pdf-to-word-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
      Loading Word converter...
    </div>
  ),
});

export default PdfToWordTool;
