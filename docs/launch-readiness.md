# LeaguePour launch readiness

Operational checklists for going live. Keep this file next to your runbooks and update dates as you complete items.

---

## 1. Launch checklist

**Product & UX**

- [ ] Walk venue path: signup → Google match → dashboard → new competition → publish → public `/c/...` page loads.
- [ ] Walk player path: signup → discover → register → pay (if fee > 0) → confirmed state.
- [ ] Confirm Stripe Connect: venue completes onboarding; paid checkout only runs when charges + payouts enabled.
- [ ] Download venue QR from Venue profile and from public `/v/{slug}`; confirm scan opens correct URL on real devices.
- [ ] Confirm `NEXT_PUBLIC_APP_URL` matches production origin (QR codes, canonical URLs, emails if any).

**Data & compliance**

- [ ] Terms & Privacy URLs reviewed for your entity and jurisdiction.
- [ ] Player communication preferences respected on campaign audience (smoke test).
- [ ] Refund path tested once in Stripe test mode for a real PaymentIntent shape you use in prod.

**Observability**

- [ ] Stripe Dashboard webhook delivery shows 2xx for `checkout.session.completed` (and any Connect events you rely on).
- [ ] Error logging / alerting configured for the hosting platform (500s, webhook failures).

**Marketing**

- [ ] `metadataBase` / `NEXT_PUBLIC_APP_URL` align with live domain (OG, canonicals, JSON-LD).
- [ ] `robots.txt` and `sitemap.xml` fetched on production; spot-check key URLs in Search Console after deploy.

---

## 2. Environment variable checklist

Copy values into your secrets store; **never** commit real secrets.

**Required for core app**

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection (Prisma). |
| `AUTH_SECRET` | NextAuth v5 JWT signing (used by `middleware.ts`; generate e.g. `openssl rand -base64 32`). |
| `NEXT_PUBLIC_APP_URL` | Canonical public origin (no trailing slash): QR links, canonicals, JSON-LD. |

**Auth (as configured in your project)**

| Variable | Purpose |
|----------|---------|
| Credentials / OAuth client IDs & secrets | Whatever `auth.ts` and providers expect (e.g. Google OAuth if enabled). |

**Stripe**

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Server-side Stripe API. |
| `STRIPE_WEBHOOK_SECRET` | Verify `Stripe-Signature` on `/api/webhooks/stripe`. |
| Publishable key (if used client-side) | Only if you add Elements or client Stripe; Checkout server-only may not need it on client. |

**Google Places (venue signup / profile)**

| Variable | Purpose |
|----------|---------|
| Google Maps / Places API key (server) | Whatever your `/api/google/places/*` routes read from env. |

**Optional / later**

| Variable | Purpose |
|----------|---------|
| Email provider (SMTP, Resend, etc.) | When replacing in-app campaign log with real delivery. |
| SMS provider | Same. |
| Analytics | PostHog, Plausible, GA, etc. |

---

## 3. Deployment steps

1. **Database** — Run pending Prisma migrations against the production database (or apply SQL from `prisma/migrations` if you baseline manually). Run `npx prisma generate` in CI before build.
2. **Secrets** — Set all env vars on the host. Confirm `NEXT_PUBLIC_APP_URL` matches the live origin exactly (`https`, no trailing slash).
3. **Build** — `npm run build` in CI; fail the pipeline on TypeScript or build errors.
4. **Stripe** — In Stripe Dashboard: production webhook endpoint → production URL + signing secret; enable Connect if using Express accounts; confirm platform account country/capabilities.
5. **Deploy** — Ship the artifact; smoke test `/`, `/pricing`, `/login`, `/signup/venue`, one authenticated venue page, and one public competition URL.
6. **Post-deploy** — Hit `/robots.txt` and `/sitemap.xml`; complete one real Stripe payment in **live** mode with a small amount if policy allows; verify webhook and DB registration state.

---

## 4. Top blockers before public release

1. **Stripe live mode** — Live keys, webhook endpoint, Connect onboarding in production, and a clear refund/support policy.
2. **Canonical URL correctness** — Wrong `NEXT_PUBLIC_APP_URL` breaks QR codes, Open Graph links, and `LocalBusiness` / `WebSite` JSON-LD URLs.
3. **Database migrations applied** — Schema drift between app and DB causes runtime 500s on first write.
4. **Google Places API** — Production key restrictions, billing enabled, and quotas suitable for signup traffic; failure blocks venue Google match.
5. **Campaign delivery** — Today sends are **in-app logs** only; marketing promises must match reality until ESP/SMS is integrated.
6. **Player account settings** — Display name editing is disabled; acceptable for v1 if copy is honest; otherwise ship profile API or hide the section.
7. **Legal** — Terms/Privacy reviewed for payments, SMS (if ever enabled), and liability for competitions you do not operate.
8. **Observability** — Without webhook + app error monitoring, failed payments and stuck registrations are hard to diagnose at scale.

---

*Last updated: generated with launch polish pass — adjust dates and owners as you execute.*
