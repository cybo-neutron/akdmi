export const UserRole = {
  ADMIN: 'admin',
  MENTOR: 'mentor',
  STUDENT: 'student',
  MANAGER: 'manager',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];
