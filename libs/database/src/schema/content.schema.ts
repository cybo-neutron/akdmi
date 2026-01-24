import { boolean, pgEnum, bigserial } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { varchar } from 'drizzle-orm/pg-core';
import { text } from 'drizzle-orm/pg-core';
import { User } from './user.schema';

export const ContentTypeEnum = {
  TEXT: 'text',
  MEDIA: 'media',
  DOCUMENT: 'document',
} as const;

export const ContentType = pgEnum(
  'content_type',
  Object.values(ContentTypeEnum) as [string, ...string[]]
);

export const Content = pgTable('content', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  type: ContentType('type').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: bigserial('created_by', { mode: 'number' })
    .notNull()
    .references(() => User.id),
  lastUpdatedBy: bigserial('last_updated_by', { mode: 'number' })
    .notNull()
    .references(() => User.id),
  ...timestamps,
});

export const ContentSelectSchema = createInsertSchema(Content);

export type ContentSchema = z.infer<typeof ContentSelectSchema>;
