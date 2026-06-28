"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/app/dashboard", label: "Dashboard", icon: "⬛" },
  { href: "/app/leads", label: "Leads", icon: "📬" },
  { href: "/app/events", label: "Events", icon: "🗓" },
  { href: "/app/proposals", label: "Proposals", icon: "📄" },
  { href: "/app/contracts", label: "Contracts", icon: "✍️" },
  { href: "/app/beos", label: "BEOs", icon: "📑" },
  { href: "/app/payments", label: "Payments", icon: "💳" },
  { href: "/app/customers", label: "Customers", icon: "👥" },
  { href: "/app/settings", label: "Settings", icon: "⚙️" },
];

export function VsAppShell({
  children,
  venueName,
}: {
  children: React.ReactNode;
  venueName: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[var(--vs-bg)] text-[var(--vs-text)]">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--vs-border)] bg-[var(--vs-surface)] md:flex">
        {/* Brand */}
        <div className="border-b border-[var(--vs-border)] px-5 py-4">
          <Link href="/app/dashboard" className="block">
            <p className="font-display text-base font-extrabold text-[var(--vs-text)]">
              Venue<span className="text-[var(--vs-accent)]">Sprocket</span>
            </p>
            <p className="mt-0.5 truncate text-xs text-[var(--vs-muted)]">{venueName}</p>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-[var(--vs-surface-2)] text-[var(--vs-accent)] font-semibold"
                        : "text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]",
                    ].join(" ")}
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--vs-border)] px-4 py-3">
          <Link
            href="/"
            className="block text-xs text-[var(--vs-muted)] hover:text-[var(--vs-accent)]"
          >
            ← Public site
          </Link>
          <Link
            href="/api/auth/signout"
            className="mt-1 block text-xs text-[var(--vs-muted)] hover:text-[var(--vs-accent)]"
          >
            Sign out
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-[var(--vs-border)] bg-[var(--vs-surface)] px-4 py-3 md:hidden">
        <Link href="/app/dashboard" className="font-display text-sm font-extrabold text-[var(--vs-text)]">
          Venue<span className="text-[var(--vs-accent)]">Sprocket</span>
        </Link>
        <p className="truncate text-xs text-[var(--vs-muted)]">{venueName}</p>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[var(--vs-border)] bg-[var(--vs-surface)] md:hidden">
        {NAV.slice(0, 5).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors",
                active ? "text-[var(--vs-accent)]" : "text-[var(--vs-muted)]",
              ].join(" ")}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20 pt-14 md:pb-0 md:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
