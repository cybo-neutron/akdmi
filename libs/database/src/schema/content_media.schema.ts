import { sql } from "drizzle-orm";
import { pgTable, pgEnum, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../lib/timestamps";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


const ContentMediaTypeEnum = {
    VIDEO: "video",
    AUDIO: "audio",
    IMAGE: "image",
} as const

const ContentMediaType = pgEnum("content_media_type", Object.values(ContentMediaTypeEnum) as [string, ...string[]]);


export const ContentMedia = pgTable('content_media', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    url: varchar('url', { length: 255 }).notNull(),
    type: ContentMediaType('type').notNull(),
    ...timestamps,
});

export const ContentMediaSelectSchema = createInsertSchema(ContentMedia);

export type ContentMediaSchema = z.infer<typeof ContentMediaSelectSchema>;
