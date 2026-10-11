"use client";

import { useState } from "react";

/**
 * Copyable "Check availability" button for a venue's own website. It is only a styled link to the
 * venue's existing public inquiry page - no script, no iframe, no new data - so an inquiry made
 * through it enters the normal lead pipeline exactly like any other.
 */
export function InquiryButtonSnippet({ inquiryUrl }: { inquiryUrl: string }) {
  const [copied, setCopied] = useState(false);
  const code = `<a href="${inquiryUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#1f2937;color:#ffffff;font:600 16px/1.2 system-ui,-apple-system,sans-serif;text-decoration:none">Check availability</a>`;

  return (
    <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-5">
      <p className="text-sm font-semibold text-[var(--vs-text)] mb-1">&ldquo;Check availability&rdquo; button for your website</p>
      <p className="text-xs text-[var(--vs-muted)] mb-3">
        Paste this where you want the button (most website builders have an &ldquo;HTML&rdquo; or
        &ldquo;embed code&rdquo; block). It opens your inquiry page in a new tab; change the label or
        colors in the code if you like.
      </p>
      <div className="mb-3">
        <span
          aria-hidden
          className="inline-block rounded-lg bg-[#1f2937] px-[22px] py-3 text-base font-semibold leading-tight text-white"
        >
          Check availability
        </span>
        <span className="ml-3 text-xs text-[var(--vs-muted)]">Preview</span>
      </div>
      <code className="block rounded-lg bg-[var(--vs-bg)] px-3 py-2 text-xs text-[var(--vs-muted)] break-all mb-3">{code}</code>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="inline-flex rounded-lg border border-[var(--vs-accent)] px-4 py-2 text-sm font-semibold text-[var(--vs-accent)] hover:bg-[var(--vs-surface-2)]"
      >
        {copied ? "Copied!" : "Copy button code"}
      </button>
    </div>
  );
}
