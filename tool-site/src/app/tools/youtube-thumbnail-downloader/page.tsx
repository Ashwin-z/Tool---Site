import type { Metadata } from "next";
import Link from "next/link";
import YouTubeThumbnailDownloaderTool from "@/components/youtube-thumbnail-downloader-tool";

export const metadata: Metadata = {
  title: "YouTube Thumbnail Downloader — HD, HQ, MQ & Default Sizes | ToolMint",
  description:
    "Download YouTube video thumbnails in 5 sizes including max resolution, standard, high, medium, and default. ToolMint supports watch URLs, Shorts, embeds, youtu.be links, and plain video IDs.",
  keywords: [
    "youtube thumbnail downloader",
    "download youtube thumbnail",
    "youtube thumbnail grabber",
    "youtube thumbnail extractor",
    "maxresdefault thumbnail",
    "youtube shorts thumbnail downloader",
    "youtube video id thumbnail",
    "download hd youtube thumbnail",
    "youtube thumbnail all resolutions",
    "img youtube thumbnail",
    "toolmint youtube thumbnail downloader",
    "youtube thumbnail preview",
  ],
  alternates: { canonical: "/tools/youtube-thumbnail-downloader" },
  openGraph: {
    title: "YouTube Thumbnail Downloader — HD, HQ, MQ & Default Sizes | ToolMint",
    description:
      "Paste a YouTube URL or video ID and download thumbnails in 5 available resolutions, including max resolution and standard sizes.",
    url: "/tools/youtube-thumbnail-downloader",
  },
};

const includedTools = [
  {
    title: "URL & Video ID Parser",
    desc: "Accepts watch URLs, youtu.be links, embed URLs, Shorts URLs, and plain 11-character YouTube video IDs.",
  },
  {
    title: "5 Thumbnail Resolutions",
    desc: "Shows Max Resolution, Standard, High Quality, Medium Quality, and Default thumbnail sizes whenever YouTube provides them.",
  },
  {
    title: "Thumbnail Preview Grid",
    desc: "Displays every available thumbnail in a clean grid with size labels and lazy loading for faster browsing.",
  },
  {
    title: "Direct Download Buttons",
    desc: "Download each available thumbnail individually without requiring a YouTube API key or account login.",
  },
];

const steps = [
  { title: "Paste a YouTube link", desc: "Enter a YouTube watch URL, Shorts URL, embed link, youtu.be link, or plain 11-character video ID." },
  { title: "Load the thumbnails", desc: "The tool extracts the video ID and fetches all available thumbnail sizes from YouTube's image CDN." },
  { title: "Preview each size", desc: "Check the preview grid to compare the max resolution, standard, high, medium, and default thumbnail versions." },
  { title: "Download the one you need", desc: "Click the download button next to the preferred size to save that thumbnail image directly." },
];

const faqs = [
  {
    q: "What YouTube URL formats are supported?",
    a: "ToolMint supports standard watch URLs, youtu.be short links, embed URLs, Shorts URLs, and plain 11-character video IDs. The tool extracts the video ID automatically from all supported formats.",
  },
  {
    q: "What thumbnail sizes can I download?",
    a: "The tool checks up to 5 common YouTube thumbnail sizes: Max Resolution (1280×720), Standard (640×480), High Quality (480×360), Medium Quality (320×180), and Default (120×90). Availability depends on the source video.",
  },
  {
    q: "Do I need a YouTube API key?",
    a: "No. The downloader uses the public YouTube image CDN pattern at img.youtube.com for thumbnails, so no API key or account login is required.",
  },
  {
    q: "Can I download thumbnails from YouTube Shorts?",
    a: "Yes. Shorts URLs are supported. As long as the video has a valid YouTube video ID, the tool can fetch the available thumbnail sizes.",
  },
  {
    q: "Why might max resolution not be available?",
    a: "Not every video has a max resolution thumbnail. If YouTube did not publish that version for the video, the tool will still show the other available sizes such as standard, high, medium, or default.",
  },
];

export default function YouTubeThumbnailDownloaderPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          YouTube Thumbnail Downloader — Get All Available Sizes
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Paste any YouTube video URL or plain video ID and download its thumbnail in all available
          resolutions. ToolMint supports standard watch URLs, Shorts, embeds, and youtu.be links, then
          shows up to 5 thumbnail sizes from YouTube's image CDN with one-click download buttons.
        </p>

        <div className="mt-8">
          <YouTubeThumbnailDownloaderTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included YouTube Thumbnail Tools
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
            How to Download a YouTube Thumbnail
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{index + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <dt className="font-semibold text-foreground">{faq.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}
