export type AudienceFilterPayload = {
  source?: "venue_followers" | "segment" | "competition";
  tag?: string;
};

export function parseAudienceFilter(raw: unknown): AudienceFilterPayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const source = o.source;
  const tag = o.tag;
  if (source === "segment" && typeof tag === "string" && tag.trim()) {
    return { source: "segment", tag: tag.trim() };
  }
  if (source === "venue_followers") return { source: "venue_followers" };
  if (source === "competition") return { source: "competition" };
  return null;
}

export function campaignAudienceSummary(campaign: {
  competitionId: string | null;
  audienceFilter: unknown;
  competition: { title: string } | null;
}): string {
  if (campaign.competitionId && campaign.competition) {
    return `Competition: ${campaign.competition.title}`;
  }
  const f = parseAudienceFilter(campaign.audienceFilter);
  if (f?.source === "segment" && f.tag) return `Saved segment (tag): ${f.tag}`;
  return "All venue followers";
}

export function inferAudienceSourceFromCampaign(campaign: {
  competitionId: string | null;
  audienceFilter: unknown;
}): "all" | "competition" | "segment" {
  if (campaign.competitionId) return "competition";
  const f = parseAudienceFilter(campaign.audienceFilter);
  if (f?.source === "segment" && f.tag) return "segment";
  return "all";
}
