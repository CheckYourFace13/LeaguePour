import type { Metadata } from "next";
import { VsLandingPage } from "@/components/venuesprocket/vs-landing-page";
import { VS_LANDING_DATA } from "@/lib/seo/vs-landing-data";

const data = VS_LANDING_DATA["bar-event-management-software"];

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  alternates: { canonical: `https://venuesprocket.com/bar-event-management-software` },
};

export default function Page() {
  return <VsLandingPage data={data} />;
}
