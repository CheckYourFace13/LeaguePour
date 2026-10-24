import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const base = z.object({
  // Trim before validating: pasted/autofilled addresses often carry whitespace.
  email: z.string().trim().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const venueSchema = base.extend({
  accountType: z.literal("venue"),
  venueName: z.string().trim().min(2),
  // Optional at signup (deferred to the venue profile); stored as a neutral default.
  venueType: z.string().trim().optional(),
  city: z.string().optional(),
  formattedAddress: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  googlePlaceId: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
});

const playerSchema = base.extend({
  accountType: z.literal("player"),
  homeCity: z.string().optional(),
});

const schema = z.discriminatedUnion("accountType", [venueSchema, playerSchema]);

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48);
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const email = data.email.trim().toLowerCase();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email already registered", code: "email_taken" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  try {
    await createAccount(data, email, passwordHash);
  } catch (err) {
    // Two simultaneous signups with one email both pass the check above; the unique index on
    // User.email makes the second fail here. Same answer as the pre-check, not a 500.
    // Prisma 7's driver adapter reports `meta.modelName` (no `target`) for unique violations.
    const e = err as { code?: string; message?: string; meta?: { target?: unknown; modelName?: string } };
    const onUserEmail =
      e?.meta?.modelName === "User" || JSON.stringify(e?.meta?.target ?? "").includes("email") || /\(`email`\)/.test(e?.message ?? "");
    if (e?.code === "P2002" && onUserEmail) {
      return NextResponse.json({ error: "Email already registered", code: "email_taken" }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}

async function createAccount(data: z.infer<typeof schema>, email: string, passwordHash: string) {
  if (data.accountType === "venue") {
    let slug = slugify(data.venueName);
    const taken = await prisma.venue.findUnique({ where: { slug } });
    if (taken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: data.name,
          passwordHash,
        },
      });
      const venue = await tx.venue.create({
        data: {
          name: data.venueName,
          slug,
          venueType: data.venueType || "Venue",
          description: `${data.venueName} on LeaguePour`,
          city: data.city || null,
          formattedAddress: data.formattedAddress || null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          // Real production bug, caught live: googlePlaceId is @unique in schema.prisma. `??`
          // only coalesces null/undefined, not "" - a venue signup that skips the "Find your
          // venue" search (the form explicitly invites this: "Skip only if you will add it
          // later") sends googlePlaceId: "", and ANY second such signup then hits a unique
          // constraint violation and 500s. `||` normalizes "" to null so multiple skips don't
          // collide (Postgres does not treat NULL as equal to NULL in a unique constraint).
          googlePlaceId: data.googlePlaceId || null,
          websiteUrl: data.websiteUrl || null,
          phone: data.phone || null,
          collectSms: false,
          teamEventsDefault: true,
          importAudienceLater: false,
        },
      });
      await tx.venueStaff.create({
        data: {
          venueId: venue.id,
          userId: user.id,
          role: "OWNER",
        },
      });
    });
  } else {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: data.name,
          passwordHash,
        },
      });
      await tx.playerProfile.create({
        data: {
          userId: user.id,
          homeCity: data.homeCity ?? null,
          onboardingComplete: Boolean(data.homeCity),
        },
      });
      await tx.communicationPreference.create({
        data: {
          userId: user.id,
          emailOffers: true,
          smsOffers: false,
          eventReminders: true,
          frequency: "normal",
          globalOptOut: false,
        },
      });
    });
  }
}
