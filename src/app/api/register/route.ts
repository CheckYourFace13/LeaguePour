import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const base = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const venueSchema = base.extend({
  accountType: z.literal("venue"),
  venueName: z.string().min(2),
  venueType: z.string().min(1),
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
  const email = data.email.toLowerCase();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

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
          venueType: data.venueType,
          description: `${data.venueName} on LeaguePour`,
          city: data.city ?? null,
          formattedAddress: data.formattedAddress ?? null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          googlePlaceId: data.googlePlaceId ?? null,
          websiteUrl: data.websiteUrl || null,
          phone: data.phone ?? null,
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

  return NextResponse.json({ ok: true });
}
