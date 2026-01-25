import { pgTable, pgEnum, varchar, bigserial } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Content } from './content.schema';

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

export const ContentDocumentSchema = createSelectSchema(ContentDocument);
export const ContentDocumentInsertSchema = createInsertSchema(ContentDocument);

export type ContentDocumentSelectType = z.infer<typeof ContentDocumentSchema>;
export type ContentDocumentInsertType = z.infer<
  typeof ContentDocumentInsertSchema
>;
