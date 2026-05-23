import {
  buildSoftwareMetadata,
  getAllSoftwareSlugs,
  SoftwareDiscoveryPage,
  type SoftwarePageSlug,
} from "@/lib/seo/render-software-page";

export async function generateStaticParams() {
  return getAllSoftwareSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return buildSoftwareMetadata(slug as SoftwarePageSlug);
}

export default async function SoftwareSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SoftwareDiscoveryPage slug={slug as SoftwarePageSlug} />;
}
