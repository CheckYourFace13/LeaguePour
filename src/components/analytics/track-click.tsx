"use client";

import { trackEvent, type AnalyticsParams } from "@/lib/analytics";

/** Wraps a submit button (or any element) to fire a GA4 event on click, then let the
 * native action (form submit, link navigation) proceed normally. */
export function TrackClick({
  event,
  params,
  children,
}: {
  event: string;
  params?: AnalyticsParams;
  children: React.ReactElement;
}) {
  return (
    <span onClick={() => trackEvent(event, params)} className="contents">
      {children}
    </span>
  );
}
