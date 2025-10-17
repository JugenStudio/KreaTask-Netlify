import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UserRole } from "../types";

/**
 * A server-side utility to get the current authenticated user's session data.
 * Returns a simplified user object or null if not authenticated.
 */
export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  // Ensure the role from the session matches the UserRole enum.
  const userRole = session.user.role in UserRole ? session.user.role : UserRole.UNASSIGNED;

  return {
    id: session.user.id,
    roleId: userRole, // Use the validated role
    email: session.user.email,
    name: session.user.name,
  };
}
