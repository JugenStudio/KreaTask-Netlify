
import type { UserRole } from "./types";

const EMPLOYEE_ROLES: UserRole[] = [
  "roles_team_member",
  "roles_unassigned",
];

const DIRECTOR_ROLES: UserRole[] = [
  "roles_admin",
  "roles_team_leader",
];

export const isEmployee = (role: UserRole): boolean => {
  return EMPLOYEE_ROLES.includes(role);
};

export const isDirector = (role: UserRole): boolean => {
  if (role === "roles_unassigned") return false;
  return DIRECTOR_ROLES.includes(role);
};

export const isSuperAdmin = (role: UserRole): boolean => {
  return role === "roles_super_admin";
}
