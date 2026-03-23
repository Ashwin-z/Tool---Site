import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Download test: return a blob of random bytes
  if (url.searchParams.has("download")) {
    const size = Math.min(
      Number(url.searchParams.get("size")) || 500_000,
      5_000_000,
    );
    const data = new Uint8Array(size);
    // Fill in 64KB chunks (crypto.getRandomValues has a 65536 limit)
    for (let offset = 0; offset < size; offset += 65536) {
      const len = Math.min(65536, size - offset);
      crypto.getRandomValues(data.subarray(offset, offset + len));
    }
    return new Response(data, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store, no-cache",
        "Content-Length": String(size),
      },
    });
  }

  // Default: return IP info
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : realIp || "127.0.0.1";
  return NextResponse.json({ ip });
}

// POST handler for upload speed measurement — consume and discard the body
export async function POST(request: Request) {
  try {
    const body = await request.arrayBuffer();
    return NextResponse.json({ received: body.byteLength });
  } catch {
    return NextResponse.json({ received: 0 });
  }
}
