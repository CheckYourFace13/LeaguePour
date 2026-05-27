import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPublicSiteUrl } from "@/lib/site-url";
import { formatDate, formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { robots: "noindex" };
}

export default async function EmbedVenuePage({
  params,
}: {
  params: Promise<{ venueSlug: string }>;
}) {
  const { venueSlug } = await params;

  const venue = await prisma.venue.findUnique({
    where: { slug: venueSlug, isDisabled: false },
    select: { id: true, name: true, slug: true, city: true, state: true },
  });
  if (!venue) notFound();

  const competitions = await prisma.competition.findMany({
    where: {
      venueId: venue.id,
      status: { in: ["SIGNUP_OPEN", "PUBLISHED"] },
      signupCloseAt: { gte: new Date() },
    },
    orderBy: { startAt: "asc" },
    take: 5,
    select: {
      slug: true,
      title: true,
      kind: true,
      startAt: true,
      entryFeeCents: true,
      entryFeeCurrency: true,
      participantCap: true,
      _count: { select: { registrations: true } },
    },
  });

  const base = getPublicSiteUrl();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 p-4">
      {/* Logo */}
      <div className="mb-5 text-sm font-semibold tracking-tight">
        League<span className="text-blue-600">Pour</span>
      </div>

      {/* Venue name */}
      <h1 className="text-xl font-bold text-gray-900 mb-1">{venue.name}</h1>
      {(venue.city || venue.state) && (
        <p className="text-sm text-gray-500 mb-5">
          {[venue.city, venue.state].filter(Boolean).join(", ")}
        </p>
      )}

      {/* Competition list */}
      {competitions.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">
          No upcoming events right now - check back soon.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {competitions.map((c: typeof competitions[number]) => {
            const spotsLeft =
              c.participantCap != null
                ? c.participantCap - c._count.registrations
                : null;
            const compUrl = `${base}/c/${venue.slug}/${c.slug}`;
            return (
              <div
                key={c.slug}
                className="rounded-xl border border-gray-200 bg-white px-4 py-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 leading-snug">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">
                      {c.kind.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {c.entryFeeCents === 0
                        ? "Free"
                        : formatMoney(c.entryFeeCents, c.entryFeeCurrency)}
                    </p>
                    {spotsLeft !== null && (
                      <p className="text-xs text-gray-500">
                        {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
                      </p>
                    )}
                  </div>
                </div>

                {c.startAt && (
                  <p className="text-sm text-gray-600">{formatDate(c.startAt)}</p>
                )}

                <a
                  href={compUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors w-full text-center"
                >
                  Sign up
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-400">
        Powered by{" "}
        <a
          href="https://leaguepour.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          LeaguePour
        </a>
      </div>
    </div>
  );
}
