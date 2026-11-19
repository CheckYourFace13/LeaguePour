/**
 * Outbound webhooks for VenueSprocket: a venue can point new-inquiry events at its own HTTPS
 * endpoint (Zapier "Catch Hook", Make, n8n, a CRM, its own server). One endpoint per venue,
 * stored in AppSetting as JSON so no schema change is needed.
 *
 * Security:
 *  - HTTPS only, default port only, no credentials in the URL.
 *  - The hostname is resolved at connect time through a custom `lookup` that refuses private,
 *    loopback, link-local, CGNAT, multicast and reserved addresses - checked on the exact address
 *    the socket connects to, so DNS rebinding between "validate" and "send" can't reach internal
 *    hosts. Redirects are never followed.
 *  - Every request is signed: `VenueSprocket-Signature: t=<unix>,v1=<hex HMAC-SHA256 of "t.body">`.
 *  - 5 s timeout, one retry, failures recorded in OperationalFailure. Never throws to the caller.
 */
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { lookup as dnsLookup, type LookupAddress } from "node:dns";
import https from "node:https";
import { isIP } from "node:net";
import { prisma } from "@/lib/db";
import { logOperationalFailure } from "@/lib/operational-failure";

export type WebhookConfig = { url: string; secret: string; createdAt: string };
export type WebhookEventType = "lead.created" | "webhook.test";

const configKey = (venueId: string) => `vs-webhook:${venueId}`;

// ─── Address policy ──────────────────────────────────────────────────────────

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, o) => (acc << 8) + Number(o), 0) >>> 0;
}

function inV4(ip: string, cidr: string): boolean {
  const [base, bits] = cidr.split("/");
  const mask = Number(bits) === 0 ? 0 : (~0 << (32 - Number(bits))) >>> 0;
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(base) & mask);
}

const BLOCKED_V4 = [
  "0.0.0.0/8",
  "10.0.0.0/8",
  "100.64.0.0/10",
  "127.0.0.0/8",
  "169.254.0.0/16",
  "172.16.0.0/12",
  "192.0.0.0/24",
  "192.0.2.0/24",
  "192.168.0.0/16",
  "198.18.0.0/15",
  "198.51.100.0/24",
  "203.0.113.0/24",
  "224.0.0.0/4",
  "240.0.0.0/4",
];

/** True when an address must never receive a webhook (internal or reserved). */
export function isBlockedAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return BLOCKED_V4.some((c) => inV4(ip, c));
  if (family === 6) {
    const lower = ip.toLowerCase();
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedAddress(mapped[1]);
    if (lower === "::" || lower === "::1") return true;
    const first = parseInt(lower.split(":")[0] || "0", 16);
    if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
    if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 link local
    if ((first & 0xff00) === 0xff00) return true; // multicast
    if (lower.startsWith("64:ff9b:") || lower.startsWith("2001:db8:") || lower.startsWith("100::")) return true;
    return false;
  }
  return true;
}

/** Synchronous shape check; DNS is checked at connect time. Returns an error message or null. */
export function validateWebhookUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return "Enter a full URL starting with https://";
  }
  if (u.protocol !== "https:") return "The webhook URL must use https://";
  if (u.username || u.password) return "Remove the username/password from the URL";
  if (u.port && u.port !== "443") return "Use the standard HTTPS port (443)";
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (!host.includes(".") && !isIP(host)) return "Use a public hostname";
  if (isIP(host) && isBlockedAddress(host)) return "That address is private or reserved";
  if (/(^|\.)(localhost|local|internal|localdomain)$/i.test(host)) return "That hostname is private";
  if (raw.length > 500) return "That URL is too long";
  return null;
}

