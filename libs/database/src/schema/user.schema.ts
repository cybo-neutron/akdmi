import { timestamps } from "../lib/timestamps";
import { sql } from "drizzle-orm";
import { boolean } from "drizzle-orm/pg-core";
import { pgTable, uuid, varchar, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


export const User = pgTable("user", {
    id: uuid("id")
        .default(sql`gen_random_uuid()`)
        .primaryKey(),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
});

export const UserSelectSchema = createInsertSchema(User).omit({
    password: true,
}).extend({
    id: z.string().uuid().optional(),
});

const UserInsertSchema_ = createInsertSchema(User);


export type UserSchema = z.infer<typeof UserSelectSchema>;
export type UserInsertSchema = z.infer<typeof UserInsertSchema_>;

