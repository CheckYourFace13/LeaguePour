import { buildFindMetadata, FindDiscoveryPage, getAllFindSlugs } from "@/lib/seo/render-find-page";

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
