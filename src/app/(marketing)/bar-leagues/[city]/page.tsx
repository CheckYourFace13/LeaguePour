import {
  buildCityDiscoveryMetadata,
  CityDiscoveryPage,
  cityDiscoveryStaticParams,
} from "@/lib/seo/render-city-discovery";

// Listings and the index/noindex decision come from live DB data - re-render hourly so they
// track real venues/competitions (and match the sitemap) instead of freezing at build time.
export const revalidate = 3600;

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
