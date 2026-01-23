import { sql } from "drizzle-orm";
import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../lib/timestamps";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ContentText = pgTable('content_text', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    content: text('content').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
});

export const ContentTextSelectSchema = createInsertSchema(ContentText);

export type ContentTextSchema = z.infer<typeof ContentTextSelectSchema>;