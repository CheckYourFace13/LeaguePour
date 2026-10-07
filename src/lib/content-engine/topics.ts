import { prisma } from "@/lib/db";
import { BRANDS } from "./brand-config";
import type { Brand, Outline, SearchIntent, TopicCandidate } from "./types";

/**
 * Curated topic backlog per brand. This is a static seed list, not invented on the fly - keeps
 * "no near-duplicate topics" a design property (hand-picked for distinct angles) rather than
 * something only caught after the fact. `nextTopic()` below still re-checks against everything
 * already queued/published (by topicKey, and by a title-similarity check against both the DB and
 * each brand's existing static guides) before handing one back, so a topic redundant with an
 * existing hand-written guide is skipped even if it slipped in here. Array order is the base
 * priority order - see `scoreForCategory()`.
 */
export const BACKLOG: Record<Brand, TopicCandidate[]> = {
  VS: [
    {
      topicKey: "vs-deposit-policy",
      category: "Payments & contracts",
      title: "Private Event Deposit Policies That Protect Your Venue",
      brief:
        "How much to require as a deposit, when to collect it, and how a written policy prevents last-minute cancellations from costing the venue money.",
    },
    {
      topicKey: "vs-reduce-response-time",
      category: "Lead management",
      title: "Why Slow Inquiry Response Times Lose Private Event Bookings",
      brief:
        "How fast venues need to respond to a private event inquiry to win the booking, and practical ways to shorten response time without a full-time coordinator.",
    },
    {
      topicKey: "vs-cancellation-policy-examples",
      category: "Payments & contracts",
      title: "Event Cancellation Policy Examples for Restaurants and Venues",
      brief:
        "Concrete example cancellation/rescheduling policy language for private events, tiered by notice period, and how it should tie to the deposit.",
    },
    {
      topicKey: "vs-brewery-private-events",
      category: "Venue playbooks",
      title: "Running Private Events at a Brewery: A Practical Playbook",
      brief:
        "What's different about hosting private events at a brewery/taproom versus a restaurant - space setup, food logistics, alcohol considerations, and pricing.",
    },
    {
      topicKey: "vs-proposal-structure",
      category: "Payments & contracts",
      title: "How to Structure a Private Event Proposal That Gets Signed Faster",
      brief:
        "What sections a winning private event proposal includes (packages, room fees, minimums, deposit terms) and how to order them so customers say yes faster.",
    },
    {
      topicKey: "vs-contract-workflow",
      category: "Payments & contracts",
      title: "From Sent to Signed: The Private Event Contract Workflow",
      brief:
        "The practical step-by-step of sending an e-signature contract, what to do while waiting, and how to handle a customer who stalls before signing.",
    },
    {
      topicKey: "vs-restaurant-event-space",
      category: "Venue playbooks",
      title: "Turning Unused Restaurant Space Into Private Event Revenue",
      brief:
        "How restaurants with a private room, patio, or slow-night capacity can start booking private events without disrupting regular service.",
    },
    {
      topicKey: "vs-corporate-event-intake",
      category: "Lead management",
      title: "What to Ask a Corporate Client Before Sending a Private Event Proposal",
      brief:
        "The specific questions a venue needs answered before quoting a corporate event - headcount, budget signals, AV needs, timing flexibility - so the first proposal is closer to final.",
    },
    {
      topicKey: "vs-day-of-staff-communication",
      category: "Event operations",
      title: "Getting Event-Day Details to Staff Without a Meeting",
      brief:
        "How a shared, mobile-friendly BEO reference reduces the need for a pre-shift huddle to communicate room setup, timeline, and special requests.",
    },
    {
      topicKey: "vs-holiday-party-season-prep",
      category: "Venue playbooks",
      title: "Preparing Your Private Event Pipeline for Holiday Party Season",
      brief:
        "How venues should get their inquiry form, proposal templates, and follow-up cadence ready before the holiday-party inquiry rush hits.",
    },
  ],
  LP: [
    {
      topicKey: "lp-checkin-process",
      category: "Operations & troubleshooting",
      title: "Running Check-In on League Night Without a Line at the Door",
      brief:
        "A practical check-in process for bar league/tournament night: what to check (paid status, team roster), how QR registration speeds it up, and how to handle walk-ins.",
    },
    {
      topicKey: "lp-entry-fee-pricing-strategy",
      category: "Payments & entry fees",
      title: "How to Price Entry Fees for a Bar League or Tournament",
      brief:
        "How to actually set the entry fee amount (not how to collect it) - covering cost, prize payout, and margin so the night makes money without pricing out players.",
    },
    {
      topicKey: "lp-qr-signup-placement",
      category: "Promotion & growth",
      title: "Where to Put Your QR Signup Code So Players Actually Scan It",
      brief:
        "Practical placement and signage tips for a competition QR code - table tents, coasters, social posts - to maximize signups versus just printing one flyer by the door.",
    },
    {
      topicKey: "lp-refund-cancellation-policy",
      category: "Payments & entry fees",
      title: "Writing a Fair Refund and Cancellation Policy for Paid Signups",
      brief:
        "What a fair refund policy looks like when players pay an entry fee online in advance - deadlines, partial refunds, and how to communicate it before anyone asks for money back.",
    },
    {
      topicKey: "lp-repeat-audience-marketing",
      category: "Promotion & growth",
      title: "Turning a One-Night Tournament Into a Recurring Weekly Draw",
      brief:
        "How to use a player email list and campaign sends to convert one-off tournament attendees into a recurring weekly audience, not just fill one night.",
    },
    {
      topicKey: "lp-euchre-league-basics",
      category: "Game-specific guides",
      title: "How to Start a Euchre League at Your Bar",
      brief:
        "Team sizes, scoring basics, and format choices (round robin works well for euchre) for bars wanting to start a euchre night.",
    },
    {
      topicKey: "lp-music-bingo-night",
      category: "Game-specific guides",
      title: "How to Run a Music Bingo Night at Your Bar",
      brief:
        "What music bingo is, how it differs from trivia, format/round structure, prize ideas, and why it's an easy low-friction recurring night.",
    },
    {
      topicKey: "lp-team-vs-solo-signup",
      category: "Getting started",
      title: "Team Signup vs. Solo Signup: Which Should Your Competition Use",
      brief:
        "When to let players register solo (and get matched/seeded) versus requiring captain-led team registration, and how that choice affects turnout.",
    },
    {
      topicKey: "lp-slow-tuesday-anchor-event",
      category: "Promotion & growth",
      title: "Choosing the Right Recurring Game Night for Your Slowest Night of the Week",
      brief:
        "How to pick which game format fits a specific slow night (weeknight trivia vs weekend cornhole) based on typical crowd and space constraints.",
    },
    {
      topicKey: "lp-multi-format-rotation",
      category: "Operations & troubleshooting",
      title: "Running Multiple Competition Formats in the Same Venue Without Confusing Players",
      brief:
        "Practical scheduling and communication advice for a bar running more than one recurring league/tournament format at once (e.g. darts Tuesdays, trivia Thursdays).",
    },
  ],
};

