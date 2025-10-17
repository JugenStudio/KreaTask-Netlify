import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * A server-side utility to get the current authenticated user's session data.
 * Returns a simplified user object or null if not authenticated.
 */
export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    role: session.user.role, // role is now a string from the JWT
    email: session.user.email,
    name: session.user.name,
  };
}
