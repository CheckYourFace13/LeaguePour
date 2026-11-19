"use client";

import { useState } from "react";

/** Read-only value with a copy button; `mask` hides it until the user chooses to show it. */
export function CopyField({ value, label = "Copy", mask = false }: { value: string; label?: string; mask?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState(!mask);
  const display = shown ? value : `${value.slice(0, 8)}${"•".repeat(16)}`;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="block min-w-0 flex-1 rounded-lg bg-[var(--vs-bg)] px-3 py-2 text-xs text-[var(--vs-muted)] break-all">
        {display}
      </code>
      <div className="flex shrink-0 gap-2">
        {mask ? (
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            className="rounded-lg border border-[var(--vs-border-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--vs-text)]"
          >
            {shown ? "Hide" : "Show"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="rounded-lg border border-[var(--vs-accent)] px-3 py-1.5 text-xs font-semibold text-[var(--vs-accent)]"
        >
          {copied ? "Copied!" : label}
        </button>
      </div>
    </div>
  );
}
