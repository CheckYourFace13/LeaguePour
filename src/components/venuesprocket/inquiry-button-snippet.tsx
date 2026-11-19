"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Website snippets for a venue's own site. Both point at the venue's existing public inquiry page,
 * so every inquiry enters the normal lead pipeline:
 *  - a styled "Check availability" link (works on any builder, no script), and
 *  - an embedded form (iframe of /v/<slug>/inquire?embed=1). Leads from it are tagged
 *    source "website_embed". The optional script only resizes the frame; without it the frame
 *    keeps a fixed height, which is fine on builders that strip scripts.
 */
export function InquiryButtonSnippet({ inquiryUrl, venueName }: { inquiryUrl: string; venueName?: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const origin = (() => {
    try {
      return new URL(inquiryUrl).origin;
    } catch {
      return "https://venuesprocket.com";
    }
  })();
  const buttonCode = `<a href="${inquiryUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#1f2937;color:#ffffff;font:600 16px/1.2 system-ui,-apple-system,sans-serif;text-decoration:none">Check availability</a>`;
  const title = `Private event inquiry${venueName ? ` - ${venueName.replace(/"/g, "")}` : ""}`;
  const embedCode = `<iframe id="vs-inquiry-frame" src="${inquiryUrl}?embed=1" title="${title}" loading="lazy" style="width:100%;max-width:640px;height:1150px;border:0;display:block;margin:0 auto"></iframe>
<script>window.addEventListener("message",function(e){if(e.origin!=="${origin}")return;var d=e.data,f=document.getElementById("vs-inquiry-frame");if(f&&d&&d.type==="venuesprocket:inquiry-height"&&d.height>200&&d.height<4000)f.style.height=d.height+"px";});</script>`;

  function copy(kind: "button" | "embed", code: string) {
    void navigator.clipboard.writeText(code);
    trackEvent("vs_snippet_copied", { product: "vs", kind });
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-5">
        <p className="text-sm font-semibold text-[var(--vs-text)] mb-1">Option 1: &ldquo;Check availability&rdquo; button</p>
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
        <code className="block rounded-lg bg-[var(--vs-bg)] px-3 py-2 text-xs text-[var(--vs-muted)] break-all mb-3">{buttonCode}</code>
        <button
          type="button"
          onClick={() => copy("button", buttonCode)}
          className="inline-flex rounded-lg border border-[var(--vs-accent)] px-4 py-2 text-sm font-semibold text-[var(--vs-accent)] hover:bg-[var(--vs-surface-2)]"
        >
          {copied === "button" ? "Copied!" : "Copy button code"}
        </button>
      </div>

      <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-5">
        <p className="text-sm font-semibold text-[var(--vs-text)] mb-1">Option 2: inquiry form on your own page</p>
        <p className="text-xs text-[var(--vs-muted)] mb-3">
          Guests fill in the form without leaving your website. Inquiries arrive in Leads like any other,
          marked <span className="font-semibold">Website embed</span> so you can see which channel works. Works
          on WordPress, Squarespace, Wix and most builders. If yours removes the script line, the form still
          works at a fixed height.
        </p>
        <code className="block whitespace-pre-wrap rounded-lg bg-[var(--vs-bg)] px-3 py-2 text-xs text-[var(--vs-muted)] break-all mb-3">{embedCode}</code>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => copy("embed", embedCode)}
            className="inline-flex rounded-lg border border-[var(--vs-accent)] px-4 py-2 text-sm font-semibold text-[var(--vs-accent)] hover:bg-[var(--vs-surface-2)]"
          >
            {copied === "embed" ? "Copied!" : "Copy embed code"}
          </button>
          <a
            href={`${inquiryUrl}?embed=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-semibold text-[var(--vs-accent)] hover:underline"
          >
            Preview embedded form ↗
          </a>
        </div>
      </div>
    </div>
  );
}
