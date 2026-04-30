import { Suspense } from "react";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md rounded-xl border border-lp-border bg-lp-surface/50 p-8 text-center text-sm text-lp-muted">
          Loading…
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
