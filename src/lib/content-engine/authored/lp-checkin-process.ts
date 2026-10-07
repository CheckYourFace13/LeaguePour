import type { AuthoredBody } from "./types";

export const lpCheckinProcess: AuthoredBody = {
  description:
    "A practical check-in process for league and tournament nights at a bar: what to settle before the night, how to run the door, and what to do about late arrivals.",
  faq: [
    {
      q: "How early should check-in open before a bar tournament?",
      a: "Thirty minutes before the first match is a common window for a field of 16 to 32. It gives late arrivals a buffer without leaving early arrivals waiting long.",
    },
    {
      q: "What should happen if a player or team arrives after check-in closes?",
      a: "Decide in advance and announce it at signup: for example, a 10-minute grace period, then the slot goes to the waitlist or the match is a forfeit. Applying the same rule every week is what makes it stick.",
    },
    {
      q: "Do we still need check-in if everyone registered online?",
      a: "Yes - registration tells you who planned to come, check-in tells you who actually did. That's the list you build the bracket or the night's pairings from.",
    },
  ],
  bodyHtml: `
<p>The first fifteen minutes of a league night set the tone for the next three hours. When check-in means a line at the bar while someone hunts for names on a crumpled sheet and makes change for entry fees, the first match starts late and the night never catches up. A smooth check-in is mostly decided before anyone walks in.</p>

<h2>Move everything you can out of the doorway</h2>
<p>Check-in gets slow when the door is doing jobs that belong somewhere else. Three of them can almost always move earlier:</p>
<ul>
<li><strong>Registration.</strong> If players sign up ahead of time - from a link or a QR code on the table - check-in becomes confirming a name instead of taking down details.</li>
<li><strong>Payment.</strong> Collecting entry fees at signup removes the slowest part of the door entirely: making change, splitting team fees, and chasing the player who'll "pay at the break."</li>
<li><strong>Team rosters.</strong> Have captains confirm their roster before the night. Sorting out who's on which team at the door is where the line forms.</li>
</ul>
<p>What's left at the door is short: confirm who showed up, handle walk-ins and subs, and point people to their board or table.</p>

<h2>Set the schedule backward from the first match</h2>
<p>Pick the first match time, then work backward:</p>
<ol>
<li><strong>First match:</strong> 7:30 PM.</li>
<li><strong>Bracket or pairings posted:</strong> 7:20 PM - you need a few minutes after check-in closes to build them.</li>
<li><strong>Check-in closes:</strong> 7:15 PM.</li>
<li><strong>Check-in opens:</strong> 6:45 PM.</li>
</ol>
<p>Announce the close time, not just the start time. "Check-in closes at 7:15" gets people in the door; "starts at 7:30" gets people walking in at 7:35.</p>

<h2>Run the door with one list and one person</h2>
<p>Use a single source of truth for who's registered - a printout of the registration list or the list on a phone or tablet - and give one person ownership of it. Two staff checking names off two different lists is how the same team ends up in the bracket twice.</p>
<p>At the door, that person:</p>
<ul>
<li>Checks off each arrival.</li>
<li>Confirms anyone who hasn't paid (if you allow pay-at-the-door at all).</li>
<li>Adds walk-ins and subs to the list, so the bracket is built from what's on it.</li>
<li>Tells each arrival where to go: board 3, table 6, or "you're up second on the far board."</li>
</ul>

<h2>Handle late arrivals the same way every week</h2>
<p>Late arrivals are where check-in rules fall apart, usually because they're decided on the spot for a regular nobody wants to upset. Decide the rule once and announce it when people sign up:</p>
<ul>
<li>A short grace period after check-in closes (10 minutes is common).</li>
<li>After that, the slot goes to the first team on the waitlist - or, mid-league, the match is recorded as a forfeit.</li>
</ul>
<p>Our guide to <a href="/guides/managing-no-shows-and-forfeits">managing no-shows and forfeits</a> covers forfeit scoring and how to keep a league fair when teams miss weeks.</p>

<h2>Keep a waitlist on busy nights</h2>
<p>If your field fills, keep a waitlist and check those players in too. When a registered team doesn't show by the close, the next team on the waitlist takes the slot. That turns a no-show from an empty board into a full one, and it rewards the people who showed up on time.</p>

<h2>A check-in checklist</h2>
<ol>
<li>Registration closes: the afternoon of the event, so you can print or load the final list.</li>
<li>Waitlist ready and in order.</li>
<li>One person owns the list; everyone else sends questions to them.</li>
<li>Boards or tables numbered and visible from the door.</li>
<li>Check-in open and close times posted.</li>
<li>Late-arrival rule announced at signup and repeated at the door.</li>
<li>Bracket or pairings built from the checked-in list, not the registration list.</li>
</ol>
<p>Choosing the format for the night? <a href="/guides/round-robin-vs-single-elimination">Round robin vs. single elimination</a> explains how each one handles an uneven or late-changing field.</p>

<h2>Where LeaguePour fits</h2>
<p>LeaguePour moves registration and entry-fee payment to signup: players register from a link or QR code on their phone and pay at the same time, and your registration list shows who's confirmed, so it can double as the check-in sheet you print or pull up at the door. See <a href="/how-it-works">how it works</a>.</p>
`.trim(),
};
