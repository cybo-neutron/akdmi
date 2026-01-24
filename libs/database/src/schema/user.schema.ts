import { timestamps } from '../lib/timestamps';
import { boolean } from 'drizzle-orm/pg-core';
import { pgTable, varchar, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { bigserial } from 'drizzle-orm/pg-core';

export const User = pgTable('user', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
});

export const UserSelectSchema = createInsertSchema(User).omit({}).extend({
  id: z.number().optional(),
});

const UserInsertSchema_ = createInsertSchema(User);

export type UserSchema = z.infer<typeof UserSelectSchema>;
export type UserInsertSchema = z.infer<typeof UserInsertSchema_>;
