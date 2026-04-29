"use client";

import { useMemo, useState } from "react";
import { CampaignChannel, CampaignType } from "@/generated/prisma/enums";
import { buildCampaignDraftScaffold } from "@/lib/campaign-draft-scaffold";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCampaignDraftFormAction, updateCampaignDraftFormAction } from "@/app/venue/campaigns/actions";

const types: { value: CampaignType; label: string }[] = [
  { value: CampaignType.SIGNUP_CLOSING, label: "Signup closing soon" },
  { value: CampaignType.STARTS_TOMORROW, label: "Starts tomorrow" },
  { value: CampaignType.JOIN_NEXT, label: "Join the next one" },
  { value: CampaignType.WINNER_RECAP, label: "Winner / recap" },
  { value: CampaignType.CUSTOM, label: "Custom" },
];

const channels: { value: CampaignChannel; label: string }[] = [
  { value: CampaignChannel.EMAIL, label: "Email (in-app log)" },
  { value: CampaignChannel.SMS, label: "SMS (in-app log)" },
];

const selectClass =
  "mt-1.5 flex w-full min-h-12 rounded-[10px] border border-lp-border bg-lp-bg/80 px-4 text-base text-lp-text outline-none focus:border-lp-accent/60 focus:ring-2 focus:ring-lp-accent/25";

export type CampaignDraftEditorInitial = {
  name: string;
  audienceSource: "all" | "competition" | "segment";
  competitionId: string;
  segmentTag: string;
  channel: CampaignChannel;
  type: CampaignType;
  subject: string;
  body: string;
};

export function CampaignDraftEditor({
  mode,
  campaignId,
  venueName,
  competitions,
  segmentTags,
  initial,
}: {
  mode: "create" | "edit";
  campaignId?: string;
  venueName: string;
  competitions: { id: string; title: string }[];
  segmentTags: string[];
  initial: CampaignDraftEditorInitial;
}) {
  const [name, setName] = useState(initial.name);
  const [audienceSource, setAudienceSource] = useState<"all" | "competition" | "segment">(initial.audienceSource);
  const [competitionId, setCompetitionId] = useState(initial.competitionId);
  const [segmentTag, setSegmentTag] = useState(initial.segmentTag);
  const [channel, setChannel] = useState<CampaignChannel>(initial.channel);
  const [type, setType] = useState<CampaignType>(initial.type);
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);

  const competitionTitle = useMemo(() => {
    if (!competitionId) return null;
    return competitions.find((c) => c.id === competitionId)?.title ?? null;
  }, [competitionId, competitions]);

  function applyGoalTemplate() {
    const s = buildCampaignDraftScaffold({
      type,
      venueName,
      competitionTitle,
      channel,
    });
    setSubject(s.subject);
    setBody(s.body);
  }

  const formAction = mode === "create" ? createCampaignDraftFormAction : updateCampaignDraftFormAction;

  return (
    <form action={formAction} className="space-y-8">
      {mode === "edit" && campaignId ? <input type="hidden" name="campaignId" value={campaignId} /> : null}

      <div className="rounded-[10px] border border-lp-border bg-lp-surface/40 px-4 py-3 text-sm text-lp-muted">
        Sends from Messages are logged <span className="font-semibold text-lp-text">in-app</span> for now — connect an
        ESP or SMS provider when you are ready for external delivery.
      </div>

      <div className="space-y-2">
        <Label htmlFor="cd-name">Campaign name</Label>
        <Input
          id="cd-name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-12 text-base"
          placeholder="Thursday darts · signup nudge"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-lp-text">Target audience</legend>
        <p className="text-xs text-lp-muted">
          Recipients still respect player communication preferences when you send.
        </p>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="radio"
            name="audienceSource"
            value="all"
            className="mt-1 size-4"
            checked={audienceSource === "all"}
            onChange={() => setAudienceSource("all")}
          />
          <span>
            <span className="font-medium text-lp-text">All venue followers</span>
            <span className="block text-lp-muted">Everyone following this room on LeaguePour.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="radio"
            name="audienceSource"
            value="competition"
            className="mt-1 size-4"
            checked={audienceSource === "competition"}
            onChange={() => setAudienceSource("competition")}
            disabled={competitions.length === 0}
          />
          <span>
            <span className="font-medium text-lp-text">Participants from a competition</span>
            <span className="block text-lp-muted">Confirmed registrations only.</span>
          </span>
        </label>
        {audienceSource === "competition" ? (
          <div className="pl-7">
            <Label htmlFor="cd-comp">Competition</Label>
            <select
              id="cd-comp"
              name="competitionId"
              className={selectClass}
              value={competitionId}
              onChange={(e) => setCompetitionId(e.target.value)}
              required
            >
              <option value="">Select…</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" name="competitionId" value="" />
        )}

        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="radio"
            name="audienceSource"
            value="segment"
            className="mt-1 size-4"
            checked={audienceSource === "segment"}
            onChange={() => setAudienceSource("segment")}
            disabled={segmentTags.length === 0}
          />
          <span>
            <span className="font-medium text-lp-text">Saved segment (audience tag)</span>
            <span className="block text-lp-muted">
              {segmentTags.length === 0
                ? "No tags on file — tag players from Audience / CRM first."
                : "Players tagged at this venue."}
            </span>
          </span>
        </label>
        {audienceSource === "segment" ? (
          <div className="pl-7">
            <Label htmlFor="cd-seg">Segment tag</Label>
            <select
              id="cd-seg"
              name="segmentTag"
              className={selectClass}
              value={segmentTag}
              onChange={(e) => setSegmentTag(e.target.value)}
              required
            >
              <option value="">Select…</option>
              {segmentTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" name="segmentTag" value="" />
        )}
      </fieldset>

      <div>
        <Label htmlFor="cd-channel">Channel</Label>
        <select
          id="cd-channel"
          name="channel"
          className={selectClass}
          value={channel}
          onChange={(e) => setChannel(e.target.value as CampaignChannel)}
          required
        >
          {channels.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="cd-type">Message goal</Label>
        <select
          id="cd-type"
          name="type"
          className={selectClass}
          value={type}
          onChange={(e) => setType(e.target.value as CampaignType)}
          required
        >
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="button" variant="secondary" size="lg" onClick={applyGoalTemplate} className="w-full sm:w-auto">
          Insert / refresh template for goal
        </Button>
        <p className="text-xs text-lp-muted sm:flex-1">
          Overwrites subject and body with an admin-only scaffold. Tune copy before saving.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cd-subject">Subject / title line</Label>
        <Input
          id="cd-subject"
          name="subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="min-h-12 text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cd-body">Body</Label>
        <Textarea
          id="cd-body"
          name="body"
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          className="min-h-[200px] text-base"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          {mode === "create" ? "Save draft" : "Update draft"}
        </Button>
      </div>
    </form>
  );
}
