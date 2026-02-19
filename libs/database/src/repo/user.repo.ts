import { logger } from '@org/utils';
import { db } from '../db';
import {
  User,
  UserInsertSchema,
  UserSchema,
  UserRoleEnum,
} from '../schema/user.schema';
import { eq } from 'drizzle-orm';

export async function createUser(
  userData: UserInsertSchema
): Promise<UserSchema> {
  const { firstName, lastName, email, password, role, avatarUrl } = userData;

  const [user] = await db
    .insert(User)
    .values({
      firstName,
      lastName,
      email,
      password,
      role: role || UserRoleEnum.STUDENT,
      avatarUrl,
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

// get all users
export async function getAllUsers(): Promise<UserSchema[]> {
  const users = await db.select().from(User);
  return users;
}

// update user
export async function updateUser(
  id: number,
  userData: Partial<UserInsertSchema>
): Promise<UserSchema | null> {
  const [user] = await db
    .update(User)
    .set({
      ...userData,
      updatedAt: new Date(),
    })
    .where(eq(User.id, id))
    .returning();

  return user || null;
}

// delete user
export async function deleteUser(id: number): Promise<boolean> {
  const result = await db.delete(User).where(eq(User.id, id)).returning();
  return result.length > 0;
}
