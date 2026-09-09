"use client";

import dynamic from "next/dynamic";

const PdfRedactionCheckerTool = dynamic(
  () => import("@/components/pdf-redaction-checker-tool"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
        Loading redaction checker…
      </div>
    ),
  },
);

export default PdfRedactionCheckerTool;
