
import { UserRole } from "./types";

const EMPLOYEE_ROLES = [
  UserRole.JURNALIS,
  UserRole.SOCIAL_MEDIA_OFFICER,
  UserRole.DESAIN_GRAFIS,
  UserRole.MARKETING,
  UserRole.FINANCE,
];

const DIRECTOR_ROLES = [
  UserRole.DIREKTUR_UTAMA,
  UserRole.DIREKTUR_OPERASIONAL,
];

export const isEmployee = (role: UserRole): boolean => {
  if (role === UserRole.UNASSIGNED) return false;
  return EMPLOYEE_ROLES.includes(role);
};

export const isDirector = (role: UserRole): boolean => {
  if (role === UserRole.UNASSIGNED) return false;
  return DIRECTOR_ROLES.includes(role);
};
