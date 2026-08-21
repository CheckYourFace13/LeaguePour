"use client";

import { useEffect } from "react";

const VS_MEASUREMENT_ID = "G-FHCFV1532R";

/**
 * VenueSprocket's GA4 tag, injected via a plain imperative DOM script append rather than
 * next/script. Two next/script-based attempts were tried first and both failed in the same way
 * on real browser testing (network requests + window.dataLayer inspection): a <link rel=preload>
 * hint appeared in the HTML, but the actual <script> element never got created/executed -
 * document.readyState reached "complete" with zero gtag scripts in the DOM and no dataLayer,
 * reproduced on every real page load tested, both with the tag declared directly in the nested
 * venuesprocket layout and (this file's previous version) as a next/script client component. The
 * equivalent next/script-based approach in the root layout works correctly for LeaguePour's own
 * tag, so whatever's going wrong here is specific to next/script's handling of a second
 * "afterInteractive" gtag.js instance in this app, not something that shows up from reading the
 * code. This sidesteps next/script's loading queue entirely - a plain document.createElement/
 * appendChild has no such failure mode to inherit.
 */
export function VenueSprocketGoogleTags() {
  useEffect(() => {
    if (document.getElementById("vs-gtag-src")) return; // already injected (e.g. fast client nav)

    const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    w.gtag =
      w.gtag ||
      function gtag(...args: unknown[]) {
        w.dataLayer!.push(args);
      };
    w.gtag("js", new Date());
    w.gtag("config", VS_MEASUREMENT_ID);

    const script = document.createElement("script");
    script.id = "vs-gtag-src";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${VS_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }, []);

  return null;
}
