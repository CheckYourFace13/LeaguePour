// venuesprocket.com/robots.txt rewrites here (see next.config.ts host rewrites).
// A nested robots.ts metadata file is ignored by Next.js (root-only convention),
// so this plain route handler serves the VS robots.txt instead.
export function GET() {
  const body = [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /venue/",
    "Disallow: /app/",
    "Disallow: /api/",
    "Disallow: /login",
    "Disallow: /signup",
    "",
    "Sitemap: https://venuesprocket.com/sitemap.xml",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
