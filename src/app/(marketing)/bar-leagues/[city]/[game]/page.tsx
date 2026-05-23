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
  return buildCityDiscoveryMetadata("bar-leagues", city, game);
}

export default async function BarLeaguesCityGamePage({
  params,
}: {
  params: Promise<{ city: string; game: string }>;
}) {
  const { city, game } = await params;
  return <CityDiscoveryPage prefix="bar-leagues" citySlug={city} gameSlug={game} />;
}
