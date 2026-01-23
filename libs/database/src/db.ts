import { drizzle } from "drizzle-orm/node-postgres";
import { logger } from '@org/utils'

logger.info('Database url', process.env.DATABASE_URL)

let db: any;
try {
    const client = drizzle(process.env.DATABASE_URL as string);
    db = client;
} catch (error: any) {
    logger.error(error, "Database Connection Error");
}
export { db };
