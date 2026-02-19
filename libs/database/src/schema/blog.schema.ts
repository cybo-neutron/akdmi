import { pgTable, bigserial } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { text } from 'drizzle-orm/pg-core';
import { User } from './user.schema';

export const Blog = pgTable('blog', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: bigserial('author_id', { mode: 'number' })
    .notNull()
    .references(() => User.id),
  ...timestamps,
});

export const BlogSchema = createSelectSchema(Blog);
export const BlogInsertSchema = createInsertSchema(Blog);

export type BlogSelectType = z.infer<typeof BlogSchema>;
export type BlogInsertType = z.infer<typeof BlogInsertSchema>;
