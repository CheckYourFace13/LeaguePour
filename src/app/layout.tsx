import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Barlow_Condensed, Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { getPublicSiteUrl } from "@/lib/site-url";
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
    images: ["/og-image.png"],
    title: "LeaguePour",
    description: "Run competitions. Collect entry fees. Bring players back.",
  },
  openGraph: {
    title: "LeaguePour",
    description: "Run competitions. Collect entry fees. Bring players back.",
    siteName: "LeaguePour",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  // Icons come from the app/icon.png + app/apple-icon.png file conventions;
  // an explicit icons entry here would suppress those generated links.
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
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-RPNMBRYF04"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RPNMBRYF04');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
