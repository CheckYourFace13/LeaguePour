"use client";

export function PrintButton({ label = "Print or save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 text-sm font-semibold text-vs-text hover:border-vs-accent print:hidden"
    >
      {label}
    </button>
  );
}
