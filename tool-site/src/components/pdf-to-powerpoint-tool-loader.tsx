"use client";

import dynamic from "next/dynamic";

const PdfToPowerpointTool = dynamic(() => import("@/components/pdf-to-powerpoint-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
      Loading PowerPoint converter...
    </div>
  ),
});

export default PdfToPowerpointTool;
