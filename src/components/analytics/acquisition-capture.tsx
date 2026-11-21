"use client";

import { useEffect } from "react";
import { ACQ_COOKIE, ACQ_COOKIE_MAX_AGE, attributionFromLanding, readCookie, serializeAttribution } from "@/lib/acquisition/attribution";

const OWN_HOSTS = ["leaguepour.com", "venuesprocket.com"];
// Signed-in apps, player/guest pages and owner tools are not acquisition traffic.
const SKIP_PREFIXES = ["/internal", "/app", "/venue", "/player", "/admin", "/sign/", "/v/", "/c/", "/beo-print", "/api"];

/**
 * First-touch attribution + one aggregated session count per browser session (see
 * src/lib/acquisition/attribution.ts and daily.ts). Keeps the FIRST landing that carried UTM
 * params, an outreach ref or an external referrer. Never reads or stores personal data, and
 * never reads the URL hash (bracket share links keep names there).
 */
export function AcquisitionCapture() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.hash.includes("bracket=")) return;
      if (SKIP_PREFIXES.some((p) => url.pathname === p || url.pathname.startsWith(p.endsWith("/") ? p : `${p}/`))) return;
      const a = attributionFromLanding(url, document.referrer, OWN_HOSTS);
      if (a && !readCookie(document.cookie, ACQ_COOKIE)) {
        const secure = url.protocol === "https:" ? "; Secure" : "";
        document.cookie = `${ACQ_COOKIE}=${serializeAttribution(a)}; Max-Age=${ACQ_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
      }
      const seenKey = "acq_session_counted";
      if (sessionStorage.getItem(seenKey)) return;
      sessionStorage.setItem(seenKey, "1");
      void fetch("/api/acquisition/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: a?.ref, source: a?.source, referrerHost: a?.referrerHost }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Attribution must never break a page.
    }
  }, []);
  return null;
}
