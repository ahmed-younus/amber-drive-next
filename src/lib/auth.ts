import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password)
            throw new Error("Missing credentials");

          const user = await prisma.adminUser.findUnique({
            where: { username: credentials.username },
          });

          if (!user) throw new Error(`User not found: "${credentials.username}"`);

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) throw new Error(`Wrong password for: "${credentials.username}"`);

          return {
            id: String(user.id),
            name: user.username,
            email: user.email,
          };
        } catch (e: unknown) {
          throw new Error(e instanceof Error ? e.message : String(e));
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7200, // 2 hours
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
};
