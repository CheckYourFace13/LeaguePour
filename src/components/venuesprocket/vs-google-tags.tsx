"use client";

import Script from "next/script";

const VS_MEASUREMENT_ID = "G-FHCFV1532R";

/**
 * VenueSprocket's GA4 tag, loaded from a client component rather than declared directly in
 * src/app/venuesprocket/layout.tsx. Live browser testing (network requests + window.dataLayer
 * inspection, not just reading source or curling server HTML) found that a directly-declared
 * next/script "afterInteractive" tag in that nested layout was present in the server-rendered
 * HTML but never actually mounted/loaded client-side - readyState reached "complete" with zero
 * gtag scripts in the DOM and no dataLayer, on every real page load tested. The equivalent
 * pattern in the root layout (src/components/leaguepour-google-tags.tsx) verified working via
 * the same method, so this converges VS onto that same proven-working approach rather than
 * further chasing the exact Next.js internal cause of the nested-layout version's failure.
 */
export function VenueSprocketGoogleTags() {
  return (
    <>
      <Script
        id="vs-gtag-src"
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${VS_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="vs-google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${VS_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
