import { db } from '../db';
import {
  AccountUser,
  AccountUserInsertType,
  AccountUserSelectType,
} from '../schema/account_user.schema';
import { and, eq } from 'drizzle-orm';

export async function addUserToAccount(
  data: AccountUserInsertType
): Promise<AccountUserSelectType> {
  const [newAccountUser] = await db
    .insert(AccountUser)
    .values(data)
    .returning();
  return newAccountUser;
}

export async function updateAccountUser(
  id: number,
  data: Partial<AccountUserInsertType>
): Promise<AccountUserSelectType | null> {
  const [updated] = await db
    .update(AccountUser)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(AccountUser.id, id))
    .returning();
  return updated || null;
}

export async function getAccountUserLink(
  accountId: number,
  userId: number
): Promise<AccountUserSelectType | null> {
  const [link] = await db
    .select()
    .from(AccountUser)
    .where(
      and(eq(AccountUser.accountId, accountId), eq(AccountUser.userId, userId))
    )
    .limit(1);
  return link || null;
}

export async function getLinksForAccount(
  accountId: number
): Promise<AccountUserSelectType[]> {
  return db
    .select()
    .from(AccountUser)
    .where(
      and(eq(AccountUser.accountId, accountId), eq(AccountUser.isActive, true))
    );
}

export async function getLinksForUser(
  userId: number
): Promise<AccountUserSelectType[]> {
  return db
    .select()
    .from(AccountUser)
    .where(and(eq(AccountUser.userId, userId), eq(AccountUser.isActive, true)));
}

export async function removeUserFromAccount(id: number): Promise<void> {
  await db
    .update(AccountUser)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(AccountUser.id, id));
}
