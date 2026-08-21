/**
 * Small key/value settings store for flags the owner should be able to flip instantly from the
 * admin panel, without a code deploy or app restart (unlike an env var change on most hosts).
 */
import { prisma } from "@/lib/db";

export async function getSetting(key: string, fallback: string): Promise<string> {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key } });
    return row?.value ?? fallback;
  } catch {
    // Table may not exist yet if the pending migration hasn't been applied - fail open to the
    // caller-provided fallback rather than crashing whatever route/action called this.
    return fallback;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function getBoolSetting(key: string, fallback: boolean): Promise<boolean> {
  const raw = await getSetting(key, fallback ? "true" : "false");
  return raw === "true";
}
