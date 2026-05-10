import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPublicSiteUrl } from "@/lib/site-url";
import { buildQrDataUrl } from "@/lib/qr";
import { ScoreboardClient } from "./scoreboard-client";
import type { CompData, SoloPlayer } from "./scoreboard-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venueSlug: string; competitionSlug: string }>;
}): Promise<Metadata> {
  const { venueSlug, competitionSlug } = await params;
  const comp = await prisma.competition.findFirst({
    where: { slug: competitionSlug, venue: { slug: venueSlug } },
    include: { venue: true },
  });
  if (!comp) return { title: "Scoreboard" };
  return {
    title: `${comp.title} — Scoreboard | ${comp.venue.name}`,
    robots: "noindex",
  };
}

export default async function ScoreboardPage({
  params,
}: {
  params: Promise<{ venueSlug: string; competitionSlug: string }>;
}) {
  const { venueSlug, competitionSlug } = await params;

  const comp = await prisma.competition.findFirst({
    where: { slug: competitionSlug, venue: { slug: venueSlug } },
    include: {
      venue: true,
      registrations: {
        where: { status: "CONFIRMED" },
        include: { user: { select: { name: true } } },
        take: 100,
        orderBy: { createdAt: "asc" },
      },
      standings: {
        include: { team: { select: { name: true } } },
        orderBy: [{ rank: "asc" }, { points: "desc" }],
        take: 50,
      },
      matches: {
        where: { completedAt: { not: null } },
        include: {
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
        },
        orderBy: [{ round: "asc" }],
      },
    },
  });

  if (!comp) notFound();

  type StandingRaw = { playerUserId: string | null; teamId: string | null; id: string; rank: number | null; points: number; team: { name: string } | null };
  type MatchRaw = { id: string; round: number; label: string | null; homeScore: number | null; awayScore: number | null; homeTeam: { name: string } | null; awayTeam: { name: string } | null };
  type RegRaw = { id: string; user: { name: string | null } };

  const soloPlayerIds = (comp.standings as StandingRaw[])
    .filter((s) => s.playerUserId && !s.teamId)
    .map((s) => s.playerUserId as string);

  const soloPlayers: SoloPlayer[] =
    soloPlayerIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: soloPlayerIds } },
          select: { id: true, name: true },
        })
      : [];

  const signupUrl = `${getPublicSiteUrl()}/c/${venueSlug}/${competitionSlug}`;
  const qrDataUrl = await buildQrDataUrl(signupUrl);

  const compData: CompData = {
    id: comp.id,
    title: comp.title,
    status: comp.status,
    kind: comp.kind,
    venue: {
      name: comp.venue.name,
      city: comp.venue.city,
      state: comp.venue.state,
    },
    standings: (comp.standings as StandingRaw[]).map((s) => ({
      id: s.id,
      rank: s.rank,
      points: s.points,
      teamId: s.teamId,
      playerUserId: s.playerUserId,
      team: s.team,
    })),
    matches: (comp.matches as MatchRaw[]).map((m) => ({
      id: m.id,
      round: m.round,
      label: m.label,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
    })),
    registrations: (comp.registrations as RegRaw[]).map((r) => ({
      id: r.id,
      user: { name: r.user.name },
    })),
  };

  return (
    <ScoreboardClient
      comp={compData}
      soloPlayers={soloPlayers}
      venueSlug={venueSlug}
      competitionSlug={competitionSlug}
      qrDataUrl={qrDataUrl}
    />
  );
}
