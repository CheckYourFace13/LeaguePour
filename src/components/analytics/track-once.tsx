"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsParams } from "@/lib/analytics";

/** Like TrackView, but the server allows each (event, subject) to be sent only once ever. */
export function TrackOnce({ event, subject, params }: { event: string; subject: string; params?: AnalyticsParams }) {
  useEffect(() => {
    let stopped = false;
    void fetch("/api/analytics/once", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, subject }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { send?: boolean } | null) => {
        if (!stopped && d?.send) trackEvent(event, params);
      })
      .catch(() => {});
    return () => {
      stopped = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, subject]);
  return null;
}
