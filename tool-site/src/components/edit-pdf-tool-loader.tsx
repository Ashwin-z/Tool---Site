"use client";

import dynamic from "next/dynamic";

const EditPdfTool = dynamic(() => import("@/components/edit-pdf-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-white/10 bg-[#111118] px-5 py-8 text-sm text-[#9b9bb3]">
      Loading editor…
    </div>
  ),
});

export default EditPdfTool;
