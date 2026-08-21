"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signContract } from "@/lib/actions/vs";
import { trackEvent } from "@/lib/analytics";

export default function SignContractForm({ token, venueName }: { token: string; venueName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sigName, setSigName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await signContract(token, fd);
    setLoading(false);
    if (result && "error" in result) {
      setError(result.error ?? "Something went wrong");
    } else {
      trackEvent("contract_signed", { product: "vs", eventId: result.eventId });
      // Deposit becomes payable immediately after signing (see signContract in src/lib/actions/vs.ts,
      // which flips the event to DEPOSIT_DUE) - no separate "make deposit available" step exists.
      trackEvent("deposit_requested", { product: "vs", eventId: result.eventId });
      router.push(`/deposit/pay?token=${token}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-7 space-y-5">
      <div>
        <p className="text-sm font-bold text-[var(--vs-text)] mb-1">Sign this contract</p>
        <p className="text-sm text-[var(--vs-muted)]">
          Complete the fields below to apply your electronic signature. This is legally binding.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1.5">
            Full legal name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="signerName"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-4 py-3 text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1.5">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="signerEmail"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-4 py-3 text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none"
            placeholder="jane@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1.5">
          Type your name to sign <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="typedSignature"
          required
          value={sigName}
          onChange={(e) => setSigName(e.target.value)}
          className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-4 py-3 text-xl text-[var(--vs-text)] italic focus:border-[var(--vs-accent)] focus:outline-none"
          placeholder="Type your full name..."
          style={{ fontFamily: "Georgia, serif" }}
        />
        {sigName.trim() && (
          <div className="mt-2 rounded-lg border border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-4 py-3">
            <p className="text-xs text-[var(--vs-muted)] mb-1">Electronic signature</p>
            <p className="text-2xl text-[var(--vs-accent)] italic" style={{ fontFamily: "Georgia, serif" }}>
              {sigName}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface-2)] px-4 py-3">
        <label className="flex gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="agreed"
            value="on"
            required
            className="mt-0.5 h-4 w-4 rounded border-[var(--vs-border)] accent-[var(--vs-accent)]"
          />
          <p className="text-xs text-[var(--vs-text-soft)]">
            I confirm that I have read and agree to all terms in this contract. I understand
            this electronic signature carries the same legal weight as a handwritten signature.
            Signed on: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
          </p>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !sigName.trim()}
        className="w-full rounded-xl bg-[var(--vs-accent)] py-4 text-base font-bold text-white hover:bg-[var(--vs-accent-hover)] disabled:opacity-60 transition-colors"
      >
        {loading ? "Signing..." : "Sign contract"}
      </button>
    </form>
  );
}
