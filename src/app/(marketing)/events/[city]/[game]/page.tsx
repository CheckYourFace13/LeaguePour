import {
  buildCityDiscoveryMetadata,
  CityDiscoveryPage,
  cityGameDiscoveryStaticParams,
} from "@/lib/seo/render-city-discovery";

// Listings and the index/noindex decision come from live DB data - re-render hourly so they
// track real venues/competitions (and match the sitemap) instead of freezing at build time.
export const revalidate = 3600;

export async function generateStaticParams() {
  return cityGameDiscoveryStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; game: string }>;
}) {
  const { city, game } = await params;
  return buildCityDiscoveryMetadata("events", city, game);
}

export default async function EventsCityGamePage({
  params,
}: {
  params: Promise<{ city: string; game: string }>;
}) {
  const { city, game } = await params;
  return <CityDiscoveryPage prefix="events" citySlug={city} gameSlug={game} />;
}
