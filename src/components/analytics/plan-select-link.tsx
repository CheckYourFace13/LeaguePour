"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

/** A <Link> that fires plan_selected before navigating to signup/checkout. */
export function PlanSelectLink({
  href,
  plan,
  product,
  className,
  children,
}: {
  href: string;
  plan: string;
  product: "lp" | "vs";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackEvent("plan_selected", { plan, product })}
    >
      {children}
    </Link>
  );
}
