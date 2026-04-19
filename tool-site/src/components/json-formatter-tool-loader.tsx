"use client";

import dynamic from "next/dynamic";

const JsonFormatterTool = dynamic(() => import("@/components/json-formatter-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
      Loading JSON workspace...
    </div>
  ),
});

export default JsonFormatterTool;
