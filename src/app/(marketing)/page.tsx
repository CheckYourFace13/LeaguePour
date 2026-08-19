import type { Metadata } from "next";
import { HomePage } from "@/components/marketing/home-page";

export const metadata: Metadata = {
  title: { absolute: "LeaguePour | Venue Competition Software for Bars" },
  description:
    "LeaguePour is venue competition software for bars: tournament signup software, player registration, Stripe entry fees, and league management in one platform.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "LeaguePour | Venue Competition Software for Bars",
    description:
      "Bar competition software for trivia, dart league, cornhole tournament, and recurring game nights.",
    url: "/",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeaguePour | Venue Competition Software for Bars",
    description: "Tournament signup and player registration software built for bars and venue game nights.",
    images: ["/opengraph-image"],
  },
};

export default function Page() {
  return <HomePage />;
}
