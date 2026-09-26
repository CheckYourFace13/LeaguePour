import { NextResponse } from "next/server";
import { runJob } from "@/lib/job-runs";
import { runContentEngine } from "@/lib/content-engine/publish";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured on the server." }, { status: 500 });
  }
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const dryRun = url.searchParams.get("dryRun") === "true";

  try {
    const outcome = await runJob("content-engine-vs", async () => {
      const result = await runContentEngine("VS", { dryRun });
      return { status: result.status === "skipped" ? "skipped" : "success", detail: JSON.stringify(result), result };
    });
    return NextResponse.json({ ok: true, result: outcome });
  } catch (err) {
    console.error("[content-engine-vs] failed", err);
    return NextResponse.json({ ok: false, error: "VS content engine run failed." }, { status: 500 });
  }
}
