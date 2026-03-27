"use client";

import dynamic from "next/dynamic";

const SignPdfTool = dynamic(() => import("@/components/sign-pdf-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
      Loading signing workspace…
    </div>
  ),
});

export default SignPdfTool;
