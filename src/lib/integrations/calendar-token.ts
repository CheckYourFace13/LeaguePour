/**
 * Secret-URL tokens for a VenueSprocket venue's private calendar feed (subscribed from Google
 * Calendar / Outlook / Apple Calendar, which cannot send credentials). The token is
 * `<venueId>.<version>.<hmac>`; the version lives in AppSetting so an owner can reset the link,
 * which invalidates every copy of the old URL without a schema change.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";

function secret(): string {
  const s = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not configured");
  return s;
}

const versionKey = (venueId: string) => `vs-calendar-version:${venueId}`;

export function signCalendarToken(venueId: string, version: number, key = secret()): string {
  const mac = createHmac("sha256", key).update(`vs-calendar:${venueId}:${version}`).digest("base64url").slice(0, 32);
  return `${venueId}.${version}.${mac}`;
}

/** Parses and checks the MAC only; the caller still has to compare the version with the current one. */
export function parseCalendarToken(token: string, key = secret()): { venueId: string; version: number } | null {
  const m = token.match(/^([a-z0-9]{10,40})\.(\d{1,6})\.([A-Za-z0-9_-]{32})$/);
  if (!m) return null;
  const venueId = m[1];
  const version = Number(m[2]);
  const expected = Buffer.from(signCalendarToken(venueId, version, key));
  const given = Buffer.from(token);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return { venueId, version };
}

export async function currentCalendarVersion(venueId: string): Promise<number> {
  const row = await prisma.appSetting.findUnique({ where: { key: versionKey(venueId) } });
  const n = Number(row?.value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export async function calendarTokenFor(venueId: string): Promise<string> {
  return signCalendarToken(venueId, await currentCalendarVersion(venueId));
}

export async function resetCalendarToken(venueId: string): Promise<void> {
  const next = (await currentCalendarVersion(venueId)) + 1;
  await prisma.appSetting.upsert({
    where: { key: versionKey(venueId) },
    create: { key: versionKey(venueId), value: String(next) },
    update: { value: String(next) },
  });
}

/** Full verification: MAC valid and version still current. */
export async function verifyCalendarToken(token: string): Promise<string | null> {
  const parsed = parseCalendarToken(token);
  if (!parsed) return null;
  return parsed.version === (await currentCalendarVersion(parsed.venueId)) ? parsed.venueId : null;
}
