import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id
        session.user.username = (user as any).username
        session.user.avatar_url = (user as any).avatar_url
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        // Check if user already exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        if (existingUser) {
          // User exists, allow sign in and link accounts
          return true
        } else {
          // User doesn't exist, create new user
          return true
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // If user is signing in, redirect to dashboard
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`
      }
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: "/login",
  },
}
