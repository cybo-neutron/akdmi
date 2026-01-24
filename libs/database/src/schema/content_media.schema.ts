import { pgTable, pgEnum, varchar } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { bigserial } from 'drizzle-orm/pg-core';
import { Content } from './content.schema';

const ContentMediaTypeEnum = {
  VIDEO: 'video',
  AUDIO: 'audio',
  IMAGE: 'image',
} as const;

const ContentMediaType = pgEnum(
  'content_media_type',
  Object.values(ContentMediaTypeEnum) as [string, ...string[]]
);

export const ContentMedia = pgTable('content_media', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  url: varchar('url', { length: 255 }).notNull(),
  type: ContentMediaType('type').notNull(),
  contentId: bigserial('content_id', { mode: 'number' })
    .notNull()
    .references(() => Content.id),
  ...timestamps,
});

export const ContentMediaSelectSchema = createInsertSchema(ContentMedia);

export type ContentMediaSchema = z.infer<typeof ContentMediaSelectSchema>;
