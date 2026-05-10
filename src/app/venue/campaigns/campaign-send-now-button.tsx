"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendCampaignNowAction } from "@/app/venue/campaigns/[id]/actions";

export function CampaignSendNowButton({ campaignId }: { campaignId: string }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!confirm("Send this campaign to all recipients now? This cannot be undone.")) return;
    setSending(true);
    setError(null);
    const result = await sendCampaignNowAction(campaignId);
    if (result?.error) {
      setError(result.error);
      setSending(false);
    }
    // On success the action redirects — component unmounts naturally
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={handleSend}
        disabled={sending}
      >
        {sending ? "Sending…" : "Send now"}
      </Button>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
