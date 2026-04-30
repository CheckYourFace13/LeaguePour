import { redirect } from "next/navigation";
import { auth } from "@/auth";

function ownerEmails(): string[] {
  const raw = process.env.INTERNAL_OWNER_EMAILS ?? process.env.OWNER_EMAIL ?? "";
  return raw
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireOwnerSession() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase() ?? "";
  const allowlist = ownerEmails();

  if (!session?.user || !email || allowlist.length === 0 || !allowlist.includes(email)) {
    redirect("/login?callbackUrl=/internal/admin");
  }

  return session;
}
