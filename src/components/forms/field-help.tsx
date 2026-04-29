import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldHelpProps = {
  title?: string;
  children: ReactNode;
  example?: string;
  className?: string;
};

export function FieldHelp({ title, children, example, className }: FieldHelpProps) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-lp-border border-l-[3px] border-l-lp-accent bg-lp-surface/90 py-4 pl-5 pr-4 text-base text-lp-muted leading-relaxed",
        className,
      )}
    >
      {title ? <p className="mb-2 text-[15px] font-semibold text-lp-text-soft">{title}</p> : null}
      <div className="space-y-2">{children}</div>
      {example ? (
        <p className="mt-4 rounded-md border border-lp-border bg-lp-bg/90 px-3 py-2.5 text-sm text-lp-muted leading-snug">
          <span className="font-semibold text-lp-text-soft/90">Example:</span> {example}
        </p>
      ) : null}
    </div>
  );
}

export function FieldHint({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mt-2 text-sm leading-snug text-lp-muted", className)}>{children}</p>
  );
}
