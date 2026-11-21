import type { AuthoredBody } from "./types";

export const lpSlowTuesdayAnchorEvent: AuthoredBody = {
  title: "Choosing a Recurring Game for Your Slowest Weeknight",
  description:
    "How to pick the right recurring game night for your slowest night: match trivia, darts, cornhole, euchre or music bingo to your crowd, your space and the staff you have.",
  faq: [
    {
      q: "What is the best game night for a slow weeknight at a bar?",
      a: "The one your regulars already like and your space can handle. Trivia and music bingo suit mixed crowds and dining tables; darts and pool suit bars with boards and tables already in use; cornhole needs floor space or a patio; euchre suits an older, card-playing crowd.",
    },
    {
      q: "How long should I give a new game night before judging it?",
      a: "Commit to six to eight weeks on the same night and time. Recurring nights grow by word of mouth, and the first two or three weeks rarely tell you much.",
    },
    {
      q: "Should a weeknight game night charge an entry fee?",
      a: "A free or low entry fee is usually right while you build a crowd. A small fee can cut no-shows for team events, and you can add prizes or a league season once attendance is steady.",
    },
  ],
  bodyHtml: `
<p>Every bar has a night that pays the staff and not much else. A recurring game night is one of the most reliable ways to change that, because it gives people a reason to come on that specific night, every week. The hard part is choosing which game. Pick the wrong one and you'll spend two months promoting a night your crowd was never going to show up for.</p>

<h2>Start with your crowd, not the game</h2>
<p>Look at who already comes in during the week:</p>
<ul>
<li><strong>Groups of coworkers and friends, mixed ages:</strong> trivia or music bingo. Both work for casual players, and nobody has to be good at anything.</li>
<li><strong>Regulars who already throw darts or shoot pool:</strong> a blind draw or a weekly tournament. You already have the equipment and the players.</li>
<li><strong>Younger crowd, lots of space or a patio:</strong> cornhole. It is social, easy to learn and fun to watch.</li>
<li><strong>Older regulars, card players, a quieter room:</strong> euchre or another card night.</li>
</ul>
<p>If you're unsure, ask a few regulars what they'd come in for on that night. The people already in your bar are the core of any recurring night.</p>

<h2>Check your space and staff honestly</h2>
<p>Each format asks something different of the room:</p>
<ul>
<li><strong>Trivia and music bingo</strong> need a sound system that reaches every table and a host. Tables stay full, which suits food service.</li>
<li><strong>Darts and pool</strong> need boards or tables in good shape, and someone to run the bracket and enter results.</li>
<li><strong>Cornhole</strong> needs about 40 feet of open floor per pair of boards, or outdoor space.</li>
<li><strong>Card nights</strong> need tables that can be reserved for the evening.</li>
</ul>
<p>Be realistic about who will run it. A night that depends on one bartender doing it while also serving the bar won't last. Formats that run themselves once set up, such as a printed bracket or an online signup, take that pressure off.</p>

<h2>Pick a format that brings people back</h2>
<p>A single tournament fills one night. A <strong>league or a season</strong> fills the same night for six to ten weeks, because teams commit up front. A good pattern is to open with a one-night tournament to find your players, then offer a short league to the ones who enjoyed it. Round robin schedules suit leagues; single elimination suits one-night events. See <a href="/guides/round-robin-vs-single-elimination">round robin vs single elimination</a> for the tradeoffs.</p>

<h2>Promote the night, not the game</h2>
<p>"Tuesday Cornhole League, 7pm, teams of two" is easier to remember than "cornhole sometimes". Keep the same night and start time every week. Put a sign at the bar and a QR code on the tables that goes straight to a signup page, and tell every team at the end of the night when the next one is. Give it six to eight weeks before you judge it.</p>

<h2>Running it without the paperwork</h2>
<p>You can start with nothing more than a whiteboard. If you want something faster, LeaguePour's free <a href="/tools/single-elimination-bracket-generator">bracket generator</a>, <a href="/tools/round-robin-schedule-generator">round robin schedule generator</a> and <a href="/tools/standings-calculator">standings calculator</a> work without an account. When you want players to sign up online, a free LeaguePour venue account gives your event a public page and QR code. Players register from their phone, and the bracket or schedule is built from the signups. Standings update as you enter scores. Your first active competition is free, and entry fees are optional, paid through your own Stripe account if you charge them. <a href="/signup/venue">Create a free venue account</a> when you're ready to run the night online.</p>
`,
};
