import {
  buildCityDiscoveryMetadata,
  CityDiscoveryPage,
  cityGameDiscoveryStaticParams,
} from "@/lib/seo/render-city-discovery";

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
