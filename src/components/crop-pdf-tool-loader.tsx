"use client";

import dynamic from "next/dynamic";

const CropPdfTool = dynamic(() => import("@/components/crop-pdf-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
      Loading cropper…
    </div>
  ),
});

export default CropPdfTool;