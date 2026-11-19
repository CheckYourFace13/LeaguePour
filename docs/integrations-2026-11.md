# Integrations audit, gap analysis and partner plan (November 2026)

Scope: LeaguePour (leaguepour.com) and VenueSprocket (venuesprocket.com), one Next.js codebase.
Provider and competitor facts were checked against public documentation on 2026-11-19 (sources at the end).
Competitor statements come from their public pages and help centres, not hands-on accounts. Re-check them before
using any of this in marketing.

Status key: **EXISTING** (live and working) · **PARTIAL** (some of it works) · **MISSING** (buildable without anyone's
approval) · **BLOCKED** (needs partner approval, credentials or money) · **NOT WORTH BUILDING** (for now).

---

## 1. What exists today (verified in code)

### VenueSprocket
| Capability | Status | Notes |
|---|---|---|
| Public inquiry page `/v/<slug>/inquire` | EXISTING | Creates a lead, emails the venue and the guest |
| "Check availability" button snippet | EXISTING | Styled link to the inquiry page |
| Embedded inquiry form (iframe) | **EXISTING (shipped in this change)** | `?embed=1` layout, auto-height via postMessage, leads tagged `website_embed` |
| Lead pipeline, proposals, contracts (e-sign), BEOs | EXISTING | Plan-gated (Starter / Pro) |
| Stripe deposits (Connect, Checkout) | EXISTING | Pro plan |
| Team reminders (stale lead / unsigned contract / unpaid deposit) | EXISTING | Pro (grandfathered for older venues) |
| Calendar: subscription feed and per-event .ics | **EXISTING (shipped)** | Secret token URL, resettable, one-way, no guest email or phone |
| CSV export: leads, customers, events | **EXISTING (shipped)** | Owners and managers only, formula-injection safe |
| Outbound webhook `lead.created` | **EXISTING (shipped)** | HTTPS only, HMAC-signed, SSRF-guarded at connect time, one retry, failures in the admin panel |
| Lead reply templates | **EXISTING (shipped)** | 4 prefilled mailto drafts, sent from the venue's own inbox |
| `VsAutomation` email automations | PARTIAL | Table exists in the schema but **nothing reads it**. Do not market "automations" |
| Two-way Google or Outlook calendar sync | MISSING | Needs Google/Microsoft OAuth apps (Google verification for calendar scopes). See section 4 |
| POS (Toast, Square, Clover) | BLOCKED | See sections 5–6 |

### LeaguePour
| Capability | Status | Notes |
|---|---|---|
| Stripe Connect entry fees | EXISTING | 5% platform fee + $1.50 player service fee (unchanged) |
| Duplicate & relaunch (repeat tournament setup) | EXISTING | Owners and managers; fresh dates, draft status |
| Signup QR (PNG download) | EXISTING | |
| TV scoreboard | EXISTING | Auto-refresh 30 s, fullscreen TV mode, shows QR. **`?tv=1` direct TV link shipped** |
| Website embed of upcoming events `/embed/<venue>` | EXISTING | Snippet on the venue dashboard |
| Share & display panel on the competition page | **EXISTING (shipped)** | TV link, QR, .ics, CSV in one place |
| Player "Add to calendar" (.ics) | **EXISTING (shipped)** | Public data only; drafts and archived events 404 |
| CSV export: registrations / standings / results | **EXISTING (shipped)** | Registrations (contact details) for owners and managers only |
| Free bracket generators (single/double elim, round robin) | EXISTING | Public tools, no login |
| Live double elimination | MISSING | Free tool only. Live competitions offer single elim, round robin and Custom |
| Player QR check-in at the venue | MISSING | Scoreholio has it. Candidate native feature (section 7) |
| League schedule feed for players (subscription) | MISSING | Low effort with the new ICS writer, once demand is shown |

### Integrations pages
- `leaguepour.com/integrations` and `venuesprocket.com/integrations` (shipped): "Working today" vs "Not available yet",
  no partner logos, no partnership claims, webhook reference with a signature-verification recipe on the VS page.

---

