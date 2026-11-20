import { DEMO_VIDEOS, toWebVtt, type DemoVideoId } from "@/lib/demo-videos";

// Captions for the recorded product demos, served as text/vtt (Hostinger's static layer would send
// a public/*.vtt file as text/plain, which some browsers refuse for <track>). Static: the cues are
// compiled in from src/lib/demo-videos.ts. Served on both hosts - middleware's matcher skips .vtt.
export const dynamic = "force-static";

export function generateStaticParams() {
  return Object.keys(DEMO_VIDEOS).map((id) => ({ file: `${id}.vtt` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const id = file.replace(/\.vtt$/, "") as DemoVideoId;
  if (!file.endsWith(".vtt") || !(id in DEMO_VIDEOS)) return new Response("Not found", { status: 404 });
  return new Response(toWebVtt(DEMO_VIDEOS[id].cues), {
    headers: {
      "Content-Type": "text/vtt; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
