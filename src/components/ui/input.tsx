import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex w-full min-h-[3.25rem] rounded-[10px] border border-lp-border-strong bg-lp-bg px-5 py-3 text-[1.02rem] text-lp-text placeholder:text-lp-muted/70 outline-none transition-colors duration-150",
      "hover:border-lp-accent/40 focus:border-lp-accent/80 focus:ring-2 focus:ring-lp-accent/28 focus:ring-offset-0",
      "disabled:cursor-not-allowed disabled:opacity-45",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
