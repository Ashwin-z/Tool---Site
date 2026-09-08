import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ColorConverterTool from "@/components/color-converter-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Color Converter – HEX to RGB, RGB to HSL, Visual Color Picker Free",
  description:
    "Convert colors between HEX, RGB, and HSL formats instantly. Includes a visual 2D color picker with hue slider, live preview, and one-click CSS copy. Free online tool.",
  keywords: [
    "hex to rgb converter online free",
    "rgb to hex converter",
    "hex to hsl converter",
    "color converter online free",
    "css color converter",
    "rgb to hsl converter",
    "color code converter online",
    "hex color picker online free",
  ],
  alternates: { canonical: "/tools/color-converter" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Color Converter – HEX to RGB, RGB to HSL, Visual Color Picker | ToolMint",
    description:
      "Convert between HEX, RGB, and HSL color formats with a visual 2D color picker, hue slider, and one-click CSS copy.",
    url: "/tools/color-converter",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "HEX Color Input & Converter", desc: "Type or paste any 3- or 6-digit HEX color code and instantly see its RGB and HSL equivalents with a live color preview swatch." },
  { title: "RGB Color Input & Converter", desc: "Enter red, green, and blue channel values (0–255) to convert to HEX and HSL. All three inputs sync in real time." },
  { title: "HSL Color Input & Converter", desc: "Enter hue (0–360°), saturation (0–100%), and lightness (0–100%) to convert to HEX and RGB instantly." },
  { title: "Visual 2D Color Picker", desc: "Pick colors with a canvas-based 2D saturation/lightness picker and a separate hue slider — all values update together automatically." },
];

const useCases = [
  { title: "Web & UI Design", desc: "Convert between HEX (from design tools like Figma), RGB (for canvas/animation code), and HSL (for CSS theming and color manipulation)." },
  { title: "CSS & Frontend Dev", desc: "Copy CSS-ready color strings in any format — #hex, rgb(), or hsl() — with one click to paste directly into your stylesheet." },
  { title: "Brand & Print Work", desc: "Convert your brand hex color to RGB for use in digital assets, or verify colors are consistent across HEX and RGB specs from your style guide." },
];

const steps = [
  { title: "Enter a color", desc: "Type a HEX code, adjust RGB sliders, set HSL values, or drag the 2D color picker to choose a color." },
  { title: "All formats update", desc: "HEX, RGB, and HSL all sync instantly — every input syncs with every other input in real time." },
  { title: "Preview your color", desc: "A large live color swatch shows the current color so you can evaluate it visually before copying." },
  { title: "Copy CSS", desc: "Click any format's copy button to copy the CSS-ready value — such as #1a2b3c, rgb(26, 43, 60), or hsl(210, 40%, 17%) — to your clipboard." },
];

const faqs = [
  {
    q: "How do I convert a HEX color to RGB?",
    a: "Type the HEX code (with or without #) into the HEX field. The RGB equivalent updates instantly. For example, #ff6347 = rgb(255, 99, 71). Each pair of hex digits represents a red, green, or blue channel 0–255.",
  },
  {
    q: "What is HSL and how is it different from RGB?",
    a: "HSL stands for Hue, Saturation, Lightness. It is a human-readable color model: Hue is the base color (0–360°), Saturation is color intensity (0–100%), and Lightness is brightness (0–100%). RGB uses raw red/green/blue channel values. CSS supports both.",
  },
  {
    q: "Can I use the output directly in CSS?",
    a: "Yes. Click the copy button next to any format to copy a CSS-ready string: the HEX value (e.g. #ff6347), the rgb() function (e.g. rgb(255, 99, 71)), or the hsl() function (e.g. hsl(9, 100%, 64%)).",
  },
  {
    q: "Does the color picker work on mobile?",
    a: "Yes. The 2D color picker canvas and hue slider support both mouse and touch events, so they work on mobile browsers and tablets as well as desktop.",
  },
  {
    q: "What HEX formats are supported?",
    a: "ToolMint's Color Converter accepts both 3-digit shorthand HEX (#abc) and 6-digit full HEX (#aabbcc). The # prefix is optional — the converter normalizes 3-digit codes to 6-digit automatically.",
  },
];

export default function ColorConverterPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <WebAppSchema slug="color-converter" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Converters", href: "/tools/converters" },
            { name: "Color Converter" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Color Converter – HEX, RGB &amp; HSL with Visual Color Picker
        </h1>

        <ProcessingBadge slug="color-converter" />
        <ToolAnalytics slug="color-converter" category="converters" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert between HEX, RGB, and HSL color formats with a visual 2D color picker and hue slider.
          All three formats sync in real time — type in any field and every other format updates instantly.
          Copy CSS-ready values for HEX, rgb(), or hsl() with one click.
        </p>

        <div className="mt-8">
          <ColorConverterTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Color Converter Tools
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {includedTools.map((tool) => (
              <div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{tool.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Who Uses a Color Converter
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {useCases.map((u) => (
              <div key={u.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{u.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{u.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Use the Color Converter
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{i + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              HEX, RGB, and HSL – Which Color Format to Use in CSS
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              CSS supports all three color formats and they are all equally valid — the choice is about
              readability and what you are trying to do. HEX (#rrggbb) is the most common format in web
              design because it is compact and every design tool (Figma, Sketch, Photoshop, etc.) exports
              colors as hex by default. A 6-digit hex code encodes the same information as an RGB value:
              each pair of hexadecimal digits (00–FF) represents a channel from 0–255. The RGB function
              format rgb(r, g, b) is preferred when you need to manipulate colors programmatically in
              JavaScript — you can add or subtract from channel values directly. The HSL format
              hsl(hue, saturation%, lightness%) is the most human-intuitive: hue is the color on a
              0–360° wheel, saturation is how vivid it is, and lightness is how dark or bright. HSL is
              particularly useful when building design systems because you can adjust only the lightness
              or saturation to create consistent color palettes without changing the hue. For example,
              hsl(210, 70%, 20%) through hsl(210, 70%, 80%) gives a 7-step scale of the same blue at
              different brightness levels — something that would require manual calculation in HEX or RGB.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How Color Conversion Math Works – HEX to RGB to HSL
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Under the hood, all three color formats represent the same sRGB color space — they are just
              different notations. HEX to RGB conversion is straightforward: split the 6-character hex
              string into three pairs (rr, gg, bb), parse each as a base-16 number, and you have the 0–255
              channel values. #ff6347 splits to ff = 255, 63 = 99, 47 = 71, giving rgb(255, 99, 71).
              RGB to HSL is more involved: normalize each channel to 0–1, find the max and min channel
              values, then compute Hue from which channel is dominant, Saturation from the range
              (max − min) relative to lightness, and Lightness as (max + min) / 2. The full formula
              handles edge cases like achromatic colors (where R = G = B, making hue undefined and
              defaulting to 0°). All of this runs instantly in the browser — this converter does the
              bidirectional math for all three formats simultaneously so you do not need to convert in
              steps or use an intermediate format.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((f, i) => (
              <div key={i}>
                <dt className="font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <RelatedTools slug="color-converter" />
      </main>
    </>
  );
}
