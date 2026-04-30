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
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.currency = (user as { currency: string }).currency
        token.isEmailVerified = (user as { isEmailVerified: boolean }).isEmailVerified
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
