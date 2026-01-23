import { sql } from "drizzle-orm";
import { boolean, pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";
import { timestamps } from "../lib/timestamps";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


export const Course = pgTable('course', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdBy: uuid('created_by').notNull(),
    lastUpdatedBy: uuid('last_updated_by').notNull(),
    ...timestamps,
});

export const CourseSelectSchema = createInsertSchema(Course);

export type CourseSchema = z.infer<typeof CourseSelectSchema>;