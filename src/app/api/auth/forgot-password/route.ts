import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";
import { getPublicSiteUrl } from "@/lib/site-url";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!user?.passwordHash) {
    return NextResponse.json({ ok: true });
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const raw = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const base = getPublicSiteUrl();
  const url = `${base}/reset-password?token=${encodeURIComponent(raw)}`;
  await sendPasswordResetEmail(email, url);

  return NextResponse.json({ ok: true });
}
