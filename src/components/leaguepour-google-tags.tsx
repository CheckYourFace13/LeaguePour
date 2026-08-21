"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const VS_HOST = "venuesprocket.com";
const LP_MEASUREMENT_ID = "G-RPNMBRYF04";

/**
 * Loads LeaguePour's GA4 tag, but only when the browser is actually on a LeaguePour host.
 * See the comment above <LeaguePourGoogleTags /> in src/app/layout.tsx for why this check
 * has to happen client-side (via window.location.hostname) rather than by reading the request
 * Host header on the server.
 */
export function LeaguePourGoogleTags() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    setShouldLoad(window.location.hostname.replace(/^www\./, "") !== VS_HOST);
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
