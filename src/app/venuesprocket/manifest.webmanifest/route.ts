// Route handler rather than a nested manifest.ts, for the same reason as
// src/app/venuesprocket/robots.txt/route.ts - Next's manifest.ts file convention is root-only.
// Referenced directly by its nested path from src/app/venuesprocket/layout.tsx's metadata
// (metadata.manifest), so no next.config.ts rewrite is needed for this one.
export function GET() {
  const manifest = {
    name: "VenueSprocket",
    short_name: "VenueSprocket",
    description: "Private event management for restaurants, bars, and breweries.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0e0d0c",
    icons: [
      { src: "/venuesprocket/icon.png", sizes: "32x32", type: "image/png" },
      { src: "/venuesprocket/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
