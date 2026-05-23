import { getAllCompareSlugs } from "@/lib/seo/compare-pages";
import { buildCompareMetadata, CompareDiscoveryPage } from "@/lib/seo/render-compare-page";

export async function generateStaticParams() {
  return getAllCompareSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return buildCompareMetadata(slug);
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CompareDiscoveryPage slug={slug} />;
}
