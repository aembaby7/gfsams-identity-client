import { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

// Define custom types for your GFSAMS response
interface GFSAMSLoginResponse {
  isSuccess: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    user: {
      id: string;
      username: string;
      email: string;
      firstName?: string;
      lastName?: string;
      roles?: string[];
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

interface GFSAMSUserInfo {
  sub: string;
  name: string;
  email: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  role?: string | string[];
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      id: string;
      email: string;
      name: string;
      username?: string;
      roles?: string[];
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    username?: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    roles?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    username?: string;
    roles?: string[];
    error?: string;
  }
}

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || "http://localhost:5125";

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${IDENTITY_SERVICE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      }),
    });

    const refreshedTokens: GFSAMSLoginResponse = await response.json();

    if (!response.ok || !refreshedTokens.isSuccess) {
      throw new Error("Failed to refresh token");
    }

    return {
      ...token,
      accessToken: refreshedTokens.data!.accessToken,
      refreshToken: refreshedTokens.data!.refreshToken,
      expiresAt: Date.now() + refreshedTokens.data!.expiresIn * 1000,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

async function getUserInfo(accessToken: string): Promise<GFSAMSUserInfo | null> {
  try {
    const response = await fetch(`${IDENTITY_SERVICE_URL}/connect/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "GFSAMS Identity",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Call your identity service login endpoint
          const response = await fetch(`${IDENTITY_SERVICE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
              rememberMe: true,
              deviceId: "nextauth-client",
              deviceName: "Web Application",
            }),
          });

          const loginResponse: GFSAMSLoginResponse = await response.json();

          if (!response.ok || !loginResponse.isSuccess || !loginResponse.data) {
            console.error("Login failed:", loginResponse.error);
            return null;
          }

          const { data } = loginResponse;

          // Return user object with tokens
          return {
            id: data.user.id,
            email: data.user.email,
            name: `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim() || data.user.username,
            username: data.user.username,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresIn: data.expiresIn,
            roles: data.user.roles,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: Date.now() + user.expiresIn * 1000,
          username: user.username,
          roles: user.roles,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (token.error) {
        session.error = token.error;
      }

      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user = {
        ...session.user,
        id: token.sub!,
        username: token.username,
        roles: token.roles,
      };

      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === "development",
};

// Helper function to validate token with introspection endpoint
export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${IDENTITY_SERVICE_URL}/connect/introspect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        token,
        token_type_hint: "access_token",
        client_id: process.env.OAUTH_CLIENT_ID || "client_spa_development",
      }),
    });

    const result = await response.json();
    return result.active === true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

// Helper function to revoke token on logout
export async function revokeToken(token: string, tokenType: "access_token" | "refresh_token" = "refresh_token"): Promise<void> {
  try {
    await fetch(`${IDENTITY_SERVICE_URL}/api/auth/revoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
      }),
    });
  } catch (error) {
    console.error("Token revocation error:", error);
  }
}