import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex w-full min-h-12 rounded-[10px] border border-lp-border bg-lp-bg px-4 py-3 text-base text-lp-text placeholder:text-lp-muted/75 outline-none transition-colors duration-150",
      "hover:border-lp-border-strong focus:border-lp-accent/70 focus:ring-2 focus:ring-lp-accent/25 focus:ring-offset-0",
      "disabled:cursor-not-allowed disabled:opacity-45",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
