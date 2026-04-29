import { Badge } from "@/components/ui/badge";
import type { RegistrationPaymentPresentation } from "@/lib/payment-display";

export function RegistrationPaymentBadge({ presentation }: { presentation: RegistrationPaymentPresentation }) {
  return (
    <Badge variant={presentation.badgeVariant} title={presentation.description}>
      {presentation.shortLabel}
    </Badge>
  );
}
