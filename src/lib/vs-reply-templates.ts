/**
 * Reply templates for a VenueSprocket lead, opened in the venue's own email app (mailto:), so the
 * reply comes from the venue's real address and sits in its normal sent mail. Plain text only;
 * every value is URL-encoded, so names with "&" or "?" can't break the link.
 */

export type ReplyLead = {
  customerName: string;
  customerEmail: string;
  eventType: string;
  preferredDate: Date | null;
  guestCount: number | null;
};

export type ReplyTemplate = { key: string; label: string; subject: string; body: string };

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "there";
}

function eventLabel(eventType: string): string {
  return eventType === "OTHER" ? "event" : eventType.toLowerCase().replace(/_/g, " ");
}

function dateLabel(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

export function replyTemplates(lead: ReplyLead, venueName: string): ReplyTemplate[] {
  const hi = `Hi ${firstName(lead.customerName)},`;
  const ev = eventLabel(lead.eventType);
  const when = dateLabel(lead.preferredDate);
  const guests = lead.guestCount ? ` for about ${lead.guestCount} guests` : "";
  const subject = `Your ${ev} at ${venueName}`;

  return [
    {
      key: "thanks",
      label: "Thanks, let's talk",
      subject,
      body: `${hi}\n\nThanks for reaching out about your ${ev}. We'd love to host you.\n\nCould we set up a quick call to go over the details? Let me know a time that works.\n\nBest,\n`,
    },
    {
      key: "available",
      label: "Date is available",
      subject,
      body: `${hi}\n\nGood news: ${when ?? "your date"} is open${guests}. I can pencil it in while we finalize the details.\n\nI'll put together a proposal with pricing. Is there anything specific you'd like included (food, drinks, setup, A/V)?\n\nBest,\n`,
    },
    {
      key: "details",
      label: "Need a few details",
      subject,
      body: `${hi}\n\nThanks for your inquiry. To put together options for your ${ev}, could you tell me:\n\n- Date and start/end time (and a backup date, if you have one)\n- Approximate number of guests\n- Food and drink you have in mind\n- Rough budget\n\nBest,\n`,
    },
    {
      key: "unavailable",
      label: "Date unavailable",
      subject,
      body: `${hi}\n\nThank you for thinking of us. Unfortunately ${when ?? "that date"} is already booked.\n\nWould another date work? I'd be glad to suggest a few nearby options${guests}.\n\nBest,\n`,
    },
  ];
}

export function mailtoHref(to: string, t: ReplyTemplate): string {
  return `mailto:${encodeURIComponent(to).replace(/%40/g, "@")}?subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(t.body)}`;
}
