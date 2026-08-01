import { pgTable, bigserial } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { User } from './user.schema';
import { Course } from './course.schema';
import { timestamp } from 'drizzle-orm/pg-core';

export const CourseEnrollment = pgTable('course_enrollment', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigserial('user_id', { mode: 'number' })
    .notNull()
    .references(() => User.id),
  courseId: bigserial('course_id', { mode: 'number' })
    .notNull()
    .references(() => Course.id),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  ...timestamps,
});

export const CourseEnrollmentSchema = createSelectSchema(CourseEnrollment);
export const CourseEnrollmentInsertSchema =
  createInsertSchema(CourseEnrollment);

export type CourseEnrollmentSelectType = z.infer<typeof CourseEnrollmentSchema>;
export type CourseEnrollmentInsertType = z.infer<typeof CourseEnrollmentInsertSchema>;
