"use client";

type ConfirmActionButtonProps = {
  label: string;
  prompt: string;
  className?: string;
  disabled?: boolean;
};

export function ConfirmActionButton({ label, prompt, className, disabled }: ConfirmActionButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      disabled={disabled}
      onClick={(e) => {
        if (!window.confirm(prompt)) {
          e.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
