"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { RegistrationFormat } from "@/generated/prisma/enums";
import { cta } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RegistrationPaymentBadge } from "@/components/payment/registration-payment-badge";
import type { RegistrationPaymentPresentation } from "@/lib/payment-display";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { submitCompetitionRegistration } from "./actions";

const errors: Record<string, string> = {
  auth: "Log in with a player account to continue.",
  profile: "Finish player signup first.",
  closed: "Signup is closed for this event.",
  full: "This event is full.",
  exists: "You are already registered.",
  waiver: "Accept the waiver to continue.",
  team_name: "Enter a team name.",
  unknown: "Something went wrong. Try again.",
};

type Props = {
  competitionId: string;
  venueSlug: string;
  competitionSlug: string;
  teamFormat: (typeof RegistrationFormat)[keyof typeof RegistrationFormat];
  waiverText: string | null;
  entryFeeCents: number;
  entryFeeCurrency: string;
  signupCloseAt: Date;
  competitionStatus: string;
  canRegister: boolean;
  isLoggedInPlayer: boolean;
  alreadyRegistered: boolean;
  pendingPaymentRegistrationId?: string;
  registrationPaymentPresentation: RegistrationPaymentPresentation | null;
};

export function RegistrationPanel({
  competitionId,
  venueSlug,
  competitionSlug,
  teamFormat,
  waiverText,
  entryFeeCents,
  entryFeeCurrency,
  signupCloseAt,
  competitionStatus,
  canRegister,
  isLoggedInPlayer,
  alreadyRegistered,
  pendingPaymentRegistrationId,
  registrationPaymentPresentation,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [teamName, setTeamName] = useState("");
  const [waiver, setWaiver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const needsTeam =
    teamFormat === RegistrationFormat.CAPTAIN_TEAM || teamFormat === RegistrationFormat.TEAM_MEMBERS;
  const totalSteps = needsTeam ? 3 : 2;
  const needsPay = entryFeeCents > 0;

  async function onSubmit() {
    setLoading(true);
    setErr(null);
    const res = await submitCompetitionRegistration(competitionId, venueSlug, competitionSlug, {
      waiverAccepted: waiver,
      teamName: needsTeam ? teamName : undefined,
    });
    setLoading(false);
    if (!res.ok) {
      setErr(errors[res.error] ?? errors.unknown);
      return;
    }
    if (res.flow === "pay") {
      router.push(`/player/pay/${res.registrationId}`);
      return;
    }
    setDone(true);
  }

  if (alreadyRegistered) {
    return (
      <Card className="mt-8 border-lp-success/30 bg-lp-success/10 p-5 md:p-6">
        <p className="text-lg font-semibold text-lp-text">You are registered</p>
        {registrationPaymentPresentation ? (
          <div className="mt-4 flex flex-col gap-2">
            <RegistrationPaymentBadge presentation={registrationPaymentPresentation} />
            <p className="text-sm leading-relaxed text-lp-muted">{registrationPaymentPresentation.description}</p>
          </div>
        ) : (
          <p className="mt-2 text-base text-lp-muted">See this event on your player dashboard.</p>
        )}
        <Button className="mt-5" size="lg" variant="secondary" asChild>
          <Link href="/player/competitions">My competitions</Link>
        </Button>
      </Card>
    );
  }

  if (pendingPaymentRegistrationId) {
    return (
      <Card className="mt-8 border-lp-warning/35 bg-lp-warning/10 p-5 md:p-6">
        <p className="text-lg font-semibold text-lp-text">Pay entry fee</p>
        <p className="mt-2 text-base text-lp-muted">
          Complete checkout on Stripe to confirm your spot
          {needsPay ? ` (${formatMoney(entryFeeCents, entryFeeCurrency)} listed)` : ""}. You will leave this page
          briefly — cards are processed by Stripe, not stored on LeaguePour.
        </p>
        {registrationPaymentPresentation ? (
          <div className="mt-4">
            <RegistrationPaymentBadge presentation={registrationPaymentPresentation} />
          </div>
        ) : null}
        <Button className="mt-5 w-full min-h-12 text-base sm:w-auto" size="lg" asChild>
          <Link href={`/player/pay/${pendingPaymentRegistrationId}`}>Continue to checkout</Link>
        </Button>
      </Card>
    );
  }

  if (!canRegister) {
    const now = new Date();
    const deadlinePassed = signupCloseAt < now;
    const statusBlocks =
      competitionStatus !== "SIGNUP_OPEN" && competitionStatus !== "PUBLISHED";
    const title = deadlinePassed
      ? "Signup window has closed"
      : statusBlocks
        ? "This event is not taking new signups"
        : "Signup is not open right now";
    const detail = deadlinePassed
      ? `Closed ${formatDateTime(signupCloseAt)}. Ask the venue about late adds or a rerun — LeaguePour does not override house rules.`
      : statusBlocks
        ? "The venue paused or moved this event. Follow them for the next blind draw or league night."
        : "Check back when the venue opens registration.";

    return (
      <Card className="mt-8 border-lp-border p-5 md:p-6">
        <p className="text-lg font-semibold text-lp-text">{title}</p>
        <p className="mt-2 text-base leading-relaxed text-lp-muted">{detail}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
            <Link href={`/v/${venueSlug}`}>Venue profile</Link>
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/player/discover">Find another night</Link>
          </Button>
        </div>
      </Card>
    );
  }

  if (!isLoggedInPlayer) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="w-full sm:min-w-[200px]" asChild>
          <Link href={`/login?callbackUrl=/c/${venueSlug}/${competitionSlug}`}>{cta.login} to register</Link>
        </Button>
        <Button size="lg" variant="secondary" className="w-full sm:min-w-[200px]" asChild>
          <Link href={`/signup/player?callbackUrl=${encodeURIComponent(`/c/${venueSlug}/${competitionSlug}`)}`}>
            Create player account
          </Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <Card className="mt-8 border-lp-success/40 bg-lp-success/10 p-5 md:p-6">
        <p className="text-lg font-semibold text-lp-text">You are in</p>
        <p className="mt-2 text-base text-lp-muted">
          {needsPay
            ? "If you still owe an entry fee, open My competitions and finish Stripe checkout — refresh if you already paid."
            : "No entry fee — you are confirmed without a payment step."}
        </p>
        <Button className="mt-5" size="lg" variant="secondary" asChild>
          <Link href="/player/competitions">View my competitions</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mt-8 space-y-6 p-5 md:p-6">
      <div>
        <p className="lp-kicker">Register</p>
        <p className="mt-2 font-display text-xl font-bold text-lp-text md:text-2xl">{cta.register}</p>
        <p className="mt-2 text-base text-lp-muted">
          Step {Math.min(step + 1, totalSteps)} of {totalSteps}
          {needsPay ? ` · ${formatMoney(entryFeeCents, entryFeeCurrency)} listed — Stripe checkout after signup` : ""}
        </p>
      </div>

      {needsTeam && step === 0 ? (
        <div className="space-y-4">
          <Label htmlFor="tn">Team name</Label>
          <Input
            id="tn"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Your team name"
            className="min-h-12 text-base"
          />
          <Button type="button" size="lg" className="w-full sm:w-auto" onClick={() => teamName.trim() && setStep(1)}>
            Continue
          </Button>
        </div>
      ) : null}

      {!needsTeam && step === 0 ? (
        <div className="space-y-4">
          <p className="text-base text-lp-muted">
            Registering as a <span className="font-semibold text-lp-text">solo player</span>.
          </p>
          <Button type="button" size="lg" onClick={() => setStep(1)}>
            Continue
          </Button>
        </div>
      ) : null}

      {((needsTeam && step === 1) || (!needsTeam && step === 1)) ? (
        <div className="space-y-4">
          {waiverText ? (
            <div className="max-h-48 overflow-y-auto rounded-[10px] border border-lp-border bg-lp-bg/60 p-4 text-sm leading-relaxed text-lp-muted">
              {waiverText}
            </div>
          ) : (
            <p className="text-base text-lp-muted">No waiver text on file — you agree to posted house rules.</p>
          )}
          <label className="flex min-h-12 cursor-pointer items-start gap-3 text-base">
            <input
              type="checkbox"
              className="mt-1 size-5 shrink-0 rounded border-lp-border text-lp-accent"
              checked={waiver}
              onChange={(e) => setWaiver(e.target.checked)}
            />
            <span>I accept the waiver / terms for this competition.</span>
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => setStep(0)}>
              Back
            </Button>
            {needsTeam ? (
              <Button type="button" size="lg" className="w-full sm:w-auto" disabled={!waiver} onClick={() => waiver && setStep(2)}>
                Review
              </Button>
            ) : (
              <Button type="button" size="lg" className="w-full sm:w-auto" disabled={!waiver || loading} onClick={onSubmit}>
                {loading ? "Saving…" : needsPay ? "Continue to Stripe checkout" : "Confirm registration"}
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {needsTeam && step === 2 ? (
        <div className="space-y-4 text-base">
          <p>
            <span className="text-lp-muted">Team:</span>{" "}
            <span className="font-semibold text-lp-text">{teamName}</span>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="button" size="lg" className="w-full sm:w-auto" disabled={loading} onClick={onSubmit}>
              {loading ? "Saving…" : needsPay ? "Continue to Stripe checkout" : "Confirm registration"}
            </Button>
          </div>
        </div>
      ) : null}

      {err ? (
        <p className="rounded-[10px] border border-lp-warning/40 bg-lp-warning/10 px-4 py-3 text-sm text-lp-text">{err}</p>
      ) : null}
    </Card>
  );
}
