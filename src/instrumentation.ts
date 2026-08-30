/**
 * Next.js server-startup hook (runs once when the server process boots - see
 * https://nextjs.org/docs/app/guides/instrumentation). Used here to start the in-process cron
 * scheduler (src/lib/scheduler.ts) - see that file's doc comment for why scheduled jobs are
 * triggered via a loopback fetch from inside this process rather than relying solely on
 * GitHub Actions hitting the public domain.
 */
export async function register() {
  // This module is evaluated for every Next.js runtime (nodejs, edge); the scheduler uses
  // Node-only APIs (setInterval is fine everywhere, but this guard keeps it from double-running
  // under edge middleware's separate instrumentation pass).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startInProcessScheduler } = await import("@/lib/scheduler");
  startInProcessScheduler();
}
