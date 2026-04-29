"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * After Stripe redirects back, fulfillment runs via webhooks only.
 * Poll by re-fetching the server component until the DB reflects confirmation.
 */
export function CheckoutReturnPoller() {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, 2500);
    const stop = setTimeout(() => clearInterval(id), 60_000);
    return () => {
      clearInterval(id);
      clearTimeout(stop);
    };
  }, [router]);

  return null;
}
