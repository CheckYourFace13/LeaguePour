import type { Metadata } from "next";
import Link from "next/link";

// Colocated with the dynamic guide route on purpose: found live that notFound() called from
// this segment rendered the root not-found.tsx's UI correctly but with a 200 status instead of
// 404 (the boundary was too far up the tree, crossing (marketing)/error.tsx). A not-found.tsx
// this close to the page that calls notFound() fixes the status code - confirmed by direct curl
// against a genuinely nonexistent /guides/<slug> before and after this file existed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function GuideNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-lp-bg px-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-lp-text">
        League<span className="text-lp-accent">Pour</span>
      </h1>
      <p className="text-lg font-semibold text-lp-text">Page not found</p>
      <p className="max-w-md text-lp-text-soft">
        That guide doesn&apos;t exist or may have moved. Head back to the guides hub to keep looking.
      </p>
      <Link
        href="/guides"
        className="mt-2 rounded-lg border border-transparent bg-lp-accent-2 px-5 py-2.5 font-bold text-[#0b214d] hover:bg-[#ffd71c]"
      >
        Back to guides
      </Link>
    </div>
  );
}
