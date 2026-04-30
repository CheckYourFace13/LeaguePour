/** Canonical public origin (no trailing slash). Safe when env is blank. */
export function getPublicSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const authUrl = process.env.AUTH_URL?.trim();
  if (authUrl) return authUrl.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  return "https://leaguepour.com";
}
