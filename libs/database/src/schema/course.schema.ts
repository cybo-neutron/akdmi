import {
  boolean,
  pgTable,
  varchar,
  text,
  bigserial,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { User } from './user.schema';

export const Course = pgTable('course', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  // accountId: bigserial('account_id', { mode: 'number' })
  //   .notNull()
  //   .references(() => Account.id),
  createdBy: bigserial('created_by', { mode: 'number' })
    .notNull()
    .references(() => User.id),
  lastUpdatedBy: bigserial('last_updated_by', { mode: 'number' })
    .notNull()
    .references(() => User.id),
  ...timestamps,
});

export const CourseSchema = createSelectSchema(Course);
export const CourseInsertSchema = createInsertSchema(Course);

export type CourseSelectType = z.infer<typeof CourseSchema>;
export type CourseInsertType = z.infer<typeof CourseInsertSchema>;
