import { SignupPlayerForm } from "./signup-player-form";

export default async function SignupPlayerPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  // "/" alone isn't enough - "//evil.com" also starts with "/" and browsers resolve it as
  // protocol-relative to an external origin (open redirect). Same check already used correctly
  // in src/app/(auth)/login/login-form.tsx's safePostLoginPath.
  const redirectTo =
    sp.callbackUrl && sp.callbackUrl.startsWith("/") && !sp.callbackUrl.startsWith("//")
      ? sp.callbackUrl
      : "/player/dashboard";
  return <SignupPlayerForm redirectTo={redirectTo} />;
}
