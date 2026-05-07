import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

const CredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Required on Vercel / reverse proxies so Auth.js trusts `Host` and callback URLs
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = CredentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            currency: true,
            emailVerified: true,
          },
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.password
        )
        if (!passwordMatch) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          isEmailVerified: user.emailVerified,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.currency = (user as { currency: string }).currency
      }
      // Auth.js invokes this on every session read with only the decoded token (no `user`).
      // Keep `isEmailVerified` / `currency` aligned with Prisma so a stale JWT cannot trap
      // verified users on /verify-email (resend then correctly returns "already verified").
      const userId = (token.id ?? token.sub) as string | undefined
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { emailVerified: true, currency: true },
        })
        if (dbUser) {
          token.isEmailVerified = dbUser.emailVerified
          token.currency = dbUser.currency
          token.id = userId
        }
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.currency = token.currency as string
        session.user.isEmailVerified = token.isEmailVerified as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})
