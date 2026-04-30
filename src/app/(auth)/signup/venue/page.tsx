"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function SignupVenuePage() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState<
    Array<{ placeId: string; name: string; formattedAddress: string }>
  >([]);
  const [picked, setPicked] = useState<{
    placeId: string;
    name: string;
    formattedAddress: string;
    latitude: number | null;
    longitude: number | null;
    websiteUrl: string | null;
    phone: string | null;
  } | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      accountType: "venue" as const,
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      venueName: String(fd.get("venueName")),
      venueType: String(fd.get("venueType")),
      city: String(fd.get("city")),
      formattedAddress: String(fd.get("formattedAddress") || ""),
      latitude: Number(fd.get("latitude")) || undefined,
      longitude: Number(fd.get("longitude")) || undefined,
      googlePlaceId: String(fd.get("googlePlaceId") || ""),
      websiteUrl: String(fd.get("websiteUrl") || ""),
      phone: String(fd.get("phone") || ""),
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error ?? "Could not create account");
      return;
    }
    await signIn("credentials", { email: body.email, password: body.password, redirect: false });
    router.push("/venue/dashboard");
    router.refresh();
  }

  async function searchPlaces() {
    const term = search.trim();
    if (term.length < 3) {
      setSearchMsg("Type at least 3 characters.");
      setMatches([]);
      return;
    }
    setLoadingMatches(true);
    setSearchMsg(null);
    const res = await fetch(`/api/google/places/search?q=${encodeURIComponent(term)}`);
    const data = (await res.json().catch(() => ({ results: [] }))) as {
      results: Array<{ placeId: string; name: string; formattedAddress: string }>;
      message?: string;
    };
    setMatches(data.results ?? []);
    if (!res.ok) {
      setSearchMsg(data.message ?? "Location search is unavailable right now.");
    } else if ((data.results ?? []).length === 0) {
      setSearchMsg("No matches yet. Try business name + city.");
    } else {
      setSearchMsg("Select your location.");
    }
    setLoadingMatches(false);
  }

  async function pickPlace(placeId: string) {
    setSearchMsg(null);
    const res = await fetch(`/api/google/places/details?placeId=${encodeURIComponent(placeId)}`);
    const data = (await res.json().catch(() => ({ place: null }))) as {
      place: {
        placeId: string;
        name: string;
        formattedAddress: string;
        latitude: number | null;
        longitude: number | null;
        websiteUrl: string | null;
        phone: string | null;
      } | null;
      message?: string;
    };
    if (data.place) {
      setPicked(data.place);
      setMatches([]);
      setSearch(data.place.name);
      setSearchMsg("Location selected.");
    } else {
      setSearchMsg(data.message ?? "Could not load that location. Pick another result.");
    }
  }

  return (
    <Card className="w-full max-w-md p-6 md:p-8">
      <h1 className="lp-page-title text-2xl md:text-3xl">Venue signup</h1>
      <p className="mt-3 text-base text-lp-muted">Account + venue in one flow (~2 min).</p>
      {msg ? (
        <p className="mt-4 rounded-[10px] border border-lp-warning/40 bg-lp-warning/10 px-4 py-3 text-sm">{msg}</p>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="gm-search">Find your venue</Label>
          <p className="text-xs text-lp-muted">Search your business, then select your location.</p>
          <div className="flex gap-2">
            <Input
              id="gm-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-12"
              placeholder="Search your business"
              aria-describedby="gm-search-hint"
            />
            <Button type="button" variant="secondary" onClick={searchPlaces} disabled={loadingMatches}>
              {loadingMatches ? "Finding..." : "Find"}
            </Button>
          </div>
          <p id="gm-search-hint" className="sr-only">
            Type at least three characters, then search. Pick one result to lock your venue location.
          </p>
          {matches.length > 0 ? (
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-[10px] border border-lp-border bg-lp-bg/80 p-2">
              {matches.map((m) => (
                <li key={m.placeId}>
                  <button
                    type="button"
                    className="w-full rounded px-2 py-2 text-left text-sm hover:bg-white/5"
                    onClick={() => pickPlace(m.placeId)}
                  >
                    <div className="font-semibold text-lp-text">{m.name}</div>
                    <div className="text-lp-muted">{m.formattedAddress}</div>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {searchMsg ? <p className="text-xs text-lp-muted">{searchMsg}</p> : null}
          {picked ? (
            <p className="text-xs text-lp-success">
              Locked: {picked.name} — {picked.formattedAddress}
            </p>
          ) : (
            <p className="text-xs text-lp-muted">Skip only if you will add it later in Venue profile.</p>
          )}
          <p className="text-[11px] text-lp-muted/80">Powered by Google</p>
        </div>
        <div>
          <Label htmlFor="venueName">Venue name</Label>
          <Input
            id="venueName"
            name="venueName"
            className="mt-1.5 min-h-12"
            required
            placeholder="Northside Tap & Trophy"
            defaultValue={picked?.name ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="venueType">Venue type</Label>
          <Input id="venueType" name="venueType" className="mt-1.5 min-h-12" required placeholder="Brewpub, VFW, Sports bar…" />
        </div>
        <div>
          <Label htmlFor="city">City (optional)</Label>
          <Input id="city" name="city" className="mt-1.5 min-h-12" placeholder="Indianapolis" />
        </div>
        <input type="hidden" name="formattedAddress" value={picked?.formattedAddress ?? ""} />
        <input type="hidden" name="latitude" value={picked?.latitude ?? ""} />
        <input type="hidden" name="longitude" value={picked?.longitude ?? ""} />
        <input type="hidden" name="googlePlaceId" value={picked?.placeId ?? ""} />
        <input type="hidden" name="websiteUrl" value={picked?.websiteUrl ?? ""} />
        <input type="hidden" name="phone" value={picked?.phone ?? ""} />
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" className="mt-1.5 min-h-12" required autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" className="mt-1.5 min-h-12" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" className="mt-1.5 min-h-12" required minLength={8} autoComplete="new-password" />
        </div>
        <Button type="submit" className="w-full" size="lg">
          Create account & venue
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-lp-muted">
        <Link className="text-lp-accent hover:underline" href="/signup">
          ← Other account types
        </Link>
      </p>
    </Card>
  );
}
