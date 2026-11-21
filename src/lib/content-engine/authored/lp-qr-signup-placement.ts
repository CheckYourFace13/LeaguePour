import type { AuthoredBody } from "./types";

export const lpQrSignupPlacement: AuthoredBody = {
  description:
    "Where to put a league or tournament QR signup code so people scan it: table tents, the bar rail, the TV screen and social posts, plus the copy that gets a scan.",
  faq: [
    {
      q: "Where should a bar put a QR code for a tournament signup?",
      a: "Where people wait with their phones out: on tables, along the bar rail, by the game area and on the TV between games. A single flyer by the door gets walked past; several small codes where guests sit get scanned.",
    },
    {
      q: "How big should a QR code be on a table tent?",
      a: "Big enough to scan from a seated distance without picking the tent up, about 2 inches square or larger, with plain contrast and space around it. Test it from the seat before you print a stack.",
    },
    {
      q: "What should the text next to the QR code say?",
      a: "What it is, when it is and what it costs: for example \"Cornhole tournament, Thursday 7pm, teams of two, $10 per team. Scan to sign up.\" People scan when they know what happens next.",
    },
  ],
  bodyHtml: `
<p>A QR code turns "we should do that" into a signup while the idea is still fresh, but only if people see it at the moment they're interested. Most bars print one flyer, tape it by the door and wonder why nobody scans it. Here's where codes actually get scanned and what to put next to them.</p>

<h2>Put codes where people already have their phones out</h2>
<ul>
<li><strong>Table tents.</strong> The single best spot. Guests sit, wait for food or a round and pick up their phones. One tent per table beats one poster per room.</li>
<li><strong>The bar rail and coasters.</strong> Regulars at the bar are your most likely league players. A small card by the taps or a printed coaster reaches them where they spend the most time.</li>
<li><strong>Next to the game.</strong> Put a code on the dartboard cabinet, the cornhole boards' storage spot or the pool table light. People watching a game are already thinking about playing.</li>
<li><strong>The TV, between games.</strong> If you rotate slides on a screen, add one with the code and the event details. Make it large enough to scan from across the room.</li>
<li><strong>The check presenter or receipt.</strong> A small "Next Thursday: trivia league, scan to join" reaches everyone at the moment they're leaving happy.</li>
</ul>

<h2>Say what happens after the scan</h2>
<p>A bare code gets ignored. The words around it should answer three questions at a glance:</p>
<ol>
<li><strong>What is it?</strong> "Cornhole tournament" or "Tuesday trivia league".</li>
<li><strong>When?</strong> The day and start time, and how many weeks for a league.</li>
<li><strong>What does it cost?</strong> Free, or the entry fee per player or team.</li>
</ol>
<p>Finish with a plain instruction: "Scan to sign up." If prizes or a bar tab are on the line, say so. That is often the line that gets a table to sign up together.</p>

<h2>Make it scannable</h2>
<ul>
<li>Print dark on light with a clear margin around the code. Busy backgrounds and tiny codes fail.</li>
<li>Test every printed version from where a guest would actually sit or stand.</li>
<li>Keep the link behind the code stable. If the code points to a page you'll replace next season, you'll be reprinting everything.</li>
</ul>

<h2>Use the same code online</h2>
<p>Post the event to your social accounts with the same signup link, and pin it for the week before. Ask your bartenders to mention it when they drop a check. A code on the table plus a reminder from a person people know works better than either alone.</p>

<h2>Check what's working</h2>
<p>Count signups for a couple of weeks after you change placement. If table tents fill the bracket and the door flyer brings nobody, put your effort into the tents. Keep the night and start time the same each week, so the signs only need new dates.</p>

<h2>Getting a code without the busywork</h2>
<p>With a free LeaguePour venue account, every competition gets a public signup page and a QR code you can print or show on a screen. Players register from their phone with no app to download, and you see the registration list as signups come in. If you're running something one-off first, the free <a href="/tools/single-elimination-bracket-generator">bracket generator</a> works without an account. <a href="/signup/venue">Create a free venue account</a> when you want online signups.</p>
`,
};
