import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { username: credentials.identifier }
            ]
          }
        });

        if (!user || !user.password) {
          throw new Error("No user found");
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordMatch) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 45 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.createdAt = Date.now();
      }

      const twelveHoursInMs = 12 * 60 * 60 * 1000;
      if (token.createdAt && Date.now() - (token.createdAt as number) > twelveHoursInMs) {
        return {};
      }

      return token;
    },
    async session({ session, token }) {
      if (token && token.id) {
        session.user = {
          ...session.user,
          id: token.id as string,
          username: token.username as string,
          role: token.role as string,
        } as any;
      } else {
        return null as any;
      }
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      if (user?.id) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });
        } catch (error) {
          console.error("Error updating lastLogin:", error);
        }
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  }
};

export const getAuthSession = () => getServerSession(authOptions);
