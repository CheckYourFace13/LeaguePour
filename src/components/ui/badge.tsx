import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const styles = {
  default: "border-lp-border bg-lp-surface-2 text-lp-text-soft border",
  accent: "border-lp-accent/40 bg-lp-accent/12 text-lp-accent border",
  success: "border-lp-success/35 bg-lp-success/10 text-lp-success border",
  muted: "border-lp-border bg-transparent text-lp-muted border",
} as const;

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof styles }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em]",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
