import { boolean, pgTable, text } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Content } from './content.schema';
import { bigserial } from 'drizzle-orm/pg-core';

export const ContentText = pgTable('content_text', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  content: text('content').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  contentId: bigserial('content_id', { mode: 'number' })
    .notNull()
    .references(() => Content.id),
  ...timestamps,
});

export const ContentTextSelectSchema = createInsertSchema(ContentText);

export type ContentTextSchema = z.infer<typeof ContentTextSelectSchema>;
