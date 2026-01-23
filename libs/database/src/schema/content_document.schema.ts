import { sql } from "drizzle-orm";
import { pgTable, pgEnum, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../lib/timestamps";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


const ContentDocumentTypeEnum = {
    PDF: "pdf",
    DOC: "doc",
    PPT: "ppt",
    OTHER: "other",
} as const

const ContentDocumentType = pgEnum("content_document_type", Object.values(ContentDocumentTypeEnum) as [string, ...string[]]);


export const ContentDocument = pgTable('content_document', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    url: varchar('url', { length: 255 }).notNull(),
    type: ContentDocumentType('type').notNull(),
    ...timestamps,
});

export const ContentDocumentSelectSchema = createInsertSchema(ContentDocument);

export type ContentDocumentSchema = z.infer<typeof ContentDocumentSelectSchema>;