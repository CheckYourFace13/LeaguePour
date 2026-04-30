import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const { prisma } = await import("@/lib/db");
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        if (user.image) token.picture = user.image;
      }
      const uid = (user?.id as string | undefined) ?? (token.userId as string | undefined);
      if (!uid) return token;

      const { prisma } = await import("@/lib/db");
      const staff = await prisma.venueStaff.findMany({
        where: { userId: uid },
        include: { venue: { select: { id: true, slug: true } } },
      });
      // Refreshed on each JWT update (e.g. session read). Server actions should still use `resolvePrimaryVenueAccess`
      // so revoked/changed roles cannot drift from the database.
      token.venueAccess = staff.map((s) => ({
        venueId: s.venueId,
        slug: s.venue.slug,
        role: s.role,
      }));
      const player = await prisma.playerProfile.findUnique({ where: { userId: uid } });
      token.hasPlayerProfile = !!player;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.userId) session.user.id = token.userId as string;
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      session.venueAccess = (token.venueAccess as typeof session.venueAccess) ?? [];
      session.hasPlayerProfile = Boolean(token.hasPlayerProfile);
      return session;
    },
  },
});
