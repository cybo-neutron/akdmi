import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
};
