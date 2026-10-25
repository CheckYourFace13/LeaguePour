"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/auth/password-input";
import { trackEvent } from "@/lib/analytics";
import type { SelectedPlan, SignupBrand } from "@/lib/signup-plans";

type Place = {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number | null;
  longitude: number | null;
  websiteUrl: string | null;
  phone: string | null;
};

type FieldName = "name" | "email" | "password" | "venueName";
type FieldErrors = Partial<Record<FieldName, string>>;

const REQUEST_TIMEOUT_MS = 20_000;

/** POST JSON; resolves to null on a network failure/timeout instead of throwing. */
async function postJson(url: string, body: unknown): Promise<{ status: number; data: Record<string, unknown> } | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: res.status, data };
  } catch {
    return null;
  }
}

/**
 * Starts the brand's Stripe Checkout. Returns the checkout URL, a same-site manage path when the
 * venue already has a subscription for that product (409 - plan changes go through billing, never
 * a second Checkout), or null if it couldn't start.
 */
async function startCheckout(brand: SignupBrand, plan: SelectedPlan): Promise<string | null> {
  const res = await postJson(brand === "vs" ? "/api/venuesprocket/subscribe" : "/api/venue/stripe/subscribe", {
    plan: plan.key.toUpperCase(),
    interval: plan.interval,
  });
  const manage = res?.data?.manageUrl;
  if (res?.status === 409 && typeof manage === "string" && manage.startsWith("/")) return manage;
  const url = res?.data?.url;
  return typeof url === "string" && url.startsWith("https://") ? url : null;
}

function dashboardFor(brand: SignupBrand): string {
  // First-run guidance lives on each dashboard: LP -> create a first competition, VS -> share the
  // inquiry page that's live as soon as the venue exists.
  return brand === "vs" ? "/app/dashboard?welcome=1" : "/venue/dashboard?welcome=1";
}

/**
 * Already signed in with a paid plan selected (e.g. clicked "Start Pro" on the pricing page, or
 * checkout couldn't start right after signup): continue to checkout for the existing account
 * instead of offering a second signup.
 */
function ContinueToCheckout({ brand, plan, venueName, failed }: { brand: SignupBrand; plan: SelectedPlan; venueName: string; failed: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    failed ? "Your account is ready, but checkout couldn't start. Try again, or continue on the free start for now." : null,
  );
  async function go() {
    if (pending) return;
    setPending(true);
    setError(null);
    const url = await startCheckout(brand, plan);
    if (url) {
      if (url.startsWith("https://")) trackEvent("checkout_started", { product: brand, plan: plan.key, interval: plan.interval });
      window.location.href = url;
      return;
    }
    setPending(false);
    setError("Checkout couldn't start. Check your connection and try again.");
  }
  return (
    <Card className="w-full max-w-md p-6 md:p-8">
      <h1 className="lp-page-title text-3xl">Continue to checkout</h1>
      <p className="mt-3 text-lg text-lp-text-soft">
        Signed in for <strong>{venueName}</strong>. Selected plan: <strong>{plan.name}</strong>, {plan.priceLabel}.
      </p>
      {error ? (
        <p role="alert" className="mt-4 rounded-[10px] border border-lp-warning/40 bg-lp-warning/10 px-4 py-3 text-base">
          {error}
        </p>
      ) : null}
      <Button className="mt-6 w-full" size="lg" onClick={go} disabled={pending} aria-busy={pending}>
        {pending ? "Opening secure checkout…" : `Continue to ${plan.name} checkout`}
      </Button>
      <p className="mt-4 text-center text-sm">
        <Link className="font-semibold text-lp-accent hover:underline" href={dashboardFor(brand)}>
          Skip for now and go to the dashboard
        </Link>
      </p>
    </Card>
  );
}

