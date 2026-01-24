import { pgTable, pgEnum, varchar } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Content } from './content.schema';
import { bigserial } from 'drizzle-orm/pg-core';

const ContentDocumentTypeEnum = {
  PDF: 'pdf',
  DOC: 'doc',
  PPT: 'ppt',
  OTHER: 'other',
} as const;

export const ContentDocumentType = pgEnum(
  'content_document_type',
  Object.values(ContentDocumentTypeEnum) as [string, ...string[]]
);

export const ContentDocument = pgTable('content_document', {
  id: bigserial('id', { mode: 'number' }).notNull().primaryKey(),
  url: varchar('url', { length: 255 }).notNull(),
  type: ContentDocumentType('type').notNull(),
  contentId: bigserial('content_id', { mode: 'number' })
    .notNull()
    .references(() => Content.id),
  ...timestamps,
});

export const ContentDocumentSelectSchema = createInsertSchema(ContentDocument);

export type ContentDocumentSchema = z.infer<typeof ContentDocumentSelectSchema>;
