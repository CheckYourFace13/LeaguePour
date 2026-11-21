/**
 * Outreach drafts for the acquisition program. Every claim here is checked against the product:
 *
 * LeaguePour: the bracket / round-robin / standings tools are free with no account; a new venue's
 *   first active competition is free with every feature and no card; events get a public signup
 *   page and QR code; entry fees are optional and go through the venue's own Stripe account.
 * VenueSprocket Free (src/lib/entitlements/vs.ts): inquiry page, unlimited inquiries, lead
 *   dashboard, customer records and lead notifications. Proposals need Starter; deposits,
 *   contracts and BEOs need Pro - drafts never imply those are free.
 *
 * No testimonials, customer counts, guarantees or invented relationships. The personal line is
 * the researched public fact for that prospect (prospect.useCase), shown to the owner before
 * approval and editable.
 */
import { BRAND_INFO, DEMO_LINKS, trackedUrl, type AcqBrand } from "./program";

export type DraftInput = {
  brand: AcqBrand;
  name: string;
  segment: string;
  useCase: string;
  token: string;
};

export type Draft = { subject: string; body: string };

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Plain-text body with {{link:...}} placeholders filled at send time with tracked URLs. */
export function buildDraft(p: DraftInput): Draft {
  const name = clean(p.name);
  const why = clean(p.useCase).replace(/[.\s]+$/, "");
  // Referral/partner prospects (league organizers, trivia hosts, caterers...): ask for a
  // conversation, not a signup. No commissions or arrangements are offered (none exist).
  if (/organizer|partner|host company|caterer|food truck/i.test(p.segment)) {
    if (p.brand === "lp") {
      return {
        subject: `${name} and bar game nights`,
        body: [
          `Hi ${name} team,`,
          `I saw ${why}. I build LeaguePour, a small Chicago-area tool for bars that run their own tournaments and game nights, so I'm not trying to replace what you run.`,
          `Two ideas, both free: your host bars could use our bracket generator (no account needed: {{link:/tools}}) or a free LeaguePour venue account for one-night tournaments between your seasons. And when a bar asks us about a full league program, I'd happily point them to you.`,
          `Would a short call make sense? If not, no worries. Just reply and I won't follow up.`,
          `Chris
LeaguePour`,
        ].join("\n\n"),
      };
    }
    return {
      subject: `Venues you work with and private events`,
      body: [
        `Hi ${name} team,`,
        `I saw ${why}. I build VenueSprocket, a small Chicago-area tool that gives restaurants, bars and breweries a free private-event inquiry form, with unlimited inquiries all landing in one place.`,
        `If any venues you work with struggle to keep track of party requests, would you be open to mentioning it to them? There is no arrangement or catch: {{link:/start}}. I'd also like to hear what slows down event bookings from your side.`,
        `Chris
VenueSprocket`,
      ].join("\n\n"),
    };
  }
  if (p.brand === "lp") {
    return {
      subject: `Brackets and signups for game nights at ${name}`,
      body: [
        `Hi ${name} team,`,
        `I saw ${why}. I build LeaguePour, a small Chicago-area tool for bars that run leagues and tournaments, and thought it might save you some time.`,
        `Two things you can use today:`,
        `- Free bracket generator (single and double elimination, round robin, standings). No account needed: {{link:/tools}}`,
        `- A free venue account: your first competition is free with every feature, no card. Players sign up from their phone through a public page and QR code, and you enter scores while the bracket updates for everyone. Entry fees are optional and go to your own Stripe account.`,
        `This 15-second part of our walkthrough shows the bracket tool: {{demo:bracket}}`,
        `If it's useful, start here: {{link:/signup/venue}}. If not, no worries. Just reply and tell me what would make your league nights easier.`,
        `Chris
LeaguePour`,
      ].join("\n\n"),
    };
  }
  return {
    subject: `Private event inquiries at ${name}`,
    body: [
      `Hi ${name} team,`,
      `I saw ${why}. I build VenueSprocket, a small Chicago-area tool that puts private event inquiries in one place instead of scattered across email, DMs and voicemail.`,
      `The free plan gives you an inquiry form you can link or embed on your site. It takes unlimited inquiries and sends you an alert for each new lead, and every request lands on one dashboard with the guest count, date and budget. No card is needed. Proposals, contracts, deposits and BEOs are on the paid plans if you ever want them.`,
      `This part of our walkthrough (about 25 seconds) shows a guest sending an inquiry and it landing on the dashboard: {{demo:vsInquiry}}`,
      `You can set up the form here in about ten minutes: {{link:/start}}. If it's not a fit, reply and let me know how you handle inquiries today. I'm genuinely curious.`,
      `Chris
VenueSprocket`,
    ].join("\n\n"),
  };
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function fillLinks(body: string, brand: AcqBrand, token: string): string {
  return body
    .replace(/\{\{link:([^}]+)\}\}/g, (_m, path: string) => trackedUrl(brand, path.trim(), token, path.trim().replace(/^\//, "") || "home"))
    .replace(/\{\{demo:bracket\}\}/g, DEMO_LINKS.lp.bracketTool)
    .replace(/\{\{demo:lp\}\}/g, DEMO_LINKS.lp.full)
    .replace(/\{\{demo:vsInquiry\}\}/g, DEMO_LINKS.vs.inquiryToLead)
    .replace(/\{\{demo:vs\}\}/g, DEMO_LINKS.vs.full);
}

export function unsubscribeUrl(brand: AcqBrand, token: string): string {
  return `${BRAND_INFO[brand].site}/api/acquisition/unsubscribe?t=${encodeURIComponent(token)}`;
}

/** CAN-SPAM footer text: who sent it, why, a postal address, and a working opt-out. */
export function footerText(brand: AcqBrand, name: string, postalAddress: string): string {
  const b = BRAND_INFO[brand];
  return `You're getting this one-time note from Chris at ${b.name} because ${name} publicly lists ${
    brand === "lp" ? "game nights or leagues" : "private events"
  }. ${postalAddress}`;
}

export function renderEmail(opts: {
  brand: AcqBrand;
  name: string;
  body: string;
  token: string;
  postalAddress: string;
}): { html: string; text: string } {
  const filled = fillLinks(opts.body, opts.brand, opts.token);
  const unsub = unsubscribeUrl(opts.brand, opts.token);
  const footer = footerText(opts.brand, opts.name, opts.postalAddress);
  const paragraphs = filled
    .split(/\n{2,}/)
    .map((para) => {
      const html = escHtml(para)
        .replace(/(https?:\/\/[^\s<]+)/g, (u) => `<a href="${u}" style="color:#1a56db;">${u.replace(/\?.*$/, "")}</a>`)
        .replace(/\n/g, "<br>");
      return `<p style="margin:0 0 14px;line-height:1.55;font-size:15px;color:#222;">${html}</p>`;
    })
    .join("\n");
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head><body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;">
<div style="max-width:560px;">
${paragraphs}
<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#777;">${escHtml(footer)}<br><a href="${unsub}" style="color:#777;">Unsubscribe</a></p>
</div></body></html>`;
  const text = `${filled}\n\n--\n${footer}\nUnsubscribe: ${unsub}\n`;
  return { html, text };
}

/** Claims that must never appear in a draft (product truths + no unverifiable social proof). */
export const FORBIDDEN_DRAFT_PATTERNS: RegExp[] = [
  /\btestimonial|\bhundreds of (bars|venues)|\bthousands of\b|\btrusted by\b/i,
  /\bguarantee/i,
  /\bwaitlist/i,
  /\bcheck-?in\b/i,
  /\bSMS\b|\btext message/i,
  /\bfree (contracts|deposits|proposals|BEOs?)\b/i,
  /\bautomations?\b/i,
];

export function draftProblems(d: Draft): string[] {
  const all = `${d.subject}\n${d.body}`;
  return FORBIDDEN_DRAFT_PATTERNS.filter((re) => re.test(all)).map((re) => `forbidden claim: ${re}`);
}
