# LeaguePour Deployment Readiness

## 1) Required environment variables

### Core
- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`

### Stripe
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Venue onboarding enrichment
- `GOOGLE_PLACES_API_KEY`

## 2) Third-party services
- PostgreSQL
- Stripe (Checkout + Connect + Webhooks)
- Google Places API

## 3) Launch checklist (ordered)
1. Provision production database and set `DATABASE_URL`.
2. Set `NEXT_PUBLIC_APP_URL` to production origin.
3. Set `AUTH_SECRET` to a long random value.
4. Run Prisma migration deploy:
   - `npx prisma migrate deploy`
5. Seed optional starter/demo data only on non-production:
   - `npm run db:seed`
6. Configure Stripe API keys (live or test for staging).
7. Add Stripe webhook endpoint:
   - `POST /api/webhooks/stripe`
8. Subscribe Stripe events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `charge.refunded`
   - `account.updated`
9. Set `STRIPE_WEBHOOK_SECRET` from Stripe endpoint.
10. Enable Google Places API and set `GOOGLE_PLACES_API_KEY`.
11. Deploy app and verify:
   - signup/login
   - venue creation with place match
   - paid registration with Stripe Checkout
   - webhook fulfillment + venue/player status updates
   - Stripe Connect onboarding from venue profile
12. Verify SEO assets:
   - `/sitemap.xml`
   - `/robots.txt`
   - favicon `/icon` and `/apple-icon`

## 4) Go-live smoke tests
- Create venue owner account.
- Match venue via Google search in signup.
- Create paid competition.
- Register player and complete Stripe payment.
- Confirm payment status in:
  - player competitions/payments
  - venue registrations/competition detail
- Connect venue Stripe account and confirm account status refresh.

## 5) Known external setup dependencies
- Stripe Dashboard:
  - Checkout enabled
  - Connect enabled
  - Webhook endpoint + events configured
- Google Cloud:
  - Places API enabled
  - key restrictions by domain/IP
