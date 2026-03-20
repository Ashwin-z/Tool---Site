"use client";

import dynamic from "next/dynamic";

const CropPdfTool = dynamic(() => import("@/components/crop-pdf-tool"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-white/10 bg-[#111118] px-5 py-8 text-sm text-[#9b9bb3]">
      Loading cropper…
    </div>
  ),
});

export default CropPdfTool;