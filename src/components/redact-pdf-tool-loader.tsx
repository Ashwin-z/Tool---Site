"use client";

import dynamic from "next/dynamic";

const RedactPdfTool = dynamic(() => import("@/components/redact-pdf-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
      Loading redaction workspace…
    </div>
  ),
});

export default RedactPdfTool;
