
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { User as FirebaseUser } from "firebase/auth";
import type { User } from "./types";
import { UserRole } from "./types";

// This function is self-contained and handles its own DB connection.
// It's designed to be used in server-side actions or API routes,
// but for this client-side use case, we ensure it has the env var.
const getDbClient = () => {
  const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);
  return drizzle(sql);
}

/**
 * Ensures a user document exists in the Postgres "users" table.
 * If it doesn't exist, it creates one with default data.
 * @param user The user object from Firebase Auth.
 * @returns Promise that resolves when the operation is complete.
 */
export async function ensureUserDoc(
  user: FirebaseUser,
  defaultRole: UserRole = UserRole.UNASSIGNED
) {
  const db = getDbClient();
  
  // Check if user exists
  const existingUsers = await db.select().from(users).where(eq(users.id, user.uid));

  if (existingUsers.length === 0) {
    // User does not exist, so create them
    const newUser: Omit<User, 'jabatan'> & {jabatan: string, createdAt: Date, updatedAt: Date} = {
      id: user.uid,
      name: user.displayName || "User Baru",
      email: user.email || "",
      avatarUrl:
        user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
      role: defaultRole,
      jabatan: "Unassigned",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(users).values(newUser);
    console.log("✅ New user created in Postgres:", newUser.email);
  } else {
    console.log("🔄 User already exists in Postgres, skipping creation.");
  }
}
