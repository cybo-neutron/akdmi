import {
  boolean,
  pgEnum,
  bigserial,
  bigint,
  pgTable,
  varchar,
  text,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Content } from './content.schema';

export const ProcessingStatusEnum = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const ProcessingStatus = pgEnum(
  'processing_status',
  Object.values(ProcessingStatusEnum) as [string, ...string[]]
);

export const TempContent = pgTable('temp_content', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  contentId: bigint('content_id', { mode: 'number' })
    .notNull()
    .references(() => Content.id),
  url: text('url').notNull(),
  status: ProcessingStatus('status')
    .default(ProcessingStatusEnum.PENDING)
    .notNull(),
  ...timestamps,
});

export const TempContentSchema = createSelectSchema(TempContent);
export const TempContentInsertSchema = createInsertSchema(TempContent);

export type TempContentSelectType = z.infer<typeof TempContentSchema>;
export type TempContentInsertType = z.infer<typeof TempContentInsertSchema>;
