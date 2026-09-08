import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToolSlugFromHref, isToolAvailableSlug, isToolRetiredSlug } from "./lib/tool-availability";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const toolSlug = getToolSlugFromHref(request.nextUrl.pathname);
  // NOTE: these responses must build their OWN Headers. Reusing the headers
  // from NextResponse.next() carries Next's internal pass-through marker,
  // which makes the router override the status we set (a 410 came back as
  // a 404 until this was fixed).
  const terminalHeaders = (contentType: string) =>
    new Headers({
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });

  if (toolSlug && isToolRetiredSlug(toolSlug)) {
    // 410 Gone, not 404: these tools were deliberately withdrawn after a
    // documented feasibility assessment and are not returning at this URL.
    // 410 tells search engines to drop the URL instead of retrying it.
    return new NextResponse(
      "This tool has been retired. It depended on server-side Office conversion that could not be " +
        "made reliable, and a browser version could not reach an acceptable quality bar. " +
        "See https://toolmint.tools/tools/pdf-tools for the tools that do work.",
      { status: 410, headers: terminalHeaders("text/plain; charset=utf-8") },
    );
  }
  if (toolSlug && !isToolAvailableSlug(toolSlug)) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: terminalHeaders("text/plain; charset=utf-8"),
    });
  }

  // ── Security headers ──────────────────────────────────────
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // ── CORS for API routes ───────────────────────────────────
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin") ?? "";
    const allowedOrigins = [
      "https://toolmint.com",
      "https://www.toolmint.com",
      "https://toolmint.tools",
      "https://www.toolmint.tools",
    ];

    // In development, allow localhost
    if (process.env.NODE_ENV === "development") {
      allowedOrigins.push("http://localhost:3000", "http://127.0.0.1:3000");
    }

    if (allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }

    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.set("Access-Control-Max-Age", "86400");

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files and _next internals
    "/((?!_next/static|_next/image|favicon.ico|vendor/).*)",
  ],
};
