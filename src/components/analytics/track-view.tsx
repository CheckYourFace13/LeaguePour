"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsParams } from "@/lib/analytics";

/** Fires a GA4 event once when the page mounts. Drop into a server-component page/layout. */
export function TrackView({ event, params }: { event: string; params?: AnalyticsParams }) {
  useEffect(() => {
    trackEvent(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
