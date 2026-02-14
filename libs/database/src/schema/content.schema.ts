import {
  boolean,
  pgEnum,
  bigserial,
  bigint,
  pgTable,
  varchar,
  text,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { User } from './user.schema';
import { Course } from './course.schema';
import { integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
  sequence: integer('sequence').default(1).notNull(),
  parentId: bigint('parent_id', { mode: 'number' }),
  courseId: bigint('course_id', { mode: 'number' })
    .notNull()
    .references(() => Course.id),
  createdBy: bigserial('created_by', { mode: 'number' })
    .notNull()
    .references(() => User.id),
  lastUpdatedBy: bigserial('last_updated_by', { mode: 'number' })
    .notNull()
    .references(() => User.id),
  ...timestamps,
});

export const contentRelations = relations(Content, ({ one }) => ({
  parent: one(Content, {
    fields: [Content.parentId],
    references: [Content.id],
  }),
  course: one(Course, {
    fields: [Content.courseId],
    references: [Course.id],
  }),
}));

export const ContentSchema = createSelectSchema(Content);
export const ContentInsertSchema = createInsertSchema(Content);

export type ContentSelectType = z.infer<typeof ContentSchema>;
export type ContentInsertType = z.infer<typeof ContentInsertSchema>;
