import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteJsonLd } from "@/components/marketing/site-json-ld";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteJsonLd />
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
