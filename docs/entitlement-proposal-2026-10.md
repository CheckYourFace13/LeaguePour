# Entitlements (implemented 2026-10-25, cutover 2026-10-26T00:00Z)

Approved direction implemented server-side. Prices, transaction fees and existing subscriptions are
unchanged. Source of truth: `src/lib/entitlements/lp-capacity.ts` and `src/lib/entitlements/vs.ts`.

## LeaguePour: active-competition capacity

| Venue | Without a subscription | Active / trialing / past_due / unpaid subscription |
|---|---|---|
| Created **before** the cutover (every existing venue, including Rachel/Q's) | Unchanged: its `billingPlan` limit (a plan-less venue = Starter = 2; a manually set plan keeps its limit) | Plan limit |
| Created **from** the cutover | 1 | Starter 2 · Growth 9 · Pro 19 · Elite unlimited |

- Checked only when something is about to become live: creating with "publish", or publishing a draft. Drafts and finished events never count. Nothing is ever unpublished or deleted on cancellation or downgrade.
- At capacity, the competition is saved as a draft (nothing typed is lost) with a notice.
- The check and the write run under a per-venue Postgres advisory lock, so simultaneous publishes can't exceed the limit. A mutation test confirmed that without the lock, 10 parallel publishes on a 2-slot venue all succeed.
- Payment-failure grace is unchanged: past_due and unpaid keep the plan until Stripe deletes the subscription. `incomplete` (first payment never succeeded) no longer sets `billingPlan`.

**What paying Starter gets a new venue:** 2 competitions at once instead of 1. Every feature is on every plan, free included.

## VenueSprocket

| Feature | Free | Starter $29 | Pro $79 |
|---|---|---|---|
| Inquiry page, lead dashboard, customer records, lead notifications, events list | ✓ | ✓ | ✓ |
| Receiving inquiries | ✓ (never capped) | ✓ | ✓ |
| Lead pipeline (status changes) | – | ✓ | ✓ |
| Basic proposals (room fee, F&B minimum) | – | ✓ | ✓ |
| Deposit on a proposal | – | – | ✓ |
| Contracts with e-signature | – | – | ✓ |
| BEO creation | – | – | ✓ |
| Untouched-lead reminder emails | – | – | ✓ |

- **Enforced server-side**, inside each server action (`src/lib/actions/vs.ts`), so a direct request is gated exactly like the button. A locked action redirects to `/app/upgrade`.
- **Never gated:**
  - receiving inquiries;
  - viewing or editing anything that already exists;
  - guest actions on documents already sent (view/accept a proposal, sign a contract, pay a deposit);
  - deposit refunds.
- **Grandfathering:** a venue keeps any feature it used before the cutover (it has a record of that kind dated before the cutover). Reminder emails continue for venues that existed before the cutover. No retroactive billing.
- **"Advanced proposals":** no separate feature exists in the product. The proposal builder is Starter, and a deposit on it is Pro.
- **Plan status:** a paid plan counts while active, trialing, past_due or unpaid. An LP subscription never grants VS features.

### Free-plan inquiry allowance (10/month): prepared, NOT enforced

Today every inquiry is received, stored, notified and shown. The billing panel shows "N inquiries this month" for Free venues. Proposed over-limit behavior, for a separate decision:

1. The 11th+ inquiry in a calendar month (UTC) is still received, stored, confirmed to the guest and counted. It is never rejected or dropped.
2. The venue's notification email still arrives, saying "a new inquiry arrived" without the guest's details, plus an upgrade link.
3. In the dashboard, over-limit inquiries show date and event type. Contact details unlock on upgrade or on the 1st of the next month, whichever comes first.
4. Grandfathering: inquiries received before enforcement starts are never restricted.

## Billing safety fixes shipped with this

- Plan changes (portal or Stripe dashboard) are read from the price lookup key, not checkout metadata.
- A second Checkout for a product the venue already pays for is refused (409) and sent to billing management.
- Events for an older subscription can't overwrite or cancel the venue's current one.
- `customer.subscription.created` is handled.
- `subscription_activated` is reported once per Stripe subscription. It's armed by the webhook and claimed atomically, so reloads, extra tabs and late webhooks can't double count.
