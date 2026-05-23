import {
  buildCityDiscoveryMetadata,
  CityDiscoveryPage,
  cityDiscoveryStaticParams,
} from "@/lib/seo/render-city-discovery";

export async function generateStaticParams() {
  return cityDiscoveryStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  return buildCityDiscoveryMetadata("bars", city);
}

export default async function BarsCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  return <CityDiscoveryPage prefix="bars" citySlug={city} />;
}
