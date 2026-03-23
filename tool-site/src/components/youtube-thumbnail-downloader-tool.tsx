"use client";

import { useState } from "react";

interface Thumbnail {
  label: string;
  resolution: string;
  url: string;
}

function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  // Plain 11-char ID
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    // youtu.be/VIDEO_ID
    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    // youtube.com/watch?v=VIDEO_ID or youtube.com/embed/VIDEO_ID or youtube.com/shorts/VIDEO_ID
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      const parts = url.pathname.split("/");
      const idx = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "v");
      if (idx !== -1 && parts[idx + 1]) {
        const id = parts[idx + 1];
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    /* not a URL */
  }

  return null;
}

function getThumbnails(videoId: string): Thumbnail[] {
  return [
    {
      label: "Max Resolution",
      resolution: "1280×720",
      url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    },
    {
      label: "Standard",
      resolution: "640×480",
      url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    },
    {
      label: "High Quality",
      resolution: "480×360",
      url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    },
    {
      label: "Medium Quality",
      resolution: "320×180",
      url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    },
    {
      label: "Default",
      resolution: "120×90",
      url: `https://img.youtube.com/vi/${videoId}/default.jpg`,
    },
  ];
}

export default function YouTubeThumbnailDownloaderTool() {
  const [input, setInput] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleFetch = () => {
    const id = extractVideoId(input);
    if (!id) {
      setError("Please enter a valid YouTube URL or video ID.");
      setVideoId(null);
      return;
    }
    setError("");
    setVideoId(id);
  };

  const thumbnails = videoId ? getThumbnails(videoId) : [];

  const downloadImage = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank", "noopener");
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">
            YouTube Thumbnail Downloader
          </h2>
          <p className="mt-1 text-xs text-muted">
            Grab thumbnails in all available resolutions.
          </p>
        </div>

        <div className="px-5 py-5">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
            YouTube URL or Video ID
          </label>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-sm text-white outline-none placeholder:text-white/20 focus:border-[#6c63ff]/50"
            />
            <button
              onClick={handleFetch}
              className="shrink-0 rounded-lg border border-[#6c63ff]/40 bg-[#6c63ff]/10 px-5 py-2.5 text-sm font-semibold text-[#6c63ff] transition hover:bg-[#6c63ff]/20"
            >
              Fetch
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>

        {thumbnails.length > 0 && (
          <div className="border-t border-border px-5 py-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {thumbnails.map((thumb) => (
                <div
                  key={thumb.label}
                  className="overflow-hidden rounded-xl border border-border bg-surface-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb.url}
                    alt={`${thumb.label} thumbnail`}
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{thumb.label}</div>
                      <div className="text-xs text-muted">{thumb.resolution}</div>
                    </div>
                    <button
                      onClick={() =>
                        downloadImage(thumb.url, `thumbnail-${videoId}-${thumb.label.toLowerCase().replace(/\s+/g, "-")}.jpg`)
                      }
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-white transition hover:border-border-strong"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="🖼️" title="All Resolutions" desc="Get thumbnails from max res (1280×720) to default (120×90)." />
        <InfoCard icon="⚡" title="Instant" desc="No API key needed. Thumbnails load from YouTube CDN." />
        <InfoCard icon="🔒" title="Private" desc="Everything happens in your browser. Nothing is tracked." />
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <span className="text-xl">{icon}</span>
      <h4 className="mt-2 text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-5 text-muted">{desc}</p>
    </div>
  );
}
