"use client";

/** Small "Print this page" button for editorial pages (rules, history). Hidden when printing. */
export function PagePrintButton({ label = "Print this page" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-6 rounded-lg border border-lp-border-strong bg-lp-bg px-4 py-2 text-sm font-semibold text-lp-text hover:border-lp-accent print:hidden"
    >
      {label}
    </button>
  );
}
