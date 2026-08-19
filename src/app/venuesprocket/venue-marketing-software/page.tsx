import type { Metadata } from "next";
import { VsLandingPage } from "@/components/venuesprocket/vs-landing-page";
import { VS_LANDING_DATA } from "@/lib/seo/vs-landing-data";

const data = VS_LANDING_DATA["venue-marketing-software"];

export const metadata: Metadata = {
  title: { absolute: data.metaTitle },
  description: data.metaDescription,
  alternates: { canonical: `https://venuesprocket.com/venue-marketing-software` },
};

export default function Page() {
  return <VsLandingPage data={data} />;
}
