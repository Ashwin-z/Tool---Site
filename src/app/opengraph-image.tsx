import { ImageResponse } from "next/og";

/**
 * Site-wide Open Graph image, generated at build time.
 *
 * Replaces 25 hardcoded /og/*.png references that all returned 404 — every
 * social share and AI preview of a ToolMint page was blank before this.
 *
 * Next applies this to any route that does not define its own
 * opengraph-image, so one file covers all 179 pages.
 */

export const alt = "ToolMint — free online PDF, image and text tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0d0f17",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 30,
            color: "#b6b2ff",
            letterSpacing: "-0.01em",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              background: "#6c63ff",
              display: "flex",
            }}
          />
          toolmint.tools
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 82,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            display: "flex",
          }}
        >
          Free online tools
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 34,
            color: "#9aa3b2",
            lineHeight: 1.35,
            display: "flex",
            maxWidth: 900,
          }}
        >
          PDF, image, text and calculator tools. No signup, no watermark.
        </div>

        <div
          style={{
            marginTop: 44,
            display: "flex",
            gap: 14,
            fontSize: 24,
            color: "#6f7789",
          }}
        >
          Most tools run entirely in your browser
        </div>
      </div>
    ),
    size,
  );
}
