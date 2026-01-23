import { sql } from "drizzle-orm";
import { boolean, pgEnum, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../lib/timestamps";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Account } from "./account.schema";
import { User } from "./user.schema";

export const UserRoleEnum = {
    ADMIN: "admin",
    MENTOR: "mentor",
    STUDENT: "student",
    MANAGER: "manager",
} as const

const UserRole = pgEnum("role", Object.values(UserRoleEnum) as [string, ...string[]]);

export const AccountUser = pgTable('account_user', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    accountId: uuid('account_id').notNull().references(() => Account.id),
    userId: uuid('user_id').notNull().references(() => User.id),
    role: UserRole('role').notNull().default(UserRoleEnum.STUDENT),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
})

export const AccountUserSelectSchema = createInsertSchema(AccountUser).omit({
    id: true,
}).extend({
    id: z.string().uuid().optional(),
});

export const AccountUserInsertSchema_ = createInsertSchema(AccountUser)

export type AccountUserSchema = z.infer<typeof AccountUserSelectSchema>;