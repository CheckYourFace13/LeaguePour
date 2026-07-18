# LeaguePour + VenueSprocket Go-To-Market Strategy

_Last updated: 2026-07-18_

Two products, one venue relationship: **VenueSprocket** books the private events; **LeaguePour**
fills the slow weeknights. Every venue that touches either brand should hear about the other —
automatically, from inside the product and every marketing surface.

---

## 1. Positioning

| | LeaguePour | VenueSprocket |
|---|---|---|
| One-liner | Run bar competitions. Fill more seats. | Book more private events. Run them better. |
| Buyer | Bar / brewery / taproom owner or GM | Venue owner, events manager |
| Wedge | Free QR signup + entry fees via Stripe (venue keeps the money, we take 5% + $1.50) | Free plan, inquiry-to-BEO pipeline |
| Revenue | SaaS tiers ($29–$299/mo) + per-entry fees | SaaS tiers (mapped to same Stripe prices) |
| Bundle | **50% off forever** when a venue has the other product active (already wired into checkout — `VSBUNDLE50`) |

Key insight: the entry-fee rail means LeaguePour makes money even on the free tier, so the CTA
everywhere is "start free, charge for your next trivia night tonight."

## 2. ICP + beachhead

- **Beachhead geography:** Chicago metro rings (the 130-city outreach list in
  `src/lib/outreach-cities.ts` is ordered by distance from Chicago — work rings 1–2 first).
- **Beachhead segment:** independent bars/taprooms that already run trivia or darts with paper
  signup sheets. They have proof of demand and zero tooling.
- **Secondary:** breweries with event spaces → land with VenueSprocket, cross-sell LeaguePour.

## 3. Built-in cross-marketing engine (VS ⇄ LP)

Already shipped — keep it healthy:
- VS header/footer + `/leaguepour` landing page ("Add LeaguePour for Game Nights →" hero CTA).
- LP footer: "LeaguePour is a VenueSprocket product" + VS links.
- Bundle discount auto-applied at Stripe checkout in **both** directions.
- Shared venue record: one login, one Stripe Connect account, one billing customer.

Recommended additions (fast wins, in priority order):
1. **In-app cross-sell cards** — VS dashboard: "Slow Tuesdays? Launch a trivia league"
   → LP competition wizard. LP venue dashboard: "Get private-event inquiries"
   → VS lead form setup. Highest-intent surface we own; currently unused.
2. **Transactional email footers** — every VS proposal/contract/deposit email and every LP
   payment-confirmation email carries a one-line cross-brand plug.
3. **Public-page cross-links** — LP venue hub pages (`/v/[slug]`) link "Book this venue for a
   private event" when the venue has VS active; VS proposal pages footer-link the venue's
   LeaguePour events calendar. This also builds cross-domain SEO authority.
4. **Player-side loop** — competition confirmation emails: "Want to host your own event here?"
   → venue's VS inquiry form. Players are also birthday-party bookers.

## 4. Channel plan (90 days)

### Phase 1 — Foundation (weeks 1–2) ✅ mostly done
- Programmatic SEO live: `/software/*`, `/compare/*`, `/find/*`, guides, history pages,
  city discovery pages (index only when they have data — already enforced).
- Fix favicons, robots.txt, sitemaps (this release).
- GA4 on both domains (done), Search Console both properties (LP done — **add VS property**).
- Google Business Profile for the company; social handles reserved.

### Phase 2 — Direct outreach (weeks 2–8, the real engine)
- Use the internal outreach tool (`/internal/outreach`, Google Places sweep) on rings 1–2.
- Pitch: "Your Tuesday trivia, with paid signups and standings, set up in 15 minutes — free."
- Offer a **founding-venue deal**: 3 months of Growth free + we build their first competition.
- Target: 10 founding venues in 30 days. One real venue per city seeds the discovery pages
  (which then become indexable) — every venue makes the SEO flywheel spin.
- Walk-in kit: one-page PDF + QR code that opens the venue signup flow.

### Phase 3 — Local proof + content (weeks 4–12)
- Case study per founding venue: "How {bar} filled Tuesday nights" — publish as a guide,
  push to local subreddits/Facebook groups (r/chicago, neighborhood groups).
- Short-form video: 30-sec clip of a QR scan → signup → live standings at a real bar.
  Post to TikTok/Reels/YouTube Shorts; bar owners are on Instagram — that's the ad surface.
- Partner channels: brewery associations, trivia-host networks (hosts bring 5–15 venues each),
  dart/cornhole leagues looking for software.

### Phase 4 — Paid (only after 10+ venues, week 8+)
- Google Ads on high-intent terms we already have landing pages for: "bar trivia software",
  "dart league software", "cornhole tournament bracket", "BEO software", "banquet hall software".
- Meta local-awareness ads within 5 miles of live venues promoting the venue's own events
  (venue co-marketing: we promote *their* night, our logo rides along).
- Budget: start $500/mo per brand, kill anything above $150 CAC.

## 5. Player-side flywheel (fills the marketplace)

- Every competition page has QR + share links; standings pages are public and shareable.
- Post-event email: "Follow this venue" → repeat-player campaigns (already built).
- Embed widget (`/embed/[venueSlug]`) → get venues to put their event list on their own site;
  every embed is a backlink + signup funnel.

## 6. Metrics that matter

| Metric | 30 days | 90 days |
|---|---|---|
| Active venues (≥1 published competition) | 10 | 40 |
| Paid registrations processed | 100 | 1,500 |
| Venue → paid-plan conversion | — | 15% |
| VS↔LP bundle attach rate | — | 25% |
| Indexed pages (Search Console) | 150 | 400 |

Weekly ritual: check Search Console coverage, GA4 signup funnels, Stripe MRR + entry-fee volume,
outreach reply rate. Kill or double each channel monthly on CAC.

## 7. Launch checklist (do now)

- [x] Favicons fixed on both domains
- [x] venuesprocket.com/robots.txt serving
- [ ] Add venuesprocket.com to Google Search Console + submit sitemap
- [ ] In-app cross-sell cards (VS dashboard ⇄ LP dashboard)
- [ ] Cross-brand email footers
- [ ] Founding-venue offer page + walk-in PDF kit
- [ ] First 20 outreach conversations booked from ring-1 sweep
