"use client";

import dynamic from "next/dynamic";

const EditPdfTool = dynamic(() => import("@/components/edit-pdf-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
      Loading editor…
    </div>
  ),
});

export default EditPdfTool;
