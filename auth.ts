import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import prisma from "./lib/prisma";
import { LoginSchema } from "./lib/schemas";
import { authConfig } from "./auth.config";
import { rateLimit } from "./lib/rate-limit";

type AuthUser = {
  id: string;
  role?: string;
  isVerified?: boolean;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },

  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields =
            LoginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } =
            validatedFields.data;

        // Rate limit by email
        const { success } =
            await rateLimit.limit(email);

        if (!success) {
          throw new Error(
              "Too many login attempts. Please try again later."
          );
        }

        const user =
            await prisma.user.findUnique({
              where: { email },
            });

        if (!user || !user.password) {
          return null;
        }

        if (!user.isVerified) {
          throw new Error(
              "Please verify your email first."
          );
        }

        if (user.active === false) {
          throw new Error(
              "Your account has been disabled."
          );
        }

        const passwordsMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      if (!token.id) {
        return token;
      }

      const dbUser =
          await prisma.user.findUnique({
            where: {
              id: token.id as string,
            },
            select: {
              role: true,
              isVerified: true,
              active: true,
            },
          });

      if (!dbUser || !dbUser.active) {
        return {};
      }

      token.role = dbUser.role;
      token.isVerified =
          dbUser.isVerified;

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id =
            token.id as string;

        (
            session.user as typeof session.user & {
              role?: string;
              isVerified?: boolean;
            }
        ).role = token.role as string;

        (
            session.user as typeof session.user & {
              role?: string;
              isVerified?: boolean;
            }
        ).isVerified =
            token.isVerified as boolean;
      }

      return session;
    },
  },

  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        secure:
            process.env.NODE_ENV ===
            "production",
        sameSite: "lax",
      },
    },
  },
});