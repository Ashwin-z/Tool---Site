"use client";

import { useEffect, useRef } from "react";

import { analytics } from "@/lib/analytics";
import { getProcessingMode } from "@/lib/processing-mode";

/**
 * Fires `tool_view` once per tool page load.
 *
 * Dropped into every tool page so view tracking is automatic and does not
 * have to be wired into each of the 81 tool components individually.
 * The lifecycle events (tool_start / tool_complete / tool_error) still have
 * to be called from inside each tool — see docs/ANALYTICS.md.
 */
export default function ToolAnalytics({
  slug,
  category,
}: {
  slug: string;
  category?: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    analytics.toolView({
      tool_slug: slug,
      category,
      processing_mode: getProcessingMode(slug),
    });
  }, [slug, category]);

  return null;
}
