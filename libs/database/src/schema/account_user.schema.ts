import { boolean, pgEnum, bigserial, pgTable } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Account } from './account.schema';
import { User } from './user.schema';

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

export const AccountUser = pgTable('account_user', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  accountId: bigserial('account_id', { mode: 'number' })
    .notNull()
    .references(() => Account.id),
  userId: bigserial('user_id', { mode: 'number' })
    .notNull()
    .references(() => User.id),
  role: UserRole('role').notNull().default(UserRoleEnum.STUDENT),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
});

export const AccountUserSchema = createSelectSchema(AccountUser);
export const AccountUserInsertSchema = createInsertSchema(AccountUser);

export type AccountUserSelectType = z.infer<typeof AccountUserSchema>;
export type AccountUserInsertType = z.infer<typeof AccountUserInsertSchema>;
