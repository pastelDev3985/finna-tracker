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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.currency = (user as { currency: string }).currency
        token.isEmailVerified = (user as { isEmailVerified: boolean }).isEmailVerified
      }
      // After OTP verification, `update()` runs without a fresh `user` object — reload
      // flags from DB (or apply explicit patch from `update(data)`).
      if (trigger === "update") {
        const patch = session as { user?: { isEmailVerified?: boolean } } | undefined
        if (
          patch?.user &&
          typeof patch.user.isEmailVerified === "boolean"
        ) {
          token.isEmailVerified = patch.user.isEmailVerified
        } else if (token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { emailVerified: true, currency: true },
          })
          if (dbUser) {
            token.isEmailVerified = dbUser.emailVerified
            token.currency = dbUser.currency
          }
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
