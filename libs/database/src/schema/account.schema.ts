import { boolean, pgTable, varchar } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { bigserial } from 'drizzle-orm/pg-core';

export const Account = pgTable('account', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
});

export const AccountSelectSchema = createInsertSchema(Account).omit({
  id: true,
});

export type AccountSchema = z.infer<typeof AccountSelectSchema>;
