"use client";

import { useEffect } from "react";
import { ACQ_COOKIE, ACQ_COOKIE_MAX_AGE, attributionFromLanding, readCookie, serializeAttribution } from "@/lib/acquisition/attribution";

const OWN_HOSTS = ["leaguepour.com", "venuesprocket.com"];

/**
 * First-touch attribution capture (see src/lib/acquisition/attribution.ts). Runs once per page
 * load: keeps the FIRST landing that carried UTM params, an outreach ref or an external referrer,
 * and reports an outreach-link visit (ref) once per browser session. Never reads or stores PII.
 */
export function AcquisitionCapture() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      // Share links carry participant names in the hash; nothing here reads the hash, but skip
      // those pages entirely to keep the share-link privacy rule simple.
      if (url.hash.includes("bracket=")) return;
      const a = attributionFromLanding(url, document.referrer, OWN_HOSTS);
      if (!a) return;
      if (!readCookie(document.cookie, ACQ_COOKIE)) {
        const secure = url.protocol === "https:" ? "; Secure" : "";
        document.cookie = `${ACQ_COOKIE}=${serializeAttribution(a)}; Max-Age=${ACQ_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
      }
      if (a.ref) {
        const seenKey = `acq_visit_${a.ref}`;
        if (sessionStorage.getItem(seenKey)) return;
        sessionStorage.setItem(seenKey, "1");
        void fetch("/api/acquisition/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ref: a.ref, path: url.pathname }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Attribution must never break a page.
    }
  }, []);
  return null;
}
