import { boolean, pgTable, varchar, text } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { User } from './user.schema';
import { bigserial } from 'drizzle-orm/pg-core';

export const Course = pgTable('course', {
  id: bigserial('id', { mode: 'number' }) 
    .primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: bigserial('created_by', { mode: 'number' })
    .notNull()
    .references(() => User.id),
  lastUpdatedBy: bigserial('last_updated_by', { mode: 'number' })
    .notNull()
    .references(() => User.id),
  ...timestamps,
});

export const CourseSelectSchema = createInsertSchema(Course);

export type CourseSchema = z.infer<typeof CourseSelectSchema>;
