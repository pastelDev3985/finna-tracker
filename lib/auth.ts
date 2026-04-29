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
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.currency = (user as { currency: string }).currency
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.currency = token.currency as string
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
