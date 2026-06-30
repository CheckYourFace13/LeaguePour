import type { Metadata } from "next";
import { VsHeader } from "@/components/venuesprocket/vs-header";
import { VsFooter } from "@/components/venuesprocket/vs-footer";

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
};

export default function VenueSprocketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-vs-bg text-vs-text font-sans">
      <VsHeader />
      <main className="flex-1">{children}</main>
      <VsFooter />
    </div>
  );
}
