"use client";

import { useState } from "react";
import { BillingPlan } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveVenueProfileAction } from "@/app/venue/profile/actions";

type VenueProfileInput = {
  name: string;
  venueType: string;
  description: string;
  formattedAddress: string;
  city: string;
  state: string;
  postalCode: string;
  websiteUrl: string;
  phone: string;
  instagramUrl: string;
  facebookUrl: string;
  xUrl: string;
  tiktokUrl: string;
  logoUrl: string;
  googlePlaceId: string;
  latitude: string;
  longitude: string;
  billingPlan: BillingPlan;
  /** Whole or fractional percent (e.g. 9 = 9%, 9.25 = 9.25%) — stored as bps server-side */
  platformFeePercent: number;
};

export function VenueProfileForm({ initial }: { initial: VenueProfileInput }) {
  const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl);
  const [description, setDescription] = useState(initial.description);
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl);
  const [facebookUrl, setFacebookUrl] = useState(initial.facebookUrl);
  const [xUrl, setXUrl] = useState(initial.xUrl);
  const [tiktokUrl, setTiktokUrl] = useState(initial.tiktokUrl);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [busy, setBusy] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  async function importWebsite() {
    if (!websiteUrl.trim()) return;
    setBusy(true);
    setImportMsg(null);
    const res = await fetch("/api/venue/import-website", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteUrl }),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, string | null>;
    if (!res.ok) {
      setImportMsg(String(data.error ?? "Import failed."));
      setBusy(false);
      return;
    }
    if (data.description && !description) setDescription(data.description);
    if (data.instagramUrl && !instagramUrl) setInstagramUrl(data.instagramUrl);
    if (data.facebookUrl && !facebookUrl) setFacebookUrl(data.facebookUrl);
    if (data.xUrl && !xUrl) setXUrl(data.xUrl);
    if (data.tiktokUrl && !tiktokUrl) setTiktokUrl(data.tiktokUrl);
    if (data.logoUrl && !logoUrl) setLogoUrl(data.logoUrl);
    setImportMsg("Suggestions applied — review, then Save profile.");
    setBusy(false);
  }

  return (
    <form action={saveVenueProfileAction} className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="v-name">Venue name</Label>
          <Input id="v-name" name="name" defaultValue={initial.name} className="mt-1.5 min-h-12" required />
        </div>
        <div>
          <Label htmlFor="v-type">Venue type</Label>
          <Input id="v-type" name="venueType" defaultValue={initial.venueType} className="mt-1.5 min-h-12" required />
        </div>
      </div>

      <div>
        <Label htmlFor="v-description">Description</Label>
        <Textarea
          id="v-description"
          name="description"
          className="mt-1.5"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="v-address">Street address</Label>
          <Input id="v-address" name="formattedAddress" defaultValue={initial.formattedAddress} className="mt-1.5 min-h-12" />
          {initial.googlePlaceId ? (
            <p className="mt-1 text-xs text-lp-success">Location linked to Google Maps.</p>
          ) : (
            <p className="mt-1 text-xs text-lp-muted">Matched during venue signup, or edit manually.</p>
          )}
        </div>
        <div>
          <Label htmlFor="v-city">City</Label>
          <Input id="v-city" name="city" defaultValue={initial.city} className="mt-1.5 min-h-12" />
        </div>
        <div>
          <Label htmlFor="v-state">State</Label>
          <Input id="v-state" name="state" defaultValue={initial.state} className="mt-1.5 min-h-12" />
        </div>
        <div>
          <Label htmlFor="v-postal">Postal code</Label>
          <Input id="v-postal" name="postalCode" defaultValue={initial.postalCode} className="mt-1.5 min-h-12" />
        </div>
        <div>
          <Label htmlFor="v-phone">Phone</Label>
          <Input id="v-phone" name="phone" defaultValue={initial.phone} className="mt-1.5 min-h-12" />
        </div>
      </div>

      <div className="space-y-4 rounded-[10px] border border-lp-border bg-lp-surface/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-lp-muted">From your website</p>
        <p className="text-xs text-lp-muted">Paste your site URL — we suggest socials and logo to review before save.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="v-website">Website URL</Label>
            <Input
              id="v-website"
              name="websiteUrl"
              className="mt-1.5 min-h-12"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://"
            />
          </div>
          <Button type="button" variant="secondary" size="lg" onClick={importWebsite} disabled={busy}>
            {busy ? "Scanning…" : "Pull socials"}
          </Button>
        </div>
        {importMsg ? <p className="text-xs text-lp-muted">{importMsg}</p> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Instagram</Label>
            <Input name="instagramUrl" className="mt-1.5 min-h-12" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} />
          </div>
          <div>
            <Label>Facebook</Label>
            <Input name="facebookUrl" className="mt-1.5 min-h-12" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} />
          </div>
          <div>
            <Label>X</Label>
            <Input name="xUrl" className="mt-1.5 min-h-12" value={xUrl} onChange={(e) => setXUrl(e.target.value)} />
          </div>
          <div>
            <Label>TikTok</Label>
            <Input name="tiktokUrl" className="mt-1.5 min-h-12" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Logo URL</Label>
            <Input name="logoUrl" className="mt-1.5 min-h-12" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Plan</Label>
          <select
            name="billingPlan"
            defaultValue={initial.billingPlan}
            className="mt-1.5 flex min-h-12 w-full rounded-[10px] border border-lp-border bg-lp-bg/80 px-4"
          >
            <option value={BillingPlan.STARTER}>Starter</option>
            <option value={BillingPlan.STANDARD}>Standard</option>
            <option value={BillingPlan.PRO}>Pro</option>
            <option value={BillingPlan.MAX}>Max</option>
          </select>
        </div>
        <div>
          <Label htmlFor="v-platform-fee-pct">Platform fee on entry fees (%)</Label>
          <Input
            id="v-platform-fee-pct"
            name="platformFeePercent"
            defaultValue={initial.platformFeePercent}
            className="mt-1.5 min-h-12"
            type="number"
            min={1}
            max={30}
            step={0.01}
          />
          <p className="mt-1 text-xs text-lp-muted">LeaguePour keeps this share of each paid registration; the rest transfers to your Stripe Connect account.</p>
        </div>
      </div>

      <input type="hidden" name="googlePlaceId" value={initial.googlePlaceId} />
      <input type="hidden" name="latitude" value={initial.latitude} />
      <input type="hidden" name="longitude" value={initial.longitude} />

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Save profile
      </Button>
    </form>
  );
}
