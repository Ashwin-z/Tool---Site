"use client";

import dynamic from "next/dynamic";

const PythonCodeEditorTool = dynamic(() => import("@/components/python-code-editor-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-sm text-muted">
      Loading browser Python runtime...
    </div>
  ),
});

export default PythonCodeEditorTool;