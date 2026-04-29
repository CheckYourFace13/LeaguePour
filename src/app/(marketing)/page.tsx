import type { Metadata } from "next";
import { HomePage } from "@/components/marketing/home-page";

export const metadata: Metadata = {
  title: "LeaguePour | Venue Competition Software for Bars",
  description:
    "LeaguePour is venue competition software for bars: tournament signup software, player registration, Stripe entry fees, and league management in one platform.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "LeaguePour | Venue Competition Software for Bars",
    description:
      "Bar competition software for trivia, dart league, cornhole tournament, and recurring game nights.",
    url: "/",
  },
  twitter: {
    title: "LeaguePour | Venue Competition Software for Bars",
    description: "Tournament signup and player registration software built for bars and venue game nights.",
  },
};

export default function Page() {
  return <HomePage />;
}
