import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import Cookies from 'js-cookie';
import { Session } from "next-auth";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
      token?: string | null;
    }
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
    token?: string | null;
  }
  
  interface JWT {
    id?: string;
    role?: string;
    apiToken?: string;
    tokenExpiry?: number;
    expired?: boolean;
  }
}

// Build providers array
const buildProviders = () => {
  const providers = [];
  
  // Add credentials provider
  providers.push(
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          // Connect to the backend API
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const response = await axios.post(`${apiUrl}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });
          
          if (response.data?.user && response.data?.token) {
            // Return user data in the format expected by NextAuth
            return {
              id: String(response.data.user.id),
              name: `${response.data.user.firstName} ${response.data.user.lastName}`,
              email: response.data.user.email,
              image: response.data.user.profilePicture,
              role: response.data.user.role,
              token: response.data.token
            };
          }

          throw new Error("Invalid email or password");
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
              throw new Error("Invalid email or password");
            } else if (error.response?.data?.message) {
              throw new Error(error.response.data.message);
            }
          }
          throw new Error("Something went wrong. Please try again later.");
        }
      }
    })
  );
  
  // Add Google provider
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder-client-secret",
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    })
  );
  
  return providers;
};

export const authOptions: NextAuthOptions = {
  providers: buildProviders(),
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // For credentials provider, we've already handled the logic in authorize
      if (account?.provider === 'credentials') {
        return true;
      }
      
      // For OAuth providers like Google, redirect to backend login
      if (account?.provider === 'google') {
        try {
          // You can pass the provider's data to your backend here
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const response = await fetch(`${apiUrl}/auth/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              email: profile?.email,
              name: profile?.name,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.token) {
              // Store the token or handle it according to your flow
              return `/auth/callback?token=${data.token}`;
            }
          }
          
          return `/auth/callback?error=BackendAuthFailed`;
        } catch (error) {
          console.error('Social login error:', error);
          return `/auth/callback?error=SocialLoginFailed`;
        }
      }
      
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        // New sign-in
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = user.role;
        token.apiToken = user.token;
        
        // Set token expiry to 24 hours from now
        token.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
      }
      
      // If token exists in cookies, synchronize with JWT
      if (typeof window !== 'undefined') {
        const cookieToken = Cookies.get('auth_token');
        if (cookieToken && cookieToken !== token.apiToken) {
          token.apiToken = cookieToken;
          token.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // Reset expiry
        }
      }
      
      // Check if token is expired
      const tokenExpiry = token.tokenExpiry as number;
      if (tokenExpiry && Date.now() > tokenExpiry) {
        // Token expired, try to refresh or force re-login
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const response = await axios.post(`${apiUrl}/auth/refresh-token`, {}, {
            headers: { Authorization: `Bearer ${token.apiToken}` }
          });
          
          if (response.data?.token) {
            token.apiToken = response.data.token;
            token.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // Reset expiry
            
            // Update cookie
            if (typeof window !== 'undefined') {
              Cookies.set('auth_token', response.data.token, { 
                expires: 1, 
                path: '/', 
                sameSite: 'strict' 
              });
            }
          }
        } catch (error) {
          // Refresh failed, clear token to force re-login
          token.expired = true;
        }
      }
      
      return token;
    },
    session({ session, token }) {
      // Check if token is expired
      if (token.expired) {
        // Return a session with user but mark it as requiring re-authentication
        return {
          ...session,
          error: "RefreshAccessTokenError",
        } as Session;
      }
      
      // Add user info to the session
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          token: token.apiToken as string,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 