/** Cheap token-overlap similarity check - deliberately simple, not semantic, on purpose: it only
 * needs to catch obvious near-duplicates, and a simple heuristic is easier to reason about and
 * audit than a judgment call for this particular gate. */
function titleSimilarity(a: string, b: string): number {
  const norm = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3),
    );
  const setA = norm(a);
  const setB = norm(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let overlap = 0;
  for (const w of setA) if (setB.has(w)) overlap++;
  return overlap / Math.min(setA.size, setB.size);
}

export const DUPLICATE_TITLE_THRESHOLD = 0.6;

export function isDuplicateTitle(candidateTitle: string, existingTitles: string[]): string | null {
  for (const existing of existingTitles) {
    if (titleSimilarity(candidateTitle, existing) >= DUPLICATE_TITLE_THRESHOLD) return existing;
  }
  return null;
}

/** Rule-based, no LLM: classifies search intent from the title shape alone. */
export function classifySearchIntent(title: string): SearchIntent {
  const t = title.toLowerCase();
  if (t.startsWith("how to") || t.startsWith("how ") || t.includes("how to")) return "how-to";
  if (/\bvs\.?\b/.test(t) || t.includes("versus") || t.includes("difference")) return "comparison";
  if (/^\d+\s/.test(title) || t.includes("examples") || t.includes("ideas")) return "listicle";
  return "informational";
}

/** A generic, topic-agnostic starting outline - deliberately not overly specific, since section 5
 * of the content spec says not to force the same structure every time. Whoever writes the body is
 * expected to adapt it, not follow it mechanically. */
export function buildOutline(topic: TopicCandidate): Outline {
  return {
    sections: [
      `The problem: ${topic.brief}`,
      "Practical steps or approach",
      "Common mistakes to avoid",
      "A concrete example, checklist, or template",
      "Where this fits with the product (one short paragraph, only real features)",
    ],
  };
}

/** Deterministic priority score: earlier backlog position scores higher, and a category with
 * fewer existing (queued + published) entries scores higher too, so topic queueing naturally
 * spreads across categories instead of exhausting one category first. */
export function scoreTopic(topic: TopicCandidate, backlogIndex: number, existingInCategory: number): number {
  const positionScore = Math.max(0, 100 - backlogIndex * 5);
  const categoryBalanceBonus = Math.max(0, 20 - existingInCategory * 8);
  return positionScore + categoryBalanceBonus;
}

/** Existing static guide titles + all known DB rows (any status) for `brand`. */
async function knownTitlesAndKeys(brand: Brand): Promise<{ titles: string[]; keys: Set<string>; categoryCounts: Map<string, number> }> {
  const config = BRANDS[brand];
  const existing = await prisma.guide.findMany({ where: { brand }, select: { topicKey: true, title: true, category: true } });
  const categoryCounts = new Map<string, number>();
  for (const g of existing) categoryCounts.set(g.category, (categoryCounts.get(g.category) ?? 0) + 1);
  return {
    titles: [...config.existingGuideTitles, ...existing.map((g) => g.title)],
    keys: new Set(existing.map((g) => g.topicKey)),
    categoryCounts,
  };
}

/** Picks the next backlog topic for `brand` that hasn't been queued/published yet, and doesn't
 * look like a near-duplicate of any existing static guide or prior Guide row. Returns null when
 * the backlog is exhausted - the caller should stop, not invent a topic on the fly. Among
 * available candidates, returns the one with the highest `scoreTopic()` score. */
export async function nextTopic(brand: Brand): Promise<{ topic: TopicCandidate; score: number } | null> {
  const { titles, keys, categoryCounts } = await knownTitlesAndKeys(brand);

  let best: { topic: TopicCandidate; score: number } | null = null;
  BACKLOG[brand].forEach((candidate, index) => {
    if (keys.has(candidate.topicKey)) return;
    if (isDuplicateTitle(candidate.title, titles)) return;
    const score = scoreTopic(candidate, index, categoryCounts.get(candidate.category) ?? 0);
    if (!best || score > best.score) best = { topic: candidate, score };
  });
  return best;
}
