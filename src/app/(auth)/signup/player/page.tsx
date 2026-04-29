import { SignupPlayerForm } from "./signup-player-form";

export default async function SignupPlayerPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const redirectTo = sp.callbackUrl && sp.callbackUrl.startsWith("/") ? sp.callbackUrl : "/player/dashboard";
  return <SignupPlayerForm redirectTo={redirectTo} />;
}
