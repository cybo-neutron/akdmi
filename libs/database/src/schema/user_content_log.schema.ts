import { pgTable, bigserial, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { User } from './user.schema';
import { Content } from './content.schema';

// enum for course completion -> not_started, in_progress, completed
export const CompletionStatusEnum = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
} as const;

export const CompletionStatus = pgEnum(
    'completion_status',
    Object.values(CompletionStatusEnum) as [string, ...string[]]
);

export const UserContentLog = pgTable(
    'user_content_log',
    {
        id: bigserial('id', { mode: 'number' }).primaryKey(),
        userId: bigserial('user_id', { mode: 'number' })
            .notNull()
            .references(() => User.id),
        contentId: bigserial('content_id', { mode: 'number' })
            .notNull()
            .references(() => Content.id),
        completionStatus: CompletionStatus('completion_status').default(CompletionStatusEnum.NOT_STARTED).notNull(),
        ...timestamps,
    },
    (table) => [
        uniqueIndex('user_content_log_unique_idx').on(table.userId, table.contentId),
    ]
);

export const UserContentLogSchema = createSelectSchema(UserContentLog);
export const UserContentLogInsertSchema =
    createInsertSchema(UserContentLog);

export type UserContentLogSelectType = z.infer<typeof UserContentLogSchema>;
export type UserContentLogInsertType = z.infer<
    typeof UserContentLogInsertSchema
>;