## 2. Competitor gaps (from public docs)

| Competitor | What they have that we didn't | After this change |
|---|---|---|
| **Perfect Venue** | Google/Outlook calendar sync (help centre says Google can take up to a day); Square payments; Zapier listing. A Toast integration is a top request on their feedback board, which suggests no deep Toast sync | Calendar feed now matches the common need (one-way, same refresh caveat). Square: BLOCKED for us. Zapier: webhook works today; listing later |
| **Tripleseat** | Large partner ecosystem (Toast, OpenTable, SevenRooms, Tock); calendar sync; public API; HMAC-signed webhooks | Signed webhook and CSV narrow the "can it connect" objection for small venues. We do not compete on enterprise breadth |
| **Scoreholio** | TV dashboards on Fire TV / Google TV sticks; QR player registration and check-in; custom dashboards | TV link (`?tv=1`) works in any TV browser. Still missing: player QR check-in and a native TV app |
| **Challonge** | Public API (v2.1 "contact us before production"); bracket embeds | Our free bracket tools and embed cover the venue use case; a public API is not needed yet |
| **LeagueApps** | Participant calendar subscriptions (one month back, six months forward), export API | Single-event .ics shipped; a full schedule subscription is a small follow-up |

Our real differentiators to keep emphasizing: a venue-first workflow (inquiry → proposal → contract → deposit → BEO in one
afternoon), bar-specific competitions with entry fees, and the shared venue login across both products.

---

## 3. Shipped in this change (quick wins, no external approvals)

1. VS embedded inquiry form + snippet; leads tagged `website_embed` and shown as "Came from" on the lead.
2. VS calendar subscription feed (`/api/vs-calendar/<token>.ics`) + reset link + per-event .ics + setup instructions.
3. VS CSV exports (leads, customers, events).
4. VS signed outbound webhook for `lead.created` + test button + secret rotation + public docs.
5. VS lead reply templates (4) replacing the single hard-coded mailto (which also broke on names containing "&").
6. VS onboarding: the first-run card links to the website form and calendar sync, plus a "send yourself a test inquiry" tip.
7. LP Share & display panel (TV link, QR, .ics, CSV); `?tv=1` scoreboard; public "Add to calendar"; CSV exports.
8. Integrations pages on both domains + footer links + sitemaps; cross-links between the products without merging brands,
   data, billing or entitlements.

Not changed: prices, fees, plans, entitlements, Stripe configuration, scheduler, customer data.

**Owner decision:** webhooks, calendar sync and CSV export are currently available on **every** VenueSprocket plan,
including Free. Gating webhooks to Starter or Pro would be a plan change, so it was left for you to decide.

---

## 4. Plugin vs native: where improving our own workflow beats an integration

