import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily disabled for JWT strategy
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        // For now, we'll use a simple password check
        // In production, you should hash passwords with bcrypt
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password || "")

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          avatar_url: user.avatar_url,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          scope: "openid email profile",
          response_type: "code",
          access_type: "offline",
          prompt: "consent",
        },
      },
      token: {
        url: "https://oauth2.googleapis.com/token",
      },
      userinfo: {
        url: "https://www.googleapis.com/oauth2/v2/userinfo",
      },
      issuer: "https://accounts.google.com",
      httpOptions: {
        timeout: 15000,
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.avatar_url = token.avatar_url as string
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        // For JWT strategy, we'll use a simple approach
        // Generate a consistent ID based on email
        const userId = user.email?.split('@')[0] || 'user'
        token.id = userId
        token.username = user.name?.toLowerCase().replace(/\s+/g, '') || userId
        token.avatar_url = user.image || ''
        token.email = user.email
      }
      return token
    },
    async signIn({ user, account, profile }) {
      // For JWT strategy, we'll handle user creation in the JWT callback
      return true
    },
    async redirect({ url, baseUrl }) {
      // If user is signing in, redirect to projects page
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/projects`
      }
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/projects`
    },
  },
  pages: {
    signIn: "/login",
  },
}
