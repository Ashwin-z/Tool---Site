import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * RETIRED in Batch 1D.
 *
 * PDF to Excel now runs entirely in the visitor's browser
 * (src/lib/pdf-to-excel.ts). This was the last PDF tool that uploaded a
 * document to ToolMint; with it gone, no PDF tool sends a user file anywhere.
 *
 * The engine that lived here was pure JavaScript (pdfjs-dist + exceljs) and
 * was ported almost verbatim — only the two canvas calls needed changing.
 *
 * Kept as an explicit 410 rather than deleted so a stale cached client gets a
 * clear answer instead of a bare 404.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "PDF to Excel now runs in your browser and no longer uses this endpoint. Reload the page to get the current version.",
      code: "ENDPOINT_RETIRED",
      movedTo: "client-side",
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  return POST();
}