| Request | Better answer | Why |
|---|---|---|
| "Integrate Gmail / Outlook email" | Reply templates via mailto (shipped) | Replies come from the venue's real inbox with no OAuth scopes, Google verification or token storage |
| "Two-way Google Calendar sync" | One-way feed (shipped), plus availability checks inside VS later | Two-way sync needs restricted-scope OAuth, conflict rules and webhook channels. Most small venues only need "show my events where I look" |
| "Zapier app" | Signed webhook + CSV (shipped) | A public Zapier app needs a fully launched product, documented API, review and upkeep. Webhooks cover the demand for now (note: Zapier's webhook trigger is a paid Zapier feature) |
| "Typeform / Jotform intake" | Embedded native form (shipped) | Native leads keep source attribution and the pipeline; third-party forms would need parsing and dedup |
| "Scoreholio-style TV app" | `?tv=1` web scoreboard (shipped) | Any smart-TV browser or casting works; a native TV app is a store listing plus device QA |
| "POS integration to see the tab" | Proposal minimum-spend fields + post-event actuals entry (future native) | Most of the value is "did they hit the minimum?". A one-field manual entry delivers most of that before any POS approval |

---

## 5. Toast partner application brief (draft, NOT submitted)

**Status:** Not applied, not a partner. Do not claim either. Toast's partner API access is granted only through Toast's
Integration Partner application and certification; sandbox and developer portal access follow partner approval.
"Standard API access" is a different, customer-side tier (a Toast location employee creates credentials; third-party
connectors report it needs RMS Essentials or higher). It is not a route for a multi-venue SaaS.

**Applicant:** VenueSprocket (private-event management for restaurants, bars, breweries, taprooms), sister product
LeaguePour (bar leagues and tournaments). Same company, shared venue accounts.

**Customer problem:** Restaurants book private events and buyouts with food and beverage minimums. Today staff
re-enter event details into Toast, and after the event they check by hand whether the minimum was met, then work out
the balance due. Perfect Venue's public feedback board shows the same pain ("I always have to enter the sales in Toast
too").

**Proposed integration (phase 1, read-mostly):**
1. Venue connects Toast (location selection) from VenueSprocket Settings.
2. VS shows the Toast check(s) for an event (matched by date, time window and table or revenue center chosen by staff).
3. VS compares the actual net sales against the proposal's F&B minimum and room fee, and shows "minimum met" or
   "shortfall $X" on the event and BEO.
4. Optional: staff attach the Toast check to the event for the final invoice.

**Phase 2 (only after phase 1 is certified):** push a pre-order or menu package to Toast (orders write), sync menu items
into VS menu packages (menus read).

**Proposed scopes (minimum necessary; confirm names against Toast's scope list at application time):**
- `orders:read`: checks and totals for the event window (core value).
- `menus:read`: map VS menu packages to Toast items (phase 1.5).
- `restaurants:read` / configuration read: location name, revenue centers, tables, used to pick the matching check.
- *Not requested in phase 1:* labor, cash management, guest marketing, credit-card data, orders write.

**Data handling:** Read-only in phase 1. We store only the check id, totals and timestamps against an event, never card
data. Per-venue tokens are encrypted at rest. Disconnecting deletes stored Toast data within 30 days. Webhooks from Toast
(if granted) use the fallback-polling pattern Toast recommends.

**Commercials and demand evidence to gather first:** number of active VS venues on Toast (add a "Which POS do you use?"
field at signup or in Settings); 3–5 named pilot venues willing to be references; target price (an add-on, or included in
Pro).

**Before submitting:** a privacy policy section for POS data, a security overview, a demo video of the flow against a
sandbox (available after approval), and support contact and SLA.

---

## 6. Square OAuth and Clover feasibility

**Square: feasible, moderate effort, no partner gate to start.**
- Developers can create an app and use OAuth in the Sandbox immediately; production OAuth for a seller's own account
  also works without a Marketplace listing.
- **An App Marketplace listing** requires approval as a Square app partner, the API-usage technical checklist, accepting
  the Partner Integrated Marketplace Agreement (PIMA) and Square QA.
- Requirements we'd have to meet: HTTPS redirect URL, OAuth secret not in source control, token refresh and revocation
  handling, and only the scopes we need (e.g. `ORDERS_READ`, `PAYMENTS_READ`, `MERCHANT_PROFILE_READ`).
- Use case: same as Toast phase 1 (did the event hit the minimum?), plus optionally Square payments for deposits.
  VS already uses Stripe for deposits, so a second processor adds support load. **Recommendation:** build read-only
  Square order matching only after the POS survey shows Square demand. No production enablement until there are
  credentials, consent screens and QA.

**Clover: feasible but slowest.**
- Requires an approved production developer account before any app can be approved, then app review (functional, then
  legal and privacy, with a permissions review). Production merchant data needs OAuth (merchant API tokens are sandbox
  only). There are regional endpoints for North America, Europe and Latin America.
- Third-party reviews describe the approval workflow as slow. **Recommendation:** last of the three POS. Revisit only
  with named Clover venue demand.

---

## 7. Next three integrations, ranked by revenue/effort

1. **POS demand capture + Toast partner application** (effort: S now, L later; revenue: highest). Add a "Which POS do
   you use?" field (Settings and signup), then submit the Toast application with real numbers. The F&B-minimum
   reconciliation is a Pro-plan upsell restaurants understand. *Blocked by:* Toast approval.
2. **LeaguePour player QR check-in + league schedule feed** (effort: M; revenue: medium, retention). Native (no partner):
   staff scan or players tap a check-in link at the venue; standings and no-show handling get easier, and the existing
   ICS writer gives players a subscribable season schedule. Closes the main Scoreholio and LeagueApps gaps.
3. **Square read-only order matching** (effort: M; revenue: medium). Self-serve OAuth, no listing needed for direct
   customers. Do it if the POS survey shows Square ≥ Toast among VS venues; otherwise defer.

Explicitly deferred: Zapier public app (webhook covers it), two-way calendar (restricted scopes, low marginal value),
Clover (approval cost), Challonge-style public API (no venue demand yet).

---

## 8. Partner approvals and credentials needed (exact blockers)

| Item | Blocker | Who acts |
|---|---|---|
| Toast integration | Integration Partner application + certification; sandbox only after approval | Owner submits (brief above) |
| Square Marketplace listing | Square partner approval, PIMA, QA review | Owner, after demand is shown |
| Square direct OAuth (no listing) | Square developer app + production credentials in env; consent-screen QA | Owner creates app; we build |
| Clover | Production developer-account approval, then app review | Owner |
| Zapier public app | Fully launched app, documented API, Zapier review | Deferred |
| Two-way Google Calendar | Google OAuth consent-screen verification for calendar scopes | Deferred |

---

## Sources

- Toast: [Partner integration overview](https://doc.toasttab.com/doc/devguide/apiPartnerIntegrationOverview.html), [Standard API access requirements](https://doc.toasttab.com/doc/devguide/devApiAccessRequirements.html), [Scopes](https://doc.toasttab.com/doc/devguide/apiScopes.html), [Developer portal](https://doc.toasttab.com/doc/devguide/apiDeveloperPortal.html), [Become a Toast Integration Partner](https://support.toasttab.com/en/article/Customer-Requesting-API-Credentials)
- Square: [OAuth overview](https://developer.squareup.com/docs/oauth-api/overview), [OAuth best practices](https://developer.squareup.com/docs/oauth-api/best-practices), [App Marketplace](https://developer.squareup.com/docs/app-marketplace), [API usage requirements](https://developer.squareup.com/docs/app-marketplace/requirements)
- Clover: [Approval](https://docs.clover.com/docs/approval), [App approval FAQs](https://docs.clover.com/dev/docs/app-approval-and-app-market-faqs), [Permissions](https://docs.clover.com/docs/permissions)
- Zapier: [Integration publishing requirements](https://docs.zapier.com/platform/publish/integration-publishing-requirements), [Private vs public integrations](https://docs.zapier.com/platform/quickstart/private-vs-public-integrations)
- Perfect Venue: [Google Calendar sync](https://perfectvenue.com/integrations-and-partnerships/google-calendar), [Square](https://perfectvenue.com/integrations-and-partnerships/square), [Toast feature request](https://feedback.perfectvenue.com/feature-requests/p/toast-integration-big-feature)
- Tripleseat: [Webhooks](https://support.tripleseat.com/hc/en-us/articles/40075780832919-Webhooks), [Partners](https://tripleseat.com/partners/page/2/)
- Scoreholio: [Display dashboard on a TV](https://docs.scoreholio.com/scoreboards-and-dashboards/display-dashboard-on-a-tv), [Custom dashboards](https://docs.scoreholio.com/scoreboards-and-dashboards/custom-dashboards)
- Challonge: [API v2.1 docs](https://transparent-pen-8a5.notion.site/Challonge-API-v2-1-Connect-Documentation-ab016fd6b875474b9b67b9d8f8590497)
- LeagueApps: [Calendar Sync](https://support.leagueapps.com/hc/en-us/articles/360039381354-Calendar-Sync)
- Calendar refresh behaviour: [Microsoft Q&A on ICS refresh](https://learn.microsoft.com/en-us/answers/questions/5956480/classic-outlook-internet-calendar-subscription-not)