export function SignupVenueForm({
  brand,
  plan,
  signedInVenueName,
  checkoutFailed,
}: {
  brand: SignupBrand;
  plan: SelectedPlan | null;
  /** Set when the visitor is already signed in as a venue owner. */
  signedInVenueName: string | null;
  checkoutFailed: boolean;
}) {
  const router = useRouter();
  const isVs = brand === "vs";
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Optional location lookup (Google). Never required: a failure here can't block signup.
  const [showLocation, setShowLocation] = useState(false);
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState<Array<{ placeId: string; name: string; formattedAddress: string }>>([]);
  const [picked, setPicked] = useState<Place | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  const started = useRef(false);
  const interacted = useRef(false);
  useEffect(() => {
    if (started.current || signedInVenueName) return;
    started.current = true;
    trackEvent("signup_started", { product: brand, plan: plan?.key, interval: plan?.interval });
  }, [brand, plan, signedInVenueName]);

  if (signedInVenueName && plan) {
    return <ContinueToCheckout brand={brand} plan={plan} venueName={signedInVenueName} failed={checkoutFailed} />;
  }

  function onFirstInteraction() {
    if (interacted.current) return;
    interacted.current = true;
    trackEvent("signup_form_interaction", { product: brand });
  }

  function validate(v: Record<FieldName, string>): FieldErrors {
    const errs: FieldErrors = {};
    if (!v.name.trim()) errs.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) errs.email = "Enter a valid email address.";
    if (v.password.length < 8) errs.password = "Use at least 8 characters.";
    if (v.venueName.trim().length < 2) errs.venueName = "Enter your venue's name (at least 2 characters).";
    return errs;
  }

  function focusFirst(errs: FieldErrors) {
    const first = (["name", "email", "password", "venueName"] as FieldName[]).find((f) => errs[f]);
    if (first) document.getElementById(first)?.focus();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current) return; // duplicate-submit guard (double click / Enter spam)
    setFormError(null);
    setEmailTaken(false);
    const fd = new FormData(e.currentTarget);
    const values = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? "").trim(),
      password: String(fd.get("password") ?? ""),
      venueName: String(fd.get("venueName") ?? ""),
    };
    const errs = validate(values);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Field names only - never values.
      trackEvent("signup_validation_error", { product: brand, fields: Object.keys(errs).join(",") });
      focusFirst(errs);
      return;
    }

    inFlight.current = true;
    setPending(true);
    const release = () => {
      inFlight.current = false;
      setPending(false);
    };

    const res = await postJson("/api/register", {
      accountType: "venue",
      ...values,
      venueType: String(fd.get("venueType") ?? "").trim() || undefined,
      city: String(fd.get("city") ?? "").trim() || undefined,
      formattedAddress: picked?.formattedAddress || undefined,
      latitude: picked?.latitude ?? undefined,
      longitude: picked?.longitude ?? undefined,
      googlePlaceId: picked?.placeId || undefined,
      websiteUrl: picked?.websiteUrl || "",
      phone: picked?.phone || undefined,
    });

    if (!res) {
      trackEvent("signup_network_error", { product: brand });
      setFormError("We couldn't reach the server. Check your connection and try again - everything you typed is still here.");
      release();
      return;
    }
    if (res.status === 409) {
      setEmailTaken(true);
      setFieldErrors({ email: "An account already uses this email." });
      trackEvent("signup_validation_error", { product: brand, fields: "email_taken" });
      document.getElementById("email")?.focus();
      release();
      return;
    }
    if (res.status === 400) {
      const fe = ((res.data.details as { fieldErrors?: Record<string, string[]> } | undefined)?.fieldErrors ?? {}) as Record<string, string[]>;
      const mapped: FieldErrors = {};
      for (const f of ["name", "email", "password", "venueName"] as FieldName[]) {
        if (fe[f]?.length) mapped[f] = f === "email" ? "Enter a valid email address." : "Check this field.";
      }
      setFieldErrors(mapped);
      if (Object.keys(mapped).length === 0) setFormError("Some details weren't accepted. Check the form and try again.");
      trackEvent("signup_validation_error", { product: brand, fields: Object.keys(mapped).join(",") || "server" });
      focusFirst(mapped);
      release();
      return;
    }
    if (res.status < 200 || res.status >= 300) {
      setFormError("Something went wrong on our side creating your account. Please try again.");
      release();
      return;
    }

    // Server confirmed: count the account only now.
    trackEvent("account_created", { product: brand });
    trackEvent("venue_created", { product: brand });

    const signed = await signIn("credentials", { email: values.email, password: values.password, redirect: false }).catch(() => null);
    if (!signed?.ok) {
      // Account exists; send them to log in with their email remembered by the browser.
      router.push("/login?registered=1");
      return;
    }

    if (plan) {
      const url = await startCheckout(brand, plan);
      if (url) {
        trackEvent("checkout_started", { product: brand, plan: plan.key, interval: plan.interval });
        window.location.href = url;
        return;
      }
      // Signed in now, so the page re-renders as "Continue to checkout" with a retry.
      const qs = new URLSearchParams({ plan: plan.key, interval: plan.interval, checkout: "failed" });
      // Production decides brand by host; keep the flag for local/preview hosts where it's the signal.
      if (isVs) qs.set("from", "vs");
      router.replace(`/signup/venue?${qs.toString()}`);
      router.refresh();
      return;
    }

    router.push(dashboardFor(brand));
    router.refresh();
  }

  async function searchPlaces() {
    const term = search.trim();
    if (term.length < 3) {
      setSearchMsg("Type at least 3 characters.");
      setMatches([]);
      return;
    }
    setSearching(true);
    setSearchMsg(null);
    try {
      const res = await fetch(`/api/google/places/search?q=${encodeURIComponent(term)}`, { signal: AbortSignal.timeout(10_000) });
      const data = (await res.json().catch(() => ({ results: [] }))) as { results?: typeof matches; message?: string };
      setMatches(data.results ?? []);
      if (!res.ok) setSearchMsg("Location search is unavailable right now. You can skip it and add your address later.");
      else if ((data.results ?? []).length === 0) setSearchMsg("No matches. Try business name + city, or skip this.");
      else setSearchMsg("Select your location.");
    } catch {
      setMatches([]);
      setSearchMsg("Location search is unavailable right now. You can skip it and add your address later.");
    } finally {
      setSearching(false);
    }
  }

  async function pickPlace(placeId: string) {
    setSearchMsg(null);
    try {
      const res = await fetch(`/api/google/places/details?placeId=${encodeURIComponent(placeId)}`, { signal: AbortSignal.timeout(10_000) });
      const data = (await res.json().catch(() => ({ place: null }))) as { place: Place | null };
      if (data.place) {
        setPicked(data.place);
        setMatches([]);
        setSearchMsg(null);
        const venueInput = document.getElementById("venueName") as HTMLInputElement | null;
        if (venueInput && !venueInput.value.trim()) venueInput.value = data.place.name;
      } else {
        setSearchMsg("Couldn't load that location. Pick another result or skip this.");
      }
    } catch {
      setSearchMsg("Couldn't load that location. You can skip this and add it later.");
    }
  }

  const err = (f: FieldName) =>
    fieldErrors[f] ? (
      <p id={`${f}-error`} className="mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">
        {fieldErrors[f]}
      </p>
    ) : null;
  const a11y = (f: FieldName) => ({
    "aria-invalid": fieldErrors[f] ? true : undefined,
    "aria-describedby": fieldErrors[f] ? `${f}-error` : undefined,
  });

  return (
    <Card className="w-full max-w-md p-6 md:p-8">
      <h1 className="lp-page-title text-3xl md:text-4xl">
        {isVs ? "Create your VenueSprocket account" : "Create your LeaguePour account"}
      </h1>
      <p className="mt-3 text-base text-lp-text-soft">
        {plan
          ? `Selected plan: ${plan.name}, ${plan.priceLabel}. You'll go to secure Stripe checkout after creating your account.`
          : isVs
            ? "Free to start - no card required. Your inquiry page is live as soon as you finish."
            : "Free to start - no card required. Create your first competition right after."}
      </p>
      <p className="mt-3 text-sm text-lp-text-soft">
        Already have an account?{" "}
        <Link className="font-semibold text-lp-accent hover:underline" href="/login">
          Log in
        </Link>
      </p>

      {formError ? (
        <p role="alert" className="mt-4 rounded-[10px] border border-lp-warning/40 bg-lp-warning/10 px-4 py-3 text-base">
          {formError}
        </p>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={onSubmit} onFocus={onFirstInteraction} noValidate aria-busy={pending}>
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" className="mt-1.5 min-h-12" required autoComplete="name" {...a11y("name")} />
          {err("name")}
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" inputMode="email" className="mt-1.5 min-h-12" required autoComplete="email" {...a11y("email")} />
          {err("email")}
          {emailTaken ? (
            <p className="mt-1.5 text-sm">
              <Link className="font-semibold text-lp-accent hover:underline" href="/login">Log in instead</Link>
              {" · "}
              <Link className="font-semibold text-lp-accent hover:underline" href="/forgot-password">Reset your password</Link>
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="mt-1.5">
            <PasswordInput id="password" name="password" className="min-h-12" required minLength={8} autoComplete="new-password" {...a11y("password")} />
          </div>
          {fieldErrors.password ? err("password") : <p className="mt-1.5 text-sm text-lp-muted">At least 8 characters.</p>}
        </div>
        <div>
          <Label htmlFor="venueName">Venue name</Label>
          <Input id="venueName" name="venueName" className="mt-1.5 min-h-12" required autoComplete="organization" placeholder="Northside Tap & Trophy" {...a11y("venueName")} />
          {err("venueName")}
        </div>

        <div className="rounded-[10px] border border-lp-border px-4 py-3">
          <button
            type="button"
            className="w-full text-left text-sm font-semibold text-lp-accent"
            aria-expanded={showLocation}
            aria-controls="optional-details"
            onClick={() => setShowLocation((v) => !v)}
          >
            {showLocation ? "Hide optional details" : "Add location and venue type (optional - you can do this later)"}
          </button>
          {showLocation ? (
            <div id="optional-details" className="mt-4 space-y-4">
              <div>
                <Label htmlFor="gm-search">Look up your venue (optional)</Label>
                <p className="mt-1 text-sm text-lp-text-soft">Search Google for your address, or skip and type your city below.</p>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    id="gm-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void searchPlaces();
                      }
                    }}
                    className="min-h-12"
                    placeholder="Business name and city"
                  />
                  <Button type="button" variant="secondary" onClick={searchPlaces} disabled={searching} className="px-5">
                    {searching ? "Searching…" : "Search"}
                  </Button>
                </div>
                {matches.length > 0 ? (
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-[10px] border border-lp-border-strong bg-lp-bg/80 p-2">
                    {matches.map((m) => (
                      <li key={m.placeId}>
                        <button type="button" className="w-full rounded px-2 py-2.5 text-left text-base hover:bg-lp-surface-2" onClick={() => pickPlace(m.placeId)}>
                          <div className="font-semibold text-lp-text">{m.name}</div>
                          <div className="text-sm text-lp-text-soft">{m.formattedAddress}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-1.5 text-sm text-lp-text-soft" aria-live="polite">
                  {picked ? (
                    <>
                      Selected: {picked.name} - {picked.formattedAddress}{" "}
                      <button type="button" className="font-semibold text-lp-accent hover:underline" onClick={() => setPicked(null)}>
                        Clear
                      </button>
                    </>
                  ) : (
                    searchMsg
                  )}
                </p>
                <p className="text-[11px] text-lp-muted/80">Location search powered by Google</p>
              </div>
              <div>
                <Label htmlFor="city">City (optional)</Label>
                <Input id="city" name="city" className="mt-1.5 min-h-12" autoComplete="address-level2" placeholder="Indianapolis" />
              </div>
              <div>
                <Label htmlFor="venueType">Venue type (optional)</Label>
                <Input id="venueType" name="venueType" className="mt-1.5 min-h-12" placeholder={isVs ? "Restaurant, brewery, event space…" : "Brewpub, VFW, sports bar…"} />
              </div>
            </div>
          ) : null}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={pending} aria-busy={pending}>
          {pending ? "Creating your account…" : plan ? `Create account and continue to ${plan.name}` : "Create free account"}
        </Button>
      </form>

      {!isVs ? (
        <p className="mt-6 text-center text-sm text-lp-muted">
          Signing up to play instead?{" "}
          <Link className="text-lp-accent hover:underline" href="/signup/player">
            Create a player account
          </Link>
        </p>
      ) : null}
    </Card>
  );
}
