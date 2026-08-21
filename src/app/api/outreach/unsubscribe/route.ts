import { prisma } from "@/lib/db";

/**
 * One-click unsubscribe for outreach emails (CAN-SPAM).
 * Public by design — the contact id is the token. Uses updateMany so no
 * row payload (and no possibly-missing columns) is selected.
 */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("c")?.trim() ?? "";
  let ok = false;
  if (id) {
    try {
      // Unsubscribing from either brand's cold outreach stops both - same company, same
      // recipient's reasonable expectation, and the safer choice against spam complaints.
      const res = await prisma.outreachContact.updateMany({
        where: { id },
        data: { status: "NOT_INTERESTED", vsStatus: "NOT_INTERESTED", notes: "Unsubscribed via email link" },
      });
      ok = res.count > 0;
    } catch (err) {
      console.error("[outreach unsubscribe] failed", err);
    }
  }

  const body = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Unsubscribed</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f7ff;margin:0;padding:60px 20px;text-align:center;color:#1a1f36;">
  <h1 style="font-size:22px;">${ok ? "You're unsubscribed" : "Link not recognized"}</h1>
  <p style="color:#4a5568;">${
    ok
      ? "We won't email you again. Sorry for the interruption."
      : "This unsubscribe link is invalid or already used. If you keep getting email, reply to it and we'll remove you manually."
  }</p>
</body></html>`;

  return new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
