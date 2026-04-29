import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-32 w-full rounded-[10px] border border-lp-border bg-lp-bg px-4 py-3.5 text-base text-lp-text placeholder:text-lp-muted/75 outline-none transition-colors duration-150",
        "hover:border-lp-border-strong focus:border-lp-accent/70 focus:ring-2 focus:ring-lp-accent/25",
        "disabled:opacity-45",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
