// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import { getDb } from '@/db/client';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import type { UserRole } from '@/lib/types';

import '@/env';
import { createNotificationAction } from '@/app/actions';

// Extends NextAuth's User type to include our custom fields
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & NextAuthUser;
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

// Initialize DB connection once at the module level
const db = getDb();

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt', // Ensure JWT is used so callbacks work
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password required');
        }

        const user = await db.query.users.findFirst({
          where: eq(schema.users.email, credentials.email.toLowerCase()),
        });

        if (!user || !user.hashedPassword) {
          return null; // User not found or signed up via OAuth
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!passwordMatch) {
          return null; // Invalid password
        }
        
        const { hashedPassword, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile, isNewUser }) {
      const email = user.email;
      if (!email) return false; // Must have email
      
      let dbUser = await db.query.users.findFirst({
        where: eq(schema.users.email, email),
      });

      if (account?.provider === 'google') {
        if (!dbUser) {
          const userId = uuidv4();
          await db.insert(schema.users).values({
            id: userId,
            name: user.name ?? 'New User',
            email: email,
            avatarUrl: user.image,
            hashedPassword: null,
            role: 'Unassigned',
            jabatan: 'Unassigned',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          dbUser = await db.query.users.findFirst({ where: eq(schema.users.id, userId )});
        }
      }

      if (dbUser) {
        // Create a welcome notification
        await createNotificationAction({
            userId: dbUser.id,
            message: `Selamat datang kembali di KreaTask, ${dbUser.name.split(' ')[0]}!`,
            type: 'SYSTEM_UPDATE',
            read: true, // Mark as read initially to not clutter
            link: '/dashboard',
            createdAt: new Date().toISOString(),
        });
      }
      
      return true; // Allow sign-in
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
         const dbUser = await db.query.users.findFirst({
            where: eq(schema.users.email, user.email!),
         });
         if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.picture = dbUser.avatarUrl;
         }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
