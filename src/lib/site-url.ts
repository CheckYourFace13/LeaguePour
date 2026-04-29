/** Canonical public origin (no trailing slash). */
export function getPublicSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://leaguepour.com").replace(/\/$/, "");
}
