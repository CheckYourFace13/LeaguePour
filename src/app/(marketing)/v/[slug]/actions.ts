"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function toggleVenueFollowFormAction(formData: FormData) {
  const venueId = String(formData.get("venueId") ?? "");
  const venueSlug = String(formData.get("venueSlug") ?? "");
  const follow = String(formData.get("follow")) === "1";
  if (!venueId || !venueSlug) redirect("/");

  const session = await auth();
  if (!session?.user?.id || !session.hasPlayerProfile) {
    redirect(`/login?callbackUrl=/v/${encodeURIComponent(venueSlug)}`);
  }

  const uid = session.user.id;

  if (follow) {
    await prisma.venueFollow.upsert({
      where: { userId_venueId: { userId: uid, venueId } },
      create: { userId: uid, venueId },
      update: {},
    });
  } else {
    await prisma.venueFollow.deleteMany({
      where: { userId: uid, venueId },
    });
  }

  revalidatePath(`/v/${venueSlug}`);
  revalidatePath("/player/venues");
  revalidatePath("/player/dashboard");
  redirect(`/v/${venueSlug}`);
}
