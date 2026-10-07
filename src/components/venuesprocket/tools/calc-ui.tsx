"use client";

/** Shared, deliberately plain building blocks for the free VenueSprocket calculators. */

export function usd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** Parses a user-typed number, treating blanks/garbage as 0 and clamping negatives to 0. */
export function num(value: string): number {
  const n = Number(value.replace(/[$,%\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  step = "any",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  step?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-vs-text">
        {label}
      </label>
      <div className="flex items-center rounded-lg border border-vs-border-strong bg-vs-bg focus-within:border-vs-accent">
        {prefix && <span className="pl-3 text-sm text-vs-muted">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 text-base text-vs-text outline-none"
        />
        {suffix && <span className="pr-3 text-sm text-vs-muted">{suffix}</span>}
      </div>
      {hint && <p className="mt-1 text-xs text-vs-muted">{hint}</p>}
    </div>
  );
}

export function ResultRow({
  label,
  value,
  math,
  strong,
}: {
  label: string;
  value: string;
  math?: string;
  strong?: boolean;
}) {
  return (
    <div className={strong ? "rounded-lg bg-vs-accent/10 px-4 py-3" : "border-b border-vs-border/60 px-4 py-3 last:border-0"}>
      <div className="flex items-baseline justify-between gap-4">
        <span className={strong ? "font-bold text-vs-text" : "text-sm text-vs-text-soft"}>{label}</span>
        <span className={strong ? "font-display text-xl font-extrabold text-vs-text" : "font-semibold text-vs-text"}>{value}</span>
      </div>
      {math && <p className="mt-1 font-mono text-[0.75rem] text-vs-muted">{math}</p>}
    </div>
  );
}
