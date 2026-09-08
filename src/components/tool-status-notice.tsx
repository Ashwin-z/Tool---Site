import Link from "next/link";

import { getToolBySlug } from "@/lib/tool-categories";
import { getOutage } from "@/lib/tool-status";

/**
 * Shown at the top of a tool page when that tool is known to be down, so a
 * visitor is told before they pick a file rather than after an upload fails.
 * Renders nothing for healthy tools.
 */
export default function ToolStatusNotice({ slug }: { slug: string }) {
  const outage = getOutage(slug);
  if (!outage) return null;

  const alternatives = (outage.alternatives ?? [])
    .map((s) => getToolBySlug(s))
    .filter((t): t is NonNullable<ReturnType<typeof getToolBySlug>> => Boolean(t));

  return (
    <div
      role="status"
      className="mt-6 rounded-xl border p-4"
      style={{ borderColor: "rgba(245,158,11,.4)", background: "rgba(245,158,11,.08)" }}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5 text-base">
          &#9888;
        </span>
        <div>
          <p className="font-semibold" style={{ color: "#fcd34d" }}>
            This tool is temporarily unavailable
          </p>
          <p className="mt-1 text-sm leading-6" style={{ color: "var(--muted)" }}>
            {outage.userMessage} Nothing you upload here will be processed until it is back, so
            please don&rsquo;t waste time trying.
          </p>

          {alternatives.length > 0 ? (
            <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
              Working alternatives:{" "}
              {alternatives.map((tool, i) => (
                <span key={tool.slug}>
                  {i > 0 ? ", " : ""}
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="font-medium underline"
                    style={{ color: "#6c63ff" }}
                  >
                    {tool.name}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
