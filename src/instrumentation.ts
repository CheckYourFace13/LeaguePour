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
 * not get rewritten the same way a statically-analyzed route import does. Wrapped in try/catch
 * with the failure persisted to AppSetting (readable via /api/cron/scheduler-status) since a
 * silent failure here would otherwise be undebuggable without server log access.
 */
export async function register() {
  // This module is evaluated for every Next.js runtime (nodejs, edge); the scheduler uses
  // Node-only APIs (setInterval is fine everywhere, but this guard keeps it from double-running
  // under edge middleware's separate instrumentation pass).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

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
