import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toggleVenueFollowFormAction } from "./actions";

export function VenueFollowForm({
  venueId,
  venueSlug,
  isFollowing,
  isAuthedPlayer,
}: {
  venueId: string;
  venueSlug: string;
  isFollowing: boolean;
  isAuthedPlayer: boolean;
}) {
  if (!isAuthedPlayer) {
    return (
      <Button size="lg" className="w-full sm:w-auto" asChild>
        <Link href={`/login?callbackUrl=/v/${encodeURIComponent(venueSlug)}`}>Log in to follow</Link>
      </Button>
    );
  }

  return (
    <form action={toggleVenueFollowFormAction} className="w-full sm:w-auto">
      <input type="hidden" name="venueId" value={venueId} />
      <input type="hidden" name="venueSlug" value={venueSlug} />
      <input type="hidden" name="follow" value={isFollowing ? "0" : "1"} />
      <Button type="submit" size="lg" variant={isFollowing ? "secondary" : "primary"} className="w-full sm:w-auto">
        {isFollowing ? "Unfollow venue" : "Follow venue"}
      </Button>
    </form>
  );
}
