import type { Metadata } from "next";
import Script from "next/script";
import { VsHeader } from "@/components/venuesprocket/vs-header";
import { VsFooter } from "@/components/venuesprocket/vs-footer";
import { VsSiteJsonLd } from "@/components/venuesprocket/vs-site-json-ld";
import { VenueSprocketGoogleTags } from "@/components/venuesprocket/vs-google-tags";

export const metadata: Metadata = {
  metadataBase: new URL("https://venuesprocket.com"),
  title: {
    default: "VenueSprocket — Private Event Booking & Venue Management Software",
    template: "%s | VenueSprocket",
  },
  description:
    "VenueSprocket helps restaurants, breweries, bars, and event spaces book private events, send proposals, sign contracts, collect deposits, and create BEOs.",
  openGraph: {
    siteName: "VenueSprocket",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  // OG/Twitter share image comes from app/venuesprocket/opengraph-image.tsx.
  // Nested path directly, not a rewritten root path - see manifest.webmanifest/route.ts's comment.
  manifest: "/venuesprocket/manifest.webmanifest",
};

export default function VenueSprocketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-vs-bg text-vs-text font-sans">
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9572509189594279"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <VenueSprocketGoogleTags />
      <VsSiteJsonLd />
      <VsHeader />
      <main className="flex-1">{children}</main>
      <VsFooter />
    </div>
  );
}
