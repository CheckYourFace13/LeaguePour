import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-lp-border bg-lp-surface/30 px-6 py-14 text-center",
        className,
      )}
    >
      <p className="font-display text-lg font-semibold text-lp-text">{title}</p>
      {description ? <p className="mt-2 max-w-sm text-sm text-lp-muted leading-relaxed">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
