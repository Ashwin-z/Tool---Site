import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import YouTubeThumbnailDownloaderTool from "@/components/youtube-thumbnail-downloader-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "YouTube Thumbnail Downloader – Download HD Thumbnail Free",
  description:
    "Download YouTube video thumbnails in HD, HQ, and all available sizes free. Paste any YouTube URL or video ID — supports Shorts, youtu.be, and embeds. No signup.",
  keywords: [
    "youtube thumbnail downloader free",
    "download youtube thumbnail hd",
    "youtube thumbnail grabber online",
    "how to download youtube thumbnail",
    "youtube thumbnail extractor free",
    "download youtube video thumbnail online",
    "youtube shorts thumbnail downloader",
    "maxresdefault thumbnail download",
  ],
  alternates: { canonical: "/tools/youtube-thumbnail-downloader" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "YouTube Thumbnail Downloader – Download HD Thumbnail Free | ToolMint",
    description:
      "Paste a YouTube URL or video ID and download thumbnails in 5 available resolutions. No signup needed.",
    url: "/tools/youtube-thumbnail-downloader",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "URL & Video ID Parser", desc: "Accepts watch URLs, youtu.be links, embed URLs, Shorts URLs, and plain 11-character YouTube video IDs." },
  { title: "5 Thumbnail Resolutions", desc: "Shows Max Resolution, Standard, High Quality, Medium Quality, and Default thumbnail sizes whenever YouTube provides them." },
  { title: "Thumbnail Preview Grid", desc: "Displays every available thumbnail in a clean grid with size labels and lazy loading for faster browsing." },
  { title: "Direct Download Buttons", desc: "Download each available thumbnail individually without requiring a YouTube API key or account login." },
];

const useCases = [
  { title: "Content Creators", desc: "Download your own video's thumbnail to reuse in blog posts, social media, or as a cover image for repurposed content." },
  { title: "Designers & Editors", desc: "Grab thumbnails as reference images when designing competing thumbnails, creating watch-later graphics, or building video mockups." },
  { title: "Researchers & Journalists", desc: "Save YouTube thumbnails for media coverage, research archives, or documentation where a screenshot of the thumbnail is needed." },
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
      <WebAppSchema slug="youtube-thumbnail-downloader" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "YouTube Thumbnail Downloader" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          YouTube Thumbnail Downloader — All Sizes, No Signup
        </h1>

        <ProcessingBadge slug="youtube-thumbnail-downloader" />
        <ToolAnalytics slug="youtube-thumbnail-downloader" category="more" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Paste any YouTube video URL or plain video ID and download its thumbnail in all available
          resolutions. Supports standard watch URLs, Shorts, embeds, and youtu.be links, then shows
          up to 5 thumbnail sizes from YouTube&apos;s image CDN with one-click download buttons.
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
            Who Uses a YouTube Thumbnail Downloader
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              YouTube Thumbnail Sizes Explained – maxresdefault, hqdefault & More
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              YouTube stores thumbnails at several standard sizes under predictable CDN URLs. The naming
              convention uses specific filenames: <code className="rounded bg-white/10 px-1 text-xs">maxresdefault.jpg</code> is the
              maximum resolution thumbnail at 1280×720 pixels (HD) — this is the image you see when you
              mouse over a video on YouTube&apos;s desktop site. <code className="rounded bg-white/10 px-1 text-xs">sddefault.jpg</code> is
              the standard definition thumbnail at 640×480. <code className="rounded bg-white/10 px-1 text-xs">hqdefault.jpg</code> is
              the &quot;high quality&quot; version at 480×360, which has been the default fallback for many years.
              <code className="rounded bg-white/10 px-1 text-xs">mqdefault.jpg</code> is medium quality at 320×180, and
              <code className="rounded bg-white/10 px-1 text-xs">default.jpg</code> is the smallest at 120×90. Not every video
              has all sizes — older videos or those uploaded at low resolution may lack maxresdefault.
              The tool automatically checks all five URLs and only shows the ones that exist for that video.
              The video ID is extracted from your pasted URL (e.g., the dQw4w9WgXcQ part of a YouTube
              watch URL) and substituted into each CDN URL pattern for fast retrieval without any API call.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Copyright Considerations When Downloading YouTube Thumbnails
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              YouTube thumbnails are creative works and are typically owned by the video creator who
              uploaded them. Downloading a thumbnail for personal reference, research, or journalistic
              fair use is generally acceptable. However, reusing someone else&apos;s thumbnail in your own
              content, publications, or commercial materials without permission is a copyright infringement
              in most jurisdictions. The safe uses of this downloader are: downloading your own video&apos;s
              thumbnail for repurposing across platforms, saving thumbnails for research or competitive
              analysis (checking what styles work in your niche), creating watch-later reference images for
              personal playlists, using thumbnails in news articles where fair use or fair dealing applies,
              and checking the exact thumbnail size your own video is using. For any commercial or public
              use of someone else&apos;s thumbnail, contact the creator directly or obtain a license. When in
              doubt, create original artwork rather than relying on downloaded images.
            </p>
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

        <RelatedTools slug="youtube-thumbnail-downloader" />
      </main>
    </>
  );
}
