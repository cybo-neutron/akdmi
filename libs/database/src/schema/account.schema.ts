import { sql } from "drizzle-orm";
import { boolean, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../lib/timestamps";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const Account = pgTable('account', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
});

export const AccountSelectSchema = createInsertSchema(Account).omit({
    id: true,
}).extend({
    id: z.string().uuid().optional(),
});


export type AccountSchema = z.infer<typeof AccountSelectSchema>;