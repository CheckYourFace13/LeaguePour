"use server";

import { requireOwnerSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { OUTREACH_CITIES, type OutreachCity } from "@/lib/outreach-cities";

const PLACES_BASE = "https://maps.googleapis.com/maps/api/place";

// --- Stats / progress ---

export async function getOutreachStats() {
  await requireOwnerSession();

  const [statusCounts, totalContacts] = await Promise.all([
    prisma.outreachContact.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.outreachContact.count(),
  ]);

  // Which cities have been swept (any contact with that city+state+country)
  const sweptRaw = await prisma.outreachContact.findMany({
    distinct: ["city", "state", "country"],
    select: { city: true, state: true, country: true },
  });
  const swept = sweptRaw as { city: string; state: string; country: string }[];
  const sweptKeys = new Set<string>(swept.map((c) => `${c.city}|${c.state}|${c.country}`));

  // Deduplicate OUTREACH_CITIES by city+state+country for counting
  const uniqueCities = new Map<string, OutreachCity>();
  for (const c of OUTREACH_CITIES) {
    const key = `${c.city}|${c.state}|${c.country}`;
    if (!uniqueCities.has(key)) uniqueCities.set(key, c);
  }

  const totalCities = uniqueCities.size;
  const sweptCities = [...sweptKeys].filter((k) => uniqueCities.has(k)).length;

  const byStatus = Object.fromEntries(
    statusCounts.map((s: { status: string; _count: { id: number } }) => [s.status, s._count.id]),
  ) as Record<string, number>;

  // Find next city to sweep
  let nextCity: OutreachCity | null = null;
  for (const c of OUTREACH_CITIES) {
    const key = `${c.city}|${c.state}|${c.country}`;
    if (!sweptKeys.has(key)) {
      nextCity = c;
      break;
    }
  }

  // If all swept, restart from beginning
  if (!nextCity) nextCity = OUTREACH_CITIES[0] ?? null;

  return {
    totalCities,
    sweptCities,
    totalContacts,
    notContacted: byStatus["NOT_CONTACTED"] ?? 0,
    emailSent: byStatus["EMAIL_SENT"] ?? 0,
    responded: byStatus["RESPONDED"] ?? 0,
    signedUp: byStatus["SIGNED_UP"] ?? 0,
    notInterested: byStatus["NOT_INTERESTED"] ?? 0,
    nextCity,
    allSwept: sweptCities >= totalCities,
  };
}

// --- Sweep a specific city ---

export async function sweepCity(
  city: string,
  state: string,
  country: string,
  query: string,
): Promise<{ added: number; skipped: number; error?: string }> {
  try {
    await requireOwnerSession();
  } catch {
    return { added: 0, skipped: 0, error: "Not authorised" };
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return { added: 0, skipped: 0, error: "GOOGLE_PLACES_API_KEY not configured" };

  const seen = new Set<string>();
  const toUpsert: {
    placeId: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    phone?: string;
    website?: string;
    rating?: number;
  }[] = [];

  const searchUrl = new URL(`${PLACES_BASE}/textsearch/json`);
  searchUrl.searchParams.set("query", query);
  searchUrl.searchParams.set("type", "bar");
  searchUrl.searchParams.set("key", apiKey);

  try {
    const res = await fetch(searchUrl.toString());
    if (!res.ok) return { added: 0, skipped: 0, error: `Places API error ${res.status}` };

    const data = (await res.json()) as {
      results: {
        place_id: string;
        name: string;
        formatted_address: string;
        rating?: number;
      }[];
    };

    for (const place of data.results ?? []) {
      if (seen.has(place.place_id)) continue;
      seen.add(place.place_id);

      let phone: string | undefined;
      let website: string | undefined;
      try {
        const detailUrl = new URL(`${PLACES_BASE}/details/json`);
        detailUrl.searchParams.set("place_id", place.place_id);
        detailUrl.searchParams.set("fields", "formatted_phone_number,website");
        detailUrl.searchParams.set("key", apiKey);
        const dr = await fetch(detailUrl.toString());
        const dd = (await dr.json()) as {
          result: { formatted_phone_number?: string; website?: string };
        };
        phone = dd.result?.formatted_phone_number;
        website = dd.result?.website;
      } catch {
        // detail fetch failed - continue without
      }

      toUpsert.push({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        city,
        state,
        country,
        phone,
        website,
        rating: place.rating,
      });

      if (toUpsert.length >= 40) break;
    }
  } catch (err) {
    return { added: 0, skipped: 0, error: err instanceof Error ? err.message : "Unknown error" };
  }

  let added = 0;
  let skipped = 0;
  for (const c of toUpsert) {
    try {
      await prisma.outreachContact.upsert({
        where: { placeId: c.placeId },
        create: {
          placeId: c.placeId,
          name: c.name,
          address: c.address,
          city: c.city,
          state: c.state,
          country: c.country,
          phone: c.phone,
          website: c.website,
          rating: c.rating,
        },
        update: {
          name: c.name,
          address: c.address,
          phone: c.phone,
          website: c.website,
          rating: c.rating,
        },
      });
      added++;
    } catch {
      skipped++;
    }
  }

  return { added, skipped };
}

// --- Sweep the next unprocessed city ---

export async function sweepNextCity(): Promise<{
  city?: OutreachCity;
  added: number;
  skipped: number;
  error?: string;
  allDone?: boolean;
}> {
  try {
    await requireOwnerSession();
  } catch {
    return { added: 0, skipped: 0, error: "Not authorised" };
  }

  const sweptRaw2 = await prisma.outreachContact.findMany({
    distinct: ["city", "state", "country"],
    select: { city: true, state: true, country: true },
  });
  const swept2 = sweptRaw2 as { city: string; state: string; country: string }[];
  const sweptKeys = new Set<string>(swept2.map((c) => `${c.city}|${c.state}|${c.country}`));

  let target: OutreachCity | null = null;
  for (const c of OUTREACH_CITIES) {
    const key = `${c.city}|${c.state}|${c.country}`;
    if (!sweptKeys.has(key)) {
      target = c;
      break;
    }
  }

  if (!target) {
    // All cities done - restart from Chicago
    target = OUTREACH_CITIES[0];
    if (!target) return { added: 0, skipped: 0, allDone: true };
    // Clear existing contacts to start fresh (keep status history by resetting to NOT_CONTACTED)
    await prisma.outreachContact.updateMany({
      where: {},
      data: { status: "NOT_CONTACTED" },
    });
  }

  const result = await sweepCity(
    target.city,
    target.state,
    target.country,
    target.query,
  );
  return { city: target, ...result };
}

// --- Contact management ---

export async function updateContactStatus(
  id: string,
  status: "NOT_CONTACTED" | "EMAIL_SENT" | "RESPONDED" | "SIGNED_UP" | "NOT_INTERESTED",
): Promise<{ ok: boolean }> {
  try {
    await requireOwnerSession();
  } catch {
    return { ok: false };
  }

  await prisma.outreachContact.update({
    where: { id },
    data: {
      status,
      ...(status === "EMAIL_SENT" ? { emailSentAt: new Date() } : {}),
    },
  });
  return { ok: true };
}

export async function updateContactNotes(id: string, notes: string): Promise<{ ok: boolean }> {
  try {
    await requireOwnerSession();
  } catch {
    return { ok: false };
  }
  await prisma.outreachContact.update({ where: { id }, data: { notes } });
  return { ok: true };
}

export async function getContacts(opts: {
  city?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireOwnerSession();

  const page = opts.page ?? 0;
  const pageSize = opts.pageSize ?? 50;

  const where = {
    ...(opts.city ? { city: opts.city } : {}),
    ...(opts.status ? { status: opts.status as never } : {}),
  };

  const [contacts, total] = await Promise.all([
    prisma.outreachContact.findMany({
      where,
      orderBy: [{ city: "asc" }, { rating: "desc" }],
      skip: page * pageSize,
      take: pageSize,
    }),
    prisma.outreachContact.count({ where }),
  ]);

  return { contacts, total, page, pageSize };
}

export async function getSweptCityList() {
  await requireOwnerSession();
  const rows = await prisma.outreachContact.findMany({
    distinct: ["city", "state", "country"],
    select: { city: true, state: true, country: true },
    orderBy: [{ country: "asc" }, { state: "asc" }, { city: "asc" }],
  });
  return rows;
}
