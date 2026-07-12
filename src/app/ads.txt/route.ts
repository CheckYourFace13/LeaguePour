export const dynamic = "force-static";

const ADS_TXT =
  "google.com, pub-9572509189594279, DIRECT, f08c47fec0942fa0\n";

export async function GET() {
  return new Response(ADS_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
