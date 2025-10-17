import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

const db = getDb();

/**
 * Checks if a user's role has a specific permission.
 * This is the central function for authorization checks.
 * @param roleId The role ID of the user (e.g., 'roles_admin').
 * @param action The permission action to check (e.g., 'manage_tasks').
 * @returns {Promise<boolean>} True if the role has the permission, otherwise false.
 */
export async function hasPermission(roleId: string, action: string): Promise<boolean> {
  // Super Admins bypass all checks and always have permission.
  if (roleId === 'roles_super_admin') {
    return true;
  }
  
  const permission = await db.query.permissions.findFirst({
    where: and(
      eq(schema.permissions.roleId, roleId),
      eq(schema.permissions.action, action)
    ),
  });

  return permission?.allowed === true;
}
