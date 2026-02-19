import { db } from '../db';
import {
  User,
  UserInsertSchema,
  UserSchema,
  UserRoleEnum,
} from '../schema/user.schema';
import { eq, ilike, or, sql } from 'drizzle-orm';

export interface PaginatedUsersParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedUsersResult {
  users: UserSchema[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

// get all users with pagination and search
export async function getAllUsers(
  params: PaginatedUsersParams
): Promise<PaginatedUsersResult> {
  const { page, limit, search } = params;
  const offset = (page - 1) * limit;

  const searchCondition = search
    ? or(
        ilike(User.firstName, `%${search}%`),
        ilike(User.lastName, `%${search}%`),
        ilike(User.email, `%${search}%`)
      )
    : undefined;

  const [users, countResult] = await Promise.all([
    db.select().from(User).where(searchCondition).limit(limit).offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(User)
      .where(searchCondition),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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
