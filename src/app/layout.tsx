import type { Metadata, Viewport } from "next";
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
    default: "LeaguePour — venue competitions & entry fees",
    template: "%s · LeaguePour",
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
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
    shortcut: "/icon",
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
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
