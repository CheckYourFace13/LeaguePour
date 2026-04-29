# LeaguePour — private alpha demo guide

Internal reference for live demos. **Not** for public marketing.

## Demo accounts

After `npx prisma db seed` (or your project’s seed command), use:

| Role   | Email                     | Password     |
|--------|---------------------------|--------------|
| Venue owner | `owner@northsidetap.test` | `password123` |
| Player      | `player@leaguepour.test`  | `password123` |

Seed creates **Northside Tap & Trophy** (`slug: northside-tap`) with several competitions and sample registrations.

## Demo routes

### Venue (sign in as owner)

- `/venue/dashboard` — snapshot + jump links  
- `/venue/competitions` — list + public pages  
- `/venue/competitions/[id]` — detail, registrations snippet, duplicate (owner)  
- `/venue/registrations` — ledger-style check-in  
- `/venue/messages` — campaign drafts + placeholder send  
- `/venue/staff` — add staff by email (account must exist)  

### Player (sign in as player)

- `/player/dashboard`  
- `/player/competitions`  
- `/player/payments`  
- `/player/preferences`  
- `/player/venues`  
- `/player/discover` — browse (supporting route)  

### Public (no login, or share URL)

- `/c/northside-tap/thursday-blind-draw-darts` — open signup example  
- `/c/northside-tap/spring-cornhole-league` — team/captain flow + fee copy  
- `/v/northside-tap` — venue profile (if implemented in your build)  

## Demo script (15–20 min)

1. **Player discovers an event**  
   Log in as player → Discover → open a public competition URL → read fee honesty copy → show registration / waiver steps.

2. **Placeholder checkout**  
   Pick a paid event → walk through “placeholder checkout” language → `/player/pay/[id]` if applicable → `/player/payments` ledger.

3. **Venue operations**  
   Log in as owner → Dashboard jump links → Competitions → open one competition → public page link → registrations list on detail → full registrations ledger.

4. **Campaigns**  
   Messages → existing draft or “New campaign draft” → audience + placeholder send → clarify no ESP/SMS.

5. **Roles**  
   Staff page: explain invite email is placeholder-only; accounts must exist. (Optional: second browser / incognito for coordinator if you add one manually.)

## What works (truthy for alpha)

- Auth, venue staff roles (owner / manager / coordinator), player profile gate  
- Competition CRUD (venue), public competition pages, registration flows  
- **Stripe Checkout** for paid registrations (server-created sessions, webhook-confirmed status)  
- Venue registrations view, competition detail with matches/standings where seeded  
- Campaign drafts, audience resolution, **placeholder** notification queue on send  
- Player preferences, follows, payment history rows when payments exist  

## What is placeholder

- **Email/SMS:** campaign send queues in-app notifications — no ESP or carrier.  
- **Staff invites:** no invitation email; add users by email after they sign up.  
- **Marketing site contact form:** placeholder endpoint unless wired.  
- **Legacy “test ledger” rows:** if any old `leaguepour_placeholder` payments exist, they are labeled separately from Stripe.  

## Top blockers before public launch

1. **Payments hardening** — Stripe Connect / destination charges if venues receive funds directly, tax/VAT, receipts, dispute workflows.  
2. **Transactional email + optional SMS** — deliverability, templates, unsubscribe compliance.  
3. **Production hardening** — monitoring, rate limits, abuse prevention, backup/restore runbooks.  
4. **Legal / policy** — terms for money movement, venue agreements, regional gambling / skill-game nuance as applicable.  
5. **Onboarding polish** — venue verification, support channel, empty-state content for non-seeded tenants.  

---

*Last updated alongside the private-alpha polish pass (venue + player demo surfaces).*
