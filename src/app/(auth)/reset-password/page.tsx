import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

type ResetPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPageProps) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  if (!token) {
    return (
      <div className="w-full max-w-md rounded-xl border border-lp-border bg-lp-surface p-8 text-center text-sm text-lp-muted">
        <p>Missing reset token.</p>
        <p className="mt-3">
          <Link className="font-semibold text-lp-accent hover:underline" href="/forgot-password">
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
