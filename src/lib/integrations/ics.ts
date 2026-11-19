/**
 * Minimal RFC 5545 (iCalendar) writer for the two calendar exports: a VenueSprocket venue's
 * private-event feed / single-event download, and a LeaguePour competition's public
 * "Add to calendar" file. Pure functions only - callers do the database reads and auth.
 *
 * Times are always written in UTC ("Z" form) so no VTIMEZONE block is needed; venue-local wall
 * times are converted with `zonedWallTimeToUtc` using the venue's IANA timezone.
 */

export type IcsEvent = {
  uid: string;
  summary: string;
  description?: string | null;
  location?: string | null;
  url?: string | null;
  /** Timed event: start/end instants. */
  start?: Date;
  end?: Date;
  /** All-day event: calendar date "YYYY-MM-DD" (used when no reliable time exists). */
  allDayDate?: string;
  status?: "CONFIRMED" | "TENTATIVE" | "CANCELLED";
  lastModified?: Date;
};

/** Escape TEXT values: backslash, semicolon, comma, newline (RFC 5545 §3.3.11). */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** Fold a content line at 75 octets (UTF-8), continuation lines start with one space. */
export function foldIcsLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let currentBytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines lose one octet to the leading space
    if (currentBytes + b > limit) {
      parts.push(current);
      current = "";
      currentBytes = 0;
    }
    current += ch;
    currentBytes += b;
  }
  if (current) parts.push(current);
  return parts.map((p, i) => (i === 0 ? p : ` ${p}`)).join("\r\n");
}

export function formatIcsUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function formatIcsDate(ymd: string): string {
  return ymd.replace(/-/g, "");
}

function nextDay(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Parse "18:00", "6:30 PM", "6pm" into minutes after midnight; null when not a clock time. */
export function parseClockTime(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const mer = m[3]?.toLowerCase().replace(/\./g, "");
  if (!m[2] && !mer) return null; // a bare number like "6" is too ambiguous
  if (min > 59) return null;
  if (mer) {
    if (h < 1 || h > 12) return null;
    if (mer === "pm" && h !== 12) h += 12;
    if (mer === "am" && h === 12) h = 0;
  } else if (h > 23) return null;
  return h * 60 + min;
}

/** Offset (ms) of `timeZone` from UTC at instant `at`. */
function tzOffsetMs(at: Date, timeZone: string): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(fmt.formatToParts(at).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - at.getTime();
}

/** Venue-local wall time ("YYYY-MM-DD" + minutes after midnight) in `timeZone` -> UTC instant. */
export function zonedWallTimeToUtc(ymd: string, minutes: number, timeZone: string): Date {
  const [y, mo, d] = ymd.split("-").map(Number);
  const naive = Date.UTC(y, mo - 1, d, Math.floor(minutes / 60), minutes % 60);
  let tz = timeZone;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
  } catch {
    tz = "UTC";
  }
  // Two passes handle the hour around a DST transition.
  let guess = naive - tzOffsetMs(new Date(naive), tz);
  guess = naive - tzOffsetMs(new Date(guess), tz);
  return new Date(guess);
}

/**
 * Build a timed or all-day IcsEvent from a calendar date plus free-text start/end times as stored
 * on VenueSprocket events. Unparseable times fall back to an all-day entry rather than guessing.
 */
export function eventTiming(
  ymd: string,
  startTime: string | null | undefined,
  endTime: string | null | undefined,
  timeZone: string,
): Pick<IcsEvent, "start" | "end" | "allDayDate"> {
  const s = parseClockTime(startTime);
  if (s == null) return { allDayDate: ymd };
  const start = zonedWallTimeToUtc(ymd, s, timeZone);
  const e = parseClockTime(endTime);
  let end: Date;
  if (e == null) end = new Date(start.getTime() + 3 * 3600_000);
  else {
    end = zonedWallTimeToUtc(ymd, e, timeZone);
    if (end <= start) end = new Date(end.getTime() + 24 * 3600_000); // runs past midnight
  }
  return { start, end };
}

export function buildIcsCalendar(opts: {
  prodId: string;
  name: string;
  events: IcsEvent[];
  /** Hint for clients that honour it (Apple, some Outlook builds); Google ignores it. */
  refreshHours?: number;
  now?: Date;
}): string {
  const stamp = formatIcsUtc(opts.now ?? new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${opts.prodId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(opts.name)}`,
  ];
  if (opts.refreshHours) {
    lines.push(`REFRESH-INTERVAL;VALUE=DURATION:PT${opts.refreshHours}H`, `X-PUBLISHED-TTL:PT${opts.refreshHours}H`);
  }
  for (const ev of opts.events) {
    lines.push("BEGIN:VEVENT", `UID:${ev.uid}`, `DTSTAMP:${stamp}`);
    if (ev.allDayDate) {
      lines.push(`DTSTART;VALUE=DATE:${formatIcsDate(ev.allDayDate)}`, `DTEND;VALUE=DATE:${formatIcsDate(nextDay(ev.allDayDate))}`);
    } else if (ev.start) {
      lines.push(`DTSTART:${formatIcsUtc(ev.start)}`);
      lines.push(`DTEND:${formatIcsUtc(ev.end ?? new Date(ev.start.getTime() + 3600_000))}`);
    }
    lines.push(`SUMMARY:${escapeIcsText(ev.summary)}`);
    if (ev.description) lines.push(`DESCRIPTION:${escapeIcsText(ev.description)}`);
    if (ev.location) lines.push(`LOCATION:${escapeIcsText(ev.location)}`);
    if (ev.url) lines.push(`URL:${ev.url}`);
    if (ev.status) lines.push(`STATUS:${ev.status}`);
    if (ev.lastModified) lines.push(`LAST-MODIFIED:${formatIcsUtc(ev.lastModified)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}

/** Safe filename stem for Content-Disposition. */
export function fileStem(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "calendar";
}
