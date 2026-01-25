import { boolean, pgTable, text, bigserial } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Content } from './content.schema';

export const ContentText = pgTable('content_text', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  content: text('content').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  contentId: bigserial('content_id', { mode: 'number' })
    .notNull()
    .references(() => Content.id),
  ...timestamps,
});

export const ContentTextSchema = createSelectSchema(ContentText);
export const ContentTextInsertSchema = createInsertSchema(ContentText);

export type ContentTextSelectType = z.infer<typeof ContentTextSchema>;
export type ContentTextInsertType = z.infer<typeof ContentTextInsertSchema>;
