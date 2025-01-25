import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import prisma from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Find or create user in Prisma DB
        const existingUser = await prisma.user.upsert({
          where: { email: user.email as string },
          update: {}, // No update needed if exists else
          create: {
            email: user.email as string,
            name: user.name,
            image:user.image
          },
        });

        user.id = existingUser.id; // Attach Prisma ID to the user
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach the Prisma user ID to the session
      //@ts-ignore
      session.user.id = token.id;
      return session;
    },
  },
});
