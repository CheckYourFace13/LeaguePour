import {
  buildCityDiscoveryMetadata,
  CityDiscoveryPage,
  cityDiscoveryStaticParams,
} from "@/lib/seo/render-city-discovery";

// Listings and the index/noindex decision come from live DB data (the build has no DB access, so
// build-time renders are empty). Re-render on the same 5-minute window as the sitemap so they
// track real venues/competitions (and match the sitemap) instead of freezing at build time.
export const revalidate = 300;

export async function generateStaticParams() {
  return cityDiscoveryStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  return buildCityDiscoveryMetadata("bar-leagues", city);
}

export default async function BarLeaguesCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  return <CityDiscoveryPage prefix="bar-leagues" citySlug={city} />;
}
