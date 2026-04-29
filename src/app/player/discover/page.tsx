import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CompetitionKind } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/utils";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const kindValues = Object.values(CompetitionKind) as string[];
  const kindFilter =
    kind && kind !== "all" && kindValues.includes(kind) ? (kind as (typeof CompetitionKind)[keyof typeof CompetitionKind]) : undefined;

  const list = await prisma.competition.findMany({
    where: {
      status: { in: ["SIGNUP_OPEN", "PUBLISHED"] },
      signupCloseAt: { gte: new Date() },
      ...(kindFilter ? { kind: kindFilter } : {}),
    },
    orderBy: { signupCloseAt: "asc" },
    take: 30,
    include: { venue: { select: { name: true, slug: true, city: true } } },
  });

  const kinds = ["all", "DARTS", "CORNHOLE", "TRIVIA", "EUCHRE", "SHUFFLEBOARD", "POOL", "POKER", "CUSTOM"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Discover</h1>
        <p className="mt-2 text-lp-muted">Browse open signups — filter by event type.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {kinds.map((k) => (
          <Link
            key={k}
            href={k === "all" ? "/player/discover" : `/player/discover?kind=${k}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              (kind ?? "all") === k
                ? "border-lp-accent bg-lp-accent/15 text-lp-text"
                : "border-lp-border text-lp-muted hover:text-lp-text"
            }`}
          >
            {k === "all" ? "All" : k.replaceAll("_", " ")}
          </Link>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState
          className="rounded-[10px] border border-dashed border-lp-border bg-lp-surface/40"
          title={kindFilter ? "Nothing open in this category" : "No open signups right now"}
          description={
            kindFilter
              ? "Try another event type or browse all open competitions."
              : "Check back soon, or ask your favorite room to publish their next league."
          }
          action={
            kindFilter ? (
              <Button size="lg" variant="secondary" asChild>
                <Link href="/player/discover">Show all types</Link>
              </Button>
            ) : (
              <Button size="lg" variant="secondary" asChild>
                <Link href="/">Back to LeaguePour</Link>
              </Button>
            )
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 md:gap-5">
          {list.map((c) => (
            <li key={c.id}>
              <Card>
                <p className="text-sm text-lp-muted">
                  {c.venue.name}
                  {c.venue.city ? ` · ${c.venue.city}` : ""}
                </p>
                <p className="mt-2 font-display text-xl font-bold tracking-tight text-lp-text">{c.title}</p>
                <p className="mt-3 text-base text-lp-muted">
                  Signup closes {formatDate(c.signupCloseAt)} · Starts {formatDate(c.startAt)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="accent">{c.kind.replaceAll("_", " ")}</Badge>
                  <Badge variant="muted">{formatMoney(c.entryFeeCents, c.entryFeeCurrency)}</Badge>
                </div>
                <Link
                  className="mt-5 inline-flex min-h-11 items-center text-base font-semibold text-lp-accent hover:underline"
                  href={`/c/${c.venue.slug}/${c.slug}`}
                >
                  View signup page →
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
