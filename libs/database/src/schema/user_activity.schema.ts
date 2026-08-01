import { bigserial } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { User } from "./user.schema";
import { pgEnum, jsonb } from "drizzle-orm/pg-core";
import { timestamps } from "../lib/timestamps";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";


export const UserActivityEnum = {
    CONTENT_COMPLETED: 'content_completed',
    COURSE_COMPLETED: 'course_completed',
} as const;

export const UserActivityType = pgEnum(
    'type',
    Object.values(UserActivityEnum) as [string, ...string[]]
);

export const UserActivity = pgTable('user_activity', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: bigserial('user_id', { mode: 'number' }).notNull().references(() => User.id),
    activityType: UserActivityType('activity_type').notNull(),
    // activityId: bigint('activity_id', { mode: 'number' }).notNull(),
    metadata: jsonb('metadata'),
    ...timestamps,
});

export const UserActivitySchema = createSelectSchema(UserActivity);
export const UserActivityInsertSchema = createInsertSchema(UserActivity, {
    metadata: z.object({
    })
}).omit({ id: true });

export type UserActivitySelectType = z.infer<typeof UserActivitySchema>;
export type UserActivityInsertType = z.infer<typeof UserActivityInsertSchema>;
