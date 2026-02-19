import { timestamps } from '../lib/timestamps';
import { boolean } from 'drizzle-orm/pg-core';
import { pgTable, varchar, text, bigserial, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const UserRoleEnum = {
  ADMIN: 'admin',
  MENTOR: 'mentor',
  STUDENT: 'student',
  MANAGER: 'manager',
} as const;

export const UserRole = pgEnum(
  'role',
  Object.values(UserRoleEnum) as [string, ...string[]]
);

export const User = pgTable('user', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  role: UserRole('role').default(UserRoleEnum.STUDENT).notNull(),
  ...timestamps,
});

export const UserSelectSchema = createInsertSchema(User)
  .omit({ role: true })
  .extend({
    id: z.number().optional(),
    role: z.enum(UserRoleEnum).optional(),
  });

const UserInsertSchema_ = createInsertSchema(User)
  .omit({ role: true })
  .extend({
    role: z.enum(UserRoleEnum).optional(),
  });

export type UserSchema = z.infer<typeof UserSelectSchema>;
export type UserInsertSchema = z.infer<typeof UserInsertSchema_>;
