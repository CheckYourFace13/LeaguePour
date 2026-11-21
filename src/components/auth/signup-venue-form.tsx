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

type Suggestion = { placeId: string; name: string; formattedAddress: string };

/** Mirrors GooglePlaceDetails in src/lib/google-places.ts. */
type Place = {
  placeId: string;
  name: string;
  formattedAddress: string;
  addressLine1: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;
  websiteUrl: string | null;
  phone: string | null;
  googleMapsUri: string | null;
};

/** The owner-confirmed (editable) version of a Google match. */
type VenueDetails = { formattedAddress: string; city: string; region: string; postalCode: string; phone: string; website: string };

/** Google session token: one per lookup, closed by the details call (bills as one session). */
function newSessionToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

/** "joespub.org" -> "https://joespub.org"; anything that still isn't a web URL -> "". */
function normalizeWebsite(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return u.hostname.includes(".") ? u.toString() : "";
  } catch {
    return "";
  }
}

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

  // Venue lookup (Google Places via our server). Optional: any failure falls back to typing.
  const [showLocation, setShowLocation] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "empty" | "unavailable">("idle");
  const [picked, setPicked] = useState<Place | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [details, setDetails] = useState<VenueDetails | null>(null);
  const [loadingPlace, setLoadingPlace] = useState(false);
  const sessionToken = useRef<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lookupAbort = useRef<AbortController | null>(null);
  const lookupDisabled = useRef(false);

  useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      lookupAbort.current?.abort();
    },
    [],
  );

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
      ...(picked && details
        ? {
            city: details.city.trim() || undefined,
            formattedAddress: details.formattedAddress.trim() || undefined,
            // Street line only while the confirmed address still matches Google's.
            addressLine1: details.formattedAddress.trim() === picked.formattedAddress ? picked.addressLine1 || undefined : undefined,
            state: details.region.trim() || undefined,
            postalCode: details.postalCode.trim() || undefined,
            country: picked.countryCode || undefined,
            googlePlaceId: alreadyRegistered ? undefined : picked.placeId,
            websiteUrl: normalizeWebsite(details.website),
            phone: details.phone.trim() || undefined,
          }
        : { city: String(fd.get("city") ?? "").trim() || undefined }),
    });

    if (!res) {
      trackEvent("signup_network_error", { product: brand });
      setFormError("We couldn't reach the server. Check your connection and try again - everything you typed is still here.");
      release();
      return;
    }
    if (res.status === 409 && res.data.code === "venue_claimed") {
      setAlreadyRegistered(true);
      setFormError("Another account already uses this Google listing. Your details are kept - submit again to create your account without the Google link, or log in if this is your venue.");
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

  function clearMatch() {
    setPicked(null);
    setDetails(null);
    setAlreadyRegistered(false);
  }

  function onVenueNameChange(value: string) {
    setVenueName(value);
    if (picked) clearMatch(); // typing a different name drops the old match
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    lookupAbort.current?.abort();
    const term = value.trim();
    if (term.length < 3 || lookupDisabled.current) {
      setSuggestions([]);
      setListOpen(false);
      setLookupState(lookupDisabled.current ? "unavailable" : "idle");
      return;
    }
    debounceTimer.current = setTimeout(() => void lookup(term), 350);
  }

  async function lookup(term: string) {
    if (!sessionToken.current) sessionToken.current = newSessionToken();
    const ctrl = new AbortController();
    lookupAbort.current = ctrl;
    setLookupState("loading");
    try {
      const qs = new URLSearchParams({ q: term, session: sessionToken.current });
      const res = await fetch(`/api/google/places/autocomplete?${qs}`, { signal: ctrl.signal });
      const data = (await res.json().catch(() => ({}))) as { results?: Suggestion[] };
      if (ctrl.signal.aborted) return;
      if (!res.ok) {
        // Google unavailable or rate limited: stop asking for this page view; typing still works.
        if (res.status === 429 || res.status >= 500) lookupDisabled.current = true;
        setSuggestions([]);
        setListOpen(false);
        setLookupState("unavailable");
        trackEvent("venue_lookup_unavailable", { product: brand, status: res.status });
        return;
      }
      const results = data.results ?? [];
      setSuggestions(results);
      setActiveIdx(-1);
      setListOpen(results.length > 0);
      setLookupState(results.length ? "idle" : "empty");
    } catch {
      if (ctrl.signal.aborted) return;
      setSuggestions([]);
      setListOpen(false);
      setLookupState("unavailable");
    }
  }

  async function choose(s: Suggestion) {
    setListOpen(false);
    setSuggestions([]);
    setVenueName(s.name);
    setLoadingPlace(true);
    try {
      const qs = new URLSearchParams({ placeId: s.placeId });
      if (sessionToken.current) qs.set("session", sessionToken.current);
      const res = await fetch(`/api/google/places/details?${qs}`, { signal: AbortSignal.timeout(10_000) });
      const data = (await res.json().catch(() => ({}))) as { place?: Place | null; alreadyRegistered?: boolean };
      if (!res.ok || !data.place) {
        setLookupState("unavailable");
        return;
      }
      const p = data.place;
      setPicked(p);
      setAlreadyRegistered(Boolean(data.alreadyRegistered));
      setVenueName(p.name);
      setDetails({
        formattedAddress: p.formattedAddress,
        city: p.city ?? "",
        region: p.region ?? "",
        postalCode: p.postalCode ?? "",
        phone: p.phone ?? "",
        website: p.websiteUrl ?? "",
      });
      setLookupState("idle");
      trackEvent("venue_lookup_selected", { product: brand, already_registered: Boolean(data.alreadyRegistered) });
    } catch {
      setLookupState("unavailable");
    } finally {
      sessionToken.current = null; // the details call ends this Google session
      setLoadingPlace(false);
    }
  }

  function onVenueKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!listOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      void choose(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setListOpen(false);
    }
  }

  const setDetail = (k: keyof VenueDetails) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDetails((d) => (d ? { ...d, [k]: e.target.value } : d));

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
        <div className="relative">
          <Label htmlFor="venueName">Venue name</Label>
          <Input
            id="venueName"
            name="venueName"
            className="mt-1.5 min-h-12"
            required
            autoComplete="off"
            placeholder="Start typing your venue's name"
            value={venueName}
            onChange={(e) => onVenueNameChange(e.target.value)}
            onKeyDown={onVenueKeyDown}
            onBlur={() => setTimeout(() => setListOpen(false), 150)}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={listOpen}
            aria-controls="venue-suggestions"
            aria-activedescendant={listOpen && activeIdx >= 0 ? `venue-suggestion-${activeIdx}` : undefined}
            {...a11y("venueName")}
            aria-describedby={[fieldErrors.venueName ? "venueName-error" : "", "venueName-hint"].filter(Boolean).join(" ")}
          />
          {listOpen && suggestions.length > 0 ? (
            <ul
              id="venue-suggestions"
              role="listbox"
              aria-label="Matching venues on Google Maps"
              className="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-[10px] border border-lp-border-strong bg-lp-bg p-1 shadow-xl"
            >
              {suggestions.map((sg, i) => (
                <li
                  key={sg.placeId}
                  id={`venue-suggestion-${i}`}
                  role="option"
                  aria-selected={i === activeIdx}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void choose(sg)}
                  className={`cursor-pointer rounded px-3 py-2.5 ${i === activeIdx ? "bg-lp-surface-2" : "hover:bg-lp-surface-2"}`}
                >
                  <div className="font-semibold text-lp-text">{sg.name}</div>
                  {sg.formattedAddress ? <div className="text-sm text-lp-text-soft">{sg.formattedAddress}</div> : null}
                </li>
              ))}
              <li role="presentation" className="px-3 pb-1 pt-2 text-right text-[11px] text-lp-muted">
                Suggestions from Google Maps
              </li>
            </ul>
          ) : null}
          {err("venueName")}
          <p id="venueName-hint" className="mt-1.5 text-sm text-lp-muted" aria-live="polite">
            {loadingPlace
              ? "Loading venue details…"
              : lookupState === "loading"
                ? "Looking up matching venues…"
                : lookupState === "unavailable"
                  ? "Google lookup isn't available right now - just type your venue's name."
                  : lookupState === "empty" && !picked
                    ? "No Google match - that's fine, just type your venue's name."
                    : picked
                      ? null
                      : "Pick your venue from the suggestions to fill in its address, or just type the name."}
          </p>
        </div>

        {picked && details ? (
          <div className="rounded-[10px] border border-lp-accent/40 bg-lp-accent/5 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-lp-text">Confirm your venue details</p>
              <button type="button" className="shrink-0 text-sm font-semibold text-lp-accent hover:underline" onClick={clearMatch}>
                Not my venue
              </button>
            </div>
            <p className="mt-1 text-sm text-lp-text-soft">From Google Maps. Edit anything that&apos;s out of date; you can change it later too.</p>
            {alreadyRegistered ? (
              <p role="alert" className="mt-3 rounded-[8px] border border-lp-warning/40 bg-lp-warning/10 px-3 py-2 text-sm text-lp-text">
                A venue account already uses this Google listing. If you work there, ask the owner to add you under Staff, or{" "}
                <Link className="font-semibold text-lp-accent hover:underline" href="/login">
                  log in
                </Link>
                . You can still create a separate account; it just won&apos;t be linked to this Google listing.
              </p>
            ) : null}
            <div className="mt-3 space-y-3">
              <div>
                <Label htmlFor="venueAddress">Address</Label>
                <Input id="venueAddress" value={details.formattedAddress} onChange={setDetail("formattedAddress")} className="mt-1 min-h-11" autoComplete="street-address" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="venueCity">City</Label>
                  <Input id="venueCity" value={details.city} onChange={setDetail("city")} className="mt-1 min-h-11" autoComplete="address-level2" />
                </div>
                <div>
                  <Label htmlFor="venueRegion">State / region</Label>
                  <Input id="venueRegion" value={details.region} onChange={setDetail("region")} className="mt-1 min-h-11" autoComplete="address-level1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="venuePostal">Postal code</Label>
                  <Input id="venuePostal" value={details.postalCode} onChange={setDetail("postalCode")} className="mt-1 min-h-11" autoComplete="postal-code" />
                </div>
                <div>
                  <Label htmlFor="venuePhone">Venue phone</Label>
                  <Input id="venuePhone" type="tel" value={details.phone} onChange={setDetail("phone")} className="mt-1 min-h-11" autoComplete="off" />
                </div>
              </div>
              <div>
                <Label htmlFor="venueWebsite">Website</Label>
                <Input id="venueWebsite" type="url" inputMode="url" value={details.website} onChange={setDetail("website")} className="mt-1 min-h-11" placeholder="https://" autoComplete="off" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-lp-muted">
              Venue information from Google Maps
              {picked.googleMapsUri ? (
                <>
                  {" · "}
                  <a href={picked.googleMapsUri} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                    View on Google Maps
                  </a>
                </>
              ) : null}
            </p>
          </div>
        ) : null}


        <div className="rounded-[10px] border border-lp-border px-4 py-3">
          <button
            type="button"
            className="w-full text-left text-sm font-semibold text-lp-accent"
            aria-expanded={showLocation}
            aria-controls="optional-details"
            onClick={() => setShowLocation((v) => !v)}
          >
            {showLocation ? "Hide optional details" : picked ? "Add venue type (optional)" : "Add city and venue type (optional - you can do this later)"}
          </button>
          {showLocation ? (
            <div id="optional-details" className="mt-4 space-y-4">
              {!picked ? (
                <div>
                  <Label htmlFor="city">City (optional)</Label>
                  <Input id="city" name="city" className="mt-1.5 min-h-12" autoComplete="address-level2" placeholder="Indianapolis" />
                </div>
              ) : null}
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
