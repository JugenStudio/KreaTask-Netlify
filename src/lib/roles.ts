
import { UserRole } from "./types";

// These roles are now based on the new enum values from your seed script
const EMPLOYEE_ROLES = [
  UserRole.JURNALIS, // "roles_team_member"
  UserRole.SOCIAL_MEDIA_OFFICER,
  UserRole.DESAIN_GRAFIS,
  UserRole.MARKETING,
  UserRole.FINANCE,
];

const DIRECTOR_ROLES = [
  UserRole.DIREKTUR_UTAMA, // "roles_admin"
  UserRole.DIREKTUR_OPERASIONAL, // "roles_team_leader"
];

export const isEmployee = (role: UserRole): boolean => {
  if (role === UserRole.UNASSIGNED) return false;
  // A simple member is one who is not a director.
  return !DIRECTOR_ROLES.includes(role);
};

export const isDirector = (role: UserRole): boolean => {
  if (role === UserRole.UNASSIGNED) return false;
  return DIRECTOR_ROLES.includes(role);
};
