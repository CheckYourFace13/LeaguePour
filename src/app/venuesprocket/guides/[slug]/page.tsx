import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import Link from "next/link";
import { CjRecommendation } from "@/components/marketing/affiliate";

// Renders auto-generated Guide rows (see src/lib/content-engine/**) that aren't one of the
// hand-written static guides under src/app/venuesprocket/guides/*/page.tsx - a static segment
// always wins over this dynamic [slug] catch-all, so no existing static guide slug can collide.
export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

const ARTICLE_CLASS =
  "prose mt-10 max-w-none text-vs-text leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-8 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6";

/**
 * Hand-picked CJ recommendations for specific DB-rendered guides: at most one per guide, shown
 * just before `beforeHeading` (or after the article if that heading is missing). Each renders
 * nothing until its registry row is enabled with a CJ link generated for VenueSprocket's PID.
 */
const GUIDE_RECOMMENDATIONS: Record<string, { beforeHeading: string; node: React.ReactNode }> = {
  "event-cancellation-policy-examples-for-restaurants-and-venues": {
    beforeHeading: "<h2>Where VenueSprocket fits</h2>",
    node: (
      <CjRecommendation advertiserId="lawdepot" website="venuesprocket" anchor="LawDepot's event contract template">
        If you don&apos;t have written contract terms yet, a fill-in-the-blanks document service is
        one optional place to start a first draft of your venue rental terms. It isn&apos;t legal
        advice, and it doesn&apos;t replace having an attorney review the final wording for your
        state.
      </CjRecommendation>
    ),
  },
};

async function getGuide(slug: string) {
  return prisma.guide.findUnique({ where: { brand_slug: { brand: "VS", slug } } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide || guide.status !== "PUBLISHED") {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  return {
    title: { absolute: `${guide.title} | VenueSprocket` },
    description: guide.description,
    alternates: { canonical: `https://venuesprocket.com/guides/${slug}` },
    openGraph: {
    siteName: "VenueSprocket", images: [{ url: "/venuesprocket/opengraph-image", alt: "VenueSprocket - private event management software" }], title: guide.title, description: guide.description, url: `https://venuesprocket.com/guides/${slug}` },
  };
}

export default async function GeneratedVsGuidePage({ params }: Props) {
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
          { "@type": "ListItem", position: 1, name: "VenueSprocket", item: "https://venuesprocket.com" },
          { "@type": "ListItem", position: 2, name: "Guides", item: "https://venuesprocket.com/guides" },
          { "@type": "ListItem", position: 3, name: guide.title, item: `https://venuesprocket.com/guides/${slug}` },
        ],
      },
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        author: { "@type": "Organization", name: "VenueSprocket" },
        publisher: {
          "@type": "Organization",
          name: "VenueSprocket",
          logo: { "@type": "ImageObject", url: "https://venuesprocket.com/logos/venuesprocket-icon.png" },
        },
        url: `https://venuesprocket.com/guides/${slug}`,
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
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 text-sm text-vs-muted">
            <Link href="/guides" className="hover:underline">Guides</Link> / {guide.category}
          </nav>
          <h1 className="vs-page-title text-4xl md:text-5xl">{guide.title}</h1>

          {(() => {
            const body = guide.bodyHtml ?? "";
            const rec = GUIDE_RECOMMENDATIONS[slug];
            const at = rec ? body.indexOf(rec.beforeHeading) : -1;
            if (!rec) return <article className={ARTICLE_CLASS} dangerouslySetInnerHTML={{ __html: body }} />;
            if (at < 0)
              return (
                <>
                  <article className={ARTICLE_CLASS} dangerouslySetInnerHTML={{ __html: body }} />
                  {rec.node}
                </>
              );
            return (
              <>
                <article className={ARTICLE_CLASS} dangerouslySetInnerHTML={{ __html: body.slice(0, at) }} />
                {rec.node}
                <div className={ARTICLE_CLASS.replace("mt-10 ", "")} dangerouslySetInnerHTML={{ __html: body.slice(at) }} />
              </>
            );
          })()}

          {faq && faq.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold">Frequently asked questions</h2>
              <div className="mt-5 space-y-4">
                {faq.map((f) => (
                  <details key={f.q} className="rounded-xl border border-vs-border bg-vs-surface px-5 py-4">
                    <summary className="cursor-pointer list-none font-semibold text-vs-text [&::-webkit-details-marker]:hidden">
                      {f.q}
                    </summary>
                    <p className="mt-3 text-sm text-vs-muted leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          <div className="mt-14 rounded-2xl border border-vs-border bg-vs-surface p-8">
            <h2 className="font-display text-2xl font-bold text-vs-text">Run your private events with VenueSprocket</h2>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup/venue" className="rounded-lg bg-vs-accent px-5 py-3 text-center text-sm font-bold text-white hover:bg-vs-accent-hover">
                Start Free
              </Link>
              <Link href="/guides" className="rounded-lg border border-vs-border-strong bg-vs-bg px-5 py-3 text-center text-sm font-bold text-vs-text hover:border-vs-accent hover:text-vs-accent">
                All guides
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