type LookupCb = (err: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void;

function safeLookup(hostname: string, options: object, callback: LookupCb) {
  dnsLookup(hostname, { all: true }, (err, addresses) => {
    if (err) return callback(err, "", 4);
    const list = addresses as LookupAddress[];
    const allowed = list.filter((a) => !isBlockedAddress(a.address));
    if (allowed.length === 0 || allowed.length !== list.length) {
      const e = new Error(`Refused to connect: ${hostname} resolves to a private or reserved address`) as NodeJS.ErrnoException;
      e.code = "EWEBHOOKBLOCKED";
      return callback(e, "", 4);
    }
    if ((options as { all?: boolean }).all) return callback(null, allowed);
    callback(null, allowed[0].address, allowed[0].family);
  });
}

// ─── Signing ─────────────────────────────────────────────────────────────────

export function signWebhookBody(secretKey: string, body: string, timestamp: number): string {
  const mac = createHmac("sha256", secretKey).update(`${timestamp}.${body}`).digest("hex");
  return `t=${timestamp},v1=${mac}`;
}

export function newWebhookSecret(): string {
  return `whsec_${randomBytes(24).toString("hex")}`;
}

// ─── Config storage ──────────────────────────────────────────────────────────

export async function getWebhookConfig(venueId: string): Promise<WebhookConfig | null> {
  const row = await prisma.appSetting.findUnique({ where: { key: configKey(venueId) } });
  if (!row) return null;
  try {
    const parsed = JSON.parse(row.value) as WebhookConfig;
    return parsed.url && parsed.secret ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveWebhookConfig(venueId: string, url: string, keepSecret = true): Promise<WebhookConfig> {
  const existing = keepSecret ? await getWebhookConfig(venueId) : null;
  const config: WebhookConfig = {
    url: url.trim(),
    secret: existing?.secret ?? newWebhookSecret(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  await prisma.appSetting.upsert({
    where: { key: configKey(venueId) },
    create: { key: configKey(venueId), value: JSON.stringify(config) },
    update: { value: JSON.stringify(config) },
  });
  return config;
}

export async function deleteWebhookConfig(venueId: string): Promise<void> {
  await prisma.appSetting.deleteMany({ where: { key: configKey(venueId) } });
}

// ─── Delivery ────────────────────────────────────────────────────────────────

export type DeliveryResult = { ok: boolean; status?: number; error?: string };

function postOnce(url: string, body: string, headers: Record<string, string>): Promise<DeliveryResult> {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.request(
      {
        protocol: "https:",
        hostname: u.hostname.replace(/^\[|\]$/g, ""),
        port: 443,
        path: `${u.pathname}${u.search}`,
        method: "POST",
        headers: { ...headers, "Content-Length": Buffer.byteLength(body) },
        lookup: safeLookup as never,
        timeout: 5000,
      },
      (res) => {
        res.resume(); // discard the body; we only need the status
        const status = res.statusCode ?? 0;
        resolve({ ok: status >= 200 && status < 300, status });
      },
    );
    req.on("timeout", () => req.destroy(new Error("Timed out after 5 seconds")));
    req.on("error", (err) => resolve({ ok: false, error: err.message.slice(0, 200) }));
    req.end(body);
  });
}

export async function deliverWebhook(
  config: WebhookConfig,
  type: WebhookEventType,
  data: Record<string, unknown>,
  opts: { retry?: boolean } = {},
): Promise<DeliveryResult> {
  const shapeError = validateWebhookUrl(config.url);
  if (shapeError) return { ok: false, error: shapeError };
  const body = JSON.stringify({ id: `evt_${randomUUID()}`, type, created_at: new Date().toISOString(), data });
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "VenueSprocket-Webhooks/1.0",
    "VenueSprocket-Event": type,
    "VenueSprocket-Signature": signWebhookBody(config.secret, body, Math.floor(Date.now() / 1000)),
  };
  let result = await postOnce(config.url, body, headers);
  const retryable = !result.ok && (result.status == null || result.status >= 500 || result.status === 429);
  if (retryable && opts.retry !== false) {
    await new Promise((r) => setTimeout(r, 2000));
    result = await postOnce(config.url, body, headers);
  }
  return result;
}

/** Fire-and-record for a venue's configured endpoint. Never throws. */
export async function sendVenueWebhook(venueId: string, type: WebhookEventType, data: Record<string, unknown>): Promise<void> {
  try {
    const config = await getWebhookConfig(venueId);
    if (!config) return;
    const result = await deliverWebhook(config, type, data);
    if (!result.ok) {
      await logOperationalFailure({
        category: "vs-webhook",
        venueId,
        summary: `Webhook ${type} was not accepted by ${new URL(config.url).hostname}`,
        detail: result.status ? `HTTP ${result.status}` : result.error ?? null,
        retryable: false,
      });
    }
  } catch (err) {
    console.error("[webhooks] delivery crashed", err);
  }
}
