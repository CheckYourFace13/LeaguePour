import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-lp-bg px-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-lp-text">
        League<span className="text-lp-accent">Pour</span>
      </h1>
      <p className="text-lg font-semibold text-lp-text">Page not found</p>
      <p className="max-w-md text-lp-text-soft">
        That page doesn&apos;t exist or may have moved. Head back to the homepage to keep looking.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg border border-transparent bg-lp-accent-2 px-5 py-2.5 font-bold text-[#0b214d] hover:bg-[#ffd71c]"
      >
        Back to LeaguePour
      </Link>
    </div>
  );
}
