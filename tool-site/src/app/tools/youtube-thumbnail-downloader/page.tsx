import type { Metadata } from "next";
import Link from "next/link";
import YouTubeThumbnailDownloaderTool from "@/components/youtube-thumbnail-downloader-tool";

export const metadata: Metadata = {
  title: "YouTube Thumbnail Downloader — Get Any Video Thumbnail | ToolCraft",
  description:
    "Free YouTube Thumbnail Downloader. Download any YouTube video thumbnail in all resolutions instantly.",
};

export default function YouTubeThumbnailDownloaderPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        YouTube Thumbnail Downloader
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Paste any YouTube video URL and download its thumbnail in all available resolutions.
      </p>

      <div className="mt-8">
        <YouTubeThumbnailDownloaderTool />
      </div>
    </main>
  );
}
