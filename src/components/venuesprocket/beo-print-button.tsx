"use client";

/**
 * The BEO print page (src/app/beo-print/[id]/page.tsx) is a Server Component - it can't hold an
 * onClick handler itself (that's what was throwing a hard server error on every real request,
 * found via whole-business audit: window.print() wired directly to a button inside a Server
 * Component). This is the entire client-side surface it needs, split out on its own.
 */
export function BeoPrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: "0.5rem 1rem",
        background: "#1a5f3f",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontWeight: "bold",
      }}
    >
      Print / Save PDF
    </button>
  );
}
