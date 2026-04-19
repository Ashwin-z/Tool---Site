"use client";

import dynamic from "next/dynamic";

const AddWatermarkTool = dynamic(() => import("@/components/add-watermark-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
      Loading watermark editor...
    </div>
  ),
});

export default AddWatermarkTool;
