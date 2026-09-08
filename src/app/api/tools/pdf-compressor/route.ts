import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * RETIRED in Batch 1A.
 *
 * Compress PDF now runs entirely in the visitor's browser
 * (src/lib/pdf-compression.ts). Nothing uploads a PDF to this endpoint any
 * more, and the Ghostscript dependency that made it fail in production —
 * returning 503 to every user for months — is gone with it.
 *
 * The route is kept as an explicit 410 rather than deleted so that a stale
 * cached client gets a clear answer instead of a bare 404, and so the reason
 * for its removal is recorded where someone would look for it.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "PDF compression now runs in your browser and no longer uses this endpoint. Reload the page to get the current version.",
      code: "ENDPOINT_RETIRED",
      movedTo: "client-side",
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  return POST();
}
