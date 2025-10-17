
import type { User } from "./types";

// These roles are now based on the string IDs from the database
const EMPLOYEE_ROLES: string[] = [
  "roles_team_member",
  "roles_unassigned",
];

const DIRECTOR_ROLES: string[] = [
  "roles_admin",
  "roles_team_leader",
];

/**
 * Checks if a role is considered an employee-level role (including unassigned).
 * These roles have the most restricted access.
 */
export const isEmployee = (role: string): boolean => {
  return EMPLOYEE_ROLES.includes(role);
};

/**
 * Checks if a role is a director-level role (Direktur Utama or Direktur Operasional).
 * These roles have elevated management permissions but are not Super Admins.
 */
export const isDirector = (role: string): boolean => {
  return DIRECTOR_ROLES.includes(role);
};

/**
 * Checks if a role is the Super Admin.
 * This role has unrestricted access to the entire system.
 */
export const isSuperAdmin = (role: string): boolean => {
  return role === "roles_super_admin";
};

    