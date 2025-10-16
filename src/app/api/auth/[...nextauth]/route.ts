// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import type { UserRole } from '@/lib/types';
import type { User } from 'next-auth';

// Pastikan file ini hanya mengimpor variabel lingkungan, bukan kode lain
import '@/env';

// Extends NextAuth's User type to include our custom fields
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & User;
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

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

    // ADDED FOR MANUAL LOGIN
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

        const sql = neon(process.env.DATABASE_URL!);
        const db = drizzle(sql, { schema });

        const user = await db.query.users.findFirst({
          where: eq(schema.users.email, credentials.email.toLowerCase()),
        });

        if (!user || !user.hashedPassword) {
          throw new Error('Invalid credentials');
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!passwordMatch) {
          throw new Error('Invalid credentials');
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
    // 1. signIn callback: For DB sync and validation
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        try {
          const sql = neon(process.env.DATABASE_URL!);
          const db = drizzle(sql, { schema });

          const existingUser = await db.query.users.findFirst({
            where: eq(schema.users.email, profile.email),
          });

          if (!existingUser) {
            const userId = uuidv4();
            await db.insert(schema.users).values({
              id: userId,
              name: user.name ?? 'New User',
              email: profile.email,
              avatarUrl: user.image,
              hashedPassword: null,
              role: 'Unassigned',
              jabatan: 'Unassigned',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          return true; // Allow sign-in
        } catch (error) {
          console.error('Error during Google sign-in DB sync:', error);
          return false; // Prevent sign-in on DB error
        }
      }
      if (account?.provider === 'credentials') {
        return true; // Credentials already authorized
      }
      return false; // Block other providers
    },

    // 2. jwt callback: Add custom data to JWT
    async jwt({ token, user, trigger, session }) {
       // If user object exists (on initial sign-in), fetch full user data
      if (user) {
         const sql = neon(process.env.DATABASE_URL!);
         const db = drizzle(sql, { schema });
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

    // 3. session callback: Make token data available to client
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },

    // 4. redirect callback
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
