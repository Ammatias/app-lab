import NextAuth, { DefaultSession } from 'next-auth'
import AuthentikProvider from 'next-auth/providers/authentik'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}

const handler = NextAuth({
  providers: [
    AuthentikProvider({
      clientId: process.env.AUTHENTIK_CLIENT_ID!,
      clientSecret: process.env.AUTHENTIK_CLIENT_SECRET!,
      issuer: process.env.AUTHENTIK_ISSUER!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'authentik') {
        return true
      }
      return true
    },
  },
})

export { handler as GET, handler as POST }
export const auth = handler.auth
export const signIn = handler.signIn
export const signOut = handler.signOut
