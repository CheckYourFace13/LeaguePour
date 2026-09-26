import { NextResponse } from "next/server";
import { runJob } from "@/lib/job-runs";
import { refreshBrandGuides } from "@/lib/content-engine/refresh";

// Monthly decay/refresh pass for both brands' auto-generated guides - see refresh.ts's doc
// comment. One route for both brands (unlike the two separate content-engine-{lp,vs} publish
// routes) since this never publishes anything new and is cheap to run for both in one call.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured on the server." }, { status: 500 });
  }
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const outcome = await runJob("content-refresh", async () => {
      const [lp, vs] = await Promise.all([refreshBrandGuides("LP"), refreshBrandGuides("VS")]);
      const updated = [...lp, ...vs].filter((r) => r.updated).length;
      return { status: "success" as const, detail: `LP: ${lp.length} checked, VS: ${vs.length} checked, ${updated} updated.`, result: { lp, vs } };
    });
    return NextResponse.json({ ok: true, result: outcome });
  } catch (err) {
    console.error("[content-refresh] failed", err);
    return NextResponse.json({ ok: false, error: "Content refresh run failed." }, { status: 500 });
  }
}
