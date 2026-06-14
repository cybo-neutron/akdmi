import {
  boolean,
  pgTable,
  varchar,
  text,
  bigserial,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { User } from './user.schema';

// enum for publishing status -> draft(default), published, archived
export const CoursePublishStatusEnum = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export const CoursePublishStatus = pgEnum(
  'publish_status',
  Object.values(CoursePublishStatusEnum) as [string, ...string[]]
);

export const Course = pgTable('course', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  coverArt: text('cover_art'),
  introductionVideo: text('introduction_video'),
  isActive: boolean('is_active').default(true).notNull(),
  status: CoursePublishStatus('status').default(CoursePublishStatusEnum.DRAFT).notNull(),
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
