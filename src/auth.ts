// src/auth.ts
import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authentication logic here
        // This is a basic example - replace with your actual auth logic
        if (credentials?.email && credentials?.password) {
          // Example user object - replace with actual user validation
          const user = {
            id: "1",
            email: credentials.email as string,
            name: "User",
          }
          return user
        }
        return null
      }
    })
  ],
  pages: {
    signIn: "/en/login",
    error: "/en/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
  trustHost: true,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)