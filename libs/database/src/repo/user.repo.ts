import { db } from '@database/db';
import { AccountUser } from '@database/schema/account_user.schema';
import {
    User,
    UserInsertSchema,
    UserSchema,
} from '@database/schema/user.schema';
import { and, asc, desc, eq, gt, gte, lt, lte, or } from 'drizzle-orm';

export async function createUser(
    userData: UserInsertSchema
): Promise<UserSchema> {
    const { firstName, lastName, email, password } = userData;

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

export async function getUserById({ id }: { id: string }): Promise<UserSchema> {
    const user = await db.select().from(User).where(eq(User.id, id));
    return user;
}

export async function getUsersForAccount({
    accountId,
    cursor,
    pageSize,
    page,
    order = {
        firstName: 'asc'
    }
}: {
    accountId: string;
    cursor?: {
        firstName?: string;
        id: string
    };
    pageSize?: number;
    page?: number;
    order?: {
        firstName?: 'desc' | 'asc'
        id?: 'desc' | 'asc'
    }
}) {

    const whereCondition = [
        eq(AccountUser.accountId, accountId),
        eq(AccountUser.isActive, true),
        cursor ?
            cursor.firstName ?
                order.firstName === 'asc' ? or(
                    gt(User.firstName, cursor.firstName),
                    and(eq(User.firstName, cursor.firstName), gte(User.id, cursor.id))
                ) : or(
                    lt(User.firstName, cursor.firstName),
                    and(eq(User.firstName, cursor.firstName), lte(User.id, cursor.id))
                ) :

                order.id === 'desc' ? lt(User.id, cursor.id) : gt(User.id, cursor.id)
            : undefined,
    ].filter(Boolean);

    const orderList = [
        order.firstName ? order.firstName === 'asc' ? asc(User.firstName) : desc(User.firstName) : undefined,
        order.id ? order.id === 'asc' ? asc(User.id) : desc(User.id) : undefined
    ].filter(Boolean)



    const users = await db
        .select()
        .from(User)
        .leftJoin(AccountUser, eq(User.id, AccountUser.userId))
        .where(
            and(
                ...whereCondition
            )
        )
        .limit(pageSize || 10)
        .offset(((page || 1) - 1) * (pageSize || 10))
        .orderBy(
            ...orderList
        );

    return users;
}
