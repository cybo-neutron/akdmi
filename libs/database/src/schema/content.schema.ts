import { sql } from "drizzle-orm";
import { boolean, pgEnum, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../lib/timestamps";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { varchar } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";

export const ContentTypeEnum = {
    TEXT: "text",
    MEDIA: "media",
    DOCUMENT: "document",
} as const

export const ContentType = pgEnum("content_type", Object.values(ContentTypeEnum) as [string, ...string[]]);


export const Content = pgTable('content', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    type: ContentType('type').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdBy: uuid('created_by').notNull(),
    lastUpdatedBy: uuid('last_updated_by').notNull(),
    ...timestamps,
})

export const ContentSelectSchema = createInsertSchema(Content)

export type ContentSchema = z.infer<typeof ContentSelectSchema>;