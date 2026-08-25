import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function VsNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-vs-bg px-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-vs-text">
        Venue<span className="text-vs-accent">Sprocket</span>
      </h1>
      <p className="text-lg font-semibold text-vs-text">Page not found</p>
      <p className="max-w-md text-vs-text-soft">
        That page doesn&apos;t exist or may have moved. Head back to the homepage to keep looking.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-vs-accent px-5 py-2.5 font-bold text-white hover:bg-vs-accent-hover"
      >
        Back to VenueSprocket
      </Link>
    </div>
  );
}
