import { getManagedJsonLd, GRAVYBLOCK_BUSINESS_ID } from "./gravyblock-managed";

/** Renders a signed GravyBlock structured-data override for this path. Renders nothing when there is none. */
export async function ManagedJsonLd({ path, businessId = GRAVYBLOCK_BUSINESS_ID }: { path: string; businessId?: string }) {
  const ld = await getManagedJsonLd(path, businessId);
  if (!ld) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />;
}