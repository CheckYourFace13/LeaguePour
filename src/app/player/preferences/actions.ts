"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const frequencies = ["quiet", "normal", "loud"] as const;

export async function updateCommunicationPreferences(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const userId = session.user.id;
  const emailOffers = formData.get("emailOffers") === "on";
  const smsOffers = formData.get("smsOffers") === "on";
  const eventReminders = formData.get("eventReminders") === "on";
  const globalOptOut = formData.get("globalOptOut") === "on";
  const rawFreq = String(formData.get("frequency") ?? "normal");
  const frequency = frequencies.includes(rawFreq as (typeof frequencies)[number])
    ? rawFreq
    : "normal";

  await prisma.communicationPreference.upsert({
    where: { userId },
    create: {
      userId,
      emailOffers,
      smsOffers,
      eventReminders,
      frequency,
      globalOptOut,
    },
    update: {
      emailOffers,
      smsOffers,
      eventReminders,
      frequency,
      globalOptOut,
    },
  });

  revalidatePath("/player/preferences");
}
