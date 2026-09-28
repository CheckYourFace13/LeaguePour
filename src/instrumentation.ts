/**
 * Next.js server-startup hook (runs once when the server process boots - see
 * https://nextjs.org/docs/app/guides/instrumentation). Used here to start the in-process cron
 * scheduler (src/lib/scheduler.ts) - see that file's doc comment for why scheduled jobs are
 * triggered via a loopback fetch from inside this process rather than relying solely on
 * GitHub Actions hitting the public domain.
 *
 * Uses a relative import path deliberately, not the "@/" tsconfig alias used everywhere else in
 * this codebase - instrumentation.ts goes through a more minimal bundling pass than normal
 * pages/routes (per Next's own docs examples for this exact "conditionally import runtime code"
 * pattern, which use relative paths, not aliases) and a dynamic `import("@/lib/x")` alias may
 * not get rewritten the same way a statically-analyzed route import does.
 *
 * Deliberately does NOT gate on `process.env.NEXT_RUNTIME === "nodejs"` (the pattern Next's own
 * docs show) - live production evidence (scheduler-status: the server was already serving
 * requests, which per Next's own contract means register() had already run to completion,
 * yet started stayed false with no captured error) showed that guard silently short-circuiting
 * on this specific host, for a reason that couldn't be root-caused further without server log
 * access. Safe to drop: the scheduler only uses fetch/setInterval/setTimeout, all available in
 * every Next.js runtime.
 *
 * DOES skip the edge runtime explicitly (`=== "edge"`, not `!== "nodejs"`, so an unset
 * NEXT_RUNTIME still starts the scheduler). register() also runs inside each edge (middleware)
 * sandbox, which does not share module state with the Node.js server - so the `started` flag
 * never deduped it, and production logs showed extra scheduler copies ticking there, each able
 * to trigger every cron job (and each failing to write status, since Prisma can't load in edge).
 * startInProcessScheduler() repeats the same guard as defense in depth.
 *
 * Wrapped in try/catch with any failure persisted to AppSetting (readable via
 * /api/cron/scheduler-status) since a silent failure here would otherwise be undebuggable.
 */
export async function register() {
  // A wrapping `if`, not an early return: webpack only drops the edge bundle's dynamic imports
  // (Prisma/pg, which can't resolve in edge) from a statically-dead branch.
  if (process.env.NEXT_RUNTIME !== "edge") {
    try {
      const { setSetting } = await import("./lib/app-settings");
      await setSetting(
        "scheduler_register_entered",
        `${new Date().toISOString()} runtime=${process.env.NEXT_RUNTIME ?? "(unset)"}`,
      );
    } catch {
      // Best-effort marker only - never block startup on it.
    }

    try {
      const { startInProcessScheduler } = await import("./lib/scheduler");
      startInProcessScheduler();
    } catch (err) {
      const message = err instanceof Error ? (err.stack ?? err.message) : String(err);
      console.error("[instrumentation] register() failed", err);
      try {
        const { setSetting } = await import("./lib/app-settings");
        await setSetting("scheduler_register_error", `${new Date().toISOString()} ${message}`.slice(0, 2000));
      } catch {
        // If even this fails (e.g. DB unreachable at boot), there's nothing more we can do here.
      }
    }
  }
}
