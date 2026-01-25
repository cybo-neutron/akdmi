import { db } from '../db';
import {
  Account,
  AccountInsertType,
  AccountSelectType,
} from '../schema/account.schema';
import { eq } from 'drizzle-orm';

export async function createAccount(
  data: AccountInsertType
): Promise<AccountSelectType> {
  const [newAccount] = await db.insert(Account).values(data).returning();
  return newAccount;
}

export async function updateAccount(
  id: number,
  data: Partial<AccountInsertType>
): Promise<AccountSelectType | null> {
  const [updated] = await db
    .update(Account)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(Account.id, id))
    .returning();
  return updated || null;
}

export async function getAccountById(
  id: number
): Promise<AccountSelectType | null> {
  const [account] = await db
    .select()
    .from(Account)
    .where(eq(Account.id, id))
    .limit(1);
  return account || null;
}

export async function deleteAccount(id: number): Promise<void> {
  await db
    .update(Account)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(Account.id, id));
}
