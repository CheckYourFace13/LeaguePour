import { buildFindMetadata, FindDiscoveryPage, getAllFindSlugs } from "@/lib/seo/render-find-page";

// Listings and the index/noindex decision come from live DB data - re-render hourly so they
// track real venues/competitions (and match the sitemap) instead of freezing at build time.
export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllFindSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return buildFindMetadata(slug);
}

export default async function FindSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FindDiscoveryPage findSlug={slug} />;
}
