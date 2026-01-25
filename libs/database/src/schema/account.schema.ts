import { boolean, pgTable, varchar, bigserial } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const Account = pgTable('account', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
});

export const AccountSchema = createSelectSchema(Account);
export const AccountInsertSchema = createInsertSchema(Account);

export type AccountSelectType = z.infer<typeof AccountSchema>;
export type AccountInsertType = z.infer<typeof AccountInsertSchema>;
