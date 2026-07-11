import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { role?: string; isVerified?: boolean }).role = token.role as string;
        (session.user as typeof session.user & { role?: string; isVerified?: boolean }).isVerified = token.isVerified as boolean;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isAuthPage = nextUrl.pathname.startsWith('/signin') || nextUrl.pathname.startsWith('/join');

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        const role = (auth?.user as { role?: string } | undefined)?.role;
        if (role === 'ADMIN') return true;
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      if (isDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
