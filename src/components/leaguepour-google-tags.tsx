"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const LP_HOST = "leaguepour.com";
const LP_MEASUREMENT_ID = "G-RPNMBRYF04";
/** Double elimination share links carry entrant names here; see double-elimination-generator.tsx. */
const SHARED_BRACKET_HASH_PREFIX = "#bracket=";

/**
 * Loads LeaguePour's GA4 tag, but only when the browser is actually on a LeaguePour host
 * (leaguepour.com / www) - never on venuesprocket.com, localhost, or preview/QA hosts, whose
 * test traffic and conversions would otherwise land in the production property.
 * See the comment above <LeaguePourGoogleTags /> in src/app/layout.tsx for why this check
 * has to happen client-side (via window.location.hostname) rather than by reading the request
 * Host header on the server.
 *
 * Page scripts can read location.hash, so analytics never loads for a page opened from a shared
 * bracket link, and stops for the rest of the tab if one is opened after it has already loaded.
 */
export function LeaguePourGoogleTags() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const hasSharedBracket = () => window.location.hash.startsWith(SHARED_BRACKET_HASH_PREFIX);
    const stopIfShared = () => {
      if (hasSharedBracket()) (window as unknown as Record<string, unknown>)[`ga-disable-${LP_MEASUREMENT_ID}`] = true;
    };
    stopIfShared();
    setShouldLoad(window.location.hostname.replace(/^www\./, "") === LP_HOST && !hasSharedBracket());
    window.addEventListener("hashchange", stopIfShared);
    return () => window.removeEventListener("hashchange", stopIfShared);
  }, []);

  if (!shouldLoad) return null;

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${LP_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${LP_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
