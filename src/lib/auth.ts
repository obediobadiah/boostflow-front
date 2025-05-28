import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Extend session types to include ID
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        // Create a random UUID for new users
        const userId = user.id || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        token.id = userId;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
      },
    }),
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 