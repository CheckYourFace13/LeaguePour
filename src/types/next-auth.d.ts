import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
    };
    venueAccess: { venueId: string; slug: string; role: string }[]; // venueId for queries, slug for public links
    hasPlayerProfile: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    email?: string;
    name?: string;
    picture?: string;
    venueAccess?: { venueId: string; slug: string; role: string }[];
    hasPlayerProfile?: boolean;
  }
}
