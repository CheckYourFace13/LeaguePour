/** Google AdSense publisher client (verification + future ad units). */
export const ADSENSE_CLIENT_DEFAULT = "ca-pub-9572509189594279";

export function getAdsenseClient(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  if (fromEnv === "") return null;
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return ADSENSE_CLIENT_DEFAULT;
  return ADSENSE_CLIENT_DEFAULT;
}

export function adsenseScriptSrc(client: string): string {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
}
