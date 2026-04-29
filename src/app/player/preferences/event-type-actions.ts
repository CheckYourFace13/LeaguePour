"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PREFERENCE_EVENT_TYPES } from "@/lib/player-preference-event-types";

const weight = z.coerce.number().int().min(1).max(5);

export async function updateEventTypeWeightsFormAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const uid = session.user.id;

  for (const kind of PREFERENCE_EVENT_TYPES) {
    const raw = formData.get(`w_${kind}`);
    if (raw === null || raw === "") continue;
    if (!weight.safeParse(raw).success) redirect("/player/preferences?notice=invalid-weights");
  }

  const writes = [];
  for (const kind of PREFERENCE_EVENT_TYPES) {
    const raw = formData.get(`w_${kind}`);
    if (raw === null || raw === "") continue;
    const w = weight.parse(raw);
    writes.push(
      prisma.eventTypePreference.upsert({
        where: { userId_kind: { userId: uid, kind } },
        create: { userId: uid, kind, weight: w },
        update: { weight: w },
      }),
    );
  }

  if (writes.length) {
    await prisma.$transaction(writes);
  }

  revalidatePath("/player/preferences");
  revalidatePath("/player/dashboard");
  redirect("/player/preferences?notice=types-saved");
}
