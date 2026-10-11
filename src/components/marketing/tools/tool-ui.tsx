"use client";

import type { Participant } from "@/lib/tournament";

export const SAMPLE_NAMES = ["The Board Room", "Rack Attack", "Chalk Talk", "Last Call", "Brew Crew", "High Fives"];

/** One name per line -> participants, in the order typed (LeaguePour seeds in signup order). */
export function parseNames(text: string): Participant[] {
  const seen = new Map<string, number>();
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 64)
    .map((name, i) => {
      // Duplicate names get a suffix so they stay distinguishable in the output.
      const count = (seen.get(name.toLowerCase()) ?? 0) + 1;
      seen.set(name.toLowerCase(), count);
      return { id: String(i), name: count > 1 ? `${name} (${count})` : name };
    });
}

export function NamesInput({
  value,
  onChange,
  label = "Teams or players (one per line)",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const count = parseNames(value).length;
  return (
    <div className="print:hidden">
      <label htmlFor="names" className="block text-sm font-semibold text-lp-text">
        {label}
      </label>
      <textarea
        id="names"
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="mt-2 w-full rounded-xl border border-lp-border-strong bg-lp-bg px-4 py-3 font-mono text-base text-lp-text outline-none focus:border-lp-accent"
      />
      <p className="mt-1 text-xs text-lp-muted">
        {count} {count === 1 ? "entry" : "entries"} (up to 64). Order matters: the first names listed are seeded first.
      </p>
    </div>
  );
}

export function ToolPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-lp-border-strong bg-lp-bg px-4 py-2 text-sm font-semibold text-lp-text hover:border-lp-accent print:hidden"
    >
      Print
    </button>
  );
}

export function ShuffleButton({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        const lines = value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        for (let i = lines.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [lines[i], lines[j]] = [lines[j], lines[i]];
        }
        onChange(lines.join("\n"));
      }}
      className="rounded-lg border border-lp-border-strong bg-lp-bg px-4 py-2 text-sm font-semibold text-lp-text hover:border-lp-accent print:hidden"
    >
      Shuffle order
    </button>
  );
}
