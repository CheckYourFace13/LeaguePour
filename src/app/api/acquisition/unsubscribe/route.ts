import { unsubscribeByToken } from "@/lib/acquisition/store";

export const runtime = "nodejs";

/**
 * Opt-out for acquisition-program emails (CAN-SPAM). GET = the link in the email footer;
 * POST = RFC 8058 one-click from the List-Unsubscribe header. The opaque token is the key.
 */
async function handle(request: Request, oneClick: boolean): Promise<Response> {
  const token = new URL(request.url).searchParams.get("t")?.trim() ?? "";
  let ok = false;
  try {
    ok = token ? await unsubscribeByToken(token) : false;
  } catch (err) {
    console.error("[acquisition unsubscribe] failed", err);
  }
  if (oneClick) return new Response(null, { status: ok ? 200 : 400 });
  const body = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Unsubscribed</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:60px 20px;text-align:center;color:#1a1f36;">
  <h1 style="font-size:22px;">${ok ? "You're unsubscribed" : "Link not recognized"}</h1>
  <p style="color:#4a5568;">${
    ok
      ? "We won't email you again from LeaguePour or VenueSprocket. Sorry for the interruption."
      : "This link is invalid. Reply to the email and we'll remove you by hand."
  }</p>
</body></html>`;
  return new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export function GET(request: Request) {
  return handle(request, false);
}

export function POST(request: Request) {
  return handle(request, true);
}
