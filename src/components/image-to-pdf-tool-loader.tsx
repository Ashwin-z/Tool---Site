"use client";

import dynamic from "next/dynamic";

const ImageToPdfTool = dynamic(() => import("@/components/image-to-pdf-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
      Loading image converter...
    </div>
  ),
});

export default ImageToPdfTool;
