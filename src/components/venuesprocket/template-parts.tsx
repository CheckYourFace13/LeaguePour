import Link from "next/link";
import type { ChecklistGroup } from "@/lib/seo/vs-templates-data";

/** Printable checkbox list used by the /templates/* pages. */
export function Checklist({ data }: { data: ChecklistGroup[] }) {
  return (
    <div className="space-y-5">
      {data.map((g) => (
        <div key={g.group} className="break-inside-avoid">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-vs-muted">{g.group}</h3>
          <ul className="space-y-2">
            {g.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-vs-text-soft">
                <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border border-vs-border-strong" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** A copy-and-fill block of plain text (kept as text so it pastes cleanly into any document). */
export function TemplateText({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-5 font-mono text-[0.8125rem] leading-relaxed text-vs-text-soft print:border-0 print:bg-transparent print:p-0">
      {children}
    </pre>
  );
}

export function TemplateBreadcrumb({ label }: { label: string }) {
  return (
    <nav className="mb-8 text-sm text-vs-muted print:hidden">
      <Link href="/templates" className="hover:text-vs-accent">Templates</Link>
      {" / "}
      <span className="font-medium text-vs-text-soft">{label}</span>
    </nav>
  );
}

export function templateJsonLd(opts: { url: string; name: string; headline: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "VenueSprocket", item: "https://venuesprocket.com" },
          { "@type": "ListItem", position: 2, name: "Templates", item: "https://venuesprocket.com/templates" },
          { "@type": "ListItem", position: 3, name: opts.name, item: opts.url },
        ],
      },
      {
        "@type": "Article",
        headline: opts.headline,
        description: opts.description,
        author: { "@type": "Organization", name: "VenueSprocket" },
        publisher: { "@type": "Organization", name: "VenueSprocket", url: "https://venuesprocket.com" },
        url: opts.url,
        datePublished: "2026-10-11",
        dateModified: "2026-10-11",
      },
    ],
  };
}

export function TemplateFooterLinks() {
  return (
    <section className="mt-14 rounded-2xl border border-vs-border bg-vs-surface-2 p-6 print:hidden">
      <h2 className="font-display text-xl font-bold text-vs-text mb-2">More free resources</h2>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/templates" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">All templates →</Link>
        <Link href="/tools" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">Free calculators →</Link>
        <Link href="/demo" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">Workflow demo →</Link>
        <Link href="/signup/venue" className="rounded-lg bg-vs-accent px-4 py-2 font-bold text-white hover:bg-vs-accent-hover">Start free</Link>
      </div>
    </section>
  );
}

/**
 * Ungated DOCX + PDF downloads (files in public/downloads/, built by
 * scripts/generate-template-downloads.py from the same content as the page).
 */
export function TemplateDownloads({ file, docxKb, pdfKb }: { file: string; docxKb: number; pdfKb: number }) {
  const link =
    "inline-flex items-center gap-2 rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 text-sm font-semibold text-vs-text hover:border-vs-accent";
  return (
    <div className="mb-6 rounded-2xl border border-vs-border bg-vs-surface-2 p-5 print:hidden">
      <p className="mb-3 text-sm font-semibold text-vs-text">Download it - free, no email required</p>
      <div className="flex flex-wrap gap-3">
        <a href={`/downloads/${file}.docx`} download className={link}>
          Word (.docx, editable) <span className="font-normal text-vs-muted">{docxKb} KB</span>
        </a>
        <a href={`/downloads/${file}.pdf`} download className={link}>
          PDF (printable) <span className="font-normal text-vs-muted">{pdfKb} KB</span>
        </a>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-vs-muted">
        Each file has the blank template plus a filled-in example with fictional names; contact
        fields are left blank.
      </p>
    </div>
  );
}

export type TemplateFaq = { q: string; a: string };

/** Visible FAQ; pass the same array to faqJsonLd so the schema always matches what's shown. */
export function TemplateFaqs({ faqs }: { faqs: TemplateFaq[] }) {
  return (
    <section className="mb-12 print:hidden">
      <h2 className="font-display text-2xl font-bold text-vs-text mb-4">Questions</h2>
      <div className="space-y-5">
        {faqs.map((f) => (
          <div key={f.q}>
            <h3 className="font-semibold text-vs-text">{f.q}</h3>
            <p className="mt-1 text-sm leading-relaxed text-vs-text-soft">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function faqJsonLd(faqs: TemplateFaq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
