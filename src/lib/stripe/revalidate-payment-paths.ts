import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

/** Invalidate Next.js caches for all surfaces that show registration payment state. */
export async function revalidateRegistrationPaymentPaths(registrationId: string): Promise<void> {
  const reg = await prisma.competitionRegistration.findFirst({
    where: { id: registrationId },
    include: { competition: { include: { venue: { select: { slug: true } } } } },
  });

  revalidatePath("/player/dashboard");
  revalidatePath("/player/competitions");
  revalidatePath("/player/payments");
  revalidatePath("/venue/registrations");
  revalidatePath("/venue/dashboard");
  revalidatePath("/venue/competitions");
  if (reg) {
    revalidatePath(`/venue/competitions/${reg.competitionId}`);
    revalidatePath(`/c/${reg.competition.venue.slug}/${reg.competition.slug}`);
  }
}
