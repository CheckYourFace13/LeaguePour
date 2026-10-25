/**
 * Once-only paid-conversion reporting (GA4 `subscription_activated`).
 *
 * Identity is the Stripe subscription id. The webhook marks a subscription "pending" when it
 * processes the Checkout that created it (insert-only: a retried webhook delivery hits the primary
 * key and changes nothing, so it can never re-arm a conversion that was already counted). A
 * signed-in page then claims it with a conditional update pending -> counted: exactly one request
 * wins, so reloads, a second tab, or a bookmarked return URL never report it again. Subscriptions
 * that existed before this marker never get one, so they are never reported as new.
 */
import { prisma } from "@/lib/db";

const key = (subscriptionId: string) => `conversion:subscription_activated:${subscriptionId}`;

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; message?: string; cause?: { code?: string } } | null;
  return e?.code === "P2002" || e?.cause?.code === "23505" || /Unique constraint|duplicate key/i.test(e?.message ?? "");
}

export async function markConversionPending(subscriptionId: string, detail: { product: string; plan?: string; interval?: string }) {
  try {
    await prisma.appSetting.create({
      data: { key: key(subscriptionId), value: JSON.stringify({ state: "pending", ...detail, at: new Date().toISOString() }) },
    });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
  }
}

export type ClaimedConversion = { subscriptionId: string; product: string; plan?: string; interval?: string };

/** Claims the pending conversion for this subscription. Returns it to the single winner, else null. */
export async function claimConversion(subscriptionId: string | null | undefined): Promise<ClaimedConversion | null> {
  if (!subscriptionId) return null;
  const row = await prisma.appSetting.findUnique({ where: { key: key(subscriptionId) } });
  if (!row) return null;
  let detail: { state?: string; product?: string; plan?: string; interval?: string };
  try {
    detail = JSON.parse(row.value);
  } catch {
    return null;
  }
  if (detail.state !== "pending") return null;
  const { count } = await prisma.appSetting.updateMany({
    where: { key: key(subscriptionId), value: row.value },
    data: { value: JSON.stringify({ ...detail, state: "counted", countedAt: new Date().toISOString() }) },
  });
  if (count !== 1) return null;
  return { subscriptionId, product: detail.product ?? "lp", plan: detail.plan, interval: detail.interval };
}

/** Cheap render-time check: is there an armed, not-yet-reported conversion for this subscription? */
export async function hasPendingConversion(subscriptionId: string | null | undefined): Promise<boolean> {
  if (!subscriptionId) return false;
  const row = await prisma.appSetting.findUnique({ where: { key: key(subscriptionId) }, select: { value: true } });
  return !!row && row.value.includes('"state":"pending"');
}
