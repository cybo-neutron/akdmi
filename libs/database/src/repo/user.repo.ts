import { logger } from '@org/utils';
import { db } from '../db';
import { User, UserInsertSchema, UserSchema } from '../schema/user.schema';
import { eq } from 'drizzle-orm';

export async function createUser(
  userData: UserInsertSchema
): Promise<UserSchema> {
  const { firstName, lastName, email, password } = userData;
  logger.info({
    firstName,
    lastName,
    email,
    password,
  });

  const user = await db
    .insert(User)
    .values({
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(password && { password }),
    })
    .returning();

  return user;
}

export async function getUserById({
  id,
}: {
  id: number;
}): Promise<UserSchema | null> {
  const user = await db.select().from(User).where(eq(User.id, id)).limit(1);
  if (user && user.length > 0) {
    return user[0];
  }
  return null;
}

export async function getUserByEmail({
  email,
}: {
  email: string;
}): Promise<UserSchema | null> {
  const user = await db
    .select()
    .from(User)
    .where(eq(User.email, email))
    .limit(1);
  if (user && user.length > 0) {
    return user[0];
  }
  return null;
}
