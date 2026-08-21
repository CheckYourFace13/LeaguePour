import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { getPublicSiteUrl } from "@/lib/site-url";
import { LeaguePourGoogleTags } from "@/components/leaguepour-google-tags";
import "./globals.css";

const inter = Inter({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const siteOrigin = getPublicSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "LeaguePour | Venue Competitions & Entry Fees",
    template: "%s | LeaguePour",
  },
  description:
    "LeaguePour helps bars and venues run trivia, darts, leagues, and buy-in nights: signups, Stripe Connect entry fees, and repeat players.",
  keywords: [
    "venue software",
    "bar trivia",
    "dart league",
    "cornhole tournament",
    "competition signup",
    "Stripe Connect",
    "LeaguePour",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  applicationName: "LeaguePour",
  twitter: {
    card: "summary_large_image",
    title: "LeaguePour",
    description: "Run competitions. Collect entry fees. Bring players back.",
  },
  openGraph: {
    title: "LeaguePour",
    description: "Run competitions. Collect entry fees. Bring players back.",
    siteName: "LeaguePour",
    type: "website",
    locale: "en_US",
  },
  // Icons come from the app/icon.png + app/apple-icon.png file conventions;
  // an explicit icons entry here would suppress those generated links.
  // Same for the OG/Twitter share image: app/opengraph-image.tsx generates it.
  verification: {
    google: "LwIFXTG8T_HfBPtfvblat8kld4HFp1C8wqUTEfzPKCc",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f7ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="google-adsense-account" content="ca-pub-9572509189594279" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9572509189594279"
          crossOrigin="anonymous"
        />
        {/*
          Loaded from a client component rather than inlined here: this root layout wraps
          venuesprocket.com pages too (next.config.ts's rewrites change routing, not the Host
          header the browser actually has), and the root layout is the only one allowed to
          render <head> - a nested layout can't remove what's already here. Deciding via
          window.location.hostname client-side (instead of reading the request Host header on
          the server) keeps every marketing page statically prerenderable; checking the Host
          header here would force this layout, and everything under it, to dynamic rendering.
          Without this gate, every VS pageview/event was also being reported into LeaguePour's
          GA4 property, since VenueSprocket's own layout can only add its tag, not remove this one.
        */}
        <LeaguePourGoogleTags />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
