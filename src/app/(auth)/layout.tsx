import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-lp-bg">
      <header className="border-b border-lp-border bg-lp-bg/90 px-4 py-4 backdrop-blur-md md:px-6 md:py-5">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          League<span className="text-lp-accent">Pour</span>
        </Link>
      </header>
      <div className="lp-hero-wash flex flex-1 flex-col items-center justify-center px-4 py-12 md:py-16">
        {children}
      </div>
    </div>
  );
}
