import {
  getProcessingMode,
  PROCESSING_DETAIL,
  PROCESSING_LABEL,
  type ProcessingMode,
} from "@/lib/processing-mode";

const STYLES: Record<ProcessingMode, { dot: string; border: string; bg: string; fg: string }> = {
  browser: {
    dot: "#22c55e",
    border: "rgba(34,197,94,.35)",
    bg: "rgba(34,197,94,.10)",
    fg: "#86efac",
  },
  server: {
    dot: "#f59e0b",
    border: "rgba(245,158,11,.35)",
    bg: "rgba(245,158,11,.10)",
    fg: "#fcd34d",
  },
  "server-fetch": {
    dot: "#6c63ff",
    border: "rgba(108,99,255,.35)",
    bg: "rgba(108,99,255,.12)",
    fg: "#b6b2ff",
  },
};

/**
 * States, accurately, whether a tool uploads the user's file.
 * Reads from src/lib/processing-mode.ts so the claim cannot drift from
 * what the tool actually does.
 */
export default function ProcessingBadge({ slug }: { slug: string }) {
  const mode = getProcessingMode(slug);
  const style = STYLES[mode];

  return (
    <div className="mt-4 flex flex-col gap-1.5">
      <span
        className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
        style={{ borderColor: style.border, background: style.bg, color: style.fg }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: style.dot }} />
        {PROCESSING_LABEL[mode]}
      </span>
      <p className="max-w-2xl text-xs leading-5" style={{ color: "var(--muted-2)" }}>
        {PROCESSING_DETAIL[mode]}
      </p>
    </div>
  );
}
