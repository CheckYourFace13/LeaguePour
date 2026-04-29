import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-[15px] font-semibold tracking-tight text-lp-text-soft", className)}
      {...props}
    />
  );
}
