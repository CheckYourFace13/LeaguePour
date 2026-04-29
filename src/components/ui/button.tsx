import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "border border-transparent bg-lp-accent text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] hover:bg-lp-accent-hover hover:brightness-[1.02] active:translate-y-px active:brightness-95",
  secondary:
    "border border-lp-border bg-transparent text-lp-text-soft shadow-none hover:border-lp-border-strong hover:bg-white/[0.04] active:bg-white/[0.06]",
  ghost:
    "border border-transparent text-lp-muted hover:bg-white/[0.05] hover:text-lp-text active:bg-white/[0.07]",
  outline:
    "border border-lp-border-strong bg-transparent text-lp-text-soft hover:border-lp-accent/50 hover:text-lp-text",
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
          "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-colors duration-150",
          "rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-lp-bg",
          "disabled:pointer-events-none disabled:opacity-40",
          variants[variant],
          size === "md" && "min-h-12 px-5 py-3 text-[15px] leading-none",
          size === "lg" && "min-h-14 px-8 py-3.5 text-base leading-none md:min-h-[3.25rem] md:text-[1.0625rem]",
          size === "icon" && "size-12 min-h-12 p-0",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
