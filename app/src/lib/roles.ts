
import { UserRole } from "./types";

// These roles are now based on the new enum values from your seed script
const EMPLOYEE_ROLES = [
  UserRole.JURNALIS, // "roles_team_member"
  UserRole.SOCIAL_MEDIA_OFFICER,
  UserRole.DESAIN_GRAFIS,
  UserRole.MARKETING,
  UserRole.FINANCE,
  UserRole.UNASSIGNED, // Added Unassigned to the employee roles
];

const DIRECTOR_ROLES = [
  UserRole.ADMIN, // "roles_admin" -> Direktur Utama
  UserRole.TEAM_LEADER, // "roles_team_leader" -> Direktur Operasional
];

export const isEmployee = (role: UserRole): boolean => {
  // Now includes UNASSIGNED
  return EMPLOYEE_ROLES.includes(role);
};

export const isDirector = (role: UserRole): boolean => {
  if (role === UserRole.UNASSIGNED) return false;
  return DIRECTOR_ROLES.includes(role);
};

export const isSuperAdmin = (role: UserRole): boolean => {
  return role === UserRole.SUPER_ADMIN;
}
