import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { applyManagedMetadata } from "@/lib/gravyblock-managed";
import { prisma } from "@/lib/db";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Renders auto-generated Guide rows (see src/lib/content-engine/**) that aren't one of the
// hand-written static guides under src/app/(marketing)/guides/*/page.tsx - Next.js always
// resolves a static segment over this dynamic [slug] catch-all, so an existing static guide's
// slug can never collide with this route.
export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

async function getGuide(slug: string) {
  return prisma.guide.findUnique({ where: { brand_slug: { brand: "LP", slug } } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide || guide.status !== "PUBLISHED") {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  return applyManagedMetadata(`/guides/${slug}`, {
    title: { absolute: `${guide.title} | LeaguePour` },
    description: guide.description,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: { title: guide.title, description: guide.description, url: `/guides/${slug}` },
  });
}

export default async function GeneratedGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide || guide.status !== "PUBLISHED" || !guide.bodyHtml) notFound();

  const faq = guide.faq as { q: string; a: string }[] | null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://leaguepour.com" },
          { "@type": "ListItem", position: 2, name: "Guides", item: "https://leaguepour.com/guides" },
          { "@type": "ListItem", position: 3, name: guide.title, item: `https://leaguepour.com/guides/${slug}` },
        ],
      },
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        author: { "@type": "Organization", name: "LeaguePour" },
        publisher: {
          "@type": "Organization",
          name: "LeaguePour",
          logo: { "@type": "ImageObject", url: "https://leaguepour.com/logos/leaguepour-icon.png" },
        },
        url: `https://leaguepour.com/guides/${slug}`,
        datePublished: guide.datePublished?.toISOString() ?? guide.createdAt.toISOString(),
        dateModified: (guide.dateModified ?? guide.updatedAt).toISOString(),
      },
      ...(faq && faq.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">
          <Link href="/guides" className="hover:underline">Guides</Link> / {guide.category}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">{guide.title}</h1>

        <article
          className="prose prose-lp mt-10 max-w-none text-lp-text leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-8 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6"
          dangerouslySetInnerHTML={{ __html: guide.bodyHtml ?? "" }}
        />

        {faq && faq.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-bold">Frequently asked questions</h2>
            <div className="mt-5 space-y-4">
              {faq.map((f) => (
                <details key={f.q} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
                  <summary className="cursor-pointer list-none font-semibold text-lp-text [&::-webkit-details-marker]:hidden">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm text-lp-muted leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-2xl font-bold">Run your venue with LeaguePour</h2>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events - free</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/guides">All guides</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
