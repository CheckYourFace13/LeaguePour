import { auth } from "@/auth";
import { PlayerAppShell } from "@/components/app/player-app-shell";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/player/dashboard");
  if (!session.hasPlayerProfile) redirect("/signup/player?reason=player");
  return <PlayerAppShell>{children}</PlayerAppShell>;
}
