import { auth } from "@/auth";
import { PlayerAppShell } from "@/components/app/player-app-shell";
import { emailIsOwner } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.hasPlayerProfile) redirect("/signup/player?reason=player");
  return (
    <PlayerAppShell isAdmin={emailIsOwner(session.user.email)}>{children}</PlayerAppShell>
  );
}
