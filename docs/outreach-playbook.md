# Outreach Playbook — LeaguePour + VenueSprocket

_Companion to [marketing-strategy.md](./marketing-strategy.md). Last updated 2026-07-18._

One contact list, two pitches. Every bar/taproom in the sweep list is a LeaguePour prospect
(game nights) **and** a VenueSprocket prospect (private events). Lead with whichever pain they
mention first; the 50% bundle is the close for the second product.

## How the machine works

1. **Sweep** — `/internal/outreach` (owner login) pulls ~40 bars per city from Google Places
   into the contact CRM (name, address, phone, website, rating). Turn on **auto-sweep** and it
   walks the 130-city list by itself. Work rings 1–2 (Chicago → 250 mi) first.
2. **Work the list** — contacts have phone + website (Places gives no emails). Priority order:
   phone call > website contact form > walk-in (ring 1 only).
3. **Track** — set status on each contact: `EMAIL_SENT` (any first touch), `RESPONDED`,
   `SIGNED_UP`, `NOT_INTERESTED`. Notes field for who you talked to and when to follow up.

**Weekly targets:** 50 first touches, 10 conversations, 2 founding venues.

## The founding-venue offer (lead with this)

> First 10 venues: 3 months of Growth free, we build your first competition for you,
> and you keep 100% of your entry fees minus Stripe's cut for the first month.

Costs almost nothing (no live venues yet) and turns cold calls into "yes, set it up."

## LeaguePour pitch (bars, taprooms, breweries)

**Call script (30 sec):**
> Hey, is the owner or GM around? … I run LeaguePour — we make the signup-and-standings side
> of trivia and league nights painless. Players scan a QR code, pay the entry fee by card,
> you see teams and standings live. Bars use it to fill Tuesdays and Wednesdays.
> Do you run trivia, darts, or cornhole nights now?

- If **yes, we run nights**: "How do you handle signups today — paper sheet? We replace that in
  15 minutes, free to start. Can I set up your first event and text you the QR code?"
- If **no**: "That's actually why bars pick us up — a weekly league is the cheapest way to fill
  a slow night. We'll build the first one for you free."

**Objections:**
- *"We use Facebook events"* → "Facebook gets you views, not commitments. A paid signup is a
  player who shows up — no-shows drop when there's $10 down."
- *"Too complicated for staff"* → "Staff only enter scores from a phone. One tap."
- *"What's it cost?"* → "Free to start. When you charge entry fees we take 5% + $1.50 per player;
  paid tiers add campaigns and multiple weekly events."

**Voicemail (10 sec):** "Hi, it's Chris with LeaguePour — we run paid signups and live standings
for bar trivia and league nights. I'd love to set up a free demo night for you. Call/text me at
[number] or see leaguepour.com."

**Website contact-form message:** 2 sentences + link to `/for-venues` + founding-venue offer.

## VenueSprocket pitch (same venues + banquet halls, event spaces)

**Trigger:** they mention private parties, or their website has an "events" / "book a party" page.

**Call script:**
> One more thing — do you book private events? Birthdays, corporate happy hours?
> Our other product, VenueSprocket, handles the whole pipeline: inquiry form on your site,
> proposal, signed contract, deposit collected by card, and a BEO for your kitchen.
> Free plan to start, and LeaguePour venues get 50% off forever.

**One-liner for follow-up email/form:** "Stop chasing deposits over the phone — inquiry to
signed contract with deposit paid, all in one link. venuesprocket.com"

## Cadence per contact

| Day | Action |
|---|---|
| 0 | Call. No answer → voicemail + website contact form. Status → `EMAIL_SENT` |
| 3 | Second call (different time of day). Note bartender/GM name |
| 7 | Follow-up via form/social DM with founding-venue offer |
| 14 | Final touch: "last spot in the founding-10" — then `NOT_INTERESTED` if silent |

Any reply → `RESPONDED`; account created → `SIGNED_UP`. Never mark `NOT_INTERESTED` before
three touches.

## When a venue signs up

1. Build their first competition with them on the spot (10 min screen share or in person).
2. Print/text the QR poster; get it on the bar that week.
3. Connect Stripe (entry fees are the hook that keeps them).
4. Pitch the VS bundle within 2 weeks of their first successful night.
5. Their city's discovery pages go live automatically — tell them they're now on
   `leaguepour.com/bars/{their-city}`.
