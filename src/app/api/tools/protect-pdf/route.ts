import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * RETIRED in Batch 1B.
 *
 * PDF password protection and removal now run entirely in the visitor's
 * browser (src/lib/pdf-security.ts), using WebCrypto for AES plus small local
 * RC4/MD5 implementations for legacy files. No PDF and no password is sent
 * here any more.
 *
 * This route previously shelled out to the `pdfcpu` binary, which is not
 * installed on the production host — it returned HTTP 503 to every user.
 *
 * Kept as an explicit 410 rather than deleted so a stale cached client gets a
 * clear answer, and so the reason is recorded where someone would look for it.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "PDF password tools now run in your browser and no longer use this endpoint. Reload the page to get the current version.",
      code: "ENDPOINT_RETIRED",
      movedTo: "client-side",
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  return POST();
}
