/**
 * The deposit a new VenueSprocket proposal asks for, in cents.
 *
 * - Deposit field left blank (or absent) -> the venue's default deposit % of (room fee + F&B
 *   minimum), rounded to the cent. Only when the venue's plan includes deposits; otherwise 0, so a
 *   Starter venue's proposal (which has no deposit field) never picks up a deposit it can't use.
 * - Any amount typed in, including 0 -> exactly that amount; the default never overrides it.
 *
 * `explicitCents` is what the venue typed; the caller still gates an explicit amount > 0 on the
 * deposits feature (Pro), so typing a deposit can't bypass the plan.
 */
export type DepositInput = {
  raw: FormDataEntryValue | null;
  roomFeeCents: number;
  minimumSpendCents: number;
  defaultPct: number;
  depositsAllowed: boolean;
};

export function parseDepositField(raw: FormDataEntryValue | null): { blank: true } | { blank: false; cents: number } {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (s === "") return { blank: true };
  const dollars = Number(s);
  return { blank: false, cents: Number.isFinite(dollars) ? Math.max(0, Math.round(dollars * 100)) : 0 };
}

export function resolveProposalDepositCents(input: DepositInput): { cents: number; usedDefault: boolean } {
  const field = parseDepositField(input.raw);
  if (!field.blank) return { cents: field.cents, usedDefault: false };
  if (!input.depositsAllowed) return { cents: 0, usedDefault: false };
  const pct = Math.min(100, Math.max(0, input.defaultPct));
  const base = Math.max(0, input.roomFeeCents) + Math.max(0, input.minimumSpendCents);
  return { cents: Math.round((base * pct) / 100), usedDefault: true };
}
