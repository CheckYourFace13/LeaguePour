import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "border border-transparent bg-lp-accent-2 text-[#0b214d] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55),0_12px_24px_-16px_rgba(255,224,66,0.7)] hover:bg-[#ffd71c] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65),0_16px_28px_-16px_rgba(255,215,28,0.7)] active:translate-y-px active:brightness-95",
  secondary:
    "border border-lp-border-strong bg-lp-surface text-lp-text-soft shadow-[0_8px_18px_-16px_rgba(0,87,217,0.4)] hover:border-lp-accent/45 hover:bg-lp-surface-2 hover:text-lp-text active:bg-lp-surface-2",
  ghost:
    "border border-transparent text-lp-text-soft hover:bg-lp-surface-2 hover:text-lp-text active:bg-lp-surface-2",
  outline:
    "border border-lp-border-strong bg-transparent text-lp-text-soft hover:border-lp-accent/65 hover:text-lp-text",
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: "md" | "lg" | "icon";
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", type = "button", asChild, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref as never}
        type={asChild ? undefined : type}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-bold tracking-tight transition-all duration-150",
          "rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-accent/55 focus-visible:ring-offset-2 focus-visible:ring-offset-lp-bg",
          "disabled:pointer-events-none disabled:opacity-40",
          variants[variant],
          size === "md" && "min-h-[3.25rem] px-6 py-3 text-base leading-none",
          size === "lg" && "min-h-[3.5rem] px-9 py-4 text-[1.0625rem] leading-none md:min-h-[3.65rem] md:text-[1.125rem]",
          size === "icon" && "size-[3.25rem] min-h-[3.25rem] p-0",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
