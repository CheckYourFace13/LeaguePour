import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const siteOrigin = (process.env.NEXT_PUBLIC_APP_URL ?? "https://leaguepour.com").replace(/\/$/, "");

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
  themeColor: "#050508",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${syne.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
