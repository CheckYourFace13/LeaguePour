"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function EmbedCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="md"
      variant="secondary"
      onClick={() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "Copied!" : "Copy embed code"}
    </Button>
  );
}
