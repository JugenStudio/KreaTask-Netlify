
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@/lib/types';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

import '@/env';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        try {
          const sql = neon(process.env.DATABASE_URL!);
          const db = drizzle(sql, { schema });

          // Check if user already exists
          let existingUser = await db.query.users.findFirst({
            where: eq(schema.users.email, profile.email),
          });

          if (!existingUser) {
            // Create a new user if they don't exist
            const userId = uuidv4();
            [existingUser] = await db.insert(schema.users).values({
              id: userId,
              name: user.name || 'New User',
              email: profile.email,
              avatarUrl: user.image || `https://picsum.photos/seed/${userId}/100/100`,
              role: UserRole.UNASSIGNED,
              jabatan: 'Unassigned',
              createdAt: new Date(),
              updatedAt: new Date(),
            }).returning();
          }

          // At this point, existingUser is guaranteed to be populated
          const { hashedPassword, ...userToSession } = existingUser;

          // Manually create an iron-session
          const cookieStore = cookies();
          const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
          session.user = userToSession;
          session.isLoggedIn = true;
          await session.save();

          return true; // Allow sign-in
        } catch (error) {
          console.error("Error during Google sign-in:", error);
          return false; // Prevent sign-in on error
        }
      }
      return true; // Allow other sign-in types
    },
    async redirect({ url, baseUrl }) {
        // Always redirect to dashboard after sign-in
        return baseUrl + '/dashboard';
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
