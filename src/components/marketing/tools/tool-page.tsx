import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";

const BASE = "https://leaguepour.com";

export function toolMetadata(opts: { path: string; title: string; description: string; ogTitle: string }): Metadata {
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: { siteName: "LeaguePour", images: [{ url: "/opengraph-image", alt: "LeaguePour - venue competition software for bars" }], title: opts.ogTitle, description: opts.description, url: opts.path, type: "website" },
    twitter: { title: opts.ogTitle, description: opts.description },
  };
}

/** Shared frame for the free LeaguePour tools: breadcrumb, intro, the tool, then the article. */
export function ToolPage({
  path,
  name,
  title,
  intro,
  children,
  article,
  faqs,
}: {
  path: string;
  name: string;
  title: string;
  intro: string;
  children: React.ReactNode;
  article: React.ReactNode;
  faqs: { q: string; a: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "LeaguePour", item: BASE },
          { "@type": "ListItem", position: 2, name: "Free tools", item: `${BASE}/tools` },
          { "@type": "ListItem", position: 3, name, item: `${BASE}${path}` },
        ],
      },
      {
        "@type": "WebApplication",
        name: title,
        url: `${BASE}${path}`,
        applicationCategory: "SportsApplication",
        operatingSystem: "Any (web browser)",
        isAccessibleForFree: true,
        publisher: { "@type": "Organization", name: "LeaguePour", url: BASE },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <div className="lp-section mx-auto max-w-6xl px-4 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <nav className="mb-6 text-sm text-lp-muted print:hidden">
        <Link href="/tools" className="hover:text-lp-accent">Free tools</Link>
        {" / "}
        <span className="font-medium text-lp-text-soft">{name}</span>
      </nav>
      <p className="lp-kicker print:hidden">Free tool · no signup</p>
      <h1 className="lp-page-title mt-2 text-4xl md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-lp-text-soft print:hidden">{intro}</p>

      <div className="mt-10">{children}</div>

      <div className="mt-12 rounded-2xl border-2 border-lp-accent/30 bg-lp-surface/60 p-7 print:hidden">
        <p className="font-display text-xl font-bold text-lp-text">Run this live with LeaguePour</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-lp-text-soft">
          This page doesn&apos;t save or publish anything - it&apos;s a calculator. LeaguePour does the
          live version: players sign up from a QR code, the bracket or schedule is generated from
          real registrations, staff enter scores, and standings update on a public page.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/signup/venue">Set up your venue</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/demo">See the demo</Link>
          </Button>
        </div>
      </div>

      <article className="mt-14 max-w-3xl space-y-9 text-lp-text-soft print:hidden [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-lp-text [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:leading-relaxed">
        {article}
        <section>
          <h2>Questions</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-lp-text [&::-webkit-details-marker]:hidden">{f.q}</summary>
                <p className="text-sm">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
