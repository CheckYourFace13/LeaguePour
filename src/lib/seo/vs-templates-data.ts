/** Checklist content shared by the VenueSprocket template pages (/templates/*). */
export type ChecklistGroup = { group: string; items: string[] };

export const proposalChecklist: ChecklistGroup[] = [
  {
    group: "Event basics",
    items: [
      "Host name, phone, and email",
      "Event type and occasion",
      "Date, arrival time, and end time (and setup/teardown windows if they matter)",
      "Room or area being booked, and whether it's a full buyout",
      "Expected guest count - and the date by which the final count is due",
    ],
  },
  {
    group: "Pricing",
    items: [
      "Room fee or buyout fee, if you charge one",
      "Food and beverage minimum, and whether it's before or after tax and service charge",
      "What counts toward the minimum (food and drink only? cake or corkage fees?)",
      "Service charge or auto-gratuity percentage",
      "Sales tax treatment",
      "Estimated total, labeled as an estimate",
    ],
  },
  {
    group: "Commitment",
    items: [
      "Deposit amount and when it's due",
      "When the remaining balance is due and how it's paid",
      "How long the proposal is valid before the date is released",
      "A clear next step: accept, then sign the contract, then pay the deposit",
    ],
  },
];

export const contractChecklist: ChecklistGroup[] = [
  {
    group: "Parties and event",
    items: [
      "Legal business name of the venue and the host's full name",
      "Event date, times, room or area, and expected guest count",
      "Reference to the accepted proposal (or the pricing restated)",
    ],
  },
  {
    group: "Money",
    items: [
      "Deposit amount, and that it's applied to the final bill",
      "Food and beverage minimum and how a shortfall is charged",
      "Service charge, gratuity, and tax terms",
      "Balance due date and accepted payment methods",
      "Who pays for damage, extra cleaning, or overtime past the end time",
    ],
  },
  {
    group: "Changes and cancellation",
    items: [
      "Final guest count deadline, and whether the minimum changes if the count drops",
      "Cancellation schedule: what's refundable, and until when",
      "Rescheduling: whether the deposit transfers, and for how long",
      "What happens if the venue has to cancel (closure, emergency, weather)",
    ],
  },
  {
    group: "House rules",
    items: [
      "Outside food, cake, and alcohol policy (and any corkage or cake-cutting fee)",
      "Decor restrictions (confetti, candles, adhesives) and vendor access times",
      "Responsible alcohol service: ID checks and the right to refuse service",
      "Music and noise limits, and the hard end time",
    ],
  },
  {
    group: "Signature",
    items: [
      "Signer's printed name, signature, and date",
      "A line confirming the signer has authority to book for their group or company",
    ],
  },
];

